# Automatización de historias (roadmap)

Cómo crear una historia de usuario y qué formas hay de que el propio repositorio la numere, la etiquete y arme la contraparte de front/back automáticamente.

> **Repo:** todo esto pasa en **`smartruck-ar/roadmap`**. Nunca en `smartruck-backend`, `smartruck-dador`, `smartruck-transportista` ni ningún otro repo de producto — esos repos no tienen esta automatización.
>
> Implementación: `.github/workflows/auto-number-issues.yml` + `scripts/auto_number_issues.py`, corriendo en el runner self-hosted del repo.

## Qué dispara la automatización

Dos eventos de GitHub sobre una issue de `roadmap`:

| Evento | Cuándo pasa | Qué hace |
|--------|-------------|----------|
| `milestoned` | Se le asigna un milestone a la issue | Numera, etiqueta y evalúa si hay que crear una contraparte |
| `labeled` | Se agrega uno de los tags `front+back`, `crear front` o `crear back` | Solo reacciona a esos tres; cualquier otro label (`bug`, `user story`, etc.) se ignora |

Nada de esto pasa si la issue no tiene milestone asignado.

## Comportamiento por defecto (una sola historia)

Al milestonear una historia **sin ningún tag especial**, la automatización:

1. La numera: `<Prefijo del milestone>.<siguiente número> - <título>` (ej. `T.2.9 - Como transportista...`).
2. Le agrega el label `user story`.
3. La agrega al proyecto **Board** (#4) y le asigna el **sprint actual** (según fecha de Argentina).

Esto es todo. **No crea ninguna otra historia.** Si querés una contraparte de front o de back, tenés que pedirla explícitamente con los tags de la sección siguiente.

> El item queda con `Status: Backlog` (el default de GitHub para un item nuevo). Movelo vos a `Ready`/`In progress` en el Board — la automatización no lo hace.

### ¿Cómo indico si la historia es de backend o de UI?

No hay un tag para esto: se define **con el título**, antes de milestonear.

- **Backend** (default): título normal, sin prefijo. Ej: `Como transportista, Quiero filtrar cargas...` → queda `T.2.9 - Como transportista...`.
- **UI**: escribí el título arrancando con **`UI-`**. Ej: `UI-Como transportista, Quiero filtrar cargas...` → queda `UI-T.2.9 - Como transportista...`.

El número (`T.2.9`) sale de un **contador compartido** por milestone: da lo mismo si la última historia numerada en ese milestone fue de backend o de UI, la siguiente sigue la secuencia.

## Crear las dos historias (back + UI) de una

Si de entrada sabés que la historia necesita pantalla y backend:

1. Escribí el título (con o sin `UI-`, según cuál de las dos querés que sea "la original").
2. Agregале el label **`front+back`** (antes o después de milestonear, da igual el orden).
3. Milestoneala.

Resultado: la historia original queda numerada, y se crea **una segunda issue** con el mismo número y el prefijo que le falta (si la original era de backend, la nueva es `UI-T.2.9 - ...`; si la original ya era `UI-`, la nueva es la de backend). Quedan **linkeadas entre sí** con un comentario cruzado (`🔗 Relacionado con el ticket de UI/backend: #N`).

Al terminar, el tag `front+back` se **saca automáticamente** de la historia original. Las dos terminan solo con `user story`.

## Agregar la contraparte más tarde

Si ya tenés una historia numerada (de backend o de UI) y **después** decidís que también necesita la otra mitad, no hace falta recrear nada: agregale el tag correspondiente a la historia que ya existe.

| Tengo... | Le pongo el tag... | Y se crea... |
|----------|---------------------|----------------|
| Una historia de backend (`T.2.9 - ...`) | `crear front` | Su contraparte de UI (`UI-T.2.9 - ...`), mismo milestone, sprint actual |
| Una historia de UI (`UI-T.2.9 - ...`) | `crear back` | Su contraparte de backend (`T.2.9 - ...`), mismo milestone, sprint actual |

El tag usado se saca solo al terminar. Si lo ponés en el lado que no corresponde (ej. `crear front` sobre una historia que ya es de UI), no hace nada más que sacarse el tag — no rompe nada ni duplica.

Si la historia todavía no tiene milestone asignado, el tag no dispara nada (no hay de dónde sacar el número); hay que milestonearla primero.

## Milestones de spike (`SPIKES`, `T.SPIKE`)

Los spikes son un caso aparte: **no** se separan por producto (transportista/dador) y **nunca** generan contraparte, tengan o no alguno de los tags anteriores.

- Prefijo fijo: **`S`**, con un contador único compartido por *todos* los milestones de spike (no hay `S` para transportista y otro para dador).
- Se numeran igual que cualquier historia (`S.1 - ...`, `S.2 - ...`, …), reciben `user story` y sprint actual.
- Los tags `front+back`, `crear front` y `crear back` se ignoran por completo en un milestone de spike.

## Sub-issues (una historia que cuelga de otra)

Si la historia que estás milestoneando es **sub-issue** de otra issue del propio repo `roadmap` (relación nativa de GitHub, no un link a mano), hereda el prefijo del padre en vez de calcular uno nuevo a partir del milestone:

```text
Padre  T.1.1  (ya numerada)
  └── Hijo  T.1.1.1, T.1.1.2, …   (siguiente número dentro del padre)
```

Si el padre todavía no tiene un prefijo numerado (por ejemplo, no fue milestoneado todavía), el hijo se numera como una historia normal a partir del milestone.

## Una vez numerada, el título queda fijo

Si el título **ya tiene** un prefijo numerado (con o sin `UI-` adelante), la automatización **nunca lo recalcula ni lo renombra**, sin importar cuántas veces se vuelva a milestonear o etiquetar la issue. Esto es lo que hace seguro:

- Re-milestonear por error una historia ya numerada (no la duplica ni le cambia el número).
- Agregar `crear front`/`crear back` sobre algo que ya tiene su contraparte (`find_existing_companion` la detecta por un marcador oculto en el body y no crea una segunda).

## Resumen rápido

| Quiero... | Qué hago | Tag a usar |
|-----------|----------|------------|
| Una sola historia de backend | Título normal + milestone | — |
| Una sola historia de UI | Título con `UI-` + milestone | — |
| Backend y UI juntas desde el arranque | Título + milestone | `front+back` |
| Agregar el UI a una historia de backend que ya existe | Sobre la historia ya numerada | `crear front` |
| Agregar el backend a una historia de UI que ya existe | Sobre la historia ya numerada | `crear back` |
| Un spike | Milestone `SPIKES` o `T.SPIKE` | — (los tags de arriba no aplican) |

## Next step

[Jerarquía](../proceso/jerarquia.md) · [Plantilla de ticket](plantilla-ticket.md) · [Tipos de ticket](tipos-de-ticket.md)
