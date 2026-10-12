# Estimación

Las **historias** se estiman en el Board del sprint, en tres campos:

| Campo del Board | Cuándo | Unidad |
|-----------------|--------|--------|
| `US Points` | En refinamiento, antes de `Ready` ([DoR](../proceso/definition-of-ready.md)) | Puntos relativos |
| `Estimate (hs)` | Al pasar la historia a `In progress` | Horas hombre |
| `Spent (hs)` | Al liberar a `test` (`In review`) | Horas hombre reales |

Las **épicas** (milestones) no se estiman.

## US points (escala sugerida)

Fibonacci acotado:

| Puntos | Significado orientativo |
|--------|-------------------------|
| 1 | Muy chica, poco riesgo |
| 2 | Chica |
| 3 | Mediana |
| 5 | Grande |
| 8 | Muy grande → considerar partir |
| 13+ | Demasiado grande → partir en sub-historias |

## Horas hombre

- Al arrancar la historia: cargar `Estimate (hs)`.
- Al liberarla a `test`: cargar `Spent (hs)` con las horas reales.
- Sirve para comparar estimado contra real; no reemplaza a los US points.

## Qué estimamos en puntos

- Complejidad, incertidumbre y esfuerzo relativo entre **historias**.
- La historia de backend y su contraparte de UI se estiman por separado.
- Comparar con historias ya hechas del mismo producto (`D`, `T`, `R`, `B`).

## Checklist de refinamiento

- [ ] Historia con criterios (Gherkin en backend) y prioridad
- [ ] `US Points` cargados
- [ ] Si aplica, Gherkins en camino a `main` (o ya en `main`)
- [ ] Si son 8 o más, se discutió partirla

## Next step

[DoR](../proceso/definition-of-ready.md) · [Plantilla](plantilla-ticket.md)
