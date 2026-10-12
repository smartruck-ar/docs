# Definition of Ready (DoR)

Una historia solo entra a desarrollo si cumple este checklist. Recién ahí pasa a `Ready` en el Board.

## Historia lista para trabajar (Ready)

- [ ] Issue en `roadmap` con milestone y número asignado por la [automatización](../tickets/automatizacion-historias.md)
- [ ] Título `Como …, Quiero …, Para …` y contexto en la descripción ([Plantilla de ticket](../tickets/plantilla-ticket.md))
- [ ] Backend: **Gherkins** pusheados a `main` del repo y link al `.feature` en la descripción
- [ ] UI: referencia a la historia de backend asociada
- [ ] `US Points` cargados ([Estimación](../tickets/estimacion.md))
- [ ] `Priority` asignada
- [ ] Dependencias declaradas (`Bloqueado por #<N>`) y desbloqueadas

### Gherkins

En una historia de backend, los criterios de aceptación son sus escenarios Gherkin. Los `.feature` tienen que estar pusheados a `main` **antes** de considerarla Ready, y la descripción tiene que tener el link al archivo. El formato del feature sigue la [Convención de Gherkin](gherkin.md). Si no aplica (spike), indicar `Gherkins: no aplica`.

Ciclo de vida en la descripción de una user story de backend: al crearla, los escenarios van escritos en la descripción; antes de Ready se pushean a `main`; una vez en `main`, el bloque se reemplaza por el link al `.feature`. Detalle en [Plantilla de ticket](../tickets/plantilla-ticket.md#descripción-de-una-user-story-en-roadmap-formato-vigente).

## Al comenzar la historia

- [ ] Pasarla a `In progress` en el Board
- [ ] Cargar `Estimate (hs)` (horas hombre previstas)

Eso es distinto de los US points: los puntos son esfuerzo relativo; las horas son la estimación temporal al arrancar.

## Qué no es Ready

| Señal | Acción |
|-------|--------|
| Historia de backend sin Gherkins | Escribirlos y devolverla a refinamiento |
| Gherkins solo en la descripción, no en `main` | Pushear el `.feature` a `main` y reemplazar el bloque por el link |
| Sin `US Points` | Estimar antes de planificar |
| Sin `Priority` | Asignarla |
| Bloqueada por otra historia abierta | Esperar o replanificar |

## Checklist rápido (pre-sprint)

- [ ] Cada historia planificada cumple DoR
- [ ] Gherkins en `main` cuando corresponde
- [ ] Equipo alineado en alcance

## Next step

Cuando el trabajo termina → [Definition of Done](definition-of-done.md)
