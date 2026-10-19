# Plantillas de ticket

Los campos del Board (`Status`, `Sprint`, `US Points`, `Priority`, `Estimate (hs)`, `Spent (hs)`) y el milestone van **fuera** de la descripción. Acá solo se define el **cuerpo** que se pega en la descripción del ticket.

## Descripción de una user story en `roadmap` (formato vigente)

Todo el trabajo se modela como **user story en `smartruck-ar/roadmap`**. El título va sin numeración (`Como …, Quiero …, Para …`): la numeración, el label `user story`, la contraparte de UI y el sprint los asigna la [automatización](automatizacion-historias.md) al asignar la épica (milestone).

### Historia de backend

```markdown
<Contexto en una o dos oraciones: qué hay hoy y qué cambia.>

Bloqueado por #<N> <(opcional) escenario o motivo>

<Gherkins: ver ciclo de vida abajo>
```

Los **criterios de aceptación de una historia de backend son sus escenarios Gherkin**. No se escribe una lista de CA aparte.

### Ciclo de vida de los Gherkins en la descripción

| Momento | Qué va en la descripción |
|---------|--------------------------|
| **Al crear la historia** (refinamiento) | Los escenarios escritos directamente en la descripción, en un bloque `gherkin`, con la ruta del `.feature` donde se van a pushear |
| **Antes de pasar a Ready** | Los escenarios se pushean a `main` del repositorio correspondiente ([DoR](../proceso/definition-of-ready.md)) |
| **Una vez en `main`** | El bloque se **reemplaza** por el link al archivo: `[Link a los Gherkins asociados](https://github.com/smartruck-ar/<repo>/blob/main/test/acceptance/features/<archivo>.feature)` |

Bloque a usar mientras los escenarios no están en `main`:

````markdown
**Gherkins** — pendientes de pushear a `<repo>/test/acceptance/features/<archivo>.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Escenario: <ID>: <descripción>
  Dado …
  Cuando …
  Entonces …
```
````

Los escenarios siguen la [convención de Gherkin](../proceso/gherkin.md). Los IDs nuevos continúan la numeración del `.feature` donde se agregan; se confirman al pushear.

### Historia de frontend (`UI-`)

Basta con referenciar la historia de backend asociada:

```markdown
Contraparte de UI del ticket backend #<N>.
```

La contraparte que crea la automatización con el tag `front+back` ya trae esta referencia. Si la historia de frontend no tiene contraparte directa, referenciar la historia de backend de la que depende.

### Spike

Contexto, qué hay que investigar o decidir y cuál es el entregable esperado. `Gherkins: no aplica`.

## Checklist

- [ ] Título `Como …, Quiero …, Para …` (con `UI-` si es de pantalla), sin numeración
- [ ] Milestone asignado (la automatización numera y agrega `user story`)
- [ ] Backend: escenarios Gherkin en la descripción o link al `.feature` en `main`
- [ ] UI: referencia a la historia de backend
- [ ] `Bloqueado por #<N>` si depende de otra historia

## Next step

[Automatización de historias](automatizacion-historias.md) · [Definition of Ready](../proceso/definition-of-ready.md)
