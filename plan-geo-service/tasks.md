# Tasks: geo-service

> Cadence for every scenario (`config.yaml`, `rules.apply`): acceptance scenario first, tagged `@wip`, commit + push (red, excluded from the pipeline) -> inward TDD cycles, one unit/integration test per cycle, each failing first for a real reason, commit + push on green -> refactor (production and test code) in its own commit + push -> remove `@wip` when the scenario passes, run `./scripts/run_all_tests`, commit + push -> verify manually against the running service (`wrangler dev` or the `test` environment) before closing the scenario.
>
> Commit messages: Spanish, first person present tense, tied to the test or scenario, e.g. `test(R.1.1): agrego el test de repositorio de localidades`, `feat(R.1.1): hago pasar el test de repositorio de rutas por par de localidades`, `refactor(R.1.1): extraigo helper de rutas precargadas en tests`.
>
> Delivery: trunk-based on `main`, no PRs, no chained branches (`delivery_strategy: single-pr`).

## 0. Enabler: executable acceptance with `@wip` exclusion (D1) — first commits of R.1.1

> Done 2026-10-11 together with the tooling alignment below: the spike failed under `workerd`, so 0.2 applies (Node project for acceptance). Steps live in `test/acceptance/steps/*.steps.ts`, support in `test/acceptance/support/`.

### 0.A Tooling aligned with the other repositories (done 2026-10-11)

- [x] eslint + prettier (same config as `smartruck-dador`), `scripts/run_lint`, `run_unit_tests`, `run_all_tests` (replaces `scripts/check`).
- [x] Dev container: `Dockerfile.dev`, `docker-compose.yml` (`app` only; databases come with the first migration in 1.A), `.devcontainer/`, `start_dev_containers`, `stop_dev_containers`, `dev_app`.
- [x] Release aligned with the fronts: bump + lint in the container, single atomic push of `main`, tag and `main:test`; `release_to_prod` runs on the host.
- [x] `.githooks/pre-push` (lint + full suite in the container) installed by `scripts/install_git_hooks`.
- [x] Pipeline: Node 22, `run_all_tests` in CI mode, `build` skipped on the `main` push of a release commit (the `test` run builds and deploys the same commit).

- [x] 0.1 Spike: install `@amiceli/vitest-cucumber@4.7.0` (pinned) and run RUT 01 from `consultar_rutas.feature` through `loadFeature(..., { language: 'es' })` under the current workers pool. Record the outcome in `design.md` (D1).
- [x] 0.2 If the spike fails under `workerd`: add `vitest.workspace.ts` with a Node project for `test/acceptance/**` and keep `test/unit/**` in the workers pool; `scripts/run_all_tests` runs both.
- [x] 0.3 Configure `setVitestCucumberConfiguration({ excludeTags: ['wip'] })` in the acceptance setup file; prove it with a throwaway `@wip` scenario that fails if run (not committed).
- [x] 0.4 Migrate the hand-written mirror to step definitions, one scenario per commit + push, in file order: RUT 01, 02, 06, 07, 05, 10, 11, 12. Steps reuse the in-memory fakes already in `consultar-rutas.spec.ts`. These are born green (allowed for acceptance).
- [x] 0.5 Remove `test/acceptance/consultar-rutas.spec.ts` once every scenario runs from the `.feature`; commit + push.
- [x] 0.6 Refactor: dedupe step helpers; commit + push.

## 1. R.1.1 #140 — own data (start here)

Data model: `design.md` section 2. Decisions: D2 (`geo` schema + own role, same Supabase), D3 (supabase-js with `db: { schema: 'geo' }`; drop `postgres`).

### 1.A Infrastructure for integration tests (no scenario; enables the adapter tests of 1.B)

