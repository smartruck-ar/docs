# Workflow de entrega

Todos los repositorios de producto operan bajo **trunk-based development** sobre `main`, con separación entre los ambientes **`test`** y **`prod`** mediante etiquetas semánticas y scripts propios.

---

## Clasificación de repositorios

| Tipo | Repositorios | Flujo de promoción |
| :--- | :--- | :--- |
| **Aplicaciones y servicios (`release_to_test` / `release_to_prod`)** | `smartruck-backend`, `microservice-routes`, `smartruck-dador`, `smartruck-transportista`, `smartruck-backoffice`, `landing-page` | Integración en `main` -> `./scripts/release_to_test` -> validación en `test` -> `./scripts/release_to_prod`. |
| **Infraestructura (`scripts/check` / `scripts/release`)** | `smartruck-infra` | Validación (`terraform fmt`, `validate`, tests UDF) -> plan/apply controlado por ambiente (`test` / `prod`). |
| **Documentación y soporte (`main`)** | `docs`, `roadmap`, `smartruck-ai` | Commits atómicos sobre `main`; `docs` compila mdBook en CI y publica a `gh-pages`. |

---

## Despliegue por componente en CI/CD

1. **`smartruck-backend`:** GitHub Actions corre `Ruff`, `pytest` + `pytest-bdd` (`--cov-fail-under=85`), `test_routes_require_authentication.py`, Gitleaks y migraciones/build Docker. Autentica con **WIF (OIDC)** contra GCP, sube imagen a Artifact Registry y despliega en Cloud Run (`us-central1`).
2. **`microservice-routes` (`geo-service`):** Ejecuta TypeScript, ESLint, Prettier, Vitest (`@amiceli/vitest-cucumber` + `@cloudflare/vitest-pool-workers`), Gitleaks y publica Worker en Cloudflare (`smartruck-routes-service-test` / `smartruck-routes-service-prod`) vía `wrangler`.
3. **`smartruck-dador`, `smartruck-transportista`, `smartruck-backoffice`:** Ejecutan lint, `tsc`, Vitest y Gitleaks; construyen imagen de servidor Nitro, la publican en **GHCR** y disparan deploy hook en **Render**.
4. **`landing-page`:** Ejecuta lint, Vitest y chequeo de seguridad (`security-check.js` + `required-checks.js` + Gitleaks) y despliega estáticos en **Cloudflare Pages** (`smartruck-landing-test` / `smartruck-landing-prod`) con `wrangler pages deploy dist`.

---

## Checklist previo a promover a producción

- Suite automatizada y escaneo **Gitleaks** en verde en GitHub Actions.
- Variables de entorno, migraciones Alembic (`smartruck-backend`) y cambios en `smartruck-infra` aplicados previamente en `test`.
- Verificación funcional manual del flujo afectado en `test` antes de ejecutar `./scripts/release_to_prod`.
