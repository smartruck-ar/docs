# 0001 · El geo-service es dueño de toda la geografía de la plataforma

- **Estado:** aceptado (2026-10-15)
- **Reemplaza:** `plan-centralizacion-routes.md` §4.3 ("alternativa descartada: un geo-service completo")

## Contexto

`microservice-routes` solo calculaba rutas. El backend tenía el catálogo de localidades, la geocodificación (Mapbox y Nominatim) y una copia del motor de rutas, y los frontends calculaban estimaciones por su cuenta. Eso producía dos dueños del mismo dato y distancias que podían diferir.

## Decisión

`microservice-routes` pasa a ser el **geo-service** (servicio geográfico). Es el único dueño de: provincias, localidades, búsqueda de localidades y direcciones, geocodificación inversa, rutas entre localidades y estimación.

- Los demás sistemas piden, nunca calculan ni copian. El backend consume el geo-service con una credencial interna; los frontends, con la sesión del usuario.
- Los endpoints se exponen en inglés bajo `/geo/*` (`/geo/localities`, `/geo/routes`, `/geo/routes/batch`). `/routes*`, la consulta de rutas por nombre de ciudad y los endpoints en español del backend se retiran cuando dejan de usarse.
- Las cargas y los centros de carga guardan solo el id de su localidad, sin nombre ni distancia: son referencias, no copias. El backend valida el id contra una tabla local de ids válidos. Los frontends piden al geo-service, por id, el nombre, la provincia, la distancia y el trazado. El pin exacto y la dirección que el usuario confirmó los guarda el backend.
- Los ids de localidad no se reasignan ni se borran.
- El geo-service no llama a otros servicios del producto.

## Consecuencias

- Una sola fuente para distancia, duración, geometría y estimación.
- Disponibilidad: si el geo-service cae, el backend devuelve error al cotizar y los frontends degradan con un catálogo en caché; ninguno calcula distancias (ver ADR 0002 para los datos).
- El nombre del repositorio no se renombra por ahora.
