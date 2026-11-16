# Arquitectura

La arquitectura de **Smartruck** combina portales web independientes orientados por rol, un backend central estructurado bajo **Arquitectura Hexagonal (Ports & Adapters)**, un microservicio geográfico especializado en el borde y servicios gestionados para identidad, persistencia geoespacial, mensajería y pagos.

---

## Principios de diseño

- **Separación por actor y dominio:** Dadores, transportistas y operadores de backoffice utilizan aplicaciones web dedicadas para reducir carga cognitiva, aislar despliegues y mantener reglas de autorización claras.
- **Lógica de negocio centralizada en `smartruck-backend`:** Cotizaciones, tarifarios, matching geográfico, scoring, bloqueo exclusivo de reservas, cancelaciones, reembolsos, calificaciones y métricas residen en el dominio del backend.
- **Geografía de catálogo cerrado separada de direcciones urbanas (`ADR 0001` y `ADR 0002`):** `geo-service` (`microservice-routes`) es la única fuente de verdad de provincias, localidades aprobadas y rutas interurbanas. La búsqueda de direcciones por calle y la geocodificación inversa residen en `smartruck-backend`.
- **Seguridad sin confianza implícita:** Autenticación JWT **ES256** emitida por Supabase Auth y validada vía **JWKS** tanto en `smartruck-backend` como en `geo-service`, con autorización explícita por rol y verificación de pertenencia por identificador en cada endpoint privado.
- **Serverless y escala a cero en costos base:** Cómputo de API en Cloud Run, microservicio geográfico en Cloudflare Workers, landing estática en Cloudflare Pages y base/storage gestionados en Supabase.

---

## Componentes y topología de despliegue

| Componente | Tecnología principal | Alojamiento / Infraestructura | Responsabilidad |
| :--- | :--- | :--- | :--- |
| **Landing Page** (`landing-page`) | React 19 + Vite + Tailwind CSS v4 (JS) | Cloudflare Pages (`smartruck.com.ar` / `test.smartruck.com.ar`) | Presentación pública y derivación por rol hacia los portales. |
| **Portal Dador** (`smartruck-dador`) | TanStack Start + React 19 + Nitro SSR + Leaflet/MapLibre + Recharts | Render (`dador.smartruck.tech` / `dador-test.smartruck.tech`) | Verificación documental, depósitos, cotización, publicación, seguimiento y métricas de ahorro. |
| **Portal Transportista** (`smartruck-transportista`) | TanStack Start + React 19 + Nitro SSR + MapLibre GL + Recharts | Render (`transportista.smartruck.tech` / `transportista-test.smartruck.tech`) | Flota, calculadora de retorno vacío, mapa/matching de paso, reserva exclusiva, pago y viajes. |
| **Portal Backoffice** (`smartruck-backoffice`) | TanStack Start + React 19 + Nitro SSR + Tailwind CSS v4 | Render (`smartruck-backoffice.onrender.com`) | Revisión documental de usuarios, habilitación de perfiles y administración de tarifarios y PDFs FADEEAC. |
| **Backend Core** (`smartruck-backend`) | Python 3.12 + FastAPI + SQLModel + GeoAlchemy2 + Alembic | GCP API Gateway -> GCP Cloud Run (`us-central1`) | Lógica de dominio, PostGIS matching, bloqueo 10 min, pagos MercadoPago, Resend, métricas y API REST. |
| **Geo-service** (`microservice-routes`) | TypeScript + Cloudflare Workers + Caché Edge + Jose JWT | Cloudflare Workers (`api.smartruck.tech` / `api-test.smartruck.tech`) | 24 provincias, catálogo cerrado de 150 localidades y rutas OSRM/OSM precalculadas (11.175 pares). |
| **Datos, Auth y Storage** | Supabase (PostgreSQL + PostGIS + Auth ES256/JWKS + Storage) | Supabase Cloud | Persistencia transaccional, geometrías PostGIS e índices GiST, emisión/validación JWT y documentos privados. |
| **Infraestructura y Observabilidad** | Terraform + GCP + Cloudflare DNS/WAF + Datadog (`us5`) | `smartruck-infra` | Provisionamiento declarativo, WIF (OIDC) para CI/CD, WAF de borde y pipelines de logs. |

---

## Geografía, direcciones y decisiones de arquitectura (`ADR 0001` – `ADR 0004`)

Durante la evolución del sistema se resolvió la duplicación histórica de proveedores geográficos mediante cuatro decisiones registradas en `adr/`:

