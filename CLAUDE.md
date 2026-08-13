# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LMS (Learning Management System) MVP — a Pluralsight-style platform for online courses with Stripe payments. Spanish-speaking developer; docs and comments are often in Spanish.

## Architecture

- **Frontend**: React 19 SPA with react-router 7 (Vite + Vitest; JSX lives in `.js` files, handled by a transform plugin in `vite.config.js`) on port 3000
- **Backend**: Spring Boot 3.5.x (Java 17) REST API on port 8080
- **Database**: PostgreSQL 18 with Flyway 11 migrations (`flyway.version` pinned in `backend/pom.xml` above Boot's managed version, plus the `flyway-database-postgresql` module)
- **Storage**: MinIO (S3-compatible) for video/PDF lesson content
- **Payments**: Stripe Checkout with webhook integration
- **Auth**: Stateless JWT (HS256) with Spring Security + BCrypt passwords. API semantics: 401 for missing/invalid token and bad credentials (`InvalidCredentialsException`), 403 for insufficient role

Frontend proxies `/api` requests to the backend via Nginx in production; in dev mode, Vite's `server.proxy` (target from `PROXY_TARGET`, defaults to localhost:8080).

## Development Commands

### Full stack (Docker)
```bash
docker compose up --build                          # Start everything
docker-compose down -v && docker-compose up --build -d  # Clean restart (wipes DB)
```
The `postgres:18+` image requires the data volume mounted at `/var/lib/postgresql` (not `.../data`); a PG15-era volume is binary-incompatible — run `docker compose down -v` after major Postgres bumps.

### Backend only
```bash
cd backend
mvn spring-boot:run                    # Run with DevTools hot-reload
mvn clean compile                      # Compile
mvn test                               # Run all tests
mvn test -Dtest=ClassName              # Run single test class
mvn test -Dtest=ClassName#methodName   # Run single test method
mvn clean package -DskipTests          # Build JAR without tests
```
`mvn test` needs a running Docker daemon: the Cucumber BDD suite (`CucumberTest`) boots Postgres 18 + MinIO via Testcontainers, and the payments tests (`StripeSessionCompatTest`, `PaymentWebhookFlowTest`) additionally boot `stripe/stripe-mock` — the full Stripe checkout/webhook flow is covered without real keys (`stripe.api-base` / `STRIPE_API_BASE` points the SDK at the mock; empty = real Stripe). `SpringIntegrationTest` starts its containers in a static block because Cucumber's JUnit Platform engine does not run the Jupiter `@Testcontainers` extension. Cucumber's version lives in the `cucumber.version` property and is paired with an explicit `junit-bom` import — Cucumber 7.34+ needs a newer JUnit Platform than Boot manages, or test discovery fails with "TestEngine with ID 'cucumber' failed to discover tests". With colima instead of Docker Desktop, export first:
```bash
export DOCKER_HOST="unix://$HOME/.colima/default/docker.sock"
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE="/var/run/docker.sock"
```

### Frontend only
```bash
cd frontend
npm install
npm start         # Vite dev server on port 3000 (PORT env overrides)
npm run build     # Production build (output in build/, served by nginx)
npm test          # Vitest, single run
npm run test:watch  # Vitest watch mode
```
Node 20.19+/22 required (Vite 7). Regenerate `package-lock.json` with npm 10 (e.g. inside a `node:20` container) — locks written by npm 11 fail `npm ci` on CI's Node 20. The dev container mounts `src/`, `public/`, `index.html` and `vite.config.js`; config changes outside those need an image rebuild.

### E2E tests (Playwright)
```bash
cd e2e
npm install
npx playwright install chromium
npx playwright test                    # Run all E2E tests
npx playwright test tests/smoke.spec.ts  # Run single spec
npx playwright show-report             # View HTML report
```
E2E requires the full stack running. CI uses `docker compose up` first. Test credentials: `admin@lms.com`/`admin123` (ADMIN), `test@example.com`/`Password123` (USER).

The dev/E2E compose stack sets `RATELIMIT_ENABLED: "false"` (the login rate limiter — 5/min per IP — would 429 the suite); the same flag is off in the backend `test` profile. In `e2e/helpers/auth.ts`, Playwright's request API takes `data:` (there is no `json:` option), and `localStorage` must be set after navigating to the app origin — `about:blank` is an opaque origin.

## Key Backend Packages (`com.lms.*`)

| Package | Purpose |
|---------|---------|
| `auth` | JWT auth (AuthController, AuthService, JwtService, JwtAuthenticationFilter) |
| `courses` | Course CRUD + AdminController for admin operations |
| `lessons` | Lesson management tied to courses |
| `payments` | Stripe Checkout + webhook (`checkout.session.completed`) |
| `progress` | Lesson completion tracking, percentage calculation |
| `assessments` | Quiz/assessment system |
| `enrollments` | Course enrollment management |
| `users` | User management, groups, roles (USER/ADMIN/STUDENT/INSTRUCTOR) |
| `storage` | MinIO integration, presigned URL generation (60-min expiry). Two clients: internal for operations, `minioPresignerClient` (public endpoint) only signs URLs |
| `config` | SecurityConfig, MinioConfig, AuditLog, DevDemoPasswordsInitializer |

## Database Migrations

Flyway migrations live in `backend/src/main/resources/db/migration_clean/` (V1 through V40). Hibernate is set to `validate` — all schema changes must go through Flyway migrations, not JPA auto-DDL. Never edit an applied migration (checksum mismatch); add a new one — e.g. V40 exists solely to correct the invalid seeded password hashes V27 shipped.

Key tables: `users`, `courses`, `lessons`, `purchases`, `progress`, `assessments`, `questions`, `submissions`, `modules`, `categories`, `user_groups`, `waitlist`.

## Frontend Structure

- `src/api/api.js` — Axios client with JWT interceptor (auto-attaches Bearer token; on 401 tries token refresh, redirects to /login only for expired sessions — failed `/auth/login`/`register` reject so pages can render the error)
- `src/context/AuthContext.js` — Global auth state (token + user in localStorage)
- `src/pages/Admin.js` — Large admin dashboard (~130KB), handles course/lesson/user management
- `src/pages/` — One file per page route (Login, Register, Home, CourseDetail, Lesson, Profile, Assessments)

## Environment Configuration

All config is via environment variables. See `docker-compose.yml` for the full list. Key ones:
- `SPRING_DATASOURCE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_API_BASE` (tests only)
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_PUBLIC_ENDPOINT`
- Frontend build args: `VITE_API_URL`, `VITE_ENABLE_DEV_LOGIN` (baked at build time via `import.meta.env`)
- `MAIL_ENABLED` also gates the SMTP health indicator — without it, a missing mail config would drag `/actuator/health` to DOWN

Backend config: `backend/src/main/resources/application.properties` (reads from env vars).

### Credentials

`JWT_SECRET` and the Postgres/MinIO credentials in `docker-compose.yml` use `${VAR:-default}` interpolation: override them via a gitignored `.env` (see `.env.example`; `.env.prod.example` for production). The committed defaults are dev-grade — anything in the repo is public, so real deployments must set their own values. The MinIO variables are shared by three consumers (the `minio` service, the backend's `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY`, and the `minio-init` entrypoint in the override file) — keep them in sync through the variables, never hardcode. Changing `POSTGRES_PASSWORD` with an existing volume requires `docker compose down -v`; Postgres bakes credentials at initdb. Don't add per-service secrets to `docker-compose.override.yml`: its `environment` entries silently override the base file key-by-key.

## CI/CD

GitHub Actions workflow (`.github/workflows/e2e.yml`) runs on push/PR to master: frontend unit tests (Vitest), backend BDD/unit tests, then builds the full Docker stack and runs Playwright E2E against it. On e2e failure the job dumps `docker compose ps -a` + container logs — without that, a crashed backend just looks like a 120s timeout in global-setup.

## License

Business Source License 1.1 (BSL) — free for organizations under $1M revenue; becomes Apache 2.0 on Jan 1, 2029.