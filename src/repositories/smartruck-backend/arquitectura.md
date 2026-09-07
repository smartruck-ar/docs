# Arquitectura — smartruck-backend

## Responsabilidades

- API REST del dominio Smartruck (cargas, oferentes, pagos, etc.)
- Reglas de negocio en capa de dominio (sin acoplar frameworks)
- Persistencia PostgreSQL e integraciones externas (p. ej. MercadoPago)

## Organización del código

```text
src/
  domain/              # modelos, puertos de dominio, excepciones
  application/         # casos de uso, DTOs, LogManager (JSON → stdout)
  infrastructure/
    api.py             # fábrica FastAPI / lifespan
    inbound/           # adaptadores de entrada
      http_controllers/
      dto/             # schemas HTTP (Pydantic)
      mappers/         # HTTP ↔ application
    outbound/          # adaptadores de salida
      persistence/     # PostgreSQL / SQLModel
      gateways/        # integraciones externas (p. ej. MercadoPago)
```

| Carpeta | Rol |
|---------|-----|
| `inbound/` | Todo lo que **entra** al hexágono (HTTP) |
| `outbound/` | Todo lo que **sale** del hexágono (DB, APIs) |
| `application/logger/` | `LogManager`: arma el log y escribe a **stdout** |

## Límites

| Hace | No hace |
|------|---------|
| Lógica de negocio y API | UI Dador / Transportista |

## Dependencias

| Depende de | Consumido por |
|------------|---------------|
| PostgreSQL / Supabase, pasarelas de pago | smartruck-dador, smartruck-transportista |

## Diagrama

```text
[dador] ──┐
           ├──> [smartruck-backend] ──> [PostgreSQL / externos]
[transp.] ─┘
```

## Logging

Convención del equipo (entradas/salidas del hexágono): [Logging](../../wiki/proceso/logging.md).

- **Controladores** (`inbound/`): `info` + log de excepciones/errores (burbujean hasta acá).
- **Repositorios** (`outbound/persistence/`): `info` de operaciones de salida.
- Emisión: `LogManager` (`application/logger`) → **stdout** (JSON: `level`, `message`, `service`, `env`).
- Recolección afuera (p. ej. Datadog Agent / Cloud Run). Cablear controllers/repos: tasks posteriores.
- API: solo `info`/`error(message)` — sin campos de secretos.

## Acceptance / Gherkin

Features en `test/acceptance/features/`. Convención del equipo: [Gherkin](../../wiki/proceso/gherkin.md).
