# Desarrollo con agentes

Cómo arrancar y llevar una feature con un agente de IA (Claude Code u OpenCode) usando el setup del repo `smartruck-ai`.

## Quick path

1. Instalar el setup siguiendo la guía de instalación del README de [`smartruck-ai`](https://github.com/smartruck-ar/smartruck-ai).
2. Abrir el agente con el wrapper de la carpeta de repos: `<carpeta>/bin/claude-smartruck` o `<carpeta>/bin/opencode-smartruck`.
3. Pasarle la historia del Board:

```text
/nueva-feature roadmap#<N>
```

## Fases

| Fase | Qué hace el agente |
|------|--------------------|
| 1. Preparación | Actualiza todos los repos de la organización y `docs`. Lee la historia y asegura los criterios de aceptación. Actualiza los Gherkins en el `.feature` del repo (con `@wip`) y en el ticket. Pasa la historia a `In progress`. |
| 2. Gate | Muestra el plan (escenarios, capas, archivos y decisiones abiertas) y espera la aprobación. Es la única pausa. |
| 3. Ejecución | Escenario por escenario, en `main`: rojo, verde, commit y push, refactor, commit y push. |
| 4. Cierre | Corre la suite completa, actualiza el README del repo y `docs`, libera a `test` con `release_to_test` y pasa la historia a `In review` con las horas insumidas. |

La liberación a `prod` y el pase a `Done` no los hace el agente: los hace el equipo al final del sprint ([Workflow de entrega](workflow-entrega.md)).

## Reglas del agente

- Los criterios de aceptación son los escenarios Gherkin ([Gherkin](gherkin.md)).
- Ciclos de TDD de un test por vez, de afuera hacia adentro, con un commit y un push por ciclo ([Conventional Commits](conventional-commits.md)).
- Solo usa las skills del setup del proyecto, no las globales de cada persona.
- Las horas insumidas las informa la persona; el agente no las estima.

## Skills principales

| Skill | Para qué |
|-------|----------|
| `nueva-feature` | Punto de entrada: preparación, gate, ejecución y cierre |
| `criterios-aceptacion` | Reglas y escenarios de una historia |
| `bdd-tdd-execution` | Ciclos BDD + TDD después del gate |
| `release-ambientes` | Release a `test` |
| `board-sprint` | Estados y horas en el Board |
| `actualizar-docs` | Qué página de `docs` tocar después de una feature |

El catálogo completo está en el README de `smartruck-ai`.
