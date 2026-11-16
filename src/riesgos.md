# Riesgos

Este registro consolida el seguimiento histórico de riesgos técnicos, operativos, de seguridad y de negocio identificados durante el proyecto, diferenciando aquellos que fueron **mitigados en el código vigente** de los que **permanecen abiertos o aceptados** dentro del alcance actual del producto.

---

## Estado consolidado de riesgos técnicos y de producto

| ID | Riesgo | Área | Estado actual | Evidencia y medidas vigentes / pendientes |
| :--- | :--- | :--- | :--- | :--- |
| **R-04** | Matching geográfico ingenuo en memoria y baja relevancia en rutas largas | Backend / Matching | **Mitigado** | `RecommendLoadsUseCase` ejecuta prefiltros en PostgreSQL + PostGIS (`ST_DWithin` con índices GiST) en Tier 1 y corredor vial Tier 2 (`PassThroughZone`), puntuando por aprovechamiento y precio/km (`LoadScorer`). |
| **R-06** | Indisponibilidad o latencia del proveedor de rutas externo | Geo / Integración | **Parcialmente mitigado** | `geo-service` usa caché en borde (`caches.default`), `stale-if-error`, 11.175 rutas precalculadas OSRM/OSM en PostgreSQL, fallback a Mapbox Directions (`no-store`) y estimación Haversine (`is_estimation: true`). El backend degrada Tier 2 a Tier 1 si `geo-service` falla; el timeout por lote sigue en `5 s` vía `urllib`. |
| **R-07** | Cobro de desbloqueo sin mecanismo de reembolso ante fallas o cancelaciones | Pagos | **Mitigado** | Implementado reembolso automático vía MercadoPago ante colisión tardía en webhook, manipulación de estado o cancelación de reserva iniciada por el dador. |
| **R-11** | Bloqueo indefinido de una carga si el transportista abandona el checkout | Concurrencia | **Mitigado** | `lock_atomically` fija `reserved_until = NOW + 600 s` (10 minutos), la consulta filtra locks expirados (`_available_clause` / `released_if_expired`) y existe `/abort-lock` explícito. |
| **R-12** | Acceso indebido a endpoints o suplantación de identificadores en ruta | Seguridad | **Mitigado** | Guardias de sesión JWT ES256 obligatorios en todas las rutas salvo `PUBLIC_ROUTES` verificados automáticamente por `test_routes_require_authentication.py`, junto a dependencias de pertenencia (`require_own_offerer`, `require_own_transporter`). |
| **R-13** | Ausencia de cancelación bilateral tras una reserva | Dominio | **Mitigado** | Casos de uso `CancelLoadByOffererUseCase` (reembolso automático, cierre definitivo `cancelada` y penalidad) y `CancelLoadReservationByTransporterUseCase` (sin reembolso, reapertura a `activa` si la fecha es vigente y penalidad). |
| **R-16** | Siniestros sobre la carga o impago del flete entre privados | Negocio / Legal | **Abierto (aceptado)** | Smartruck intermedia únicamente el contacto inicial; pólizas de seguro, carta de porte y pago del traslado quedan bajo acuerdo directo entre dador y transportista. |
| **R-17** | Cuello de botella por verificación manual de cuentas en Backoffice | Operación | **Abierto** | La revisión de constancias en `smartruck-backoffice` es manual (`admin_users` / `admin_documents`), sin validación automática contra padrones externos ni OCR. |
| **R-20** | Valores inconsistentes entre calculadora del portal y dominio backend | Producto / UI | **Mitigado** | `empty-return-cost.ts` en transportista y `FleetAssumptions` en backend comparten parámetros unificados (`28 L/100 km`, `2400 ARS/L`, `35.000 ARS` peaje, `2,68 kg CO2/L`). |
| **R-25** | Exposición de secretos en despliegue y ausencia de limpieza de archivos huérfanos | Seguridad / Infra | **Parcialmente abierto** | CI utiliza **WIF (OIDC)** para GCP y **Gitleaks** en todos los repositorios; sin embargo, `smartruck-backend` aún inyecta secretos mediante `--set-env-vars` desde Infisical en `pipeline.yml` y no existe un proceso automático para purgar documentos huérfanos en Supabase Storage. |
| **R-26** | Regla de rate-limiting en Cloudflare WAF desalineada de `/geo/*` | Infra / Edge | **Abierto** | `smartruck-infra/modules/cloudflare_waf/main.tf` filtra el patrón `/routes*`, por lo que las rutas actuales bajo `/geo/*` no quedan cubiertas hasta unificar el prefijo en Terraform. |
| **R-27** | Dimensionamiento implícito de pool SQL y observabilidad Datadog incompleta en `prod` | Infra / Operación | **Abierto** | `engine.py` crea conexiones SQL con `pool_pre_ping=True` sin límites explícitos de pool (`pool_size` / `max_overflow`), y los módulos de reenvío a Datadog (`datadog_log_forwarding` y `render_datadog_log_stream`) solo están cableados en `test`, no en `prod`. |
| **R-28** | Divergencia entre cálculo de `unlock_fee` y verificación superficial de smoke test | Calidad / Dominio | **Abierto** | El backend calcula `unlock_fee` con distancia Haversine (`(5 + 0,04 * km) * 1500 ARS`), el portal transportista conserva un cálculo de contingencia cliente con +21% IVA ante error de API y `smoke_test.sh` solo consulta `/version`. |
| **R-30** | Competencia concurrente ("el primero que desbloquea gana") | Modelo operativo | **Abierto (aceptado)** | Acotado mediante lock exclusivo de 10 minutos al iniciar el pago, sin esquema de licitación múltiple. |
| **R-31** | Falta de marco legal de aceptación en el registro | Legal / UX | **Parcialmente mitigado** | Tanto `smartruck-dador` como `smartruck-transportista` exigen aceptar `TermsAndConditionsDialog` al registrarse; resta consolidar flujos de actualización de políticas y retención de datos. |

