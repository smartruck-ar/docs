# `geo-service` (`microservice-routes`)

Microservicio geográfico en el borde (*edge*) desplegado sobre **Cloudflare Workers** (paquete `smartruck-routes-service` `v0.15.1`, repositorio [`microservice-routes`](https://github.com/smartruck-ar/microservice-routes)). Constituye la única fuente oficial en **solo lectura** de provincias, localidades aprobadas y rutas interurbanas de **Smartruck**.

---

## Responsabilidades y límites (`ADR 0001` – `ADR 0003`)

- **Catálogo cerrado geográfico:** Expone las **24 provincias** argentinas y las **150 localidades** curadas en PostgreSQL/Supabase, resolución exacta y búsqueda por cercanía (`/geo/localities/nearest` con radio de cobertura por defecto de `50 km`).
- **Ruteo interurbano y lotes:** Responde consultas individuales (`/geo/routes`) y por lote (`/geo/routes/batch`) utilizadas por los portales y por `smartruck-backend` (scoring y corredor Tier 2).
- **Fuera de alcance:** **No** realiza autocompletado de calles ni geocodificación inversa; esas funciones pertenecen a `smartruck-backend` (`/localizaciones/direcciones` y `/localizaciones/reversa` vía Geoapify y Georef).

---

## Stack tecnológico

| Área | Herramientas |
| :--- | :--- |
| **Runtime y lenguaje** | Cloudflare Workers, TypeScript 5.7+, `wrangler` |
| **Auth y datos** | `jose` (JWKS ES256 Supabase), `@supabase/supabase-js` |
| **Pruebas y calidad** | Vitest + `@amiceli/vitest-cucumber` + `@cloudflare/vitest-pool-workers`, ESLint, Prettier, **Gitleaks** |
| **Despliegue** | Wrangler workers `smartruck-routes-service-test` (`api-test.smartruck.tech`) y `smartruck-routes-service-prod` (`api.smartruck.tech`) |

---

## Scripts principales

```bash
./scripts/dev_app                 # Worker local en desarrollo
./scripts/run_lint                # Verificación tsc, ESLint y Prettier
./scripts/run_unit_tests          # Pruebas unitarias rápidas
./scripts/run_all_tests           # Suite completa con Cucumber y pool-workers
./scripts/migrate                 # Aplica migraciones geográficas locales
./scripts/load_geo                # Carga catálogo cerrado de provincias y localidades
./scripts/compute_missing_routes  # Precalcula pares OSRM/OSM faltantes
```

---

## Más información

- [Arquitectura de `geo-service`](./arquitectura.md)
- [Links de referencia](./links.md)
