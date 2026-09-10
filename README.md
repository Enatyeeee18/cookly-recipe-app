# Cookly

Cookly is a focused recipe discovery app for quick, practical home cooking.

## Production setup

Install Node.js 20 LTS or newer, then run `npm install`. Copy `apps/api/.env.example` to `apps/api/.env`, set a strong secret, and start MySQL with `npm run db:up`. Initialize persistence with `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed`.

For deployment, build `apps/api/Dockerfile` with a managed MySQL `DATABASE_URL`; `apps/api/render.yaml` contains a Render service definition. Set `EXPO_PUBLIC_API_URL` to the deployed API URL before building the mobile app. See [RELEASE_CHECKLIST.md](apps/mobile/RELEASE_CHECKLIST.md) and [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for the store release requirements.

## Mobile app

```powershell
npm install
npm run mobile:dev
```

The mobile app includes account registration/login, API-backed recipe loading, search, category filters, favorites, and recipe details. It falls back to bundled recipes when the API is unavailable during development.

## Workspace checks

```powershell
npm run typecheck
npm run build
npm test
```
