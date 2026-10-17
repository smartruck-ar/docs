# Delta spec: geo-service

> The executable acceptance criteria are the Gherkin scenarios in each roadmap story (linked per requirement). The scenarios below summarize the contract; when they differ, the story wins.

## ADDED Requirements

### Requirement: Own geographic data (R.1.1 #140)

The service MUST own its data (provinces, localities with coordinates, routes) in its own schema with its own database role, and MUST NOT read or write tables owned by other services. Preloaded routes MUST remain available after the migration.

The existing route scenarios (RUT 01, 02, 05, 10, 11, 12) cover this requirement once they run against the service's own database (tasks 1.B.6). No dedicated scenarios: they would repeat RUT 01, and independence from the backend database is verified by removing those adapters and by the role's grants.

### Requirement: Route identity by locality pair (R.1.5 #144)

A route MUST be identified by the unordered pair of locality ids it connects. Name normalization (accents, case, repeated spaces, ", Provincia" suffix) SHALL only be used to resolve the locality a user typed. A route MUST be queryable by locality ids.

#### Scenario: name variants resolve to the same route (RUT 16, RUT 17)
- GIVEN localities "San Nicolás", "Rosario" and "Córdoba"
- WHEN a user requests the route using "San   Nicolás" or "Rosario, Santa Fe"
- THEN the same localities and the same route are returned

#### Scenario: query by locality ids (RUT 18)
- GIVEN a preloaded route between "Rosario" and "Córdoba"
- WHEN a user requests the route by the localities' ids in reverse order
- THEN the stored route is returned without calling the external provider

### Requirement: Localities, search and geocoding (R.1.7 #163)

The service MUST expose locality search (partial, accent-insensitive, optionally filtered by province), address search restricted to the chosen locality, and reverse geocoding from a point to its locality or address. The backend MUST NOT expose these capabilities any more.

#### Scenarios
- BLD 01: localities found by partial name without accents.
- BLD 02: search restricted to a province.
- BLD 03: addresses only from the chosen locality.
- BLD 04: a map point resolves to its locality.
- INF-LOC 01 (backend): the backend no longer searches localities (404).

### Requirement: External provider fallback with persistence (R.1.2 #141)

When a route is neither cached nor stored, the service MUST resolve it with the external road-routing provider. It MUST persist the result only when the provider's license allows storage; with Mapbox (design D4) the result MUST NOT be persisted nor cached. If the provider fails, the service MUST return an estimate flagged `is_estimation: true` and MUST NOT persist it.

#### Scenarios
- RUT 13: a new route is resolved by the provider and flagged exact.
- RUT 14: a route resolved by the provider is not stored (the next query, in either direction, calls the provider again). Changes to "served from storage" if a storable provider (self-hosted OSRM/Valhalla) is adopted.
- RUT 15: provider unavailable returns an estimate.

### Requirement: Batch route resolution (R.1.3 #142)

The service MUST resolve several pairs in one call (`POST /routes/batch`), in the requested order, deduplicated, with optional geometry and the coordinates of each pair's localities; results MUST match single-route queries.

#### Scenarios
- RLT 01 to RLT 05 (order, deduplication, locality coordinates, optional geometry, same result as single query).

### Requirement: Authentication (R.1.4 #143)

The service MUST accept requests from authenticated users (Supabase JWT validated with ES256 via JWKS, same audience and issuer as the backend) and from internal services with their own credential, and MUST reject anything else with 401.

#### Scenarios
- AUR 01 to AUR 05 (valid session, no credentials, expired session, internal service, wrong internal credential).

### Requirement: Single route provider (R.1.6 #145, geo-service part)

Estimation parameters (road factor, average speed) MUST be configurable. The service SHALL be the only runtime writer of route data.

#### Scenario: configured road factor (RUT 19)
- GIVEN no stored route, provider unavailable and road factor configured as 1.3
- WHEN a user requests the route
- THEN the response is an estimate equal to the straight-line distance times 1.3

## MODIFIED Requirements

### Requirement: Route lookup by city names

Lookup by names (RUT 01 to RUT 12) MUST keep its current observable behavior (same status codes, messages, orientation and accent/case insensitivity) while the internal identity moves to locality pairs.
