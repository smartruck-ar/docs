# Repositories

Índice de la documentación técnica por repositorio dentro de la organización [`smartruck-ar`](https://github.com/smartruck-ar).

---

## Aplicaciones y servicios activos

| Repositorio | Rol en la plataforma | Guía principal |
| :--- | :--- | :--- |
| **`smartruck-backend`** | API REST FastAPI, arquitectura hexagonal, PostGIS matching, pagos, cancelaciones y métricas | [Ver documentación](./smartruck-backend/README.md) |
| **`geo-service` (`microservice-routes`)** | Microservicio Cloudflare Workers para catálogo cerrado de localidades y rutas interurbanas | [Ver documentación](./geo-service/README.md) |
| **`smartruck-dador`** | Portal web TanStack Start + React para dadores de carga | [Ver documentación](./smartruck-dador/README.md) |
| **`smartruck-transportista`** | Portal web TanStack Start + React para PyMEs transportistas | [Ver documentación](./smartruck-transportista/README.md) |
| **`smartruck-backoffice`** | Consola administrativa TanStack Start para revisión documental y tarifarios FADEEAC | [Ver documentación](./smartruck-backoffice/README.md) |
| **`landing-page`** | Sitio público React + Vite desplegado en Cloudflare Pages | [Ver documentación](./landing-page/README.md) |

---

## Infraestructura y soporte de ingeniería

| Repositorio | Rol | Guía principal |
| :--- | :--- | :--- |
| **`smartruck-infra`** | Terraform declarativo (GCP Cloud Run, API Gateway, WIF, Cloudflare DNS/WAF, Datadog) | [Ver documentación](./smartruck-infra/README.md) |
| **`smartruck-ai`** | Automatización multirepo, reglas compartidas (`AGENTS.md`) y skills del equipo | [Ver documentación](./smartruck-ai/README.md) |

---

## Repositorios históricos y herramientas locales

Las siguientes secciones se conservan como referencia de las herramientas locales de observabilidad e infraestructura inicial evaluadas en etapas tempranas del proyecto (reemplazadas en la nube por `smartruck-infra`):

- [`smartruck-audit`](./smartruck-audit/README.md) — Pila local opcional con Grafana, Loki y Promtail para inspección de logs.
- [`cloud-template`](./cloud-template/README.md) — Plantilla inicial de servicios evaluada sobre Nomad.
- [`infra-template`](./infra-template/README.md) — Plantilla inicial de infraestructura sobre OCI / Nomad previa a la migración a GCP/Cloudflare/Render en `smartruck-infra`.
