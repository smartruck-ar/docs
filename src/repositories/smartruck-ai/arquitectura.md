# Arquitectura y contenido de `smartruck-ai`

El repositorio organiza scripts shell, reglas declarativas y habilidades modulares separadas de los repositorios de aplicación:

---

## Estructura de carpetas

| Carpeta / Archivo | Contenido y función |
| :--- | :--- |
| **Scripts raíz** | `fetch-repos.sh`, `workspace.sh`, `install.sh`, `update.sh`, `orca-up.sh`, `versions.env`, `WORKFLOW.md` para inicializar y actualizar el workspace completo. |
| **`scripts/`** | Utilidades compartidas (`lib.sh`, `workspace-lib.sh`, `orca-agents.py`, `smartruck-push`). |
| **`workspace/`** | Contexto transversal (`AGENTS.md`, `domain.md`, `issue-tracker.md`, `spec-template.md`). |
| **`rules/`** | Reglas operativas estandarizadas (`bdd-tdd-execution.mdc`, `conventional-commits.mdc`, `ponytail.mdc`, `skills-solo-proyecto.mdc`). |
| **`skills/`** | **23 skills propias** (`actualizar-docs`, `arquitectura-hexagonal`, `bdd-aceptacion`, `bdd-tdd-execution`, `board-sprint`, `conventional-commits`, `criterios-aceptacion`, `ddd-buenas-practicas`, `documentar-smartruck`, `fastapi-controllers`, `gherkin-español`, `historia-roadmap`, `migraciones-datos`, `nueva-feature`, `orca`, `portales-frontend`, `pytest-unit`, `python-convenciones`, `release-ambientes`, `scripts-del-repo`, `seguridad-chequeos`, `smartruck-proyecto`, `verificacion-completa`). |
| **`vendor/` y `tests/`** | Submódulos/paquetes externos (`mattpocock-skills`, `ponytail`) y pruebas shell (`asset_names_test.sh`, `clone_if_missing_test.sh`, `project_registry_test.sh`). |
| **`mcp.json`** | Configuración de servidor MCP compartido (`codebase-memory-mcp`). |
