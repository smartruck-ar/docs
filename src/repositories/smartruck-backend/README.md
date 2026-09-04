# smartruck-backend

Backend del sistema Smartruck: publicación, cotización, gestión y desbloqueo de ofertas de carga, con pagos integrados.

## Quick path

```bash
# ver guía completa en el repo
# Dev Containers / docker-compose disponibles
```

Repo: [smartruck-ar/smartruck-backend](https://github.com/smartruck-ar/smartruck-backend)

## Stack

| Área | Tecnología |
|------|------------|
| Lenguaje | Python 3.12 |
| Framework | FastAPI |
| Arquitectura | Hexagonal + Clean + DDD táctico |
| Persistencia | PostgreSQL 16, SQLModel, Alembic |
| Hosting DB | Supabase |
| Compute | Google Cloud Run + API Gateway |
| Contenedores | Docker / Dev Containers |

## Ambientes

| Ambiente | Rama | Notas |
|----------|------|-------|
| Local / CI | `main` | Pipeline en GitHub Actions |
| Test | `test` | Gateway GCP test |
| Prod | `prod` | Gateway GCP prod |

## Docs de este repo

- [Arquitectura](./arquitectura.md)
- [Links](./links.md)

## Checklist

- [ ] Comandos locales de run/test copiados del README del repo si cambian
- [ ] Links de ambientes actualizados