- [x] 1.A.0 (partially done in 0.A: `app` container and scripts) Local development environment, mirroring `smartruck-dador` / `smartruck-transportista` (Node) and `smartruck-backend` (databases). One commit + push per item:
  - `Dockerfile.dev`: `node:22-bookworm-slim` + `git` + `postgresql-client` (to apply migrations), `npm ci` with the npm cache mount, `CMD ["/bin/bash"]` (same as the fronts).
  - `docker-compose.yml`:
    - `app`: build `Dockerfile.dev`, image `smartruck-routes-service-dev`, container `smartruck-routes-service`, volumes `.:/app` + `app_node_modules`, port `${HOST_PORT:-8787}:8787` (`wrangler dev`), `command: /bin/bash`, `stdin_open`/`tty`, `depends_on` the databases healthy.
    - `dev_db` / `test_db`: `postgres:16-alpine`, password `example`, `pg_isready` healthcheck (same as the backend).
    - `dev_rest` / `test_rest`: `postgrest/postgrest` over each database (`PGRST_DB_SCHEMAS=geo`, `PGRST_DB_ANON_ROLE`, `PGRST_JWT_SECRET`), because supabase-js talks to PostgREST, not to Postgres. The key the Worker sends is a JWT signed with that local secret for role `geo_service`.
    - `pgadmin` (optional, as in the backend) and named network `smartruck-routes-service-net`.
  - `.devcontainer/devcontainer.json`: compose service `app`, workspace `/app`, `postCreateCommand: npm ci`, forward 8787 (same as the fronts).
  - `scripts/start_dev_containers` / `scripts/stop_dev_containers`: same behavior as the fronts (reuse the running container, rebuild only when the `Dockerfile.dev` / `package-lock.json` stamp changes, `npm ci` only when the lock changed, port-in-use check with `HOST_PORT` override), plus applying migrations to `dev_db` and `test_db`.
  - `scripts/migrate`: applies `db/migrations/*.sql` in order to the database given by `DATABASE_URL`; used by the dev scripts and by CI.
  - `scripts/dev_app`: `wrangler dev --ip 0.0.0.0 --port 8787` inside the container.
  - `scripts/run_all_tests`: migrations on `test_db` before the suite (acceptance excludes `@wip`).
  - `.dev.vars.example`: `SUPABASE_URL=http://dev_rest:3000` and the local key (local service names only; deployed environments get theirs from secrets).
  - README: "Desarrollo local" section with `./scripts/start_dev_containers` -> `./scripts/dev_app`.
  - Out of scope (noted for later): a `run_lint` with eslint + prettier like the fronts, and aligning `release_to_test` to the fronts' bump-in-container flow.
- [x] 1.A.1 Add SQL migrations under `db/migrations/` creating schema `geo`, tables `provinces`, `localities`, `routes` (pair `locality_a_id < locality_b_id`, unique), and role `geo_service` with grants limited to `geo`. Applied in CI by the deploy jobs with the environment's connection string (secret, never hardcoded).
- [x] 1.A.2 Add `services:` `postgres:16` + `postgrest/postgrest` to the `build` job (self-hosted runner), apply the migrations before tests, expose `GEO_TEST_SUPABASE_URL` / key as job env.
- [x] 1.A.3 Add an integration test project (`test/integration/**`) that is skipped locally when the env vars are absent and runs in CI.

### 1.B Existing scenarios run against the service's own data (no new scenario)

> Done 2026-10-13 before 1.B.2: `controllers/`, `mappers/`, `cors.ts` and the response DTO moved under `infrastructure/inbound/` (same layout as the backend); tests mirror it.
>
> Naming and layout follow `smartruck-backend`: repositories are named after the persistence technology and the entity in singular (`PostgresLocalityRepository`, table `geo.localities`), live in `infrastructure/outbound/persistence/{repositories,models}`, repository methods are `getAll` / `getBy<Field>` / `save`, and mapping row -> domain happens inside the repository. Moving `controllers/` and `mappers/` under `infrastructure/inbound/` is a separate refactor, not part of this ticket.
>
> Revised 2026-10-13. RUT 20 would repeat RUT 01 (same `Cuando`/`Entonces`; only where the data lives changes) and RUT 21 is a deployment property, not behavior. So no new scenarios: the existing ones (RUT 01, 02, 05, 10, 11, 12) become the proof that the service works on its own database. The ticket is wiring + test configuration. Cadence deviation: those scenarios are already green, so there is no new `@wip` red; the outside-in check is 1.B.6 (switching the scenarios to the real database).

