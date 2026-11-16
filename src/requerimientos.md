# Requerimientos

Esta sección documenta los requerimientos funcionales implementados para cada actor del ecosistema (**Dador**, **Transportista**, **Backoffice** y **Geo-service**) y los requerimientos no funcionales verificados en la arquitectura y en el código vigente.

---

## Requerimientos funcionales por dominio

### Dador de cargas (`D`)

| Código / Área | Requerimiento | Comportamiento implementado |
| :--- | :--- | :--- |
| **Registro y verificación** | Alta de empresa dadora y validación de identidad | Registro con correo, contraseña, razón social, CUIT y aceptación obligatoria de Términos y Condiciones (`TermsAndConditionsDialog`). Carga directa de constancias hacia Supabase Storage mediante URLs firmadas (`/documents`) para revisión administrativa (`/profile/verify`). |
| **Depósitos habituales** | Administración de orígenes frecuentes | Alta, listado, edición y eliminación de depósitos (`/depots`) con provincia, localidad y dirección geocodificada para reutilizar en futuras publicaciones. |
| **Cotización previa** | Estimación de tarifa sugerida y piso mínimo | Consulta previa (`POST /loads/quote`) por categoría (6 disponibles), embalaje (7 tipos), origen, destino, ruta vial y volumen/peso. Devuelve tarifa sugerida con descuento de retorno del **20%** (`0.8`), piso mínimo del **90%** sobre lo sugerido (nunca menor a `50.000 ARS`) y origen de cálculo (`BASE` o tarifario externo FADEEAC / vehículo). |
| **Geolocalización urbana** | Búsqueda de direcciones y selección por pin | Autocompletado de calles mediante **Geoapify** (radio `5000 m`, fallback por calle) y **Georef** (`/localizaciones/direcciones`), además de selección manual en mapa validada dentro de `20 km` respecto de la localidad (`/localizaciones/reversa`). |
| **Publicación y gestión** | Ciclo de vida completo de la oferta de carga | Publicación (`/loads/offerer/{id}`), edición de cargas activas, visualización de estado (`activa`, `bloqueada`, `reservada`, `en_camino`, `demorada`, `entregada`, `entrega_confirmada`, `cancelada`), cancelación de carga reservada con reembolso total automático al transportista y penalización de 1 estrella. |
| **Entrega, calificación y métricas** | Cierre operativo y tablero de ahorro | Confirmación de recepción (`POST /loads/{id}/confirm-delivery` hacia `entrega_confirmada`), calificación mutua (1 a 5 estrellas), notificaciones in-app/email (`Resend`) y tablero real (`/offerers/{id}/metrics`). |

### Transportista (`T`)

| Código / Área | Requerimiento | Comportamiento implementado |
| :--- | :--- | :--- |
| **Registro y flota** | Alta de PyME y gestión de unidades | Registro con aceptación de T&C y documentación; CRUD completo de camiones (`/trucks`) y remolques (`/trucks/trailers`) con tipo de carrocería y capacidad sin bloquear la exploración del mapa previo a completar la flota. |
| **Calculadora de retorno** | Cuantificación del costo hundido | Simulación de costo de viaje vacío (`28 L/100 km`, `2400 ARS/L`, peaje base `35.000 ARS`, emisión `2,68 kg CO2/L`) para dimensionar combustible, peajes y emisiones evitables antes de elegir una carga. |
| **Matching inteligente** | Recomendaciones por cercanía y de paso | Búsqueda en `POST /loads/recommendations` filtrando por fecha mínima/máxima, entrega límite, categoría y remolque. Aplica PostGIS **Tier 1** (cercanía `max(0,20 * D_nominal, 15 km)`) y **Tier 2** (`PassThroughZone` sobre corredor vial si Tier 1 aporta menos de 3 resultados puntuables), ordenando por `LoadScorer` (aprovechamiento >= **25%** y precio/km). |
| **Reserva y desbloqueo** | Bloqueo exclusivo y pago de comisión | Consulta de tarifa (`(5 + 0,04 * km) * 1500 ARS` en `/unlock-fee`), lock atómico exclusivo por **10 minutos** (`/lock`), pago vía **MercadoPago Checkout Pro**, webhook idempotente + verificación síncrona (`/payments`), cancelación explícita de lock (`/abort-lock`), reembolso automático ante colisión tardía y acceso a los datos del dador junto a correo con link de búsqueda de retorno. |
| **Ejecución del viaje** | Asignación de unidades, estado y cancelación | Validación de flota compatible (`/valid-units`), asignación de camión y remolque (`/truck`, `/trailer`, `/reserve`), avance de viaje (`en_camino`, `demorada`, `entregada`), opción de cancelación por transportista (sin reembolso y con penalización de 1 estrella; reabre a `activa` si la fecha de retiro es vigente), calificación y métricas reales (`/transporters/{id}/metrics`). |

### Backoffice (`B`) y Geo-service (`R`)

