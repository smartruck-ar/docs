# Fuentes de datos geográficos para el geo-service

> Estado: **investigación**, no es una decisión. Consultado el **2026-10-15**. Amplía `docs/decision-proveedor-rutas.md` (que ya analiza Mapbox Directions y OSRM/Valhalla/ORS/GraphHopper para rutas) sin repetirlo: acá se verifica lo que ese documento dejó sin confirmar y se suman provincias/localidades, direcciones y geocodificación inversa.

Convenciones: cada afirmación lleva su fuente (URL); todas fueron consultadas el 2026-10-15 salvo indicación. "**No verificado**" = no se pudo confirmar en la fuente primaria (ver la sección final). Las observaciones hechas llamando a la API o bajando archivos están marcadas como "observado".

## 1. Georef (datos.gob.ar)

### 1.1 Licencia y términos

- Los datos del Servicio de Normalización de Datos Geográficos se publican bajo **Creative Commons Attribution 4.0** y "pueden ser usados para cualquier fin, incluyendo fines comerciales". Fuente: <https://datosgobar.github.io/georef-ar-api/terms/>.
- Por ser CC BY 4.0 se puede almacenar y redistribuir con atribución. Esa página no dice nada explícito sobre "almacenar", pero la licencia lo permite; la atribución concreta (texto exacto) **no está especificada** en esa página.
- El código de la API es MIT (observado en la API de GitHub: <https://api.github.com/repos/datosgobar/georef-ar-api>). Es distinto de la licencia de los datos.
- Condiciones técnicas: la página de términos dice que la API está "en estado alpha" y que "las cuotas de uso abierto sin autenticación no están definidas". Mismo URL de términos. Esa página parece desactualizada (ver 1.4).

### 1.2 Endpoints

Fuente de la lista: <https://datosgobar.github.io/georef-ar-api/download/> (variantes de descarga) y <https://datosgobar.github.io/georef-ar-api/addresses/>. Todos los endpoints respondieron HTTP 200 al probarlos (observado, 2026-10-15, base `https://apis.datos.gob.ar/georef/api/`).

| Recurso | Qué hace | Observado hoy |
| --- | --- | --- |
| `/provincias` | Provincias con centroide | `total: 24` |
| `/departamentos`, `/municipios` | Unidades territoriales | responde |
| `/localidades` | "Localidades" | `total: 4037` |
| `/localidades-censales` | Localidades censales | `total: 4027` |
| `/asentamientos` | Todo BAHRA, incluye parajes | `total: 14673` |
| `/ubicacion?lat=&lon=` | Geocodificación inversa: devuelve provincia, departamento y municipio que contienen el punto | responde; **no devuelve localidad** |
| `/direcciones?direccion=` | Normaliza y georreferencia calle + altura; filtra por `provincia`, `departamento`, `localidad_censal`, `localidad` | responde |

- `/ubicacion` y `/direcciones`: la geocodificación inversa de Georef resuelve a **municipio/departamento/provincia**, no a localidad censal ni a dirección (observado con `lat=-34.6&lon=-58.4`). Fuente del comportamiento: <https://datosgobar.github.io/georef-ar-api/> (describe `/ubicacion` como provincia, departamento y municipio).
- `/direcciones` devuelve `ubicacion` solo si los datos alcanzan, y "la efectividad de la georreferenciación varía de acuerdo a cada región del país". Fuente: <https://datosgobar.github.io/georef-ar-api/addresses/>. Se alimenta de las vías de circulación de INDEC (<https://datosgobar.github.io/georef-ar-api/georef-api-data/>).
- Hay consultas por lote (POST), con máximo de 1000 consultas por petición desde la versión 0.3.2. Fuentes: <https://datosgobar.github.io/georef-ar-api/bulk/> y <https://datosgobar.github.io/georef-ar-api/history/>.

### 1.3 Localidades vs. localidades censales vs. asentamientos

Definición oficial: <https://datosgobar.github.io/georef-ar-api/localities/>.

| Entidad | Origen según la documentación | Qué es |
| --- | --- | --- |
| Localidad censal | INDEC | Unidad geoestadística de los censos: concentración de objetos físicos artificiales conectados por calles, independiente de límites jurisdiccionales |
| Localidad | BAHRA (subconjunto) | "Superficie ... caracterizada por la continuidad de áreas edificadas ... donde se concentra población". Toda localidad pertenece a una localidad censal y ambas son coincidentes |
| Asentamiento | BAHRA completa | Incluye todas las localidades **más** entidades que "en general un usuario no consideraría ser una localidad" (parajes, etc.); pueden o no pertenecer a una localidad censal |

Observado en los CSV de descarga (2026-10-15, <https://infra.datos.gob.ar/georef/>):

| Archivo | Filas | Categorías (campo `categoria`) | Fuente (campo `fuente`) |
| --- | --- | --- | --- |
| `localidades.csv` | 4028 | Localidad simple 3098, Entidad 678, Componente de localidad compuesta 252 | INDEC 4027, IGN 1 |
| `localidades_censales.csv` | 4023 | Localidad simple 3587, Componente de localidad compuesta 436 | INDEC 4023 |
| `asentamientos.csv` | 14466 | Paraje 10425, Localidad simple 3098, Entidad 678, Componente 252, Base Antártica 13 | Mapa Educativo (GPS) 5835, INDEC 4042, INDEC. ACA 3626, IGN 485+347 (varias capas), otros |

- **Discrepancia a tener en cuenta:** la documentación dice que `localidades` sale de BAHRA, pero el campo `fuente` de los CSV actuales dice INDEC. No se pudo determinar cuál refleja el proceso real (**no verificado**). Además hay una diferencia menor entre `total` de la API (4037) y filas del CSV (4028), también sin explicar.
- Para Smartruck ("ciudad que pertenece a una provincia, con coordenadas"): `localidades` ya trae `centroide_lat`, `centroide_lon`, `provincia_id/nombre`, `departamento_*` y `localidad_censal_*` (observado). Ejemplos observados: Rosario, Santa Fe, centroide -32.947, y Mar del Plata, Buenos Aires.
- Los "centroides" son del polígono o de la entidad según la fuente; la **calidad de esas coordenadas para ruteo (¿cae sobre una calle?) no está documentada** (**no verificado**).

### 1.4 Límites de uso y disponibilidad

- Observado en los encabezados HTTP de cada respuesta: `x-ratelimit-limit-minute: 6000` y `x-ratelimit-limit-day: 3000000`. No figura en la documentación consultada (los términos dicen que las cuotas "no están definidas"), así que es un dato empírico y puede cambiar.
- **Disponibilidad:** el 2026-10-15 la API respondió 200 en todas las pruebas. Un fetch aislado al portal `datos.gob.ar` devolvió 502 con `Retry-After: 60` (observado). **No hay página de estado ni SLA** en las fuentes consultadas; la afirmación del equipo de que "Georef suele fallar en vivo" no se pudo contrastar con una fuente primaria (**no verificado**).
- Mantenimiento: el repositorio de la API tuvo actividad el 2026-09-25 y no está archivado (<https://api.github.com/repos/datosgobar/georef-ar-api>).

### 1.5 Dumps descargables

- Sí. Cada recurso (excepto `/ubicacion`) tiene variantes `.csv`, `.json`, `.geojson` y `.ndjson`, por ejemplo `https://apis.datos.gob.ar/georef/api/localidades.csv`. Fuente: <https://datosgobar.github.io/georef-ar-api/download/>.
- Esas URL redirigen (302) a archivos estáticos en `https://infra.datos.gob.ar/georef/` (observado). `localidades.csv`: 687 KB, `Last-Modified: 2026-08-19`. **Se puede cargar una vez sin depender de la API en vivo.** Hay que seguir el redirect (`curl -L`).
- Esquema de los archivos de datos y fuentes del ETL (IGN para unidades territoriales, BAHRA para localidades, INDEC para vías): <https://datosgobar.github.io/georef-ar-api/georef-api-data/>. El ETL es público (repositorio `georef-ar-etl`, mencionado ahí).
- Frecuencia de actualización de los datos: no documentada (**no verificado**); el único indicio es el `Last-Modified` observado.

## 2. Alternativas abiertas para provincias y localidades

| Fuente | Licencia | Formato | Cobertura / calidad | Fuente (URL) |
| --- | --- | --- | --- | --- |
| **IGN** (capas SIG) | **No verificado** para las capas de vectores. Lo único legible fue la licencia de las plantillas de mapa: exige citar "FUENTE: Instituto Geográfico Nacional de la República Argentina", no alterar la información y permite uso comercial solo como insumo de obras derivadas | Shapefile, KML, GeoJSON, CSV; WGS 84 / POSGAR 07 | Capas de asentamientos, límites, transporte, etc. | <https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/CapasSIG> y <https://www.ign.gob.ar/archivos/sig250/Instrucciones-y-licencia-de-uso_Continental_QGIS.pdf> |
| **INDEC** | El sitio dice que todo su material "posee la licencia Creative Commons (CC), salvo contenidos específicamente indicados"; **no indica la variante** (BY, BY-SA...). Remite a la "Política de difusión" | Geoservicios, tablas | Origen oficial de las localidades censales y de las vías de Georef | <https://www.indec.gob.ar/indec/web/Institucional-Indec-TerminosYCondiciones> |
| **OpenStreetMap / Geofabrik** | **ODbL**: atribución ("© OpenStreetMap contributors") y share-alike si se publica una base derivada | `argentina-latest.osm.pbf` (412 MB, datos hasta 2026-10-14), shapefiles y otros | Cobertura de lugares (`place=city/town/village`) por colaboración; calidad variable (**no verificada**) | <https://www.openstreetmap.org/copyright>, <https://download.geofabrik.de/south-america/argentina.html>, <https://wiki.openstreetmap.org/wiki/License/Use_Cases> |
| **GeoNames** | **CC BY 4.0** (atribución) | `AR.zip` (1,9 MB, modificado 2026-10-15) en `download.geonames.org/export/dump/` | Gazetteer mundial colaborativo; calidad de coordenadas y completitud para Argentina **no verificadas** | <https://www.geonames.org/export/>, <https://download.geonames.org/export/dump/readme.txt> |
| **Natural Earth** | **Dominio público**, sin atribución obligatoria | Shapefile/GeoJSON | Escala pequeña (mundial); sirve para límites generales, **no para 150+ localidades argentinas con precisión** (la escala es una inferencia mía, no de la fuente) | <https://www.naturalearthdata.com/about/terms-of-use/> |

Lectura para el caso de Smartruck: Georef (CC BY 4.0, declarada) es la única fuente oficial argentina con licencia explícita y entidad "localidad con provincia y coordenadas" lista para cargar. GeoNames y OSM son alternativas de contraste.

## 3. Mapbox

### 3.1 Geocoding: temporary vs. permanent

- Por defecto es **temporal**: "Temporary results are not allowed to be cached, while Permanent results are allowed to be cached and stored indefinitely". Para permanente hay que pasar `permanent=true` y tener "a valid credit card on file or an active enterprise contract". Fuente: <https://docs.mapbox.com/api/search/geocoding/>.
- En temporal: "You cannot store the coordinate results for future use"; los resultados son "session-based". En permanente: se pueden guardar en bases de datos y reutilizar entre sesiones. Fuente: <https://docs.mapbox.com/help/dive-deeper/understand-temporary-vs-permanent-geocoding/>.
- **Qué cuenta como "almacenar":** la documentación usa "cache" y "store" para el resultado de coordenadas (guardarlo en una base o almacenamiento local para uso futuro). No hay una definición más fina (por ejemplo, un TTL corto) en las páginas consultadas (**no verificado** si un caché en memoria de segundos cuenta).
- **Restricción adicional importante:** "You may only use responses from the Geocoding API in conjunction with a Mapbox map." Fuente: <https://docs.mapbox.com/api/search/geocoding/>. Si la UI de Smartruck no usa un mapa de Mapbox, el uso del Geocoding de Mapbox (incluso el actual) puede no cumplir; no se pudo leer la letra de los Product Terms para confirmarlo (**no verificado**).
- La precisión de que `permanent=true` es "personal o comercial propio, sin distribución ni sublicencia" figura en la página de precios: "Results from the Permanent Geocoding API are only available for your own personal or business use, and cannot be used for distribution or sublicense". Fuente: <https://www.mapbox.com/pricing>.
- Límite: 1000 solicitudes por minuto por defecto (misma fuente de la API de geocodificación).

### 3.2 Directions

- Límites: 300 solicitudes por minuto; hasta 25 waypoints; una solicitud con varios waypoints se cobra como una sola. Fuente: <https://docs.mapbox.com/api/navigation/directions/>.
- **Almacenar o cachear respuestas: no figura en la página de la API** (la sección "Directions API restrictions and limits" no dice nada). La guía de caché de Mapbox remite a esa sección por API (<https://docs.mapbox.com/help/dive-deeper/api-caching/>). Los Product Terms (<https://www.mapbox.com/legal/product-terms>) no se pudieron leer (la página carga el contenido dinámicamente). Conclusión: **no verificado**; se mantiene la cautela de `decision-proveedor-rutas.md` (no almacenar). Los Términos de Servicio generales (<https://www.mapbox.com/legal/tos>) no contienen regla específica de Directions que yo haya encontrado.

### 3.3 Precios (página de precios, <https://www.mapbox.com/pricing>)

| Producto | Gratis | Después |
| --- | --- | --- |
| Geocoding temporal | hasta 100.000 solicitudes/mes | USD 0,75 por 1.000 (100.001 a 500.000) |
| Geocoding permanente | **sin tramo gratis visible**; "contactar a ventas" | USD 5,00 por 1.000 (hasta 500.000) |
| Directions | hasta 100.000 solicitudes/mes | USD 2,00 por 1.000 (100.001 a 500.000) |

Costo para decenas de miles al mes (ej. 30.000): geocoding temporal USD 0 (no se puede guardar); geocoding permanente 30.000 x 5/1000 = **USD 150** (cálculo mío con la tarifa publicada); Directions USD 0 (dentro del tramo gratis; guardar no verificado).

## 4. Geocodificación de direcciones y reverse

| Proveedor | ¿Se pueden guardar resultados? | Precio / límite | Fuente |
| --- | --- | --- | --- |
| **Nominatim público** (nominatim.openstreetmap.org) | Para bulk "los resultados deben cachearse de su lado"; datos ODbL (atribución y share-alike) | Máximo absoluto 1 req/s; User-Agent propio; **prohibido** autocompletar, consultas sistemáticas (p. ej. reverse en grilla) y "aplicaciones cuya función principal está relacionada con la geocodificación ... incluye seguimiento de paquetes/vehículos", que "deben correr su propio servicio" | <https://operations.osmfoundation.org/policies/nominatim/> |
| **Nominatim autohosteado** | Sí (datos ODbL; el código es GPL-3.0) | Mínimo 2 GB de RAM; planeta completo 128 GB+. Tamaño necesario para solo Argentina **no verificado** | <https://nominatim.org/release-docs/latest/admin/Installation/>, <https://api.github.com/repos/osm-search/Nominatim> |
| **Photon** (komoot) | Software Apache-2.0, datos de OSM. El demo `photon.komoot.io` se puede usar "mientras el número de solicitudes se mantenga en un límite razonable", sin garantías y con posible bloqueo; **política de almacenamiento del demo no verificada** | Autohosteado: base planeta ~95 GB en disco, 64 GB RAM recomendados (para el planeta; Argentina solo **no verificado**) | <https://github.com/komoot/photon> |
| **Pelias** | Software MIT; datos abiertos. Autohosteado requiere Elasticsearch y libpostal (4 GB de disco solo para este) | Hospedado (Geocode Earth): **no verificado** | <https://github.com/pelias/documentation>, <https://api.github.com/repos/pelias/pelias> |
| **Geoapify** | La documentación de Places y Batch dice "Cache/store results with no limits"; la de Reverse Geocoding dice "You can cache and store your results every time". Condición: atribución a OpenStreetMap, y a Geoapify en el plan gratis. **Para Forward Geocoding no pude leer la frase literal** | Gratis: 3.000 créditos/día (uso comercial permitido), 5 req/s; plan de USD 59/mes: 10.000 créditos/día. 1 solicitud de geocoding = 1 crédito | <https://www.geoapify.com/pricing/>, <https://apidocs.geoapify.com/docs/geocoding/forward-geocoding/>, <https://www.geoapify.com/reverse-geocoding-api/>, <https://www.geoapify.com/terms-and-conditions/> |
| **LocationIQ** | Los *datos de respuesta* se pueden guardar para siempre; pero cachear *pares solicitud-respuesta* (para no volver a llamar) es: **48 horas en el plan gratis; mientras dure la suscripción en planes pagos**. Sin permiso escrito no se pueden recolectar pares salvo caché temporal. Atribución con enlace en el plan gratis | Gratis: 5.000 req/día, 2 req/s, 60/min (uso comercial con enlace). Planes pagos desde USD 45; la correspondencia exacta plan-límite **no verificada** | <https://locationiq.com/static/tos.html> (actualizado 2020-05-11), <https://help.locationiq.com/support/solutions/articles/36000216698-can-i-cache-the-results->, <https://locationiq.com/pricing> |
| **HERE** | **No verificado** (las páginas de precios y términos no se pudieron leer) | **No verificado** | — |
| **Google Maps Platform** | **Restringido**: la política de Geocoding dice que pre-fetching, cache o almacenamiento "is generally restricted, with the exception of place IDs"; los términos prohíben "pre-fetch, index, store" y descargas masivas de geocodes. Los resultados deben mostrarse en un mapa de Google (o con atribución) | Geocoding: 10.000 gratis/mes, luego USD 5,00 por 1.000 hasta 100.000. QPM 3.000. El crédito mensual de USD 200 terminó el 2025-02-28 | <https://developers.google.com/maps/documentation/geocoding/policies>, <https://cloud.google.com/maps-platform/terms/>, <https://developers.google.com/maps/billing-and-pricing/pricing>, <https://developers.google.com/maps/documentation/geocoding/usage-and-billing> |

Nota ODbL sobre geocodificadores basados en OSM: la guía del OSMF dice que los resultados individuales son "extractos insubstanciales" y se pueden guardar junto con otros datos sin activar share-alike, siempre que no se agreguen para armar una base que contenga una parte sustancial de OSM (por ejemplo, reverse sistemático de toda una región); atribución obligatoria. Fuente: <https://osmfoundation.org/wiki/Licence/Community_Guidelines/Geocoding_-_Guideline>. Corolario: cargar "todas las localidades" a fuerza de consultas a un geocodificador OSM sería justo el caso a evitar; para eso están Georef o el extracto de Geofabrik.

## 5. Ruteo que permite guardar resultados

Complementa `docs/decision-proveedor-rutas.md`.

| Motor | Licencia (software) | Costo / límites | Esfuerzo operativo | ¿Guardar? | Fuente |
| --- | --- | --- | --- | --- | --- |
| **OSRM demo público** | BSD-2-Clause (software) | "Uso restringido a casos razonables y **no comerciales**. No superar 1 solicitud por segundo", sin garantías | Ninguno | **No usable en producción comercial** | <https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server> |
| **OSRM autohosteado** | BSD-2-Clause | Hosting propio. La carga es "aproximadamente el tamaño de los archivos preprocesados"; las cifras oficiales son para el planeta (123 GiB de RAM, v5.26, 2021); para Argentina **no verificado** (el doc existente estima 1-2 GB, a medir) | Preprocesar el extracto (412 MB) y mantener el servicio | Sí, con atribución a OSM (ODbL) | <https://github.com/Project-OSRM/osrm-backend/wiki/Disk-and-Memory-Requirements>, <https://api.github.com/repos/Project-OSRM/osrm-backend> |
| **Valhalla** | MIT (el sitio del proyecto; la API de GitHub reporta `NOASSERTION`) | Demo de FOSSGIS con "fair-usage" y límites de tasa | Similar a OSRM; tiene costing dinámico (incluye camión) | Sí con datos OSM | <https://valhalla.github.io/valhalla/> |
| **GraphHopper (hosted)** | Software Apache-2.0 | Plan gratis: **uso comercial solo en desarrollo; producción "on inquiry"**. Standard 199 EUR/mes (15.000 créditos/día); Premium 479 EUR/mes (50.000/día) | Ninguna | Los términos dicen que los resultados "pueden ser cacheados temporalmente del lado del cliente"; redistribuir requiere plan custom. **No permite persistir** | <https://www.graphhopper.com/pricing/>, <https://www.graphhopper.com/terms/> |
| **GraphHopper (self-host)** | Apache-2.0 | Hosting propio | Similar | Sí con datos OSM | <https://api.github.com/repos/graphhopper/graphhopper> |
| **OpenRouteService (hosted)** | Software GPL-3.0 | Directions: 2.000 solicitudes/día y 40/min por defecto | Ninguna | **No verificado**: los términos no se pudieron leer | <https://giscience.github.io/openrouteservice/frequently-asked-questions>, <https://api.github.com/repos/GIScience/openrouteservice> |
| **OpenRouteService (self-host)** | GPL-3.0 | Hosting propio | Similar; hay guía de ejecución | Sí con datos OSM | idem |

Para guardar: de los hospedados, ninguno tiene permiso verificado; el camino que sí tiene licencia clara es **autohostear OSRM, Valhalla, GraphHopper u ORS sobre datos OSM** (ODbL, atribución "© OpenStreetMap contributors"; ver <https://wiki.openstreetmap.org/wiki/License/Use_Cases>).

## 6. Resumen por caso: ¿se puede guardar? y costo con decenas de miles de consultas por mes

Se toma 30.000 consultas/mes como ejemplo (cálculo mío con las tarifas publicadas; confirmar al contratar).

| Opción | ¿Guardar? | Costo ~30.000/mes |
| --- | --- | --- |
| Georef (CC BY 4.0) | Sí, con atribución | USD 0 (límites observados 6.000/min, 3 M/día) |
| GeoNames / Natural Earth / OSM-Geofabrik | Sí (CC BY / dominio público / ODbL) | USD 0 de licencia |
| Mapbox Geocoding temporal | **No** | USD 0 (bajo 100.000 gratis) |
| Mapbox Geocoding permanente | Sí | USD 150 |
| Mapbox Directions | **No verificado** | USD 0 (bajo 100.000 gratis) |
| Nominatim público | Cachear sí; uso restringido a 1 req/s y no para apps de seguimiento de vehículos/paquetes | USD 0, pero poco apto |
| Geoapify | Sí (según su documentación) | USD 0 si cabe en 3.000 créditos/día (~90.000/mes); si no, plan desde USD 59/mes |
| LocationIQ | Datos sí; caché de pares 48 h (gratis) | USD 0 hasta 5.000/día |
| Google Geocoding | **No** (salvo place IDs) | (30.000-10.000) x 5/1000 = USD 100 |
| HERE | No verificado | No verificado |
| OSRM/Valhalla/GraphHopper/ORS autohosteados | Sí | Hosting propio (no medido) |

## 7. Tabla comparativa y recomendación

| Uso | Recomendación | Por qué (con fuente arriba) | Riesgo |
| --- | --- | --- | --- |
| (a) Carga inicial de provincias y localidades | **Georef** vía los CSV/JSON de descarga completa (`provincias`, `localidades`; `localidades_censales` si hace falta), cargados una vez con un script | CC BY 4.0 declarada, uso comercial permitido, dump estático en `infra.datos.gob.ar`, ya trae provincia y centroide. Dejar registrados fuente, fecha de descarga y atribución | Ambigüedad documentación vs. campo `fuente` (BAHRA/INDEC); calidad de centroides no verificada. Contraste opcional con GeoNames (`AR.zip`, CC BY 4.0) |
| (b) Búsqueda de direcciones limitada a una localidad | **Georef `/direcciones`** filtrando por `provincia` + `localidad_censal`/`localidad`, con **Geoapify** como respaldo si hay que guardar | Georef: licencia abierta y filtro por localidad, pero cobertura de georreferenciación desigual. Geoapify: dice permitir guardar, con atribución. **No usar Mapbox temporal ni Google si se quiere guardar** | Georef puede no georreferenciar direcciones fuera de grandes ciudades; no autocompleta (**no verificado**); Nominatim público prohíbe autocompletar y apps de logística |
| (c) Geocodificación inversa | **Georef `/ubicacion`** para punto -> provincia/departamento/municipio (sin costo ni caché de terceros). Para dirección exacta: Geoapify (permite guardar) o Mapbox con `permanent=true` | `/ubicacion` no devuelve localidad ni calle (observado). Si se necesita "localidad" se puede resolver localmente con el centroide más cercano de la tabla propia (idea mía, no de la fuente) | Mapbox exige uso con mapa Mapbox y plan pago para guardar |
| (d) Ruteo de pares desconocidos | Corto plazo: **Mapbox Directions sin guardar** (como ya decide `decision-proveedor-rutas.md`). Para que la base crezca: **OSRM autohosteado** | Mapbox: 100.000 gratis/mes, pero guardar no está verificado. OSRM: misma fuente que las 10.879 rutas, BSD-2 y datos ODbL con atribución. OSRM demo: no comercial, 1 req/s | Operar OSRM (RAM de Argentina no medida). ORS y GraphHopper hospedados no tienen permiso de guardar verificado |

## 8. Qué no pude verificar

1. **Licencia de las capas SIG del IGN** (solo se leyó la de las plantillas de mapa) y de "Unidades Territoriales" en datos abiertos.
2. **Variante exacta de la licencia Creative Commons del INDEC** (el sitio dice "CC" sin variante) y el contenido de su "Política de difusión".
3. **Texto exacto de atribución exigido por Georef** (la licencia es CC BY 4.0, la fórmula concreta no está especificada en las páginas leídas).
4. **Estabilidad de Georef en producción**: no hay SLA ni página de estado; solo observé que respondía el 2026-10-15. La afirmación "suele fallar" no se contrastó con fuente primaria.
5. **Cuota oficial de Georef**: los términos dicen "no definidas"; los 6.000/min y 3 M/día son encabezados observados.
6. **Procedencia real de `localidades`** (BAHRA vs. INDEC) y la diferencia 4037 vs. 4028; **calidad de los centroides** para ruteo; frecuencia de actualización.
7. **Autocompletado en Georef** (no vi un parámetro ni mención en la documentación leída).
8. **Reglas de almacenamiento de Mapbox Directions** (el Product Terms no se pudo leer) y si el requisito "solo con mapa Mapbox" aplica al caso de Smartruck.
9. **Qué cuenta exactamente como "almacenar"** en Mapbox más allá de "cache/store results for future use".
10. **HERE**: precios, plan gratuito vigente y reglas de almacenamiento (páginas dinámicas, sin texto legible).
11. **Términos de OpenRouteService hospedado** (no legibles), **LocationIQ**: correspondencia plan-límite de los planes pagos; **Geoapify**: frase de almacenamiento para forward geocoding (se leyó en Places, Batch y Reverse); **Photon demo**: política de almacenamiento.
12. **Recursos de hardware para Argentina** de OSRM, Valhalla, Nominatim, Photon y Pelias (la documentación da cifras del planeta).
13. **Calidad de cobertura de localidades/parajes** en OSM y GeoNames para Argentina, y detalles de Natural Earth (solo se leyó la licencia).
14. **Google Geocoding**: el periodo de caché permitido para lat/lng en Geocoding (la tabla de 30 días que leí es de Address Validation; para Geocoding la política dice "generalmente restringido").
