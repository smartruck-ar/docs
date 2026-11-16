# Desarrollo con agentes

El equipo utiliza asistentes de programación de forma estructurada y auditable a través del repositorio [`smartruck-ai`](https://github.com/smartruck-ar/smartruck-ai), garantizando que todo código generado respete la arquitectura hexagonal, el modelo de dominio y las pruebas del proyecto.

---

## Organización de `smartruck-ai`

- **Orquestación multi-repositorio (`fetch-repos.sh`, `workspace.sh`, `install.sh`, `update.sh`, `orca-up.sh`):** Clona y sincroniza el espacio de trabajo completo de `smartruck-ar` e instala reglas y habilidades en el entorno local.
- **Reglas base (`rules/` y `workspace/`):** Definen las invariantes no negociables (`AGENTS.md`, `domain.md`, `bdd-tdd-execution.mdc`, `conventional-commits.mdc`, `skills-solo-proyecto.mdc`).
- **Habilidades de dominio e ingeniería (`skills/`):** El repositorio provee 23 skills propias (entre ellas `nueva-feature`, `bdd-aceptacion`, `arquitectura-hexagonal`, `fastapi-controllers`, `migraciones-datos`, `portales-frontend`, `pytest-unit`, `release-ambientes`, `verificacion-completa`, `actualizar-docs` y `documentar-smartruck`), complementadas con paquetes externos versionados en `vendor/` (`mattpocock-skills` y `ponytail`) y soporte MCP (`codebase-memory-mcp`).

---

## Principios de trabajo asistido

1. **Conceptos y arquitectura primero:** El desarrollador define el diseño (ADR o especificación en `docs/specs/`) antes de delegar implementación.
2. **TDD / BDD como red de seguridad:** Ningún cambio generado se acepta sin escenarios Gherkin y cobertura de pruebas automatizadas (`./scripts/run_all_tests` y `./scripts/run_lint`).
3. **Commits limpios y autoría humana:** Todo commit pasa revisión humana y respeta [Conventional Commits](./conventional-commits.md), sin incluir etiquetas de coautoría automatizada.
