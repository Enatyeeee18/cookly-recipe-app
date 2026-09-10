# Cookly API

## Setup

1. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`.
2. Start MySQL with `npm run db:up` from the repository root.
3. Run `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed`.
4. Start the API with `npm run api:dev`.

Routes:

- `GET /health`
- `GET /recipes`
- `GET /recipes/:id`
- `POST /auth/register` with `{ "email", "name", "password" }`
- `POST /auth/login` with `{ "email", "password" }`
- `GET /me` with a bearer token
- `GET /favorites` with a bearer token
- `POST /favorites/:recipeId` with a bearer token
- `DELETE /favorites/:recipeId` with a bearer token
