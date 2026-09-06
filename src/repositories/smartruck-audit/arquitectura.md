# Arquitectura — smartruck-audit

## Responsabilidades

- Recolectar logs de containers SmartTruck (stdout/stderr)
- Almacenarlos en Loki
- Exponer búsqueda y usuarios vía Grafana

## Flujo

```text
[smartruck-backend]          ─┐
[smartruck-dador]             ─┼─ stdout ──> [Promtail] ──> [Loki] ──> [Grafana]
[smartruck-transportista]     ─┘
[otros containers smartruck-*]
```

Las apps **no** hablan con Grafana: solo loguean a stdout. Promtail filtra por nombre `smartruck-*` y excluye los propios containers de audit.

## Organización

```text
docker-compose.yml
config/
  loki.yml
  promtail.yml
  grafana/provisioning/datasources/loki.yml
```

## Límites

| Hace | No hace |
|------|---------|
| Centralizar y consultar logs | Lógica de negocio / UI de producto |
| Usuarios del equipo en Grafana | Reemplazar Cloud Logging en Cloud Run sin cableado extra |

## Dependencias

| Depende de | Consumido / usado por |
|------------|------------------------|
| Docker (socket) en local/VM | Todo el equipo (lectura en Grafana) |
| Apps que escriben a stdout | — |

## Cloud Run

En Docker/VM, Promtail alcanza. Para Cloud Run hace falta un paso aparte (sink, sidecar u OTLP); documentar cuando se implemente.
