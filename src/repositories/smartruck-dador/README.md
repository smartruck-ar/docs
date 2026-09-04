# smartruck-dador

Frontend del **Dador** / shipper (prefijo de trabajo `D`).

TanStack Start + Vite. Arquitectura hexagonal bajo `src/` (`domain` / `application` / `infrastructure`). Pantallas en `src/views/`.

## Quick path

```bash
nvm use 22
npm install
npm run dev
```

Variables: ver `.env.example` (`VITE_SMARTRUCK_BACKEND_API`, `VITE_USE_STUB`, etc.).

Repo: [smartruck-ar/smartruck-dador](https://github.com/smartruck-ar/smartruck-dador)

## Stack

| Área | Tecnología |
|------|------------|
| Runtime | Node 22 |
| Framework | TanStack Start + Vite |
| UI | React + Radix / shadcn-style |
| Tests | Vitest + Playwright |
| Contenedores | Docker / Dev Containers |

## Scripts útiles

| Comando | Qué hace |
|---------|----------|
| `./scripts/dev_app` | Dev con hot reload (Compose: host `5174`) |
| `./scripts/run_lint` | ESLint + Prettier + tsc + Vitest |
| `./scripts/run_all_tests` | Lint + Playwright |
| `./scripts/start_dev_containers` | Compose + shell en `app` |

## Docs de este repo

- [Arquitectura](./arquitectura.md)
- [Links](./links.md)
