# Guía de desarrollo

## Requisitos previos

Dependen del repo. Resumen:

| Repo | Stack principal |
|------|-----------------|
| [smartruck-backend](./repositories/smartruck-backend/README.md) | Python 3.12, FastAPI, Docker / Dev Containers |
| [smartruck-dador](./repositories/smartruck-dador/README.md) | Node 22, TanStack Start, Vite |
| [smartruck-transportista](./repositories/smartruck-transportista/README.md) | Node / Bun, Vite |

## Instalación

Seguí el README de cada repositorio (comandos de setup, `dev_app`, tests y Dev Containers).

## Flujo de trabajo

1. Trabajo en **tasks** con ID `D-x.y.z` / `T-x.y.z` asociadas a un repo — [Jerarquía](./wiki/proceso/jerarquia.md)
2. DoR antes de empezar — [Definition of Ready](./wiki/proceso/definition-of-ready.md)
3. PR y review — [Workflow de PR](./wiki/proceso/workflow-pr.md)
4. Cierre — [Definition of Done](./wiki/proceso/definition-of-done.md)

## Convenciones

| Tema | Dónde está |
|------|------------|
| Plantillas de ticket | [wiki/tickets/plantilla-ticket.md](./wiki/tickets/plantilla-ticket.md) |
| Estimación (story points) | [wiki/tickets/estimacion.md](./wiki/tickets/estimacion.md) |
| Glosario | [wiki/equipo/glosario.md](./wiki/equipo/glosario.md) |
