# infra-template

Template de **microservicio** (agnóstico de lenguaje y cloud): build con Docker, publicación en GHCR y deploy en Nomad vía GitHub Environments.

Pipeline: `build → security → deploy → smoke`.

## Quick path

1. Crear repo desde el template
2. Ramas `main` / `test` / `prod`
3. Adaptar `Dockerfile` (stages `build` + `runtime`) y `scripts/ci-test.sh`
4. Configurar Environments `test` / `production`

Repo: [Mriat30/infra-template](https://github.com/Mriat30/infra-template)

## Stack

| Área | Tecnología |
|------|------------|
| Build / runtime | Docker |
| Registry | GHCR |
| Orquestación | Nomad |
| CI | GitHub Actions |
| Versión | archivo `VERSION` (SemVer) |

## Docs de este repo

- [Arquitectura](./arquitectura.md)
- [Links](./links.md)
