# Decisión: proveedor de direcciones y qué guarda el backend

> Estado: **decidida (2026-10-21)**, ver la sección «Decisión» más abajo. Propuesta original del 2026-10-17. Spike S.5 #166. Relacionada con `decision-proveedor-rutas.md` y con `research/fuentes-datos-geograficos.md` (términos y precios; no se repiten acá).

## Decisión (2026-10-21)

Se separan dos responsabilidades que no se mezclan:

| Pregunta | Quién responde | Cómo |
| --- | --- | --- |
| Dada una coordenada, ¿en qué **localidad** está (y, al revés, dónde queda una localidad)? | **El servicio de rutas (geo-service)** | `GET /geo/localities/nearest?lat=&lng=` (devuelve la localidad del catálogo o `out_of_coverage`) y `GET /geo/localities/{id}` (trae las coordenadas) |
| Buscar una **dirección exacta** y, dado un pin, ¿qué **dirección exacta** es? | **El backend**, con un proveedor externo | `/localizaciones/direcciones` y `/localizaciones/reversa` (búsqueda y pin del dador) y `loads/{id}/…/reverse-geocode` (dirección exacta después del desbloqueo). **No pasan por el servicio de rutas ni por los frontends** |

Consecuencias:

- **Georef no se usa para direcciones.** El servicio de rutas no recibe búsquedas de direcciones, así no suma carga ni dependencia de un proveedor. Georef sigue solo como fuente offline de provincias y localidades. Verificado el 2026-10-21: su consulta por coordenadas (`/ubicacion`) devuelve provincia, departamento y municipio, no calle, así que tampoco sirve para la dirección de un pin.
- **El proveedor de direcciones exactas es el que ya tiene el backend:** `FallbackGeocoder` con **Mapbox** como principal y **Nominatim** como respaldo; la dirección exacta de un pin ya publicado usa solo Mapbox. Los frontends no llaman a proveedores de direcciones.
- **El frontend** consulta cada cosa a su dueño: la localidad al servicio de rutas y la dirección al backend. Lo único que decide es qué mostrar.
- Las historias #172 y #175 (direcciones en el servicio de rutas) **dejan de aplicar en su forma original**.

Riesgos que quedan abiertos (no se resuelven con esta decisión):

- Mapbox en modo **temporal** no permite guardar los resultados y el backend guarda el texto de la dirección. Para cumplirlo hace falta el modo permanente (`permanent=true`, con tarjeta cargada y unos USD 5 por 1.000 consultas) o cambiar de proveedor.
- **Nominatim público** prohíbe el autocompletado y las aplicaciones de seguimiento de vehículos.
- En el ambiente de test las búsquedas parecen resolverse con el respaldo (formato de Nominatim): conviene revisar el token de Mapbox.
- Las direcciones sugeridas no se limitan a la localidad elegida (se arma un texto libre con la localidad como contexto): puede traer calles de ciudades vecinas.

## Qué se decide

1. Qué proveedor resuelve direcciones (buscar y confirmar "calle y número, localidad").
2. Qué puede guardar el backend de lo que el usuario confirma.

## Medición propia: Georef `/direcciones` (2026-10-17)

Se probaron 20 direcciones reales (Rosario, Córdoba, Buenos Aires, La Plata), sin clave.

| Resultado | Cantidad |
| --- | --- |
| Encontradas, con coordenadas a menos de 20 km del centro de la ciudad | 19 de 20 |
| Sin resultado ("Ruta 9 km 300") | 1 |

Hallazgos sobre el autocompletado:

- Con un **nombre de calle parcial** ("Corrie", "corrientes") devuelve calles candidatas: sirve para sugerir mientras se escribe.
- Con **número incompleto** ("Corrientes 12") devuelve 0 resultados: no sugiere por prefijo de número.
- Las direcciones tipo ruta con kilómetro no están cubiertas.

No se midieron Geoapify, LocationIQ ni HERE: **no verificado**. Lo que se sabe de ellos son sus términos publicados, en `research/fuentes-datos-geograficos.md`, sección 4.

## Propuesta

**Proveedor por defecto: Georef.** Es gratis, no necesita clave ni variable de entorno, sus datos son CC BY 4.0 (se pueden guardar con atribución) y el geo-service ya lo usa para localidades. Los límites observados (6.000/min, 3 M/día) están muy por encima del uso esperado, pero **no son un compromiso documentado** y no hay SLA.

**Cuándo cambiar a Geoapify:** solo si se necesita sugerir mientras se escribe el número de la calle, o si las rutas con kilómetro importan. Exige que el equipo cree una clave (variable de entorno) y mostrar atribución a OpenStreetMap y Geoapify en el plan gratis. Sus términos de almacenamiento para forward geocoding no se pudieron leer literalmente.

**Descartados:** Mapbox temporal (los resultados no se pueden guardar), Mapbox permanente (~USD 150 por 30.000 consultas/mes), Google (restringe almacenar), Nominatim público (prohíbe autocompletar y apps de seguimiento de vehículos).

## Qué guarda el backend

Guarda **solo lo que el usuario confirmó**, no la respuesta del proveedor:

- el **id de la localidad** (ya definido, #165);
- el **pin** (latitud y longitud) que el usuario marcó o aceptó;
- el **texto de la dirección** que el usuario confirmó (calle y número), tal cual lo escribió o eligió.

No se guarda la respuesta cruda del proveedor ni se arma una base de direcciones, así que la licencia del proveedor no condiciona el almacenamiento: el texto y el pin son dato del usuario. Si se usa Georef, mostrar "Fuente: Georef, Argentina (CC BY 4.0)" donde se sugieran direcciones. El texto exacto de atribución **no está especificado** por Georef.

## Decisiones que quedan para el equipo

- Confirmar Georef y aceptar que no hay SLA (mensaje de error razonable si no responde; el usuario puede marcar el pin a mano).
- Aceptar que no se sugiere por número, o asumir la complejidad de Geoapify.
- Qué hacer con direcciones de ruta con kilómetro (hoy: el usuario marca el pin).

## Cuándo revisar

Si Georef falla seguido en producción, si los transportistas piden sugerencias por número, o si el volumen se acerca a los límites observados.
