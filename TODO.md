# TODO

Pendientes tras la modernización de agosto 2026 (tests verdes, PG18, Boot 3.5, deps al día).

## Prioridad alta

- [x] **Migración CRA → Vite** (agosto 2026): Vite 7 + Vitest 4. Env vars ahora `VITE_*` (`import.meta.env`), proxy dev en `vite.config.js`, JSX en `.js` vía plugin de transformación.
- [ ] **Probar checkout Stripe real en test mode**: compatibilidad del SDK 33 ya validada contra stripe-mock (`StripeSessionCompatTest`: `Session.create`/`retrieve` con la misma forma de params que `PaymentService`). Falta el flujo end-to-end con claves reales de test: poner `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` en `.env` (ver `.env.example`), `stripe listen --forward-to localhost:8080/api/payments/webhook`, comprar con tarjeta `4242 4242 4242 4242` y verificar que el webhook crea la purchase.

## Prioridad media

- [x] **React 19 + react-router 7** (agosto 2026): drop-in tras Vite; react-chartjs-2 5.3.1 para peer de React 19.
- [x] **Actuator health DOWN en dev** (agosto 2026): `management.health.mail.enabled=${MAIL_ENABLED:false}` — el health de SMTP solo cuenta cuando el mail está activo.
- [x] **Rediseñar MinioConfig** (agosto 2026): cliente interno (`@Primary`) para operaciones y `minioPresignerClient` con endpoint público solo para firmar URLs; el arranque ya no depende de resolver el endpoint público.

## Prioridad baja

- [ ] Warning `react-hooks/exhaustive-deps` en `frontend/src/pages/Dashboard.js` (useEffect sin `loadDashboard` en deps).
- [ ] Subir Cucumber 7.15.0 a la última 7.x.
- [ ] Ampliar tests frontend (solo existen ConfirmModal y Login; Admin.js ~130KB sin cobertura).
