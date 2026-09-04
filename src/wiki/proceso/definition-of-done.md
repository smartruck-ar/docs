# Definition of Done (DoD)

Hay una **jerarquía de Done**: nada superior está Done si lo inferior no está en **ambiente productivo**.

## Regla de oro

**Done = en productivo** (además de cumplir CA, tests y review).

| Nivel | Done cuando… |
|-------|----------------|
| Task | Está desplegada en **productivo** (y cumple el checklist de task) |
| Historia | **Todas** sus tasks asociadas están en **productivo** |
| Épica | **Todas** sus historias asociadas están en **productivo** |

## Task Done

- [ ] Cumple todos los **criterios de aceptación**
- [ ] Código mergeado en el repositorio asociado
- [ ] Tests acordados en verde (incl. aceptación / Gherkin si aplica)
- [ ] PR revisado y aprobado
- [ ] **Desplegada en ambiente productivo**
- [ ] Documentación del repo actualizada si aplica

## Historia Done

- [ ] **Todas** las tasks de la historia están Done (por lo tanto, en productivo)
- [ ] No quedan tasks abiertas ni “implícitas” fuera del tracker

## Épica Done

- [ ] **Todas** las historias de la épica están Done (todas sus tasks en productivo)

## Checklist de cierre

- [ ] Estado actualizado en el tracker
- [ ] Evidencia de deploy en productivo (pipeline, release, URL)
- [ ] ID correcto en commits/PR cuando aplique (`D-1.2.1`)

## Next step

PRs → [Workflow de PR](workflow-pr.md)
