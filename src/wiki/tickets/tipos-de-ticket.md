# Tipos de ticket

Solo existen tres tipos: **épica**, **historia** y **task**.

| Tipo | Rol en la jerarquía | Estimación | Repo |
|------|---------------------|------------|------|
| Épica | Agrupa historias | No | No |
| Historia | Valor de negocio (Como/Quiero/Para) | No (el esfuerzo vive en las tasks) | No |
| Task | Trabajo técnico que compone una historia | **US points** (DoR) | Sí |

## Reglas rápidas

- Si entrega valor al usuario → **historia** (+ tasks).
- Si es implementación concreta de una historia → **task**.
- Todo el trabajo (incluido un arreglo o mejora) se modela como **task** bajo una historia; no hay tipo “bug”.

## Checklist

- [ ] El tipo es épica, historia o task
- [ ] Las tasks cuelgan de una historia con ID padre

## Next step

[Estimación](estimacion.md)
