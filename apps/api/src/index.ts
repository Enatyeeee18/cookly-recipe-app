import 'dotenv/config';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validateCredentials } from './validation.js';

const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error('JWT_SECRET must be configured');
const signingSecret: string = jwtSecret;

type AuthenticatedRequest = IncomingMessage & { userId?: string };

function send(response: ServerResponse, status: number, payload: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

async function body(request: IncomingMessage): Promise<Record<string, unknown>> {
  let raw = '';
  for await (const chunk of request) raw += chunk;
  if (!raw) return {};
  try { return JSON.parse(raw) as Record<string, unknown>; } catch { throw new Error('Invalid JSON'); }
}

function tokenFor(userId: string) { return jwt.sign({ sub: userId }, signingSecret, { expiresIn: '7d' }); }

function requireUser(request: AuthenticatedRequest): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), signingSecret) as jwt.JwtPayload;
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch { return null; }
}

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }

  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const path = url.pathname;
  const requestWithUser = request as AuthenticatedRequest;
  requestWithUser.userId = requireUser(requestWithUser) ?? undefined;

  try {
    if (request.method === 'GET' && path === '/health') return send(response, 200, { status: 'ok' });
    if (request.method === 'GET' && path === '/recipes') {
      const recipes = await prisma.recipe.findMany({ orderBy: { createdAt: 'asc' } });
      return send(response, 200, { data: recipes });
    }
    if (request.method === 'GET' && path.startsWith('/recipes/')) {
      const recipe = await prisma.recipe.findUnique({ where: { id: path.slice('/recipes/'.length) } });
      return recipe ? send(response, 200, { data: recipe }) : send(response, 404, { error: 'Recipe not found' });
    }
    if (request.method === 'POST' && path === '/auth/register') {
      const input = await body(request);
      const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
      const name = typeof input.name === 'string' ? input.name.trim() : '';
      const password = typeof input.password === 'string' ? input.password : '';
      if (!name || !validateCredentials(email, password)) return send(response, 400, { error: 'Name, valid email, and password of at least 8 characters are required' });
      if (await prisma.user.findUnique({ where: { email } })) return send(response, 409, { error: 'Email is already registered' });
      const user = await prisma.user.create({ data: { email, name, passwordHash: await bcrypt.hash(password, 12) } });
      return send(response, 201, { token: tokenFor(user.id), user: { id: user.id, email: user.email, name: user.name } });
    }
    if (request.method === 'POST' && path === '/auth/login') {
      const input = await body(request);
      const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
      const password = typeof input.password === 'string' ? input.password : '';
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) return send(response, 401, { error: 'Invalid email or password' });
      return send(response, 200, { token: tokenFor(user.id), user: { id: user.id, email: user.email, name: user.name } });
    }
    if (!requestWithUser.userId && (path === '/me' || path === '/favorites' || path.startsWith('/favorites/'))) return send(response, 401, { error: 'Authentication required' });
    if (request.method === 'GET' && path === '/me') {
      const user = await prisma.user.findUnique({ where: { id: requestWithUser.userId! }, select: { id: true, email: true, name: true } });
      return user ? send(response, 200, { data: user }) : send(response, 401, { error: 'User not found' });
    }
    if (request.method === 'GET' && path === '/favorites') {
      const favorites = await prisma.favorite.findMany({ where: { userId: requestWithUser.userId! }, include: { recipe: true }, orderBy: { createdAt: 'desc' } });
      return send(response, 200, { data: favorites.map((favorite) => favorite.recipe) });
    }
    if ((request.method === 'POST' || request.method === 'DELETE') && path.startsWith('/favorites/')) {
      const recipeId = path.slice('/favorites/'.length);
      if (request.method === 'POST') {
        await prisma.favorite.upsert({ where: { userId_recipeId: { userId: requestWithUser.userId!, recipeId } }, update: {}, create: { userId: requestWithUser.userId!, recipeId } });
        return send(response, 201, { saved: true });
      }
      await prisma.favorite.deleteMany({ where: { userId: requestWithUser.userId!, recipeId } });
      return send(response, 200, { saved: false });
    }
    return send(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return send(response, error instanceof Error && error.message === 'Invalid JSON' ? 400 : 500, { error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

server.listen(port, () => console.log(`Cookly API listening on http://localhost:${port}`));
process.on('SIGTERM', async () => { await prisma.$disconnect(); server.close(); });
