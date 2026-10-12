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

## Commits atómicos y push

- Un commit es la unidad más chica que tiene sentido sola y deja el repo funcionando: un ciclo de TDD, un script, una página.
- El test va en el mismo commit que el código que verifica.
- Cada commit se pushea apenas se crea. No se acumulan commits locales.
- Todo se pushea a `main`: no hay ramas de feature ni pull requests. `test` y `prod` solo se mueven con los scripts de release ([Workflow de entrega](workflow-entrega.md)).
- Sin cuerpo ni trailers (`Co-authored-by`, `Signed-off-by`), sin `--no-verify` y sin force-push.
- En los repos sin tasks (`smartruck-ai`), el mensaje va sin scope: `feat: <descripción>`.

## Checklist

- [ ] Type es `feat`, `fix` o `refactor`
- [ ] Scope es el ID de la task
- [ ] Descripción clara y acotada al cambio
- [ ] Commit atómico y pusheado a `main`

## Referencia

Especificación completa: [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

## Next step

[Workflow de entrega](workflow-entrega.md)
