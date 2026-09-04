# smartruck-transportista

Frontend del **Transportista** (prefijo de trabajo `T`).

Vite + Nitro; scripts alineados con dador (`run_lint`, `dev_app`, Dev Containers, releases `test`/`prod`).

## Quick path

```bash
nvm use 22   # o Bun
npm install
npm run dev
```

Dev por defecto en puerto `5173` (dador usa `5174` en Compose).

Repo: [smartruck-ar/smartruck-transportista](https://github.com/smartruck-ar/smartruck-transportista)

## Stack

| Área | Tecnología |
|------|------------|
| Runtime | Node 20+ / Bun |
| Framework | Vite (+ Nitro para serve) |
| Tests | Vitest + Playwright |
| Secrets CI | Infisical (`VITE_*` en build) |
| Deploy | Render (hook post-`package`) |

## Scripts útiles

| Comando | Qué hace |
|---------|----------|
| `./scripts/dev_app` | Dev hot reload |
| `./scripts/run_lint` | Lint + types + Vitest |
| `./scripts/run_all_tests` | Lint + Playwright |
| `./scripts/start_dev_containers` | Compose + shell |

## Docs de este repo

- [Arquitectura](./arquitectura.md)
- [Links](./links.md)
