# Arquitectura — infra-template

## Responsabilidades

- Plantilla de CI/CD para microservicios: tests en Docker, gitleaks, deploy Nomad, smoke `GET /health`
- No asume lenguaje ni cloud concreto

## Stages

| Stage | Qué hace |
|-------|----------|
| build | Tests + linter (`docker build --target build`) |
| security | Escaneo de secretos |
| deploy | Tag, push GHCR, `nomad job run` |
| smoke | Health hasta OK |

## Relación con el resto

| Relación | Detalle |
|----------|---------|
| Despliega sobre | Plataforma Nomad tipicamente levantada con [cloud-template](../cloud-template/README.md) |
| No es | El backend/frontends de negocio Smartruck |
