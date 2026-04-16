# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LMS (Learning Management System) MVP — a Pluralsight-style platform for online courses with Stripe payments. Spanish-speaking developer; docs and comments are often in Spanish.

## Architecture

- **Frontend**: React 18 SPA (Create React App) on port 3000
- **Backend**: Spring Boot 3.2.1 (Java 17) REST API on port 8080
- **Database**: PostgreSQL 15 with Flyway migrations
- **Storage**: MinIO (S3-compatible) for video/PDF lesson content
- **Payments**: Stripe Checkout with webhook integration
- **Auth**: Stateless JWT (HS256) with Spring Security + BCrypt passwords

Frontend proxies `/api` requests to the backend via Nginx in production; in dev mode, React's proxy or direct calls to localhost:8080.

## Development Commands

### Full stack (Docker)
```bash
docker compose up --build                          # Start everything
docker-compose down -v && docker-compose up --build -d  # Clean restart (wipes DB)
```

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

Flyway migrations live in `backend/src/main/resources/db/migration_clean/` (V1 through V27). Hibernate is set to `validate` — all schema changes must go through Flyway migrations, not JPA auto-DDL.

Key tables: `users`, `courses`, `lessons`, `purchases`, `progress`, `assessments`, `questions`, `submissions`, `modules`, `categories`, `user_groups`, `waitlist`.

## Frontend Structure

- `src/api/api.js` — Axios client with JWT interceptor (auto-attaches Bearer token, redirects to /login on 401)
- `src/context/AuthContext.js` — Global auth state (token + user in localStorage)
- `src/pages/Admin.js` — Large admin dashboard (~130KB), handles course/lesson/user management
- `src/pages/` — One file per page route (Login, Register, Home, CourseDetail, Lesson, Profile, Assessments)

## Environment Configuration

All config is via environment variables. See `docker-compose.yml` for the full list. Key ones:
- `SPRING_DATASOURCE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`
- `REACT_APP_API_URL`, `REACT_APP_STRIPE_PUBLIC_KEY`

Backend config: `backend/src/main/resources/application.properties` (reads from env vars).

## CI/CD

GitHub Actions workflow (`.github/workflows/e2e.yml`) runs on push/PR to master: builds the full Docker stack, then runs Playwright E2E tests against it.

## License

Business Source License 1.1 (BSL) — free for organizations under $1M revenue; becomes Apache 2.0 on Jan 1, 2029.