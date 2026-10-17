# Proposal: microservice-routes becomes the geo-service (milestone R.1)

## Intent

Turn `microservice-routes` into the platform's **geo-service**: the only place where geographic reference data and computation live. Today that knowledge is split: the backend owns `locations`, geocoding (Mapbox/Nominatim) and a line-by-line copy of the route engine, while this Worker only reads backend tables and estimates with haversine x 1.25. The result is duplicated logic, two writers of the same data and distances that can diverge.

Source of truth for scope and acceptance criteria: the R.1 user stories in `smartruck-ar/roadmap` (S.3 #137, R.1.1 #140 to R.1.7 #163). Their descriptions carry the Gherkin scenarios; this proposal does not restate them.

## Overview: today vs target (end of R.1)

| | Today | Target |
|---|---|---|
| Public path | `api.smartruck.tech/routes*` only: `GET /routes`, `/routes/health`, `/routes/version` | `/geo/*` added in parallel (localities, addresses, reverse, routes, batch); `/routes*` retired once unused (D6) |
| Auth | None | Supabase JWT (ES256/JWKS, same issuer as the backend) for users; shared API key header for internal services; anything else gets 401 |
| Known external consumer | The backend's `QuoteLoadUseCase` already calls `GET /routes` through `RoutesServiceDistance` (`src/infrastructure/outbound/http_client/routes_service_distance.py`) to price a quote — this dependency already exists today and is unchanged by R.1.1-R.1.7, it just moves behind auth (R.1.4) | Same call, authenticated; plus the backend's publish flow geocoding and the Recommendations module's trunk-route/batch calls (see D7) |
| Localities, address search, reverse geocoding | Backend's job (Mapbox/Nominatim) | Moves here entirely; backend loses it (`INF-LOC 01`: backend search returns 404) |
| Unknown route | No fallback; the request fails | Resolved live by an external provider (Mapbox), flagged exact; if the provider fails, a configurable-factor estimate (`is_estimation: true`) — neither is persisted |
| Data ownership | Reads the backend's own `routes`/`locations` tables directly (same Supabase project, backend's schema) | Own `geo` schema and `geo_service` role in the same project; owns `provinces`, `localities`, `routes`; backend stops being read |
| Route identity | `canonical_key` (normalized name string) | Unordered pair of locality ids; name normalization only resolves what a user typed to a locality |
| Cache | `caches.default`, keyed by canonical key | Same mechanism, but only exact (non-estimated) routes are ever cached |
| Runtime | Cloudflare Worker | Unchanged — Worker stays serverless; Docker is dev/test-only. Revisit only if PostGIS-heavy queries, batch CPU limits, or a self-hosted routing engine force it |

Out of this service's reach, now and after: the exact pickup/delivery pin of a load (backend business datum) and Recommendations' matching/scoring logic — which, as of 2026-10-12, runs as a module inside the backend rather than a separate Worker (see design D7).

## Settled decisions (platform level, not reopened here)

1. The geo-service owns provinces, localities (cities, towns and rural places with coordinates), locality/address search, forward and reverse geocoding, and routes between localities (`docs/responsabilidades-servicios.md`).
2. One schema and one database role per service; no service writes another service's tables; communication is by API.
3. A route is identified by the **pair of locality ids** it connects (direction-independent); name normalization is only used to find a locality.
4. Unknown routes are fetched from an external provider and **persisted only when the provider's license allows it** (with Mapbox, the chosen provider, they are not; see design D4); if the provider fails, an estimate is returned flagged `is_estimation` and is **not persisted**.
5. The exact pickup/delivery point of a load is a backend business datum (visible only after unlock); the geo-service computes, the backend stores and guards it.
6. The geo-service never calls other services; it only answers.

## Scope (in this repo)

| Capability | Story |
|---|---|
| Own data: provinces, localities, routes (own schema/role, migrated preloaded routes) | R.1.1 #140 |
| Route identity by locality pair | R.1.5 #144 |
| Localities, address search, forward/reverse geocoding move here (+ endpoints) | R.1.7 #163 |
| External provider fallback + persistence | R.1.2 #141 |
| Batch route resolution | R.1.3 #142 |
| Authentication (users via Supabase JWT/JWKS, internal services) | R.1.4 #143 |
| Single provider: configurable estimation, backend seed no longer writes routes | R.1.6 #145 (backend/UI parts live in other repos) |

## Out of scope

- Backend changes (remove the route engine copy, locality snapshot in loads/depots: #145 backend part, #165).
- Frontend changes (#152, #164).
- Recommendations service and its spatial queries.
- Renaming the GitHub repository (owner action; see design D6 for the path/Worker naming).

## Delivery plan

Trunk-based, outside-in BDD->TDD, one acceptance scenario at a time, one test per commit + push, refactor in its own commit + push (`config.yaml`, `rules.apply`). Order:

1. **Close the design decisions (S.3 #137).** D1 (acceptance tooling) is a hard prerequisite for any story; D2/D3 gate R.1.1.
2. **Enabler: executable acceptance with work-in-progress exclusion** (per D1), delivered as the first commits of the first story.
3. **R.1.1 #140 (start here).**
4. R.1.5 #144 and R.1.7 #163 (both need R.1.1), then R.1.2 #141.
5. R.1.3 #142 and R.1.4 #143 can run in parallel with step 4 (they only depend on S.3).
6. R.1.6 #145 (geo-service part) last: it needs R.1.2 and R.1.4 and the consumers migrated.

### Why start with R.1.1 (#140)

- It is on the **critical path**: R.1.2, R.1.5 and R.1.7 (and through them R.1.6 and the backend's D.2.10) are blocked by it.
- It removes the root problem (two owners of `routes`/`locations`); everything built before it would target tables the service is about to stop reading.
- R.1.3 (batch) and R.1.4 (auth) are independent quick wins, but starting with them does not unblock anything else. They are good parallel work for a second person.

## Risks and rollback

| Risk | Mitigation / rollback |
|---|---|
| Data migration of `routes`/`locations` breaks lookups | Keep reading the old tables behind the same port until the new schema is verified; switch the adapter in a single commit; revert = previous adapter |
| Canonical identity change makes stored routes unreachable | R.1.5 contract scenarios (RUT 16-18) and a migration that maps existing `canonical_key` rows to locality pairs |
| Consumers break when auth is enforced | R.1.4 rolls out with the backend credential first; users' JWT path verified before enforcement |
| Provider terms forbid storing results | D4 decides the provider before R.1.2 starts |
| Public path rename breaks the backend | D6: add the new path in parallel, retire `/routes*` only when unused |
