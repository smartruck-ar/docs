# Repositories

Documentación técnica por repositorio. El índice lateral del mdBook lista cada servicio.

## Índice

| Repositorio | Rol |
|-------------|-----|
| [smartruck-backend](./smartruck-backend/README.md) | API FastAPI (hexagonal) |
| [smartruck-dador](./smartruck-dador/README.md) | Frontend Dador (`D`) |
| [smartruck-transportista](./smartruck-transportista/README.md) | Frontend Transportista (`T`) |
| [smartruck-audit](./smartruck-audit/README.md) | Logs: Promtail → Loki → Grafana |
| [cloud-template](./cloud-template/README.md) | Plataforma Nomad + Terraform (OCI) |
| [infra-template](./infra-template/README.md) | Template de microservicio (Docker / Nomad / GHCR) |

## Convención

Cada carpeta incluye `README.md`, `arquitectura.md` y `links.md`.

Las historias viven en `roadmap` y se trabajan en el repo que corresponde: backend en `smartruck-backend`, pantallas (`UI-`) en `smartruck-dador` o `smartruck-transportista`. Ver [Jerarquía](../wiki/proceso/jerarquia.md).
