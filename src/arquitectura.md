# Arquitectura

## Vista general

Smartruck se organiza en varios repositorios:

```text
[smartruck-dador] ────────┐
                          ├──> [smartruck-backend] ──> PostgreSQL / integraciones
[smartruck-transportista] ─┘
         │
         └── stdout (y otros smartruck-*) ──> [smartruck-audit: Promtail → Loki → Grafana]

[cloud-template]   → plataforma Nomad (IaC)
[infra-template]   → template de microservicio (Docker / Nomad / GHCR)
```

Diagrama interactivo (Archify): [Arquitectura SmartTruck](./arquitectura/diagrams/smartruck-architecture.html)  
(en local: `mdbook serve --open` y abrí ese link, o el HTML directo con el browser).

Detalle por servicio: [Repositories](./repositories/README.md).

## Componentes

| Componente | Rol |
|------------|-----|
| smartruck-backend | API FastAPI, arquitectura hexagonal, dominio compartido |
| smartruck-dador | Frontend Dador (TanStack Start + Vite) |
| smartruck-transportista | Frontend Transportista |
| smartruck-audit | Auditoría / logs (Promtail, Loki, Grafana) |
| cloud-template | Laboratorio / plataforma Nomad con Terraform (OCI) |
| infra-template | Template de microservicio agnóstico de lenguaje |

## Decisiones técnicas

Las decisiones relevantes de diseño se registran aquí y/o en la arquitectura de cada repo bajo `repositories/`.
