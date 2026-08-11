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

Frontend proxies `/api` requests to the backend via Nginx in production; in dev mode, React's proxy or direct calls to localhost:8080.

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
`mvn test` needs a running Docker daemon: the Cucumber BDD suite (`CucumberTest`) boots Postgres 18 + MinIO via Testcontainers. `SpringIntegrationTest` starts its containers in a static block because Cucumber's JUnit Platform engine does not run the Jupiter `@Testcontainers` extension. With colima instead of Docker Desktop, export first:
```bash
export DOCKER_HOST="unix://$HOME/.colima/default/docker.sock"
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE="/var/run/docker.sock"
```

### Frontend only
```bash
cd frontend
npm install
npm start         # Dev server on port 3000
npm run build     # Production build
npm test          # Run tests
```

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
| `storage` | MinIO integration, presigned URL generation (60-min expiry) |
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
- `SPRING_DATASOURCE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`
- `REACT_APP_API_URL`, `REACT_APP_STRIPE_PUBLIC_KEY`

Backend config: `backend/src/main/resources/application.properties` (reads from env vars).

### Credentials

`JWT_SECRET` and the Postgres/MinIO credentials in `docker-compose.yml` use `${VAR:-default}` interpolation: override them via a gitignored `.env` (see `.env.example`; `.env.prod.example` for production). The committed defaults are dev-grade — anything in the repo is public, so real deployments must set their own values. The MinIO variables are shared by three consumers (the `minio` service, the backend's `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY`, and the `minio-init` entrypoint in the override file) — keep them in sync through the variables, never hardcode. Changing `POSTGRES_PASSWORD` with an existing volume requires `docker compose down -v`; Postgres bakes credentials at initdb. Don't add per-service secrets to `docker-compose.override.yml`: its `environment` entries silently override the base file key-by-key.

## CI/CD

GitHub Actions workflow (`.github/workflows/e2e.yml`) runs on push/PR to master: frontend unit tests (Jest exits 1 if no test files exist — keep at least one under `frontend/src/__tests__/`), backend BDD/unit tests, then builds the full Docker stack and runs Playwright E2E against it.

## License

Business Source License 1.1 (BSL) — free for organizations under $1M revenue; becomes Apache 2.0 on Jan 1, 2029.