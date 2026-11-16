# Arquitectura de `smartruck-infra`

La configuración Terraform se organiza en módulos reutilizables (`modules/`) instanciados de forma aislada por ambiente en `environments/test/` y `environments/prod/`.

---

## Módulos (`modules/`)

| Módulo | Recursos provisionados | Observaciones vigentes |
| :--- | :--- | :--- |
| **`cloud_run`** | Servicio Cloud Run para `smartruck-backend` | `512 MiB`, `1 vCPU`, concurrencia `80`, `cpu_idle = true`, `startup_cpu_boost = true`; `min_instances = 0` en `test` y `1` en `prod` (`max_instances` por defecto `5` en `variables.tf`). |
| **`api_gateway`** | Gateway regional GCP (`smartruck-gw-test` / `smartruck-gw-prod`) | Plantilla `openapi.yaml.tpl` por entorno con salida hacia Cloud Run. |
| **`artifact_registry`** | Repositorio Docker con limpieza | Política automática para conservar las últimas `3` imágenes. |
| **`wif`** | Proveedor OIDC GitHub Actions -> GCP | Elimina secretos JSON estáticos de cuenta de servicio en CI/CD. |
| **`cloudflare_dns`** | Registros DNS del dominio | Administra subdominios de producto y API. |
| **`cloudflare_waf`** | Regla de rate limit en borde | Límite de `20 req / 10 s` *(pendiente alinear patrón `/routes*` hacia `/geo/*`, ver Riesgo R-26)*. |
| **`datadog_log_forwarding`** | Logging Sink + Pub/Sub + Dataflow + UDF JS | Transforma logs con `format_for_datadog.js` (testeado con `format_for_datadog.test.mjs`). Cableado en `test`, pendiente en `prod`. |
| **`render_datadog_log_stream`** | Log stream de Render hacia Datadog | Cableado en `test`, pendiente en `prod`. |

---

## Diferencias actuales entre `test` y `prod`

- `test`: escala a cero instancias (`min_instances = 0`) y tiene activos ambos módulos de envío de logs hacia Datadog (`test/main.tf`).
- `prod`: mantiene al menos `1` instancia tibia (`min_instances = 1`) para evitar arranque en frío; aún no incorpora los módulos `datadog_log_forwarding` ni `render_datadog_log_stream` en `prod/main.tf`.
