# Decisión: proveedor de rutas para pares no precargados

> Estado: **decidida (2026-10-10)**, revisable. Decisión D4 del plan del geo-service (`plan-geo-service/design.md`), historia S.3 #137 y R.1.2 #141.

## Contexto

El servicio de rutas resuelve hoy cada consulta así:

```text
cache (caches.default) -> misma ciudad -> rutas precargadas -> estimación haversine x 1.25 -> 404
```

- No hay ningún proveedor de ruteo en vivo (ni OSRM, ni Mapbox Directions, ni otro).
- Las rutas precargadas son **10.879 pares entre 150 ciudades** (97% de los 11.175 pares posibles). Vienen de `smartruck-backend/src/infrastructure/outbound/persistence/data/seed_rutas.json` (commit `89e03c3`, 2026-09-02). El script que las generó no está en el repositorio.
- Evidencia de que se generaron con **OSRM** (comparación contra el servidor demo de OSRM, 2026-10-10):

| Ruta | Seed | OSRM demo |
|---|---|---|
| Buenos Aires -> La Plata | 57,81 km, 2731 s | 57,81 km, 2743 s |
| San Lorenzo -> Santa Fe | 146,99 km, 5598 s | 146,68 km, 5588 s |
| Mercedes -> San Nicolás | 189,78 km, 8846 s | 193,44 km, 8810 s |

  El autor del seed confirmó que se generaron con OSRM. Los datos provienen de OpenStreetMap (licencia ODbL): se pueden almacenar y reutilizar con la atribución "© OpenStreetMap contributors".

Los pares fuera de las precargadas (el 3% restante y todo origen o destino fuera de las 150 ciudades, que crecerá cuando el geo-service maneje localidades, R.1.7) hoy se resuelven con una estimación.

## Restricción de licencia: almacenar resultados

Que un proveedor exponga una API no implica permiso para almacenar sus respuestas; lo define su licencia.

| Proveedor | ¿Se puede almacenar? | Fuente |
|---|---|---|
| Mapbox Geocoding temporal (el que usa hoy el backend) | **No**: "You cannot store the coordinate results for future use" | [Temporary vs permanent geocoding](https://docs.mapbox.com/help/dive-deeper/understand-temporary-vs-permanent-geocoding/) |
| Mapbox Geocoding permanente (`permanent=true`) | **Sí**, con tarjeta registrada y mayor costo por consulta | Idem |
| Mapbox Directions | **Sin regla pública específica**; la guía general indica que almacenar o cachear respuestas está restringido y remite a Ventas | [mapbox-agent-skills PR #80](https://github.com/mapbox/mapbox-agent-skills/pull/80) |
| Motores sobre OpenStreetMap autohosteados (OSRM, Valhalla, OpenRouteService, GraphHopper) | **Sí**, con atribución (ODbL) | [OSM License/Use Cases](https://wiki.openstreetmap.org/wiki/License/Use_Cases) |
| OpenRouteService hosteado | No confirmado (términos no legibles al momento del análisis) | [Términos](https://openrouteservice.org/?p=940) |
| GraphHopper hosteado | Solo una respuesta informal en su foro ("we think so") | [Foro GraphHopper](https://discuss.graphhopper.com/t/what-is-the-data-license-for-the-directions-api/1397) |

Hallazgo lateral: el backend hoy usa geocoding **temporal** de Mapbox (`mapbox_geocoder.py`, `mapbox_reverse_geocoder.py`, sin `permanent=true`) y guarda las coordenadas en cargas y depósitos. Al mover el geocoding al geo-service (R.1.7) hay que usar `permanent=true` o un geocodificador basado en OSM.

## Alternativas evaluadas

| Alternativa | Almacenar | Costo | Operación | A favor | En contra |
|---|---|---|---|---|---|
| **A. Mapbox Directions sin almacenar** | No (ni cache persistente) | Free tier generoso | Ninguna | Simple, ruta real, cuenta ya existente | La base no crece; cada consulta repetida vuelve a llamar a Mapbox; distancias pueden diferir levemente de las precargadas (OSRM) |
| **B. OSRM autohosteado** | Sí | Hosting (estimado 1-2 GB de RAM para Argentina, a medir) | Preprocesar el extracto de Argentina (412 MB, Geofabrik) y mantener el servicio | Misma fuente que las precargadas; la base crece sola | Hay que tenerlo corriendo; no corre en un Worker |
| **C. Valhalla autohosteado** | Sí | Similar a B | Similar a B | Perfil de camión (peso, alto, ejes) | Distancias pueden diferir de las precargadas |
| **D. OpenRouteService hosteado** | No confirmado | Gratis: 2.000 rutas/día, 40/min | Ninguna | Perfil `driving-hgv` | Permiso de almacenamiento sin confirmar por escrito |
| **E. Solo estimación (estado actual)** | No aplica | 0 | Ninguna | Sin dependencias | No es una ruta real |

Notas sobre dónde hostear B o C:

| Lugar | Comentario |
|---|---|
| Cloud Run con escala a cero (mismo proyecto que el backend) | Costo casi nulo por el bajo volumen; arranque en frío cubierto por el fallback de estimación |
| VM chica aparte | Sin arranque en frío; costo fijo |
| VM de Azure del runner de CI | Desaconsejado: mezcla producción con CI |
| Heroku (GitHub Student Pack, USD 13/mes, dynos de 512 MB) | Probablemente insuficiente en memoria; el algoritmo CH de OSRM usa menos memoria que MLD, a medir |

Una sola instancia alcanza para los entornos `test` y `prod`: es un servicio de datos de referencia sin estado, y los tests de CI usan fakes.

## Decisión

**A: Mapbox Directions sin almacenar**, detrás del puerto `RoutingProvider`, con la estimación haversine como último recurso:

```text
precargadas / almacenadas -> Mapbox (no se almacena ni se cachea) -> estimación (is_estimation: true, no se almacena)
```

- Las 10.879 rutas precargadas se migran tal cual al esquema propio en R.1.1, con atribución a OpenStreetMap.
- Consecuencia en la especificación: la regla "las rutas nuevas del proveedor se persisten" pasa a ser "**se persisten solo si la licencia del proveedor lo permite**". Con Mapbox, RUT 14 especifica que una ruta del proveedor no queda guardada (historia R.1.2, roadmap #141, actualizada). Si se adopta B o C, RUT 14 vuelve a "la ruta se sirve almacenada en la siguiente consulta".

## Cuándo revisar

Pasar a B (OSRM, misma fuente que las precargadas) o C (Valhalla, perfil de camión) si ocurre alguno de estos casos:

1. El volumen de pares fuera de las precargadas se acerca al límite del free tier de Mapbox.
2. Se necesita que todas las distancias provengan del mismo motor (por ejemplo, para que la tarifa no dependa del origen de la ruta).
3. Se quiere que la base de rutas crezca con cada par nuevo.
4. Se necesita ruteo específico para camiones.

El cambio es un nuevo adapter de `RoutingProvider` y un reordenamiento de la cascada; el dominio no cambia.