- [x] 1.B.1 Refactor the steps so seeding goes through one `World` method (`givenRoute(origin, destination)`) instead of building in-memory objects in each step; still in-memory, green; commit + push.
- [x] 1.B.2 Integration TDD: `PostgresLocalityRepository` (`src/infrastructure/outbound/persistence/repositories/postgres-locality-repository.ts`, row type in `.../persistence/models/locality-record.ts`, `toDomain` private, as in the backend) implements the new `LocalityRepository` port (`getByName`) over `geo.localities`; domain model `Locality` replaces `LocationData`. One test per cycle in `test/integration/persistence/postgres-locality-repository.spec.ts`; not found returns `null`, never throws.
- [x] 1.B.3 Integration TDD: `PostgresRouteRepository` (same folder) implements `RouteRepository.getByLocalities(origin, destination)` over `geo.routes`, finding the route for a pair of locality ids in either order.
- [x] 1.B.4 Unit TDD: the get-route use case resolves names to localities, then the route by pair (replaces the canonical-key lookup). The in-memory fakes follow the new ports; observable behavior of the scenarios unchanged.
- [x] 1.B.5 (done together with 1.B.4: the new use case signature forced the wiring) Composition: one composition function in `src/index.ts` wiring the `geo` adapters (removes the duplicated block).
- [x] 1.B.6 The acceptance `World` wires the Postgres adapters over the test database (`GEO_TEST_SUPABASE_URL` / key) and seeds `geo.*` through the same client, cleaning tables between scenarios. No skip: it fails loudly when the variables are missing (the container and CI always provide them). The in-memory repositories stay for unit tests only. Update the test-layers table in `design.md` accordingly.
- [>] 1.B.7 Movida a R.1.8 #168 (2026-10-15): la carga inicial de provincias, localidades y rutas (la provincia sale del dump de Georef) queda en esa historia, que absorbe también la verificación de independencia 1.C.3. Se mantiene el texto original abajo como referencia.
  - Original: 1.B.7 (BLOCKED 2026-10-13: `seed_rutas.json` carries no province for the 150 cities and `geo.localities.province_id` is NOT NULL; decide the province source first: Georef API, a reviewed mapping file, or a placeholder province) Data migration script: build `geo.provinces` / `geo.localities` for the 150 cities and `geo.routes` from `seed_rutas.json` (10,879 routes, OSRM / OpenStreetMap). Locality coordinates: from the backend `locations` where present, else from the route polyline endpoints. Idempotent; run once per environment. Add the "© OpenStreetMap contributors" attribution to the README and the route responses' documentation. Stop before running it against a real environment.
- [ ] 1.B.8 `./scripts/run_all_tests`; commit + push; verify manually against the running service (sin 1.B.7, que pasó a R.1.8 #168).

### 1.C Independence from the backend database (no new scenario)

- [x] 1.C.1 (done together with 1.B.4: the old adapters could not compile against the new ports) Remove `src/infrastructure/adapters/` (`Supabase*Repository`, the backend-table readers), `LocationRepository` / `LocationData` and their env vars from `wrangler.jsonc`; the Worker only receives `geo` credentials.
- [x] 1.C.2 Move the `postgres` dependency to `devDependencies` (only `scripts/migrate` uses it now); the Worker does not bundle it.
- [>] 1.C.3 Movida a R.1.8 #168 (2026-10-15): la prueba de independencia necesita datos cargados en el ambiente. Original: Verify manually against `test` with the backend tables' grants revoked for the `geo_service` role.

## 2. R.1.5 #144 — route identity by locality pair (needs R.1.1)

- [ ] 2.1 RUT 16: name variants (repeated spaces) resolve to the same localities and route.
- [ ] 2.2 RUT 17: `"Rosario, Santa Fe"` resolves the same as `"Rosario"`.
- [ ] 2.3 RUT 18: query by locality ids in reverse order returns the stored route without calling the provider.

## 3. R.1.7 #163 — localities, search and geocoding (needs R.1.1)

Geocoding results that are stored must come from a provider whose license allows it (Mapbox `permanent=true` or open sources; see `docs/decision-proveedor-rutas.md`). Decide the source at the start of this story.

- [ ] 3.1 BLD 01: partial, accent-insensitive locality search (`GET /geo/localities`).
- [ ] 3.2 BLD 02: search restricted to a province.
- [ ] 3.3 BLD 03: address search restricted to the chosen locality.
- [ ] 3.4 BLD 04: reverse geocoding of a point to its locality.
- Backend and frontend parts (INF-LOC 01, #164) live in their repositories.

## 4. R.1.2 #141 — external provider (needs R.1.1; D4)

- [ ] 4.1 RUT 13: unknown pair resolved by Mapbox Directions through the `RoutingProvider` port, flagged exact.
- [ ] 4.2 RUT 14: a provider route is not stored nor cached (next query calls the provider again).
- [ ] 4.3 RUT 15: provider unavailable returns an estimate (`is_estimation: true`, not stored).

## 5. R.1.3 #142 — batch (parallel; needs only S.3)

- [ ] 5.1 RLT 01 to RLT 05, one scenario at a time (`POST /geo/routes/batch`).

## 6. R.1.4 #143 — authentication (parallel; needs only S.3; D7)

- [ ] 6.1 AUR 01 to AUR 05, one scenario at a time (Supabase JWT ES256 via JWKS; shared API key header for internal services).

## 7. R.1.6 #145 — single route provider, geo-service part (needs R.1.2 and R.1.4)

- [ ] 7.1 RUT 19: configurable road factor and average speed.
- Backend and frontend parts (COC 22, COC 23, INF-RUT 01, #152) live in their repositories.
