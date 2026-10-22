# Convención de logging (arquitectura hexagonal)

Dónde y qué loguear en los servicios SmartTruck (backend y fronts con capas hexagonales).

Los logs se emiten con **LogManager** (`application/logger/`): JSON a **stdout**. La recolección (Datadog, Loki, etc.) es responsabilidad de la infraestructura, no de un provider en la app. Convención de carpetas: [Arquitectura backend](../../repositories/smartruck-backend/arquitectura.md).

En **smartruck-backend**, los controllers/repos de infrastructure **inyectan** `LogManager` (desde `application.logger`). Cada controller y cada repositorio lo recibe por `Depends` (por ejemplo `trucks_controller.py` y `PostgreSQLTruckRepository`); este módulo solo provee el mecanismo.

### API (sin secretos)

```python
LogManager(service="smartruck-backend", env="test").info("…")
LogManager(service="smartruck-backend", env="test").error("…")
```

Niveles disponibles: **`fatal`**, **`error`**, **`warn`**, **`info`**, **`debug`**, **`trace`**.

| Nivel | Uso |
|-------|-----|
| `info` | Qué se está haciendo en bordes (entrada/salida, datos salientes seguros) |
| `error` / `warn` / `fatal` | Fallos y advertencias (p. ej. GlobalExceptionHandler) |
| `debug` / `trace` | Solo para depurar; no para flujo de negocio habitual |

Solo `message: str`. **No** hay parámetros `password`, `token` ni similares: no loguear secretos en el mensaje.

### Correlation ID

- Header: `X-Correlation-Id`
- Middleware: reutiliza el header o genera un UUID; lo refleja en la response.
- `LogManager` lo incluye en el JSON cuando está disponible (`correlation_id`).

## Dónde loguear

Solo en los **bordes** del hexágono: **entradas** y **salidas**.

| Lugar | Rol en el hexágono | Qué loguea |
|-------|--------------------|------------|
| **Controladores** (adapters de entrada / HTTP) | Entrada | `info` de lo que se está haciendo (request / caso, sin secretos) |
| **Repositorios** (adapters de salida / persistencia u otros gateways) | Salida | `info` de operaciones hacia afuera |
| **GlobalExceptionHandler** | Borde HTTP | `error`/`warning` de excepciones burbujeadas + response HTTP |

```text
[HTTP] → Controlador ──info────────────┐
              │                        │
              ▼                        ├──> stdout → Datadog / audit
         Caso de uso                   │
              │                        │
              ▼                        │
         Repositorio ──info────────────┤
              │                        │
              └── excepciones ──► GlobalExceptionHandler ──error─┘
```

## Errores y excepciones

- Las excepciones **burbujean** hasta un **GlobalExceptionHandler** (capa HTTP / inbound).
- El handler centraliza: log `error`/`warning`, mapeo a response HTTP. Los controllers **no** atrapan para relanzar.
- Controllers: solo `info` de entrada (y datos seguros). Repos: `info` de salida; propagan errores hacia arriba.
- No duplicar el log de error en repo **y** controller **y** handler.

## Info / “qué se está haciendo”

- **Controlador:** entrada al caso (ej. “crear viaje”, IDs relevantes, sin secretos).
- **Repositorio:** operación de salida (ej. “persistir load”, “buscar oferente por email”).
- Preferir mensajes estructurados (JSON) con `service`, `env`, `level`, y contexto útil (`request_id` si existe).

## Qué no loguear ahí

| Evitar | Motivo |
|--------|--------|
| Loguear en cada línea del caso de uso / dominio | Ruido; el dominio queda limpio |
| Loguear el mismo error en repo **y** controller **y** handler | Duplicado; el error se loguea una sola vez en el GlobalExceptionHandler |
| Passwords, tokens, PII innecesaria | Seguridad |

## Excepción: decisiones de negocio que el spec pide registrar

Un caso de uso puede emitir un `warn` cuando el spec pide dejar registro de una decisión de negocio para poder investigarla después. Por ejemplo, el caso de uso de recomendaciones deja una línea por cada carga que descarta, con su id y el motivo. El caso de uso recibe `LogManager` por constructor, y el motivo lo describe el dominio (`DiscardedLoad`). Es un `warn` por decisión, no un log por línea: no es ruido.

## Checklist

- [ ] `info` en controlador (entrada) y repositorio (salida)
- [ ] Errores/excepciones logueados en el **GlobalExceptionHandler** (no catch/rethrow en controllers)
- [ ] Sin logs de negocio ruidosos en application/domain (salvo las decisiones que el spec pide registrar)
- [ ] Salida a stdout (JSON vía LogManager)
- [ ] Sin passwords/tokens en la API ni en el contenido del mensaje

## Next step

### Recolección local con Datadog (Student Pack)

La app **no** envía a Datadog: solo escribe JSON a stdout. En local, el Agent lee el stdout del container `app`.

1. En `.env` (no commitear): `DD_API_KEY=<tu-api-key>`, opcional `DD_SITE=us5.datadoghq.com`, y `DD_MIRROR_LOGS_TO_DOCKER=true`.
2. Recrear `app` (para inyectar el flag) y levantar el Agent: `docker compose up -d --force-recreate app && docker compose --profile datadog up -d datadog-agent`.
3. Dentro del container, `./scripts/run_app` (espeja stdout al log del container para que el Agent lo lea; JetBrains/exec no alcanza solo).
4. Generar tráfico (p. ej. `POST /transporters` con header `X-Correlation-Id`).
5. En [Log Explorer](https://us5.datadoghq.com/logs): filtro `service:smartruck-backend` y el `correlation_id`.

El servicio `app` declara labels `com.datadoghq.ad.logs` / tags `service`+`env`.

### Recolección en Cloud Run (test/prod) — `smartruck-infra`

La app **no** usa Infisical para Datadog. En GCP, Cloud Run ya manda stdout a Cloud Logging; la infra reenvía esos logs a Datadog:

`Cloud Run → Logging sink → Pub/Sub → Dataflow (Cloud_PubSub_to_Datadog) → us5`

En `smartruck-infra` (entorno **test** primero):

1. Agregar el secret de GitHub `DATADOG_API_KEY` en el repo `smartruck-infra` (**Repository secret**). No poner la key en `terraform.tfvars` (pisa `TF_VAR_*`).
2. Tag/release para que el pipeline haga `terraform apply` en test (`TF_VAR_datadog_api_key`).
3. Generar tráfico en la API de test y verificar en [Log Explorer](https://us5.datadoghq.com/logs).

Módulo: `modules/datadog_log_forwarding`. Prod: mismo módulo cuando test esté validado. Si `DATADOG_API_KEY` está vacío, el módulo no se crea.

### Recolección en Render (dador / transportista) — `smartruck-infra`

Las apps solo escriben JSON a stdout. Render reenvía el default log stream del workspace a Datadog (IaC; no configurar en la UI):

`Web Service → Render Log Stream → us5 (/api/v2/logs)`

1. Repository secrets en `smartruck-infra`: `RENDER_API_KEY`, `RENDER_OWNER_ID` (`usr-…`/`tea-…`), además de `DATADOG_API_KEY`.
2. Tag/release → `apply_test` crea `modules/render_datadog_log_stream` (`render_log_stream`).
3. Generar tráfico en dador/transportista y filtrar en Datadog por `ddsource:render` (o el `service` que Render asigne).

Si falta algún secret, el módulo no se crea. Preview instances: `drop` por defecto.

Alternativa local: [smartruck-audit](../../repositories/smartruck-audit/README.md) (Loki/Grafana) · [Arquitectura backend](../../repositories/smartruck-backend/arquitectura.md)
