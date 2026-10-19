# 0003 · La resiliencia del geo-service vive en el servicio y no en los frontends

- **Estado:** aceptado (2026-10-19)
- **Reemplaza:** la parte "catálogo embebido en el build" de la sección Resiliencia y del comportamiento 23 de `specs/centralizacion-geografia/spec.md`

## Contexto

El spec original resolvía una caída del geo-service haciendo que cada frontend embebiera el catálogo de 150 localidades y cachee rutas en el navegador. Eso copia datos del servicio en cada consumidor (justo lo que la centralización quiere evitar), obliga a regenerar el catálogo en cada build con credenciales, puede quedar desactualizado y reparte lógica de contingencia entre repos. En un sistema distribuido la disponibilidad de una dependencia se garantiza en esa dependencia.

Del lado del servicio, lo que puede fallar es la base (Supabase), la verificación de sesión (JWKS de Supabase Auth) y, solo para rutas no guardadas, el proveedor de rutas. El Worker en sí corre en la red de Cloudflare, no en una región.

## Decisión

1. **Los frontends no embeben el catálogo ni calculan nada.** Piden todo al geo-service. Si el servicio no puede responder, muestran el error o "distancia no disponible" y el mapa sin trazado.
2. **El servicio sigue respondiendo con lo último que supo** cuando falla su base: el catálogo y las rutas guardadas se sirven desde una copia en el borde (*stale-if-error*). Los datos de los que se responde son propios, así que no entra en conflicto con la regla de no guardar respuestas de Mapbox.
3. **La verificación de sesión no depende de que Supabase Auth responda en cada pedido:** las claves públicas (JWKS) se guardan con una vigencia larga.
4. **Las rutas precargadas cubren todas las combinaciones** (#169), para que el proveedor externo sea solo un respaldo.
5. **La disponibilidad se mide** con el monitor de `/geo/health` (#181). Si hay caídas repetidas o se incumple el objetivo de disponibilidad, se reevalúa separar el servicio de Cloudflare Workers.

## Consecuencias

- Los frontends quedan sin lógica geográfica ni de contingencia, y el catálogo tiene una sola copia.
- La garantía depende de cómo se implemente la copia en el borde. La Cache API de Workers es por centro de datos y no se replica; KV es global pero eventualmente consistente. La elección se resuelve en la historia #171, con un escenario que lo demuestre.
- Una caída total de Cloudflare sigue sin cubrirse. Es un riesgo aceptado hasta que el monitor indique lo contrario.
- Una localidad o ruta que nunca se consultó mientras la base estaba caída no tiene copia y se informa como no disponible.
