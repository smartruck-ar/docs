# Logging y observabilidad

El estándar de logging de **Smartruck** prioriza trazas estructuradas en JSON enviadas a `stdout` para que la infraestructura gestionada recolecte los eventos sin acoplar el código de dominio a un proveedor particular.

---

## Implementación en `smartruck-backend`

### `LogManager` (`src/application/logger/log_manager.py`)

El backend define una única abstracción liviana inyectada en casos de uso y controladores:

- **Salida:** `sys.stdout` en formato JSON de una línea por evento.
- **Campos emitidos:**
  - `level`: `fatal`, `error`, `warn`, `info`, `debug`, `trace`.
  - `message`: texto descriptivo del evento (`str`).
  - `service`: identificador del servicio (por ejemplo, `smartruck-backend`).
  - `env`: entorno activo (`development`, `test`, `production`).
  - `correlation_id` *(opcional)*: identificador de correlación de la petición cuando está disponible.
- **Regla de seguridad:** la firma pública recibe únicamente `message: str` (nunca diccionarios libres ni credenciales), reduciendo la probabilidad de filtrar tokens, CUITs completos o claves en los logs.

### Manejo de excepciones

No existe una clase monolítica `GlobalExceptionHandler`: las excepciones de dominio (`src/domain/exceptions.py`) se traducen en la capa de entrada HTTP a respuestas tipadas (`src/infrastructure/inbound/dto/error_response.py`), y la aplicación FastAPI registra manejadores dedicados donde corresponde, como `@app.exception_handler(GeoCatalogUnavailableError)` en `src/infrastructure/api.py` cuando el servicio geográfico no está disponible.

---

## Recolección y envío hacia Datadog

El monitoreo centralizado en **Datadog** (`us5`) se encuentra implementado de forma declarativa en `smartruck-infra` para el ambiente **`test`**:

- **GCP Cloud Run -> Datadog (`modules/datadog_log_forwarding`):** Cloud Logging exporta entradas de Cloud Run vía Sink hacia **Pub/Sub**, y un job de **Dataflow** ejecuta la UDF `format_for_datadog.js` antes de enviarlas a Datadog.
- **Portales en Render -> Datadog (`modules/render_datadog_log_stream`):** configura el stream de logs del workspace de Render hacia Datadog en `test`.
- **Pendiente de producción:** ambos módulos están conectados en `environments/test/main.tf`; su habilitación en `environments/prod/main.tf` permanece registrada como pendiente técnico en [Riesgos](../../riesgos.md).

---

## Inspección local

Para pruebas locales con agregación visual, el repositorio histórico [`smartruck-audit`](../../repositories/smartruck-audit/README.md) conserva una pila opcional basada en **Loki + Promtail + Grafana** ejecutada con Docker Compose.
