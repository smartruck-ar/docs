# Convención de logging (arquitectura hexagonal)

Dónde y qué loguear en los servicios SmartTruck (backend y fronts con capas hexagonales).

Los logs van a **stdout** y los recolecta [smartruck-audit](../../repositories/smartruck-audit/README.md) (Promtail → Loki → Grafana).

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
- [ ] Salida a stdout (compatible con audit)

## Next step

Stack de recolección: [smartruck-audit](../../repositories/smartruck-audit/README.md) · [Arquitectura audit](../../repositories/smartruck-audit/arquitectura.md)