1. **Propiedad geográfica y catálogo cerrado (`ADR 0001` y `ADR 0002`):** Los frontales dejaron de embeber listados estáticos de localidades. Todo selector interurbano consulta `geo-service`, que expone en modo **solo lectura** el catálogo oficial de 24 provincias y 150 localidades junto a su radio de cobertura (`50 km` por defecto en `/geo/localities/nearest`).
2. **Resiliencia en cascada dentro de `geo-service` (`ADR 0003`):** Ante una consulta de ruta (`/geo/routes` o `/geo/routes/batch`), el worker recorre en orden:
   - Caché de borde de Cloudflare (`caches.default` + `stale-if-error` ante fallos).
   - Clave canónica bidireccional en caché cuando aplica ruta equivalente.
   - Tabla PostgreSQL de rutas precalculadas con polilíneas reales derivadas de OSRM / OpenStreetMap (11.175 pares).
   - **Mapbox Directions** en vivo como contingencia (respuesta marcada `Cache-Control: no-store`, sin persistencia).
   - Estimación Haversine (`factor vial 1,25` a `60 km/h`, marcada `is_estimation: true`).
3. **Búsqueda de direcciones urbanas en `smartruck-backend`:** Los endpoints `/localizaciones/direcciones` y `/localizaciones/reversa` utilizan **Geoapify** como proveedor primario (búsqueda acotada a `5000 m` del centroide de la localidad, con fallback específico a `type=street`) y **Georef (API oficial Argentina)** como respaldo para autocompletado. Las integraciones iniciales con Mapbox Geocoding y Nominatim fueron retiradas del backend. Además, los pines seleccionados por el usuario se validan contra un radio máximo de `20 km` (`PIN_VALIDATION_RADIUS_M = 20000.0`).
4. **Estimación interna en línea recta (`ADR 0004`):** El backend consulta rutas viales reales por lote hacia `geo-service` mediante `RoutesServiceDistance` (`urllib.request.urlopen`, timeout por defecto de `5 s` y lotes máximos de `200` pares) para cotización y scoring. Mantiene Haversine interno para prefiltros y cálculos donde la aproximación lineal resulta determinística, como la comisión de desbloqueo (`(5 + 0,04 * distancia_km) * 1500 ARS`).

---

## Motor de matching geográfico y puntaje

El endpoint inicial `POST /loads/search` en memoria fue reemplazado por **`POST /loads/recommendations`** (`RecommendLoadsUseCase` + `PostgreSQLLoadRepository` + `LoadScorer`), ejecutado en dos niveles apoyados en PostGIS (`geography` con índices GiST):

1. **Prefiltro operativo y SQL:** Selecciona únicamente cargas en estado `activa` disponibles (sin lock activo o con lock ya vencido), dentro de la ventana temporal solicitada (`pickup_date >= earliest_pickup`, `latest_pickup`, `latest_delivery`) y compatibles con las preferencias de categoría y remolque del transportista.
2. **Tier 1 — Búsqueda por cercanía:** Aplica `ST_DWithin` en PostGIS alrededor de los centroides de origen y destino del viaje declarado con radio dinámico:
   `radio = max(0,20 * D_nominal, 15 km)`.
3. **Tier 2 — Búsqueda de paso sobre corredor (`PassThroughZone`):** Si Tier 1 obtiene menos de **3** cargas finales puntuables, el backend consulta la polilínea de ruta en `geo-service`, construye un corredor vial en PostGIS (`ST_DWithin(geom, LINESTRING, margen_m)` con `margen = max(0,30 * sqrt(500 * D_nominal), 15 km)`) y exige avance direccional hacia destino (`ST_Distance(destino_carga, destino_objetivo) < ST_Distance(origen_carga, destino_objetivo)`). Si `geo-service` falla en este paso, registra una advertencia y degrada de forma segura a los resultados de Tier 1.
4. **Filtrado de viabilidad y puntaje (`LoadScorer`):** Descarta cargas sin `max_price` válido, con tramos estimados (`is_estimation`) o faltantes y aquellas cuyo aprovechamiento cargado (`load_distance / (approach_distance + load_distance + return_distance)`) sea inferior al **25%** (`MIN_LOADED_RATIO = 0.25`). Luego calcula el puntaje redondeado (0 a 100):
   `score = round_half_up(100 * (0,5 * loaded_ratio + 0,5 * (price_per_km / best_price_per_km)))`
   y ordena por `(-score, pickup_date, -max_price, id)` devolviendo un máximo de **20** recomendaciones.

