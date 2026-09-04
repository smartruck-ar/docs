# Workflow de Pull Request

Flujo estándar para integrar cambios desde una task.

## Quick path

1. Crear branch desde `main` (o la branch base del equipo)
2. Implementar la task (`D-1.2.1`, etc.)
3. Abrir PR con descripción y checklist
4. Review + checks en verde
5. Merge y desplegar; la task solo queda Done si está en productivo ([DoD](definition-of-done.md))

## Commits

Usar [Conventional Commits](conventional-commits.md): solo `feat`, `fix` o `refactor`, con la task en el scope.

```text
feat(1.1.2): <descripción>
```

## Branching (propuesta)

| Tipo | Convención sugerida |
|------|---------------------|
| Task | `feature/D-1.2.1-descripcion-corta` |

Ajustá nombres si el repo ya tiene otra convención; documentalo en `repositories/<repo>/README.md`.

## Contenido mínimo del PR

- Qué cambia y por qué (ID de task si aplica)
- Cómo probarlo
- Criterios de aceptación cubiertos
- Capturas / logs solo si aportan

## Checklist de review

- [ ] Cumple los CA de la task
- [ ] Tests o evidencia manual
- [ ] No hay secretos ni configs locales
- [ ] Alcance acotado a la task

## Merge

- Preferir squash o el método que defina cada repo
- Borrar branch remota si el equipo lo usa así
- Actualizar estado de la task a Done solo si cumple [DoD](definition-of-done.md)

## Next step

Ver docs del repo en [repositories/](../../repositories/README.md)
