# Decisión: proveedor de direcciones y qué guarda el backend

> Estado: **propuesta (2026-10-17)**, para que la confirme el equipo. Spike S.5 #166. Relacionada con `decision-proveedor-rutas.md` y con `research/fuentes-datos-geograficos.md` (términos y precios; no se repiten acá).

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
