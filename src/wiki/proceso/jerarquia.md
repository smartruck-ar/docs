# Jerarquía de trabajo

Todo el trabajo se modela como **user stories** en el repo [`smartruck-ar/roadmap`](https://github.com/smartruck-ar/roadmap), agrupadas en épicas (milestones) y planificadas en el Board del sprint. No hay tasks: cada historia se trabaja directamente en el repo de producto que corresponde.

## Modelo

```text
Épica       milestone de roadmap         D.2 - Gestión de carga
  └── Historia   issue "user story"      D.2.8 - Como dador, Quiero …, Para …
        ├── Contraparte de UI            UI-D.2.8 - Como dador, Quiero …, Para …
        └── Sub-historia (sub-issue)     D.2.8.1 - …
```

## Prefijos

El prefijo sale del milestone y se hereda en toda la cadena.

| Prefijo | Producto o grupo | Milestones |
|---------|------------------|------------|
| `D` | Dador | `D.1` … `D.7`, `D.X` |
| `T` | Transportista | `T.1` … `T.7`, `T.X` |
| `R` | Servicio de rutas | `R.1` |
| `B` | Backoffice | `Backoffice` |
| `S` | Spikes (contador único, sin producto) | `SPIKES` |

## IDs

| Nivel | Formato | Ejemplo | Quién lo asigna |
|-------|---------|---------|-----------------|
| Épica | `<Prefijo>.<N> - <nombre>` | `T.3 - Gestion y visualizacion de flota` | El equipo, al crear el milestone |
| Historia | `<épica>.<M> - <título>` | `T.3.14 - Como transportista, …` | La [automatización](../tickets/automatizacion-historias.md), al asignar el milestone |
| Historia de UI | `UI-<épica>.<M> - <título>` | `UI-T.3.14 - Como transportista, …` | La automatización (prefijo `UI-` en el título o tags `front+back` / `crear front`) |
| Sub-historia | `<historia>.<K> - <título>` | `T.1.1.1 - …` | La automatización, si es sub-issue de una historia numerada |
| Spike | `S.<N> - <título>` | `S.3 - …` | La automatización, en el milestone `SPIKES` |

La historia de backend y su contraparte de UI comparten el número: el contador es único por milestone. Una vez numerado, el título no cambia.

## Qué lleva cada nivel

### Épica (milestone)

- Objetivo de negocio amplio que agrupa historias.
- No se estima ni tiene repositorio.

### Historia (user story)

- Título `Como …, Quiero …, Para …`; la automatización le agrega el número y el label `user story`.
- Backend: los criterios de aceptación son sus escenarios Gherkin ([Plantilla de ticket](../tickets/plantilla-ticket.md)).
- UI (`UI-`): referencia la historia de backend asociada.
- En el Board lleva `Status`, `Sprint`, `US Points`, `Priority`, `Estimate (hs)` y `Spent (hs)`.
- Se trabaja en el repo de producto que corresponde, en `main` ([Workflow de entrega](workflow-entrega.md)).

### Spike

- Investigación o decisión con un entregable concreto (documento o decisión), sin código de producto.
- Milestone `SPIKES` y label `spike`. `Gherkins: no aplica`.

## Completitud

Done implica **ambiente productivo**. Detalle en [DoD](definition-of-done.md).

| Nivel | Se completa cuando… |
|-------|---------------------|
| Historia | Está liberada a `prod` con el release del sprint |
| Épica | Todas sus historias están Done |

## Ejemplo

```text
T.3 - Gestion y visualizacion de flota          (milestone)
  T.3.12 - Como transportista, Quiero registrar la capacidad en toneladas de mis remolques, …
  UI-T.3.12 - Como transportista, Quiero registrar la capacidad en toneladas de mis remolques, …
  T.3.13 - Como transportista, Quiero desasignar un camión o un remolque de una carga, …
```

Los commits llevan el número de la historia en el scope: `feat(T.3.12): …` ([Conventional Commits](conventional-commits.md)).

## Next step

[Definition of Ready](definition-of-ready.md) · [Automatización de historias](../tickets/automatizacion-historias.md)
