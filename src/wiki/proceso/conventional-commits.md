# Conventional Commits

Convención de mensajes de commit del equipo, basada en [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

## Formato

```text
<type>(<historia>): <descripción>
```

- **type:** solo `feat`, `fix` o `refactor`
- **scope:** número de la **historia** de `roadmap` (ej. `D.2.8`, `T.3.12`, `B.5`). La contraparte de UI usa el mismo número, sin `UI-`
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
feat(D.2.8): agregar caso de uso para eliminar una carga

fix(T.2.11): corregir el camión asignado en el detalle de la carga

refactor(B.5): extraer el mapeo de estado del transportista
```

## Commits atómicos y push

- Un commit es la unidad más chica que tiene sentido sola y deja el repo funcionando: un ciclo de TDD, un script, una página.
- El test va en el mismo commit que el código que verifica.
- Cada commit se pushea apenas se crea. No se acumulan commits locales.
- Todo se pushea a `main`: no hay ramas de feature ni pull requests. `test` y `prod` solo se mueven con los scripts de release ([Workflow de entrega](workflow-entrega.md)).
- Sin cuerpo ni trailers (`Co-authored-by`, `Signed-off-by`), sin `--no-verify` y sin force-push.
- En los repos sin historias (`smartruck-ai`, `docs`) o sin historia asociada, el mensaje va sin scope: `feat: <descripción>`.

## Checklist

- [ ] Type es `feat`, `fix` o `refactor`
- [ ] Scope es el número de la historia
- [ ] Descripción clara y acotada al cambio
- [ ] Commit atómico y pusheado a `main`

## Referencia

Especificación completa: [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

## Next step

[Workflow de entrega](workflow-entrega.md)
