# Conventional Commits

Convención de mensajes de commit del equipo, basada en [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

## Formato

```text
<type>(<id-task>): <descripción>
```

- **type:** solo `feat`, `fix` o `refactor`
- **scope:** ID de la **task** asociada (ej. `1.1.2` → task `D-1.1.2` / `T-1.1.2`)
- **descripción:** resumen corto en imperativo / presente

## Tipos permitidos

| Type | Cuándo usarlo |
|------|----------------|
| `feat` | Nueva funcionalidad / feature |
| `fix` | Corrección de un comportamiento incorrecto |
| `refactor` | Cambio de código sin cambiar comportamiento observable |

No usamos otros types (`chore`, `docs`, `test`, etc.) en este proyecto.

## Ejemplos

```text
feat(1.1.2): agregar endpoint de alta de viaje

fix(1.1.2): corregir validación de fecha de carga

refactor(1.1.2): extraer mapper de oferta de carga
```

Con prefijo de producto en el scope (si el equipo lo prefiere de forma explícita):

```text
feat(D-1.1.2): agregar endpoint de alta de viaje
```

## Checklist

- [ ] Type es `feat`, `fix` o `refactor`
- [ ] Scope es el ID de la task
- [ ] Descripción clara y acotada al cambio

## Referencia

Especificación completa: [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

## Next step

[Workflow de PR](workflow-pr.md)
