# Workflow de entrega

Cómo una historia pasa de `Ready` a producción. No hay ramas de feature ni pull requests: se trabaja en `main` y los ambientes se mueven con los scripts de release.

## Quick path

1. Tomar una historia `Ready` del Board y pasarla a `In progress`.
2. Implementar en `main`, con commits atómicos y un push por commit ([Conventional Commits](conventional-commits.md)).
3. Con la feature terminada y la suite en verde, liberar a `test`: `./scripts/release_to_test patch|minor|major`.
4. Con el pipeline de `test` en verde, pasar la historia a `In review` y cargar las horas insumidas.
5. Al final del sprint, el equipo valida todo en `test` y libera a `prod`: `./scripts/release_to_prod`. Las historias liberadas pasan a `Done`.

## Ramas y ambientes

| Rama | Para qué | Cómo se mueve |
|------|----------|---------------|
| `main` | Integración. Acá se trabaja | Push directo, un push por commit |
| `test` | Ambiente de test | `./scripts/release_to_test patch\|minor\|major` |
| `prod` | Ambiente productivo | `./scripts/release_to_prod`, a mano, con el equipo, al final del sprint |

Nunca se pushea a mano a `test` ni a `prod`. Los repos de documentación y soporte (`docs`, `roadmap`, `smartruck-ai`, `smartruck-infra`, `audit`) solo tienen `main` y no se liberan.

## Release a test

`release_to_test` corre desde `main` limpio y al día:

1. Sube la versión (`patch`, `minor` o `major`).
2. Commitea `tag:vX.Y.Z` y crea el tag.
3. Pushea `main` y `test` de forma atómica. El pipeline de `test` despliega esa versión.

| Cambio desde la última versión | Nivel |
|--------------------------------|-------|
| Solo correcciones | `patch` |
| Funcionalidad nueva compatible | `minor` |
| Contrato roto (API o esquema incompatible) | `major` |

## Release a prod

`release_to_prod` no crea versión nueva: promueve lo que está en `test` a `prod`. Exige que `main` y `test` apunten al mismo commit. Lo corre el equipo al final del sprint, con todo validado en `test`.

## Estados en el Board

| Momento | Status | Horas |
|---------|--------|-------|
| Se empieza la historia | `In progress` | `Estimate (hs)` |
| La versión está en `test` y el pipeline quedó verde | `In review` | `Spent (hs)` con las horas insumidas |
| El equipo liberó a `prod` al final del sprint | `Done` | — |

## Checklist antes de liberar a test

- [ ] Escenarios de la historia en verde, sin `@wip`
- [ ] `./scripts/run_all_tests` en verde
- [ ] README del repo y `docs` actualizados si el cambio los afecta
- [ ] Sin secretos ni configs locales en los commits

## Next step

Cuándo está terminado → [Definition of Done](definition-of-done.md)
