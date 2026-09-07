# Convención de logging (arquitectura hexagonal)

Dónde y qué loguear en los servicios SmartTruck (backend y fronts con capas hexagonales).

Los logs se emiten con **LogManager** (`application/logger/`): JSON a **stdout**. La recolección (Datadog, Loki, etc.) es responsabilidad de la infraestructura, no de un provider en la app. Convención de carpetas: [Arquitectura backend](../../repositories/smartruck-backend/arquitectura.md).

En **smartruck-backend**, los controllers/repos de infrastructure **inyectan** `LogManager` (desde `application.logger`). El cableado de cada borde es por task; este módulo solo provee el mecanismo.

### API (sin secretos)

```python
LogManager(service="smartruck-backend", env="test").info("…")
LogManager(service="smartruck-backend", env="test").error("…")
```

Solo `message: str`. **No** hay parámetros `password`, `token` ni similares: no loguear secretos en el mensaje.

## Dónde loguear

Solo en los **bordes** del hexágono: **entradas** y **salidas**.

| Lugar | Rol en el hexágono | Qué loguea |
|-------|--------------------|------------|
| **Controladores** (adapters de entrada / HTTP) | Entrada | `info` de lo que se está haciendo (request / caso) y **todas** las excepciones/errores |
| **Repositorios** (adapters de salida / persistencia u otros gateways) | Salida | `info` de lo que se está haciendo hacia afuera (query, save, call externo) |

```text
[HTTP] → Controlador ──info + errores──┐
              │                        │
              ▼                        ├──> stdout → audit
         Caso de uso                   │
         (dominio / application)       │
              │                        │
              ▼                        │
         Repositorio ──info────────────┘
```

## Errores y excepciones

- Las excepciones **burbujean** hacia el **controlador**.
- El **controlador** es quien **loguea** excepciones/errores (nivel `error` / `warning` según corresponda).
- Los repositorios (y el dominio) **lanzan** o propagan; no tragan el error en silencio ni duplican el log de error si ya va a subir.

## Info / “qué se está haciendo”

- **Controlador:** entrada al caso (ej. “crear viaje”, IDs relevantes, sin secretos).
- **Repositorio:** operación de salida (ej. “persistir load”, “buscar oferente por email”).
- Preferir mensajes estructurados (JSON) con `service`, `env`, `level`, y contexto útil (`request_id` si existe).

## Qué no loguear ahí

| Evitar | Motivo |
|--------|--------|
| Loguear en cada línea del caso de uso / dominio | Ruido; el dominio queda limpio |
| Loguear el mismo error en repo **y** controlador | Duplicado; el error se loguea al burbujear en el controlador |
| Passwords, tokens, PII innecesaria | Seguridad |

## Checklist

- [ ] `info` en controlador (entrada) y repositorio (salida)
- [ ] Errores/excepciones logueados en el controlador tras burbujear
- [ ] Sin logs de negocio ruidosos en application/domain
- [ ] Salida a stdout (JSON vía LogManager)
- [ ] Sin passwords/tokens en la API ni en el contenido del mensaje

## Next step

Recolección: Datadog (Student Pack / Agent) o [smartruck-audit](../../repositories/smartruck-audit/README.md) · [Arquitectura backend](../../repositories/smartruck-backend/arquitectura.md)