---

## Riesgos de negocio, adopción y contexto argentino

Además de los riesgos técnicos, el diseño del producto contempla cuatro riesgos propios del mercado de cargas en Argentina:

1. **Desactualización tarifaria por contexto inflacionario:** Un tarifario estático pierde validez rápidamente. Se mitigó incorporando historial de vigencia (`effective_from`), ajuste porcentual configurable en Backoffice e importación directa de grillas FADEEAC distancia-tonelaje desde PDF, aunque exige disciplina operativa para mantener las tablas al día.
2. **Desintermediación luego del primer contacto (*bypass*):** Una vez conectado un dador con un transportista, operaciones recurrentes futuras pueden realizarse fuera de la plataforma. Se contrarresta aportando valor continuo en métricas de ahorro real, seguimiento de viajes, historial de calificaciones y visibilidad de retornos diarios.
3. **Fricción por pago previo al contacto:** Transportistas PyME pueden desconfiar de abonar un desbloqueo antes de hablar con el dador. El reembolso automático si el dador cancela, el bloqueo exclusivo de 10 minutos y el cálculo transparente del ahorro esperado reducen esa barrera.
4. **Calidad y consistencia de datos geográficos declarados:** Direcciones informales en parques industriales o zonas rurales dificultan la geocodificación exacta. Se mitigó permitiendo selección manual de pin en mapa validada dentro de `20 km` del centroide de la localidad, combinando Geoapify y Georef.

---

## Prioridades recomendadas de cierre técnico

1. Actualizar la regla de `cloudflare_waf` para cubrir `/geo/*` junto al retiro definitivo del prefijo legado `/routes*`.
2. Extender `datadog_log_forwarding` y `render_datadog_log_stream` al entorno `prod` en `smartruck-infra`, y definir límites explícitos de pool SQL en `engine.py`.
3. Migrar variables sensibles de `--set-env-vars` en `smartruck-backend` a GCP Secret Manager montado en Cloud Run y sumar limpieza periódica de documentos huérfanos.
4. Ampliar `smoke_test.sh` más allá de `/version` (conectividad básica autenticada y salud de base de datos) y unificar el criterio definitivo de distancia vial para el `unlock_fee`.
