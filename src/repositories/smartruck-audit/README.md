# smartruck-audit

Stack de auditoría / logs de SmartTruck: recolecta stdout de containers, almacena en Loki y expone consulta en Grafana.

## Quick path

```bash
cd smartruck-audit
cp .env.example .env
docker compose up -d
docker compose --profile demo up -d   # opcional
```

- Grafana: http://localhost:3001 (`admin` / `admin` por defecto)
- Query demo: `{container="smartruck-audit-log-demo"}`

Repo: [smartruck-ar/audit](https://github.com/smartruck-ar/audit)

## Stack

| Área | Tecnología |
|------|------------|
| UI | Grafana 11.5 |
| Logs | Loki 3.4 |
| Agente | Promtail 3.4 (Docker socket, filtro `smartruck-*`) |
| Local | Docker Compose |
| Destino | VM GCP (mismo compose; pendiente) |

## Ambientes

| Ambiente | Notas |
|----------|-------|
| Local | Compose en el repo |
| GCP | Próximo: Compute Engine + HTTPS |

## Docs de este repo

- [Arquitectura](./arquitectura.md)
- [Links](./links.md)

## Checklist

- [ ] Password Grafana distinta de default en entornos compartidos
- [ ] Usuarios del equipo en Grafana
- [ ] Deploy GCP documentado cuando exista
