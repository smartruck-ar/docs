# Wiki del equipo

Documentación operativa interna de ingeniería del **Grupo 179 (FIUBA)**: procesos, estándares de código, convenciones de tickets, glosario de dominio y criterios de diseño visual.

## Proceso de desarrollo

| Documento | Qué resuelve |
| :--- | :--- |
| [Jerarquía de trabajo](./proceso/jerarquia.md) | Cómo se descompone el trabajo desde épica hasta historia, sub-tarea y PR. |
| [Definition of Ready (DoR)](./proceso/definition-of-ready.md) | Condiciones obligatorias antes de tomar una historia para desarrollar. |
| [Definition of Done (DoD)](./proceso/definition-of-done.md) | Criterios de calidad y verificación para dar una historia por terminada. |
| [Workflow de entrega](./proceso/workflow-entrega.md) | Integración continua sobre `main` y promoción hacia `test` y `prod`. |
| [Desarrollo con agentes](./proceso/desarrollo-con-agentes.md) | Uso estandarizado de `smartruck-ai`, skills, reglas e inspección humana. |
| [Conventional Commits](./proceso/conventional-commits.md) | Convención de mensajes de commit atómicos en el proyecto. |
| [Logging y observabilidad](./proceso/logging.md) | Formato JSON con `LogManager`, manejo de errores y reenvío a Datadog. |
| [Convenciones Gherkin](./proceso/gherkin.md) | Redacción de criterios y pruebas BDD en español (`# language: es`). |

## Tickets y tablero (`roadmap`)

| Documento | Qué resuelve |
| :--- | :--- |
| [Plantilla de ticket](./tickets/plantilla-ticket.md) | Estructura estándar de historias e issues en `smartruck-ar/roadmap`. |
| [Tipos de ticket](./tickets/tipos-de-ticket.md) | Clasificación por naturaleza (`Historia`, `Bug`, `Tarea técnica`). |
| [Estimación](./tickets/estimacion.md) | Escala de US Points y registro de horas (`Estimate` / `Spent`). |
| [Automatización de historias](./tickets/automatizacion-historias.md) | Sincronización automática de ramas, PRs y columnas del proyecto. |

## Equipo y dominio

| Documento | Qué resuelve |
| :--- | :--- |
| [Roles y responsables](./equipo/roles.md) | Integrantes, tutorías, referentes de validación y responsabilidades por área. |
| [Glosario](./equipo/glosario.md) | Definiciones canónicas del dominio logístico y mapa de repositorios vigentes. |

## Diseño UI y handoff

| Documento | Qué resuelve |
| :--- | :--- |
| [Restyling visual](./ui/restyling.md) | Decisiones de paleta, tipografía, espaciado y componentes compartidos. |
| [Handoff Portal Dador](./ui/restyling-dador-handoff.md) | Lineamientos específicos y pendientes visuales del portal dador. |
