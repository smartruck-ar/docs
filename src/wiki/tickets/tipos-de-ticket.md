# Tipos de ticket

Todo ticket es una issue de [`smartruck-ar/roadmap`](https://github.com/smartruck-ar/roadmap). Hay un solo tipo de trabajo, la **user story**, con tres variantes, más las épicas que las agrupan.

| Tipo | Qué es | Cómo se crea | Label |
|------|--------|--------------|-------|
| Épica | Milestone que agrupa historias | Milestone en `roadmap` | — |
| Historia de backend | Valor de negocio (Como/Quiero/Para) con criterios en Gherkin | Título sin prefijo + milestone | `user story` |
| Historia de UI | Contraparte de pantalla de una historia de backend | Título con `UI-`, o tags `front+back` / `crear front` | `user story` |
| Spike | Investigación o decisión con entregable | Milestone `SPIKES` | `user story` (lo pone la automatización) y `spike` |

## Reglas rápidas

- Si entrega valor al usuario o habilita una capacidad técnica → **historia** (`Como desarrollador, Quiero …` vale para trabajo técnico).
- Si necesita pantalla y backend → dos historias con el mismo número (`T.2.9` y `UI-T.2.9`), creadas con `front+back`.
- Si hay que investigar antes de decidir → **spike**.
- Un arreglo o mejora también es una historia; no hay tipo "bug" ni "task".
- Si una historia es grande, se parte en sub-historias (sub-issues nativas de GitHub), que heredan su número.

## Checklist

- [ ] Es una issue de `roadmap` con milestone
- [ ] El título sigue `Como …, Quiero …, Para …` (o `UI-…`)
- [ ] Tiene el label que le corresponde

## Next step

[Estimación](estimacion.md) · [Automatización de historias](automatizacion-historias.md)
