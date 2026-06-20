# Hono + Drizzle + Better Auth Starter Kit

A production-oriented starter for building modular APIs with:

- `hono` for routing and middleware
- `drizzle-orm` + PostgreSQL for data access
- `better-auth` for authentication, organizations, admin features, and API keys
- `@hono/zod-openapi` + Scalar for schema-driven API docs
- `pino` for structured logging
- `vitest` for e2e tests

## Libraries Installed And Used

### Core runtime and API

- `hono`: Web framework used across `src/app.ts` and module routes.
- `@hono/node-server`: Node adapter that runs the Hono app in `src/index.ts`.

### Database and schema

- `drizzle-orm`: Type-safe SQL and schema mapping.
- `pg`: PostgreSQL driver.
- `drizzle-kit` (dev): schema push/migration tooling.

### Authentication

- `better-auth`: main auth system.
- `@better-auth/drizzle-adapter`: Better Auth <-> Drizzle adapter.
- `@better-auth/api-key`: API key plugin.
- Better Auth plugins enabled in `src/auth.ts`:
	- organization plugin (`organization()`)
	- admin plugin (`admin()`)
	- API key plugin (`apiKey()`)

### Validation and API docs

- `zod`: request/response schemas and environment validation.
- `@hono/zod-openapi`: OpenAPI routes from Zod schemas.
- `@scalar/hono-api-reference`: interactive API docs at `/scalar`.

### Logging and utility

- `pino`: structured logger.
- `pino-pretty` (dev): readable pretty logs in development.
- `dotenv`: environment variable loading.

### Testing and quality

- `vitest`: e2e test runner.
- `typescript` + `tsx`: TypeScript compile/dev runtime.
- `ultracite` + `@biomejs/biome`: linting and formatting standards.

## Better Auth Integration

Better Auth is configured in `src/auth.ts` and mounted through `src/app.ts`:

- Auth handler route: `app.on(["GET", "POST"], "/api/auth/*", ...)`
- Session is loaded per request via `auth.api.getSession(...)`
- Session user/session are saved into Hono context variables (`user`, `session`)

Better Auth database schema is generated into `src/db/better-auth-schema.ts`.

### Better Auth pnpm commands

```bash
# Generate Better Auth schema file from src/auth.ts config
pnpm run db:auth:generate

# Run Better Auth migrations
pnpm run db:auth:migrate

# Push Drizzle schema to database (app + auth schema)
pnpm run db:push
```

## Folder Structure And Module Separation

```text
src/
	index.ts                      # Server bootstrap
	app.ts                        # Hono app, middleware, route mounting
	auth.ts                       # Better Auth configuration
	env.ts                        # Zod-validated environment config
	logger.ts                     # Pino logger setup
	db/
		client.ts                   # Drizzle + pg client
		app-schema.ts               # App domain tables
		better-auth-schema.ts       # Better Auth generated schema
	types/
		app-context.ts              # Hono context variable types
	modules/
		auth/
			auth.service.ts
		health/
			health.routes.ts
			health.service.ts
			health.repo.ts
			health.schema.ts
			health.types.ts
		posts/
			posts.routes.ts
			posts.service.ts
			posts.repo.ts
			posts.schema.ts
			posts.types.ts
		docs/
			docs.routes.ts
			docs.service.ts
			docs.repo.ts

test/
	auth.e2e.test.ts
	posts.e2e.test.ts
	helpers/
		app.ts
		auth.ts
		organization.ts
```

### File convention

Each module follows a consistent split:

- `*.routes.ts`: HTTP handlers, middleware, OpenAPI route declarations.
- `*.service.ts`: business logic and orchestration.
- `*.repo.ts`: database access only.
- `*.schema.ts`: Zod request/response schemas.
- `*.types.ts`: TypeScript types inferred from schemas or domain models.

Typical flow is: `routes -> service -> repo`.

## Local Environment Setup

### Prerequisites

- Node.js 18+
- pnpm
- Docker + Docker Compose (for local PostgreSQL)

### 1) Install dependencies

```bash
pnpm install
```

### 2) Create environment file

```bash
cp .env.example .env
```

Important variables from `.env.example`:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_TRUSTED_ORIGINS`
- `BETTER_AUTH_ADMIN_DEFAULT_ROLE`
- `PORT`
- `LOG_LEVEL`
- `NODE_ENV`

### 3) Start local database

```bash
pnpm run infra:up
```

Useful infra commands:

```bash
pnpm run infra:ps
pnpm run infra:logs
pnpm run infra:down
```

### 4) Initialize database schema

```bash
pnpm run db:push
pnpm run db:auth:migrate
```

### 5) Start development server

```bash
pnpm run dev
```

Open:

- API root/health: `http://localhost:3000/` and `http://localhost:3000/health`
- OpenAPI JSON: `http://localhost:3000/doc`
- Scalar UI: `http://localhost:3000/scalar`

## Logger

Logging is centralized in `src/logger.ts` using `pino`.

- `LOG_LEVEL` controls verbosity (`fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent`).
- In development, `pino-pretty` is enabled for human-readable logs.
- In production, logs are structured JSON.

Request-level logging happens in `src/app.ts` middleware and includes:

- `method`
- `path`
- `statusCode`
- `durationMs`
- `requestId`
- `userId` (when authenticated)

Domain-level logs can use child loggers, for example `src/modules/posts/posts.service.ts` creates a module logger (`module: "posts"`) and logs key actions like post create/list events.

## E2E Testing

This starter includes end-to-end tests focused on auth and authorization behavior.

### Test files

- `test/auth.e2e.test.ts`
	- sign-up flow
	- authenticated session access
	- API key creation
	- admin user listing
	- organization creation
- `test/posts.e2e.test.ts`
	- unauthenticated access rejection
	- org admin post creation
	- non-admin create forbidden
	- org-scoped visibility checks
	- cross-organization isolation

### Test helpers

- `test/helpers/app.ts`: request helper against the app instance.
- `test/helpers/auth.ts`: user signup/session helpers and role/session utilities.
- `test/helpers/organization.ts`: organization creation and membership-role helpers.

### Run tests

```bash
# All tests
pnpm run test

# E2E suite only
pnpm run test:e2e
```

## Development Commands

```bash
# App lifecycle
pnpm run dev
pnpm run build
pnpm run start

# Database / auth schema
pnpm run db:push
pnpm run db:auth:generate
pnpm run db:auth:migrate

# Quality
pnpm run typecheck
pnpm run check
pnpm run fix

# Infra
pnpm run infra:up
pnpm run infra:down
pnpm run infra:logs
pnpm run infra:ps
```
