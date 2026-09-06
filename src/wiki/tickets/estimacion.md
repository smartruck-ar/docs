# Estimación

Las **tasks** se estiman en dos capas:

| Qué | Cuándo | Unidad |
|-----|--------|--------|
| **US points** | DoR (antes de planificar) | Puntos relativos |
| **Horas estimadas** | Al **comenzar** la task | Horas hombre |
| **Horas insumidas** | Al **finalizar** (DoD) | Horas hombre reales |

Las **épicas** no se estiman.

## US points (escala sugerida)

Fibonacci acotado:

| Puntos | Significado orientativo |
|--------|-------------------------|
| 1 | Muy chica, poco riesgo |
| 2 | Chica |
| 3 | Mediana |
| 5 | Grande |
| 8 | Muy grande → considerar partir |
| 13+ | Demasiado grande → partir en varias tasks |

## Horas hombre

- Al tomar/arrancar la task: cargar **horas estimadas**.
- Al cerrar (productivo + DoD): cargar **horas insumidas**.
- Sirve para comparar estimado vs real; no reemplaza a los US points.

## Qué estimamos en puntos

- Complejidad + incertidumbre + esfuerzo relativo entre **tasks**.
- Comparar con tasks ya hechas del mismo producto (`D` / `T`) y repo.

## Qué no estimamos

- Épicas (Done cuando todas sus historias están en productivo vía sus tasks).
- Historias (el esfuerzo se estima en las tasks).

## Checklist de refinamiento

- [ ] Task con CA, tag y prioridad
- [ ] US points asignados
- [ ] Si aplica, Gherkins en camino a `main` (o ya en `main`)
- [ ] Si ≥ 8, se discutió partir

## Next step

[DoR](../proceso/definition-of-ready.md) · [Plantilla](plantilla-ticket.md)