---

## Tarifarios, reservas, cancelaciones y notificaciones

- **Categorías y referencia tarifaria:** El dominio define 6 categorías (`CARGA_GENERAL`, `REFRIGERADO`, `PELIGROSA_REGULADA`, `GRANOS_Y_AGRICULTURA`, `AGROINDUSTRIA`, `GANADERIA_HACIENDA`) y 7 tipos de embalaje. El cotizador resuelve tarifas según modo configurado en Backoffice (`BASE` en ARS/km o `EXTERNAL_SOURCE` con tablas FADEEAC importadas desde PDF vía `pdfplumber` y tarifarios por vehículo), aplica el descuento de retorno del **20%** (`0.8`) y establece un piso mínimo operativo del **90%** sobre la tarifa sugerida (mínimo absoluto `50.000 ARS`).
- **Reserva exclusiva y pagos:** Al iniciar el pago de desbloqueo, el backend ejecuta un lock atómico en PostgreSQL (`reserved_until = NOW + 600 s`) que impide bloqueos simultáneos por otros transportistas y se libera automáticamente al vencer el TTL o ante `/abort-lock`. La preferencia se genera en **MercadoPago** y la confirmación combina webhook con verificación síncrona de respaldo. En caso de colisión tardía o estado inconsistente tras la acreditación, el caso de uso ejecuta un **reembolso automático**. Ver el detalle completo en [Reserva y desbloqueo consistente](./repositories/smartruck-backend/reserva-concurrencia-y-desbloqueo.md).
- **Cancelación bilateral y calificaciones:** Desde `reservada`, el dador puede cancelar con reembolso total automático al transportista, paso definitivo a `cancelada` y penalización de 1 estrella; si cancela el transportista, pierde la comisión sin reembolso, recibe penalidad de 1 estrella y la carga retorna a `activa` si su fecha de retiro continúa vigente (o pasa a `cancelada` en caso contrario). Al finalizar el viaje (`finalizada`), ambas partes pueden calificarse.
- **Notificaciones, correos y métricas:** Eventos relevantes (reservas, cancelaciones, verificaciones y entregas) generan notificaciones persistidas in-app y disparan envíos transaccionales por **Resend** (`BackgroundTasks`). Los tableros de dador y transportista consumen métricas reales calculadas en dominio a partir de los viajes concretados y supuestos de flota (`28 L/100 km`, `2400 ARS/L`, `2,68 kg CO2/L`, `35.000 ARS` peaje base).

---

## Diagrama interactivo y vistas de referencia

> **Nota:** El diagrama interactivo y las capturas de esta sección corresponden a los entregables visuales generados durante la etapa de consolidación arquitectónica (octubre de 2026). Para detalles vigentes de proveedores y mecanismos implementados posteriormente (Geoapify/Georef, PostGIS Tier 2, cancelación y reembolsos, Cloudflare Pages para landing y datadog en `test`), prevalece la especificación textual superior y la documentación específica de cada repositorio.

<iframe
  src="./arquitectura/diagrams/smartruck-architecture.html"
  title="Diagrama interactivo de arquitectura Smartruck"
  style="width: 100%; height: 680px; border: 1px solid #d0d7de; border-radius: 8px;"
  loading="lazy">
</iframe>

### Vistas complementarias de arquitectura y flujo

- [Flujo de reserva y desbloqueo (SVG)](./arquitectura/diagrams/flujo-desbloqueo.svg)
- [01 — Despliegue general](./arquitectura/diagrams/presentacion/01-despliegue-general.png)
- [02 — Portales y Gateway](./arquitectura/diagrams/presentacion/02-portales-y-gateway.png)
- [03 — Ruteo geográfico](./arquitectura/diagrams/presentacion/03-ruteo-geografico.png)
- [04 — Backend e integraciones](./arquitectura/diagrams/presentacion/04-backend-integraciones.png)
- [05 — Pagos MercadoPago](./arquitectura/diagrams/presentacion/05-pagos-mercadopago.png)
- [06 — Datos y archivos](./arquitectura/diagrams/presentacion/06-datos-y-archivos.png)
- [07 — Observabilidad](./arquitectura/diagrams/presentacion/07-observabilidad.png)
- [08 — Stack tecnológico](./arquitectura/diagrams/presentacion/08-stack-tecnologico.png)
