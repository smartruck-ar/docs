# Arquitectura — smartruck-backend

## Responsabilidades

- API REST del dominio Smartruck (cargas, oferentes, pagos, etc.)
- Reglas de negocio en capa de dominio (sin acoplar frameworks)
- Persistencia PostgreSQL e integraciones externas (p. ej. MercadoPago)

## Organización del código

```text
src/
  domain/           # modelos, puertos, excepciones
  application/      # casos de uso, DTOs
  infrastructure/   # FastAPI, HTTP, persistence, gateways
```

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

Fuente detallada: README del repositorio.
