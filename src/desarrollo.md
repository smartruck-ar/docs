# Guía de desarrollo

Esta guía resume el mapa de repositorios, herramientas requeridas y convenciones operativas para levantar, probar y publicar cambios en **Smartruck**. Para el detalle técnico de cada módulo, consultar el índice en [Repositories](./repositories/README.md).

---

## Repositorios y stack tecnológico vigente

| Repositorio | Propósito | Stack y herramientas principales |
| :--- | :--- | :--- |
| [**`smartruck-backend`**](./repositories/smartruck-backend/README.md) | API core, matching PostGIS, pagos y métricas | Python >= 3.12 (`uv`), FastAPI, SQLModel, Alembic, GeoAlchemy2, `pytest`, `pytest-bdd`, `ruff`. |
| [**`microservice-routes`** (`geo-service`)](https://github.com/smartruck-ar/microservice-routes) | Servicio geográfico de borde | TypeScript, Cloudflare Workers (`wrangler`), `jose`, `@supabase/supabase-js`, Vitest + Cucumber, ESLint. |
| [**`smartruck-dador`**](./repositories/smartruck-dador/README.md) | Portal web para dadores de carga | Node 22+, React 19, TypeScript, TanStack Start/Router/Query, Vite 8, Nitro, Tailwind v4, Leaflet, MapLibre GL, Recharts, Vitest. |
| [**`smartruck-transportista`**](./repositories/smartruck-transportista/README.md) | Portal web para transportistas | Node 22+, React 19, TypeScript, TanStack Start/Router/Query, Vite 8, Nitro, Tailwind v4, MapLibre GL, Recharts, Vitest (`happy-dom`). |
| [**`smartruck-backoffice`**](https://github.com/smartruck-ar/smartruck-backoffice) | Consola administrativa y tarifaria | Node 22+, React 19, TypeScript, TanStack Start/Router/Query, Vite 8, Nitro, Tailwind v4, Vitest. |
| [**`landing-page`**](https://github.com/smartruck-ar/landing-page) | Sitio institucional y acceso por rol | Node 22+, React 19 (JavaScript), Vite 7, Tailwind CSS v4, Vitest, Cloudflare Pages (`wrangler`). |
| [**`smartruck-infra`**](https://github.com/smartruck-ar/smartruck-infra) | Infraestructura declarativa en nube | Terraform >= 1.5 (GCP Cloud Run, API Gateway, WIF, Artifact Registry, Cloudflare DNS/WAF, Datadog). |
| [**`smartruck-ai`**](https://github.com/smartruck-ar/smartruck-ai) | Espacio de trabajo, scripts y skills AI | Scripts Bash (`fetch-repos.sh`, `workspace.sh`, `orca-up.sh`), reglas y skills compartidas. |
| [**`docs`**](https://github.com/smartruck-ar/docs) | Documentación técnica publicada | mdBook >= 0.4, especificaciones en Markdown y diagramas en `src/arquitectura/diagrams/`. |
| *Soporte e históricos* | Tablero y legados de etapa inicial | [`roadmap`](https://github.com/smartruck-ar/roadmap), [`smartruck-audit`](./repositories/smartruck-audit/README.md), [`cloud-template`](./repositories/cloud-template/README.md), [`infra-template`](./repositories/infra-template/README.md). |

---

## Prerrequisitos locales

- **Git** y acceso SSH/HTTPS a la organización `smartruck-ar`.
- **Docker** (con Docker Compose) para levantar PostgreSQL + PostGIS local y dependencias auxiliares.
- **Python >= 3.12 + `uv`** para `smartruck-backend`.
- **Node.js 22+ + `npm`** para portales TanStack Start, `microservice-routes` (`geo-service`) y `landing-page`.
- **Terraform >= 1.5** para validar o planificar cambios en `smartruck-infra`.
- **`mdbook` (>= 0.4)** para previsualizar localmente esta documentación (`mdbook serve --open`).

---

## Convención de scripts en `./scripts/`

Los repositorios de producto comparten una interfaz homogénea dentro de `./scripts/` para evitar memorizar comandos distintos por lenguaje:

### 1. Entorno local y base de datos

- `./scripts/start_dev_containers` y `./scripts/stop_dev_containers`: inician o detienen los contenedores locales (por ejemplo, Postgres + PostGIS).
- `./scripts/start_app` o `./scripts/dev_app`: levantan el servicio o portal en modo desarrollo (`APP_MODE=development`).
- `./scripts/dev_against_test` (disponible en `smartruck-dador` y `smartruck-transportista`): ejecuta el frontend local conectado contra los servicios desplegados en `test`.
- En `microservice-routes`, además existen `./scripts/migrate`, `./scripts/load_geo` y `./scripts/compute_missing_routes` para poblar y mantener el catálogo cerrado y las rutas en base geoespacial.

### 2. Verificación, pruebas y hooks

- `./scripts/install_git_hooks` en `smartruck-backend` (y `npm run prepare` con Husky en repositorios Node) instala hooks locales previos al commit/push.
- `./scripts/run_lint`: ejecuta análisis estático (`ruff` en Python; `eslint`, `prettier` y `tsc --noEmit` en TypeScript/JavaScript).
- `./scripts/run_unit_tests` y `./scripts/run_all_tests`: corren pruebas unitarias, integración y BDD (`pytest` + `pytest-bdd` con mínimo **85%** de cobertura en backend; `Vitest` en frontales y `geo-service`).

### 3. Versionado y promoción entre ambientes

- `./scripts/bump_version`: actualiza la versión semántica siguiendo etiquetas y formato del proyecto.
- `./scripts/release_to_test`: publica la versión hacia el ambiente `test`.
- `./scripts/release_to_prod`: promueve el artefacto o etiqueta hacia producción.
- En `smartruck-infra`, la validación y despliegue utilizan `./scripts/check` y `./scripts/release`.

---

## Configuración de ambientes (`APP_MODE`) y buenas prácticas

- Todos los servicios distinguen comportamiento por `APP_MODE` (`development`, `test`, `production`) para validar orígenes CORS, activar o relajar autenticación local en desarrollo y apuntar al proyecto Supabase correspondiente.
- Las variables de entorno sensibles permanecen fuera de Git (`.env` locales ignorados) y todos los repositorios ejecutan **Gitleaks** en CI/CD para detectar filtraciones accidentales.
- Todo cambio destinado a `main` debe integrarse con historial limpio siguiendo [Conventional Commits](./wiki/proceso/conventional-commits.md) y respetar los criterios descritos en el [Workflow de entrega](./wiki/proceso/workflow-entrega.md).
