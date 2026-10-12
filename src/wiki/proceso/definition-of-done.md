# Definition of Done (DoD)

Una historia está Done cuando está en **ambiente productivo**. Una épica está Done cuando todas sus historias lo están.

## Regla de oro

**Done = en productivo** (además de cumplir CA y tests). Productivo se libera a mano, con el equipo, al final del sprint ([Workflow de entrega](workflow-entrega.md)).

| Estado en el Board | Significa |
|--------------------|-----------|
| `In progress` | En desarrollo en `main` |
| `In review` | Liberado a `test` con `release_to_test` y pipeline en verde |
| `Done` | Liberado a `prod` con `release_to_prod` al final del sprint |

| Nivel | Done cuando… |
|-------|----------------|
| Historia | Está desplegada en **productivo** y cumple el checklist de abajo |
| Épica (milestone) | **Todas** sus historias están Done |

## Historia Done

- [ ] Cumple todos los **criterios de aceptación** (escenarios Gherkin en verde, sin `@wip`)
- [ ] Código pusheado a `main` del repositorio asociado
- [ ] Tests acordados en verde (incl. aceptación / Gherkin si aplica)
- [ ] Validada en `test` (historia en `In review`)
- [ ] **Desplegada en ambiente productivo** con el release del sprint
- [ ] `Spent (hs)` cargado con las horas hombre insumidas
- [ ] README del repo y `docs` actualizados si aplica

### Horas

| Momento | Campo | Qué es |
|---------|-------|--------|
| Al comenzar | `Estimate (hs)` en el Board | Previsión en horas hombre |
| Al liberar a `test` (`In review`) | `Spent (hs)` en el Board | Tiempo real dedicado en horas hombre |

Sin `Spent (hs)` cargado, la historia **no** se considera Done.

## Checklist de cierre

- [ ] Estado actualizado en el Board (`In review` al liberar a `test`, `Done` al liberar a `prod`)
- [ ] Evidencia de deploy en productivo (pipeline de `prod` en verde, versión `vX.Y.Z`)
- [ ] Horas estimadas (al inicio) e insumidas (al cierre) registradas
- [ ] Número de la historia en el scope de los commits ([Conventional Commits](conventional-commits.md))

## Next step

Releases y estados → [Workflow de entrega](workflow-entrega.md)
