# Guía de desarrollo

## Requisitos previos

Dependen del repo. Resumen:

| Repo | Stack principal |
|------|-----------------|
| [smartruck-backend](./repositories/smartruck-backend/README.md) | Python 3.12, FastAPI, Docker / Dev Containers |
| [smartruck-dador](./repositories/smartruck-dador/README.md) | Node 22, TanStack Start, Vite |
| [smartruck-transportista](./repositories/smartruck-transportista/README.md) | Node / Bun, Vite |
| [smartruck-audit](./repositories/smartruck-audit/README.md) | Grafana + Loki + Promtail (Docker Compose) |

## Instalación

Seguí el README de cada repositorio (comandos de setup, `dev_app`, tests y Dev Containers).

## Flujo de trabajo

1. Las historias viven en el Board de [`roadmap`](./wiki/tickets/automatizacion-historias.md), con sus criterios de aceptación como escenarios Gherkin ([Plantilla de ticket](./wiki/tickets/plantilla-ticket.md)).
2. Antes de empezar, la historia cumple el [Definition of Ready](./wiki/proceso/definition-of-ready.md) y pasa a `In progress`.
3. Se trabaja en `main`, sin ramas de feature ni pull requests, con commits atómicos y un push por commit ([Conventional Commits](./wiki/proceso/conventional-commits.md)).
4. Con la feature terminada, se libera a `test` con `./scripts/release_to_test patch|minor|major` y la historia pasa a `In review` con las horas insumidas ([Workflow de entrega](./wiki/proceso/workflow-entrega.md)).
5. Al final del sprint, el equipo libera a `prod` con `./scripts/release_to_prod` y las historias pasan a `Done` ([Definition of Done](./wiki/proceso/definition-of-done.md)).

Para hacerlo con un agente de IA, ver [Desarrollo con agentes](./wiki/proceso/desarrollo-con-agentes.md).

## Convenciones

| Tema | Dónde está |
|------|------------|
| Plantillas de ticket | [wiki/tickets/plantilla-ticket.md](./wiki/tickets/plantilla-ticket.md) |
| Estimación (story points) | [wiki/tickets/estimacion.md](./wiki/tickets/estimacion.md) |
| Logging (hexagonal) | [wiki/proceso/logging.md](./wiki/proceso/logging.md) |
| Gherkin (BDD) | [wiki/proceso/gherkin.md](./wiki/proceso/gherkin.md) |
| Glosario | [wiki/equipo/glosario.md](./wiki/equipo/glosario.md) |
