# Definition of Done (DoD)

Hay una **jerarquía de Done**: nada superior está Done si lo inferior no está en **ambiente productivo**.

## Regla de oro

**Done = en productivo** (además de cumplir CA y tests). Productivo se libera a mano, con el equipo, al final del sprint ([Workflow de entrega](workflow-entrega.md)).

| Estado en el Board | Significa |
|--------------------|-----------|
| `In progress` | En desarrollo en `main` |
| `In review` | Liberado a `test` con `release_to_test` y pipeline en verde |
| `Done` | Liberado a `prod` con `release_to_prod` al final del sprint |

| Nivel | Done cuando… |
|-------|----------------|
| Task | Está desplegada en **productivo** (y cumple el checklist de task) |
| Historia | **Todas** sus tasks asociadas están en **productivo** |
| Épica | **Todas** sus historias asociadas están en **productivo** |

## Task Done

- [ ] Cumple todos los **criterios de aceptación**
- [ ] Código pusheado a `main` del repositorio asociado
- [ ] Tests acordados en verde (incl. aceptación / Gherkin si aplica)
- [ ] Validada en `test` (historia en `In review`)
- [ ] **Desplegada en ambiente productivo** con el release del sprint
- [ ] Registradas las **horas hombre insumidas** (tiempo real al finalizar)
- [ ] README del repo y `docs` actualizados si aplica

### Horas

| Momento | Campo | Qué es |
|---------|-------|--------|
| Al comenzar | `Estimate (hs)` en el Board | Previsión en horas hombre |
| Al liberar a `test` (`In review`) | `Spent (hs)` en el Board | Tiempo real dedicado en horas hombre |

Sin horas insumidas cargadas, la task **no** se considera Done.

## Historia Done

- [ ] **Todas** las tasks de la historia están Done (por lo tanto, en productivo)
- [ ] No quedan tasks abiertas ni “implícitas” fuera del tracker

## Épica Done

- [ ] **Todas** las historias de la épica están Done (todas sus tasks en productivo)

## Checklist de cierre

- [ ] Estado actualizado en el Board (`In review` al liberar a `test`, `Done` al liberar a `prod`)
- [ ] Evidencia de deploy en productivo (pipeline de `prod` en verde, versión `vX.Y.Z`)
- [ ] Horas estimadas (al inicio) e insumidas (al cierre) registradas
- [ ] ID correcto en los commits cuando aplique ([Conventional Commits](conventional-commits.md))

## Next step

Releases y estados → [Workflow de entrega](workflow-entrega.md)
