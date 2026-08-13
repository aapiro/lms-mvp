# TODO

Pendientes tras la modernización de agosto 2026 (tests verdes, PG18, Boot 3.5, deps al día).

## Prioridad alta

- [x] **Migración CRA → Vite** (agosto 2026): Vite 7 + Vitest 4. Env vars ahora `VITE_*` (`import.meta.env`), proxy dev en `vite.config.js`, JSX en `.js` vía plugin de transformación.
- [x] **Checkout Stripe con mock** (agosto 2026): `PaymentWebhookFlowTest` cubre el flujo completo contra stripe-mock — checkout por el stack real (controller→service→SDK 33), webhook `checkout.session.completed` con firma HMAC válida crea la purchase, firma inválida → 400. El webhook ahora usa la Session del payload verificado (patrón recomendado por Stripe, sin `Session.retrieve` extra) y `stripe.api-base` es configurable para tests.
- [ ] **(Opcional) Checkout Stripe contra cuenta real en test mode**: humo manual con claves `sk_test_` propias — `.env` + `stripe listen --forward-to localhost:8080/api/payments/webhook` + tarjeta `4242 4242 4242 4242`.

## Prioridad media

- [x] **React 19 + react-router 7** (agosto 2026): drop-in tras Vite; react-chartjs-2 5.3.1 para peer de React 19.
- [x] **Actuator health DOWN en dev** (agosto 2026): `management.health.mail.enabled=${MAIL_ENABLED:false}` — el health de SMTP solo cuenta cuando el mail está activo.
- [x] **Rediseñar MinioConfig** (agosto 2026): cliente interno (`@Primary`) para operaciones y `minioPresignerClient` con endpoint público solo para firmar URLs; el arranque ya no depende de resolver el endpoint público.

## Prioridad baja

- [x] Warning `react-hooks/exhaustive-deps` en Dashboard.js (agosto 2026): fetch movido dentro del useEffect con `features.gamification` como dependencia real.
- [x] Cucumber 7.15.0 → 7.34.6 (agosto 2026): requiere `junit-bom` 5.14.2 importado (Boot 3.5 gestiona Platform 1.12 y el engine no descubre tests).
- [x] Ampliar tests frontend (agosto 2026): +9 tests de hooks (`useForm`, `usePagination`) — 13 en total. Admin.js sigue sin cobertura directa (lo cubre E2E admin.spec).
