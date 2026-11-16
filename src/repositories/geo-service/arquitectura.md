# Arquitectura de `geo-service`

El microservicio adopta **Arquitectura Hexagonal** en TypeScript dentro de `src/` (`domain`, `application`, `infrastructure`) con un entrypoint ligero en `src/index.ts`.

---

## Capas y flujos internos

- **Dominio (`src/domain/`):** Define `CityName` (normalización y clave canónica bidireccional entre pares de localidades) y excepciones de dominio (`domain-exceptions.ts`).
- **Aplicación (`src/application/`):**
  - Casos de uso de localidades: `ListLocalitiesUseCase`, `SearchLocalitiesUseCase`, `ResolveLocalityUseCase`, `GetLocalityUseCase` y `NearestLocalityUseCase` (`coverageRadiusFrom(env)`, `50 km` por defecto).
  - Casos de uso de rutas: `GetRouteUseCase` y `GetRoutesBatchUseCase` (`providerBatchLimitFrom(env)` y configuración de estimación en `estimation-config.ts`).
- **Infraestructura (`src/infrastructure/`):**
  - Controladores HTTP: `LocalitiesController`, `RoutesController` y `RoutesBatchController`.
  - Persistencia: `PostgresLocalityRepository` y `PostgresRouteRepository` conectados a PostgreSQL/Supabase (`geo-client.ts`).
  - Proveedor de contingencia: `MapboxRoutingProvider`.
  - Middleware de borde: CORS (`APP_MODE`), caché (`staleIfError` + `caches.default`), verificación JWT (`authentication.ts`) y control de acceso (`access.ts`).

---

## Cascada de resiliencia para rutas (`GetRouteUseCase` / `src/index.ts`)

1. **Caché de borde en Cloudflare (`caches.default`):** Responde con clave canónica ordenada (`origin:destination` / inversa cuando corresponde) y `X-Cache: HIT`.
2. **`stale-if-error`:** Si la ejecución posterior falla ante tráfico transitorio, sirve respuestas cacheadas previamente cuando aplica.
3. **PostgreSQL precalculado:** Consulta las **11.175 rutas** OSRM/OpenStreetMap ya persistidas con distancia, duración y polilínea.
4. **Contingencia en vivo (`MapboxRoutingProvider`):** Si el par no está en base y existe `MAPBOX_ACCESS_TOKEN`, consulta Mapbox Directions devolviendo `Cache-Control: no-store` para no contaminar caché ni persistir datos externos.
5. **Estimación Haversine:** Si ningún proveedor responde, calcula distancia aproximada por línea recta con factor vial **`1,25`** a **`60 km/h`**, marcando `is_estimation: true` (el backend descarta estas estimaciones en el scoring final de cargas).

---

## Seguridad y rutas expuestas

Cuando `AUTH_REQUIRED === "true"`, todo endpoint fuera de `/geo/health` y `/geo/version` (más las rutas legadas `/routes/health` y `/routes/version`) exige JWT **ES256 / JWKS** válido y evalúa permisos bajo política *deny by default* (`src/infrastructure/inbound/middleware/access.ts`):

| Prefijo | Roles permitidos (`app_metadata.roles`) |
| :--- | :--- |
| `/geo/routes` *(y legado `/routes`)* | `user`, `routes:read` |
| `/geo/routes/batch` | `user`, `routes:batch` |
| `/geo/localities*` | `user`, `localities:read` |
