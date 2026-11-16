# `smartruck-infra`

Repositorio de **Infraestructura como Código (IaC)** con **Terraform (>= 1.5)** (`v0.4.0`), responsable del provisionamiento reproducible de la infraestructura cloud y de borde de **Smartruck** en **Google Cloud Platform**, **Cloudflare** y **Datadog**.

---

## Qué gestiona

- **Cómputo y puerta de enlace en GCP (`us-central1`):** Servicio **Cloud Run** para `smartruck-backend`, **API Gateway** con especificación OpenAPI (`openapi.yaml.tpl`), **Artifact Registry** con política de retención y **Workload Identity Federation (WIF)** para despliegues sin claves desde GitHub Actions.
- **Borde en Cloudflare:** Registros DNS (`cloudflare_dns`) y reglas WAF con rate limiting (`cloudflare_waf`).
- **Observabilidad en Datadog (`us5`):** Pipeline de exportación de logs de Cloud Run vía Cloud Logging Sink -> Pub/Sub -> Dataflow (`datadog_log_forwarding`) y stream de logs de Render (`render_datadog_log_stream`), actualmente habilitados en el ambiente `test`.

---

## Scripts principales

```bash
./scripts/check     # Valida formato, configuración Terraform y pruebas de la UDF de Datadog
./scripts/release   # Ejecuta flujo controlado de liberación de cambios de infraestructura
```

---

## Más información

- [Arquitectura de `smartruck-infra`](./arquitectura.md)
- [Links de referencia](./links.md)
