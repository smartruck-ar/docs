# Definition of Ready (DoR)

Una task solo entra a desarrollo si cumple este checklist.

## Task — lista para trabajar (Ready)

- [ ] **Criterios de aceptación** definidos en la descripción
- [ ] Si corresponde: **Gherkins** (features) ya están en **`main`**
- [ ] Estimada en **US points** (user story points)
- [ ] ID correcto (`D-1.2.1` / `T-1.2.1`) e historia padre definida
- [ ] Repositorio asociado

### Gherkins

Si la task tiene escenarios BDD, los `.feature` (o equivalente) deben estar mergeados en `main` **antes** de considerarla Ready. Si no aplica BDD, ese ítem no bloquea.

## Historia (contexto)

La historia sigue el formato **Como / Quiero / Para**, sin repo. El trabajo Ready/Done operativo vive en las **tasks**.

Checklist útil al refinar una historia:

- [ ] ID (`D-1.2`) y épica padre
- [ ] Como / Quiero / Para completo
- [ ] Tasks hijas identificadas (cada una podrá cumplir DoR de task)

## Qué no es Ready

| Señal | Acción |
|-------|--------|
| Task sin CA en la descripción | Completar CA o devolver a refinamiento |
| Faltan Gherkins en `main` y sí aplican | Mergear features a `main` primero |
| Task sin US points | Estimar antes de planificar |
| Task sin repo | Asignar repo |

## Checklist rápido (pre-sprint)

- [ ] Cada task planificada cumple DoR
- [ ] Gherkins en `main` cuando corresponde
- [ ] Equipo alineado en alcance

## Next step

Cuando el trabajo termina → [Definition of Done](definition-of-done.md)
