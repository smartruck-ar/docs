# Exploration: geo-service

> Read-only survey of `microservice-routes` at `origin/main` (510bf9a, v0.0.7), 2026-10-10.
> Platform context: `docs/plan-centralizacion-routes.md`, `docs/responsabilidades-servicios.md` (smartruck-ar/docs).

## Current state of the service

| Area | Today |
|---|---|
| Endpoints | `GET /routes?origin=&destination=`, `GET\|HEAD /routes/health`, `GET\|HEAD /routes/version`; manual pathname matching in `src/index.ts`; any other path returns 404 |
| Resolution cascade | `caches.default` (key per `APP_MODE` + canonical key + direction) -> same city -> Supabase `routes` by `canonical_key` -> estimate from `locations` (haversine x 1.25, 60 km/h) -> 404 |
| Data | Reads the backend-owned Supabase tables `routes` and `locations` (read-only). `locations.findByName` loads the whole table per lookup |
| Identity | `CityName.canonicalKeyWith`: symmetric text key (NFKD, accents stripped, part before the comma, lowercase, spaces to `_`) |
| Geometry | `coordinates_json` stored as `[lng, lat]`, returned as `[lat, lng]`; `Route.orientedTo` reverses when needed |
| Auth | None (public endpoint, CORS only) |
| Composition | Supabase adapters, use case and controller built per request in `index.ts`; the block is duplicated (cached and uncached paths) |
| External provider | None. No Mapbox/OSRM routing; geocoding lives in the backend |
| Unused | `postgres` npm dependency |

## Testing reality (impacts the delivery cadence)

- `test/acceptance/features/consultar_rutas.feature` is **documentation only**: no Gherkin runner, no step definitions.
- Each scenario is mirrored by hand in `test/acceptance/consultar-rutas.spec.ts` (`it("RUT NN: ...")`) against in-memory fakes, and runs under `npm test`.
- **There is no work-in-progress exclusion** (`@wip` or equivalent). The team's BDD cadence (push the red acceptance scenario first, excluded from the pipeline) cannot be applied as-is. See design decision D1.
- `scripts/check` = `tsc --noEmit` + `vitest run`; no linter (the CI step is named "Lint y tests").
- `scripts/acceptance_test.sh` is a post-deploy curl check (health + Rosario -> Córdoba) that only runs on pushes to `test` and `prod`.

## Target (decided at platform level, roadmap S.3 #137)

`microservice-routes` becomes the **geo-service**: the single owner of geographic reference data and computation (provinces, localities with coordinates, locality and address search, forward and reverse geocoding, routes between localities, external provider fallback with persistence, estimation). It does not own load data (the exact pin of a load stays in the backend) nor matching logic (recommendations service).

## Roadmap stories in scope (milestone R.1, smartruck-ar/roadmap)

```text
S.3 #137 (decisions) ──► R.1.1 #140 base propia ──► R.1.2 #141 fallback a proveedor + persistencia ──► R.1.6 #145/#152 único proveedor
                    │                         ├─► R.1.5 #144 identidad por par de localidades
                    │                         └─► R.1.7 #163/#164 localidades y geocodificación ──► D.2.10 #165 (backend)
                    ├─► R.1.3 #142 rutas en lote
                    └─► R.1.4 #143 autenticación
```

Out of the geo-service repo but related: D.2.10 #165 (backend stores the locality snapshot), the R.1.6 and R.1.7 UI counterparts (#152, #164) in the frontends.

## Findings that need a decision before design

1. How to run acceptance scenarios with a work-in-progress exclusion (D1).
2. Where the geo-service's own data lives (D2) and how the Worker reaches it (D3).
3. External provider (D4), L1 cache (D5), public path and naming (D6), internal credential (D7).
