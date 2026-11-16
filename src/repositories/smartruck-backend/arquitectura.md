# Arquitectura de `smartruck-backend`

El backend aplica **Arquitectura Hexagonal** estricta para aislar las reglas del negocio logístico respecto de FastAPI, SQLModel, PostGIS y los proveedores externos.

---

## Estructura de capas (`src/`)

### 1. Dominio (`src/domain/`)

Contiene modelos puros, invariantes y servicios sin dependencias de framework:

- **`load_status.py`:** Define los 8 estados válidos de `LoadStatus` (`activa`, `bloqueada`, `reservada`, `en_camino`, `demorada`, `entregada`, `entrega_confirmada`, `cancelada`) y `SYSTEM_MANAGED_STATUSES`.
- **`cargo_catalog.py` y `packaging_type.py`:** Catálogo de 6 categorías (`CARGA_GENERAL`, `REFRIGERADO`, `PELIGROSA_REGULADA`, `GRANOS_Y_AGRICULTURA`, `AGROINDUSTRIA`, `GANADERIA_HACIENDA`) y 7 tipos de embalaje (`A GRANEL`, `PALETIZADA`, `BIG BAG / EN BOLSAS`, `EN CAJAS`, `EN FARDOS`, `SIN EMBALAJE`, `OTRO`).
- **`models/pricing.py`, `unlock_fee.py` y `fleet_assumptions.py`:** Descuento de retorno (`0.8`), piso mínimo (`0.9` del sugerido, piso absoluto `50.000 ARS`), fórmula `UnlockFee` (`(5 + 0,04 * km) * 1500 ARS`) y supuestos de flota (`28 L/100 km`, `2400 ARS/L`, `2,68 kg CO2/L`, `35.000 ARS` peaje).
- **`models/pass_through_zone.py` y `recommendation_tolerance.py`:** Cómputo de radios Tier 1 (`max(0,20 * D_nominal, 15 km)`) y margen de corredor vial Tier 2 (`max(0,30 * sqrt(500 * D_nominal), 15 km)`).
- **`services/`:** `LoadScorer` (`MIN_LOADED_RATIO = 0.25`, pesos 50% aprovechamiento / 50% precio/km), `TransporterMetricsCalculator` y `OffererMetricsCalculator`.

### 2. Aplicación (`src/application/`)

Orquesta casos de uso, puertos y logging sin acoplamiento HTTP:

- **Cargas y matching:** `RecommendLoadsUseCase` (coordinación Tier 1 -> Tier 2 con degradación segura ante fallos de `geo-service`), `QuoteLoadUseCase` + `RateResolverService`, `GetUnlockFeeUseCase`, `CancelLoadByOffererUseCase` (reembolso automático), `CancelLoadReservationByTransporterUseCase`, bloqueo/reserva/confirmación.
- **Pagos, usuarios, flota y backoffice:** `CreatePaymentUseCase`, sincronización webhook/polling, validación documental, depósitos, camiones/remolques, calificaciones, notificaciones e importación de grillas FADEEAC en PDF.
- **`logger/log_manager.py`:** `LogManager` emite JSON estructurado a `stdout` (`level`, `message`, `service`, `env`, `correlation_id`) aceptando únicamente texto plano para evitar fuga de secretos.

### 3. Infraestructura (`src/infrastructure/`)

Implementa puertos hacia entrada HTTP y salida externa:

- **`inbound/http_controllers/`:** 20 módulos router especializados (`loads_controller`, `load_pin_reverse_geocode_controller`, `payments_controller`, `depot_controller`, `trucks_controller`, `trailers_controller`, `documents_controller`, `profile_controller`, `offerers_controller`, `transporters_controller`, `ratings_controller`, `notifications_controller`, `notification_types_controller`, `cargo_types_controller`, `packaging_types_controller`, `trailer_types_controller`, `address_search_controller`, `admin_users_controller`, `admin_documents_controller`, `admin_rates_controller`).
- **`inbound/dependencies/`:** Validación JWT **ES256 / JWKS** de Supabase Auth y dependencias de rol/pertenencia (`require_own_offerer`, `require_own_transporter`, `require_verified_offerer`, `require_admin`). Todo el árbol de endpoints queda auditado por `test_routes_require_authentication.py`.
- **`outbound/persistence/`:** Repositorios SQLModel + **GeoAlchemy2 / PostGIS** con columnas `geography` e índices GiST y motor SQL configurado con `pool_pre_ping=True`. Las evoluciones del esquema viven en **Alembic** (`0001`..`0049`).
- **`outbound/http_client/` y `gateways/`:**
  - `RoutesServiceDistance`: consume `geo-service` por lotes de hasta `200` pares vía `urllib.request.urlopen` (timeout por defecto `5 s`).
  - `GeoapifyGeocoder` (`5000 m` de radio + fallback `type=street` + reverse geocode) y `GeorefGeocoder` (fallback de autocompletado urbano).
  - `SupabaseStorageGateway` (URLs firmadas de carga/descarga con TTL lectura `600 s`), gateway de **MercadoPago** y envío asíncrono por **Resend**.

---

## Seguridad y manejo de excepciones

- El acceso a endpoints protegidos exige JWT válido de Supabase salvo las rutas explícitas en `PUBLIC_ROUTES` (salud, versión, tipos públicos y webhook MercadoPago verificado).
- Las excepciones de dominio (`src/domain/exceptions.py`) se traducen en controladores mediante `error_response.py`, complementadas por manejadores globales registrados en FastAPI (`@app.exception_handler(GeoCatalogUnavailableError)` en `src/infrastructure/api.py`).

Para profundizar en el diseño de bloqueos y pagos, consultar [Reserva y desbloqueo consistente](./reserva-concurrencia-y-desbloqueo.md).
