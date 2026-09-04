# Arquitectura

## Vista general

Smartruck se organiza en varios repositorios:

```text
[smartruck-dador] ────────┐
                          ├──> [smartruck-backend] ──> PostgreSQL / integraciones
[smartruck-transportista] ─┘

[cloud-template]   → plataforma Nomad (IaC)
[infra-template]   → template de microservicio (Docker / Nomad / GHCR)
```

Detalle por servicio: [Repositories](./repositories/README.md).

## Componentes

| Componente | Rol |
|------------|-----|
| smartruck-backend | API FastAPI, arquitectura hexagonal, dominio compartido |
| smartruck-dador | Frontend Dador (TanStack Start + Vite) |
| smartruck-transportista | Frontend Transportista |
| cloud-template | Laboratorio / plataforma Nomad con Terraform (OCI) |
| infra-template | Template de microservicio agnóstico de lenguaje |

## Decisiones técnicas

Las decisiones relevantes de diseño se registran aquí y/o en la arquitectura de cada repo bajo `repositories/`.
