# TODO

Pendientes tras la modernización de agosto 2026 (tests verdes, PG18, Boot 3.5, deps al día).

## Prioridad alta

- [x] **Migración CRA → Vite** (agosto 2026): Vite 7 + Vitest 4. Env vars ahora `VITE_*` (`import.meta.env`), proxy dev en `vite.config.js`, JSX en `.js` vía plugin de transformación.
- [ ] **Probar checkout Stripe real en test mode**: el upgrade stripe-java 24 → 33 cambia la versión de API enviada en las llamadas. Los tests BDD usan el bypass de pago dev (`dev_payments`), así que el flujo real de Checkout/webhook no está cubierto. Verificar `Session.create` y `Webhook.constructEvent` con claves de test antes de confiar en producción.

## Prioridad media

- [ ] **React 19 + react-router 7**: ya desbloqueados por Vite; upgrade en tarea propia.
- [ ] **Actuator health DOWN en dev**: `MailHealthIndicator` falla sin SMTP configurado y tumba `/actuator/health` completo. Valorar `management.health.mail.enabled=false` en dev o configurar credenciales.
- [ ] **Rediseñar MinioConfig**: el cliente usa `MINIO_PUBLIC_ENDPOINT` para todo (incluido `bucketExists` en arranque), lo que acopla la salud del backend a la resolubilidad del endpoint público (origen del crash en CI con minio 9). Lo correcto: cliente interno contra `minio:9000` y endpoint público solo para firmar presigned URLs.

## Prioridad baja

- [ ] Warning `react-hooks/exhaustive-deps` en `frontend/src/pages/Dashboard.js` (useEffect sin `loadDashboard` en deps).
- [ ] Subir Cucumber 7.15.0 a la última 7.x.
- [ ] Ampliar tests frontend (solo existen ConfirmModal y Login; Admin.js ~130KB sin cobertura).
