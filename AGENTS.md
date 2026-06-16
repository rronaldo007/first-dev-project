# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**first-dev-project** is a Node.js/Express backend API for user authentication and acquisitions management. The architecture follows a layered pattern with clear separation of concerns: controllers handle HTTP requests, services contain business logic, models define database schemas using Drizzle ORM, and utilities provide reusable functions.

**Stack:**
- **Runtime:** Node.js (ES modules)
- **Framework:** Express.js 5.x
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **Logging:** Winston
- **Code Quality:** ESLint (with Prettier integration) + Prettier

## Directory Structure

```
src/
├── index.js                  # Entry point (loads .env, then server.js)
├── server.js                 # Express server startup
├── app.js                    # Express app configuration with middleware
├── config/                   # Configuration files
│   ├── database.js          # Drizzle + Neon connection
│   └── logger.js            # Winston logger setup
├── models/                   # Drizzle schema definitions (ORM models)
│   └── user.model.js        # User table schema
├── controllers/              # Request handlers (HTTP layer)
│   └── auth.controller.js   # Authentication endpoints
├── services/                 # Business logic and database operations
│   └── auth.service.js      # User creation, hashing, DB queries
├── routes/                   # Express route definitions
│   └── auth.routes.js       # Auth endpoints (/api/auth/*)
├── validations/              # Zod input validation schemas
│   └── auth.validation.js   # Sign-up, sign-in schema
├── utils/                    # Reusable utilities
│   ├── jwt.js               # JWT sign/verify
│   ├── cookies.js           # Cookie management
│   └── format.js            # Error formatting
└── middleware/               # Express middleware (currently empty)
```

## Commands

### Development

```bash
# Start dev server with file watching (restarts on file changes)
npm run dev

# Run linting checks (ESLint)
npm run lint

# Auto-fix ESLint violations
npm run lint:fix

# Check code formatting (Prettier)
npm run format:check

# Auto-format code (Prettier)
npm run format

# Run linting + formatting in one pass
npm run lint:fix && npm run format
```

### Database

```bash
# Generate migration files from schema changes
npm run db-generate

# Apply pending migrations to database
npm run db-migrate

# Open Drizzle Studio (visual DB browser)
npm run db-studio
```

### Testing

```bash
# Tests not yet implemented
npm test
```

## Architecture Patterns

### Layered Request Flow
Requests flow through: **Route** → **Controller** → **Service** → **Database Model**

1. **Routes** (`src/routes/`) — Define HTTP endpoints and verb mappings.
2. **Controllers** (`src/controllers/`) — Parse requests, validate input with Zod, call services, format responses.
3. **Services** (`src/services/`) — Contain business logic (password hashing, user creation, queries).
4. **Models** (`src/models/`) — Define Drizzle ORM table schemas; referenced directly in services.

### Database Layer
- **Drizzle ORM** with serverless PostgreSQL (Neon via `@neondatabase/serverless`).
- Models are schema definitions, **not classes**; services perform all DB queries using Drizzle's query builder.
- Database instance in `src/config/database.js` exports `{ sql, db }`.

### Validation
- **Zod schemas** in `src/validations/` are applied in controllers before calling services.
- `formatValidationError()` utility normalizes error output.

### Authentication (Partial Implementation)
- **JWT** utility (`src/utils/jwt.js`) with configurable secret and expiration.
- **bcrypt** for password hashing in `auth.service.js`.
- **Cookies** utility sets HTTP-only, secure, SameSite-strict cookies.
- `POST /api/auth/sign-up` is complete; `sign-in` and `sign-out` are stubs.

### Logging
- **Winston logger** in `src/config/logger.js` writes JSON to files (`logs/error.log`, `logs/combined.log`) and console in dev.
- Imported as `import logger from '#config/logger.js'` and used throughout for structured logging.

### Middleware
- **helmet** for security headers.
- **CORS** configured (blanket allow; should be scoped before production).
- **morgan** for HTTP request logging (piped to Winston).
- **cookie-parser** for request.cookies parsing.
- Middleware stack in `src/app.js` is executed before routes.

## Path Aliases

Import paths use aliases defined in `package.json` for cleaner imports:

```javascript
import logger from '#config/logger.js';
import { createUser } from '#services/auth.service.js';
import { User } from '#models/user.model.js';
import authRoutes from '#routes/auth.routes.js';
```

**Alias mappings:**
- `#config/` → `./src/config/`
- `#controllers/` → `./src/controllers/`
- `#models/` → `./src/models/`
- `#middleware/` → `./src/middleware/`
- `#routes/` → `./src/routes/`
- `#services/` → `./src/services/`
- `#utils/` → `./src/utils/`
- `#validations/` → `./src/validations/`

## Code Quality Standards

### ESLint Rules
- **Indentation:** 2 spaces (1 for switch cases).
- **Line endings:** Unix (LF).
- **Quotes:** Single quotes.
- **Semicolons:** Required.
- **Unused variables:** Error, unless prefixed with `_`.
- **no-console:** Off (allows console.log; use logger for production output).
- **const/let:** Enforced; no `var`.
- **Object shorthand:** Enforced (`{ name }` not `{ name: name }`).
- **Arrow callbacks:** Enforced over `function() {}`.

### Prettier Config
- Line width: 80 characters.
- Tab width: 2 spaces.
- Single quotes.
- Trailing commas: ES5 (default).
- Arrow function parens: Avoid when possible (`x => x`, not `(x) => x`).

### Pre-commit Checklist
Before committing, run:
```bash
npm run lint:fix && npm run format && npm run lint:check
```

## Environment Configuration

Copy `.env.exemple` to `.env` and set:

```env
# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require&channel_binding=require

# Auth (optional, defaults provided)
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
```

## Key Implementation Notes

### Database Migrations
After schema changes in `src/models/`, run:
```bash
npm run db-generate    # Creates migration in drizzle/
npm run db-migrate     # Applies migration to DB
```

### Adding New Endpoints
1. Create controller in `src/controllers/` with request handler.
2. Create service(s) in `src/services/` with business logic.
3. Create Zod schema in `src/validations/` if input validation needed.
4. Add route in `src/routes/` mapping HTTP method/path to controller.
5. Import route in `src/app.js` and mount with `app.use()`.

### Error Handling
- Controllers catch errors, log with `logger.error()`, and respond with appropriate status codes.
- Services throw descriptive errors caught by controllers.
- No global error handler currently defined; add middleware to `src/app.js` for 500/404/etc.

### Cookies vs JWT
Both are implemented:
- **JWT** created on sign-up, used for stateless auth.
- **Cookies** set in response with JWT token; `getOptions()` enforces httpOnly, secure, sameSite rules.

## Known Gaps / TODOs

- **Testing:** `npm test` is a stub; no test framework configured.
- **Global error handler:** No catch-all middleware for unhandled errors.
- **Authentication middleware:** No route protection; `sign-in` and `sign-out` are unimplemented.
- **CORS:** Currently allows all origins; scope before production.
- **Middleware directory:** Reserved but unused.

## Git Workflow

Main branch is `main`. Typical workflow:
```bash
git checkout -b feature/your-feature
# Make changes
npm run lint:fix && npm run format
git add .
git commit -m "description"
git push origin feature/your-feature
# Open PR
```

Include co-author line in commits:
```
Co-Authored-By: Oz <oz-agent@warp.dev>
```