| Dominio | Requerimiento | Comportamiento implementado |
| :--- | :--- | :--- |
| **Backoffice — Usuarios** | Auditoría de documentación y habilitación | Listado y filtrado de cuentas dadoras y transportistas (`/admin/users`), visualización segura de PDFs/imágenes mediante URLs firmadas (`/admin/documents`) y aprobación o rechazo fundado. |
| **Backoffice — Tarifarios** | Gobierno de precios de referencia | Gestión de tarifas por categoría (`BASE` o `EXTERNAL_SOURCE` con `adjustment_percentage` y vigencia `effective_from` e historial en `/admin/rates`), importación de grillas distancia-tonelaje **FADEEAC en PDF** (`pdfplumber` en `/admin/rates/distance-tonnage/import`) y CRUD de tarifas por tipo de vehículo para hacienda (`/admin/rates/vehicles`). |
| **Geo-service (`R`)** | Servicio único de geografía y ruteo | Exposición solo lectura de 24 provincias y catálogo cerrado de 150 localidades (`/geo/localities`, `/nearest` con `50 km`, `/resolve`), cálculo de ruta individual (`/geo/routes`) y en lote (`/geo/routes/batch`), caché edge, cascada de contingencia (caché -> OSRM/OSM precalculadas -> Mapbox Directions `no-store` -> Haversine `1,25` a `60 km/h`) y control de acceso por roles JWT. |

---

## Requerimientos no funcionales (`S`)

### Seguridad y privacidad

- **Autenticación asimétrica sin secreto compartido:** Validación de JWT **ES256** emitidos por Supabase Auth mediante **JWKS** tanto en `smartruck-backend` (`PyJWT`) como en `microservice-routes` (`jose`).
- **Autorización estricta por recurso y rol:** Cada endpoint privado valida rol y pertenencia del recurso (`require_own_offerer`, `require_own_transporter`, `require_verified_offerer`, `require_admin`, más roles `routes:read`, `routes:batch`, `localities:read` en `geo-service`). La suite `test_routes_require_authentication.py` impide registrar rutas nuevas sin guardia explícita.
- **Almacenamiento seguro de documentos:** Subida directa cliente -> Supabase Storage mediante URLs firmadas y acceso de lectura con expiración corta (`600 s` por defecto).
- **Control en CI:** Detección automática de secretos en todos los repositorios mediante **Gitleaks** y validación declarativa en `landing-page` (`security-check.js`).

### Confiabilidad, resiliencia y consistencia

- **Concurrencia en reservas:** Control transaccional en PostgreSQL (`lock_atomically`) con expiración perezosa (`reserved_until = NOW + 600 s`) y compensación por reembolso automático en MercadoPago si un pago llega sobre un lock vencido o una carga ya asignada.
- **Degradación controlada ante fallos externos:** `geo-service` protege sus rutas mediante `caches.default` + `stale-if-error` y 5 niveles de fallback; `smartruck-backend` degrada Tier 2 a Tier 1 si falla la consulta de corredor vial y conmuta de Geoapify a Georef en búsquedas urbanas.
- **Envío de correos no bloqueante:** Las notificaciones vía **Resend** se ejecutan como `BackgroundTasks` en modo mejor esfuerzo para no interrumpir transacciones críticas.

### Rendimiento y escalabilidad

- **Consultas espaciales indexadas:** Columnas `geography` en PostGIS respaldadas por índices GiST para filtros de cercanía y corredor vial directamente en base de datos.
- **Procesamiento por lotes y borde:** Comunicación backend -> `geo-service` en lotes de hasta `200` pares por petición (`RoutesServiceDistance`) y resolución estática/borde de localidades y polilíneas en Cloudflare Workers.
- **Arquitectura *serverless*:** Cómputo escalable en Cloud Run (`512 MiB`, `1 vCPU`, concurrencia `80`, `min_instances = 0` en `test` y `1` en `prod`) sin costos fijos de instancias ociosas en servicios auxiliares.

### Mantenibilidad, calidad y observabilidad

- **Arquitectura Hexagonal y BDD:** Separación explícita `domain` / `application` / `infrastructure` en backend y `geo-service`, escenarios de aceptación **Gherkin** en español, cobertura mínima obligatoria del **85%** en `smartruck-backend` (`--cov-fail-under=85`) y suites automatizadas con `pytest`, `Vitest`, `Ruff`, `ESLint` y `tsc`.
- **Infraestructura declarativa y migraciones:** Cambios de esquema gobernados por **Alembic** (49 revisiones incrementales en backend) y topología en la nube definida mediante **Terraform** en `smartruck-infra` con autenticación CI por **WIF (OIDC)**.
- **Trazabilidad y logging:** Emisión de logs JSON estructurados a `stdout` en servicios y portales, con reenvío hacia **Datadog** (`us5`) provisto en Terraform para el entorno `test` (pendiente de habilitar en `prod`).
