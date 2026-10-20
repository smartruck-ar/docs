# Spec: Centralización de la geografía en el geo-service

## Problema

La geografía de Smartruck está repartida. El backend tiene el catálogo de localidades, la geocodificación y una copia del motor de rutas; el servicio de rutas tiene otra implementación; y los frontends calculan estimaciones por su cuenta. El resultado: la misma distancia sale de más de un lugar y puede diferir entre cotizar y publicar, cambiar una regla obliga a tocar varios repos, y el servicio de rutas depende de tablas que no son suyas.

## Solución

Un único lugar, el **geo-service** (`microservice-routes`), responde todo lo geográfico: provincias, localidades, direcciones, geocodificación inversa, rutas y estimación. El backend y los frontends solo piden; nadie más calcula ni copia. Cotizar y publicar devuelven la misma distancia. Si el geo-service cae, el sistema degrada sin inventar números. Ver [ADR 0001](../../adr/0001-geoservice-dueno-de-la-geografia.md) y [ADR 0002](../../adr/0002-geoservice-solo-lectura-y-catalogo-cerrado.md).

## Comportamientos

**Geo-service**

1. Como dador o transportista, quiero buscar localidades por parte del nombre, sin tildes y opcionalmente dentro de una provincia, para indicar dónde se retira y se entrega una carga.
2. Como dador o transportista, quiero que una localidad fuera del catálogo se informe como no soportada, para entender por qué no puedo elegirla.
3. Como dador, quiero buscar direcciones limitadas a la localidad elegida, para ubicar con precisión el retiro y la entrega.
4. Como dador, quiero marcar un punto en el mapa y que se asocie a la localidad más cercana del catálogo dentro de un radio máximo, y recibir la dirección sugerida para confirmarla, para precisar mi centro de carga.
5. Como dador, quiero que un punto fuera del radio máximo se informe como fuera de cobertura, para no asociarlo a una localidad lejana.
6. Como desarrollador, quiero que el geo-service sea dueño de las provincias y de las 150 localidades del catálogo, cada una con su provincia, para que la geografía viva en un solo lugar.
7. Como desarrollador, quiero identificar cada ruta por el par de localidades que une, sin importar el sentido, para que todas las consultas encuentren la ruta guardada.
8. Como usuario, quiero consultar la ruta entre dos localidades (distancia, duración y geometría, orientada de origen a destino), para ver el recorrido y el costo.
9. Como desarrollador, quiero que una ruta sin dato guardado se resuelva con el proveedor externo sin guardarla, y que si el proveedor falla se devuelva una estimación marcada `is_estimation`, para no inventar distancias sin avisar.
10. Como desarrollador, quiero que el factor vial y la velocidad media de la estimación sean configurables, para cambiarlos en un solo lugar.
11. Como desarrollador, quiero que las 11.175 rutas posibles entre las 150 localidades estén precargadas (hoy faltan unas 296), para no depender de un proveedor externo.
12. Como desarrollador, quiero resolver varias rutas en una sola llamada (en el orden pedido, sin duplicados, con coordenadas de las localidades y geometría opcional, con un tope configurable de llamadas al proveedor externo), para que el motor de recomendaciones calcule tramos vacíos rápido.
13. Como desarrollador, quiero que el servicio exija autenticación de usuarios y de servicios internos, para que solo la plataforma lo consuma.
14. Como desarrollador, quiero que el geo-service no tenga ningún endpoint de escritura y que la carga inicial sea un script idempotente, para que sea un servicio de consulta.
15. Como desarrollador, quiero endpoints en inglés bajo `/geo/*`, y que `/routes*` y la consulta de rutas por nombre de ciudad se retiren cuando dejen de usarse, para tener una API clara sin romper a nadie.

**Backend**

16. Como dador, quiero que la carga no guarde la distancia y que cada pantalla la consulte al geo-service a partir de las localidades de la carga, para ver siempre el mismo valor que al cotizar.
17. Como dador, quiero un error claro si el geo-service no responde al cotizar, para saber que debo reintentar.
18. Como desarrollador, quiero que el backend deje de exponer localidades, geocodificación y rutas y elimine su copia del motor y de la estimación, para que exista una sola implementación.
19. Como desarrollador, quiero que las cargas y los centros de carga guarden solo el id de la localidad del geo-service y que el backend valide ese id contra una tabla local de ids válidos, con un backfill de lo existente, para no duplicar datos geográficos.
20. Como dador, quiero que el backend guarde solo el pin y el texto de dirección que yo confirmé, para no almacenar datos de un proveedor que no lo permite.

**Frontends**

21. Como dador o transportista, quiero que el autocompletado de localidades, la búsqueda de direcciones y el pin del mapa usen el geo-service con mi sesión, para ver siempre la misma geografía.
22. Como dador o transportista, quiero ver las rutas que informa el geo-service, y que una ruta estimada se muestre como estimada, sin que la app calcule nada.
23. Como dador o transportista, quiero poder elegir localidades aunque el geo-service esté caído (catálogo embebido en el build) y ver las rutas que ya miré (caché), para seguir trabajando; si falta el trazado, quiero ver el mapa sin trazado y "distancia no disponible".
24. Como desarrollador, quiero eliminar la vista `/map` del dador, el `haversine × 1,25` repetido y las constantes de rutas hardcodeadas, para que no queden copias.

**Operación**

25. Como equipo, quiero un health check del geo-service en la herramienta de monitoreo que usemos, para enterarnos de una caída antes que los usuarios.
26. Como equipo, quiero un plan para ampliar el catálogo según la frecuencia de uso y no según la población, con un script idempotente que reciba la lista de localidades, para crecer sin rehacer datos.

**Consulta por id**

27. Como desarrollador, quiero consultar una localidad (con su provincia) y una ruta por id de localidad, para que los consumidores guarden y pidan solo ids.

## Decisiones de implementación

**Dueño y límites**
- El geo-service es dueño de provincias, localidades, direcciones, geocodificación inversa, rutas y estimación. No llama a otros servicios del producto y no tiene endpoints de escritura. Corre como Cloudflare Worker.
- Esquema y rol propios (`geo`, `geo_service`) en el mismo proyecto de Supabase; ningún servicio lee ni escribe tablas de otro.
- Las cargas y los centros de carga guardan solo el id de su localidad del geo-service, sin nombre ni distancia: son referencias, no copias. El backend tiene una tabla local con los ids válidos (solo ids) y la usa para validar al guardar; cómo se mantiene al día cuando el catálogo crece queda por decidir. El pin y la dirección confirmados por el usuario los guarda el backend.

**Flujo de una carga**
- El frontend busca y normaliza origen y destino contra el geo-service y obtiene el id de cada localidad.
- Al publicar manda esos ids; el backend valida que existan en su tabla local y guarda la carga.
- Al mostrarla, el frontend toma las cargas del backend y le pide al geo-service, por id, el nombre y la provincia (el catálogo embebido los resuelve sin llamar) y la distancia y el trazado (en las listas, con el lote).
- Los ids de localidad no se reasignan ni se borran: el geo-service no tiene endpoints de escritura y su catálogo es cerrado.

**Catálogo y datos**
- Catálogo cerrado de 150 localidades (las de las rutas precargadas). A cada una se le asigna su provincia desde el dump de Georef (CC BY 4.0), con un archivo de mapeo revisado a mano donde el nombre sea ambiguo. Una localidad fuera del catálogo se responde como no soportada.
- Las rutas son las 10.879 precargadas (OpenStreetMap vía OSRM, atribución "© OpenStreetMap contributors"), más ~296 pares completados con un script offline. Se guarda todo lo que la licencia permita; lo que no, no.
- Almacenamiento de coordenadas `[lng, lat]`; respuesta HTTP `[lat, lng]`.
- La base cabe en el plan gratuito (500 MB); una matriz grande no, por eso el catálogo no crece ahora.

**Contrato**
- Endpoints bajo `/geo/*`: localidades, direcciones, geocodificación inversa, ruta por par y batch. Las respuestas de ruta vienen orientadas origen → destino. El batch devuelve resultados en el orden pedido, deduplicados, con coordenadas de las localidades y geometría opcional.
- Errores: 404 localidad o ruta no encontrada o no soportada, 400/422 parámetros inválidos, 401 sin credenciales. "Fuera de cobertura" es un resultado distinto de "no soportada".
- Una ruta se identifica por el par de ids de localidad; la normalización de nombres solo sirve para encontrar la localidad.
- La localidad y la ruta se consultan por id. La consulta de rutas por nombre de ciudad se retira al final de la migración; la búsqueda de localidades por texto (autocompletado) se mantiene.

**Resolución de rutas**
- Orden: caché → ruta guardada → proveedor externo (Mapbox Directions, sin guardar) → estimación. La estimación (`is_estimation`) usa un factor vial y una velocidad media configurables y nunca se guarda ni se cachea.
- La caché perimetral guarda solo rutas exactas guardadas.
- El batch resuelve guardadas y estimaciones, y llama al proveedor hasta un tope configurable por llamada.

**Direcciones y pin**
- El geo-service expone la búsqueda de direcciones y la geocodificación inversa; detrás usa el proveedor que hoy usa el frontend, que se decide en el spike de abajo.
- Pin: se asocia a la localidad más cercana del catálogo si está dentro del radio máximo (configurable); si no, "fuera de cobertura". Para la dirección en texto el geo-service consulta al proveedor, la devuelve al usuario para que la confirme y no la guarda.

**Autenticación**
- Usuarios: JWT de Supabase (ES256 vía JWKS, mismo audience e issuer que el backend). Servicios internos: cabecera con clave compartida.

**Migración (strangler)**
- Orden: geo-service con datos propios y autenticación → backend consumidor (cotizar y publicar) → frontends → retiro de los endpoints viejos (`GET /routes` y los de localidades del backend, `/routes*` del geo-service). Nunca hay dos fuentes distintas respondiendo a la vez.

**Resiliencia**
- Los frontends embeben el catálogo (150 localidades, provincia y coordenadas) generado desde el geo-service en cada build, y cachean en el navegador las geometrías ya vistas. Nunca calculan distancias ni estimaciones.
- El backend responde 503 al cotizar si el geo-service no responde. Publicar no consulta ni guarda la distancia, así que funciona aunque el geo-service esté caído; la distancia de una carga la piden los frontends al geo-service (en las listas, con el lote).
- No hay segundo deploy. Se reevalúa si hay caídas repetidas, un SLO de disponibilidad incumplido, consultas espaciales (PostGIS) que no entren en PostgREST, límites de CPU en el batch o un motor de ruteo propio.

## Decisiones de testing

- **Seams** (el más alto en cada repo):
  - **Geo-service:** escenarios `.feature` por HTTP: controlador, casos de uso y adaptadores Postgres sobre la base de test.
  - **Backend:** aceptación `pytest-bdd` con un fake del puerto que llama al geo-service. Los escenarios INF-RUT 01 e INF-LOC 01 (los endpoints viejos devuelven 404) se verifican al final.
  - **Frontends:** `vitest` de integración sobre los repositorios de rutas y localidades, con el catálogo embebido como fallback.
- Un buen test verifica comportamiento por la interfaz pública, no la implementación. No hay tests unitarios de controladores finos.
- Los escenarios Gherkin no se copian acá: viven en los `.feature` de cada repo y en cada historia.
- Antecedentes: los escenarios `RUT` de `consultar_rutas.feature` del geo-service, los `COC` de `crear_oferta_carga.feature` del backend y los tests de integración de los frontends. No se prueba la fórmula de estimación en los frontends porque no existe.

## Fuera de alcance

- Consulta espacial de recomendaciones (PostGIS sobre `loads`): su spec propio, junto con T.2.12 a T.2.16.
- Tarifa de desbloqueo con distancia vial (decisión de precios, S.2).
- Ampliar el catálogo más allá de las 150 localidades: historia futura (punto 26); con 500 MB no entra una matriz grande.
- Endpoints de alta de datos o backoffice para administrar localidades y rutas.
- Un segundo deploy del geo-service en otra plataforma.
- Retirar `smartruck-audit` y definir el monitoreo del equipo (solo se pide un health check).
- Renombrar el repositorio.

## Notas

- **Spike de cumplimiento de direcciones (abierto):** el backend guarda el pin y la dirección de cada carga. Si la dirección viene del geocoding temporal de Mapbox, guardarla viola los términos, y la documentación de Mapbox además exige usar su mapa; los frontends dibujan con MapLibre. El spike decide el proveedor de direcciones (Mapbox permanente, Geoapify u otro que permita guardar). Fuentes en [fuentes-datos-geograficos](../../research/fuentes-datos-geograficos.md).
- **Sin verificar:** si Mapbox Directions permite guardar resultados (por eso no se guardan); la licencia de las capas SIG del IGN; que el backend y los frontends salgan por la zona de Cloudflare, que afecta cuánto ayuda el fallback.
- **Este spec reemplaza** `plan-centralizacion-routes.md` §4.3 y el write-through de R4. `plan-geo-service/` queda como el detalle del lado del Worker; su tarea 1.B.7 pasa a usar el dump de Georef para las provincias de las 150 localidades.
- **Historias existentes que probablemente se ajustan:** #137 (S.3), #140, #141, #144 a #145, #152, #163, #164 y #165. Se confirma en `/to-tickets`.

## Historias derivadas

Cada historia lleva la línea `Spec:` que apunta a este documento.

| Historia | Cubre (de este spec) |
| --- | --- |
| #140 R.1.1 · base propia del servicio | 6, 14 |
| #168 R.1.8 · carga inicial de las 150 localidades con provincia (Georef) y de las rutas precargadas | 6, 14 |
| #169 R.1.9 · rutas que faltan entre las 150 localidades | 11, 14 |
| #144 R.1.5 · ruta identificada por el par de localidades | 7, 8 |
| #141 R.1.2 · proveedor externo como respaldo, sin guardar | 9 |
| #142 R.1.3 · rutas en lote con tope de llamadas | 12 |
| #143 R.1.4 · autenticación de usuarios y servicios | 13 |
| #170 R.1.10 · recursos bajo `/geo` y health check | 15, 25 |
| #163 R.1.7 / #164 UI-R.1.7 · localidades y pin | 1, 2, 4, 5, 18, 21 |
| #166 S.5 · spike del proveedor de direcciones | 3, 4, 20 |
| #172 R.1.12 / #175 UI-R.1.12 · direcciones y dirección sugerida del pin | 3, 4, 20 |
| #145 R.1.6 / #152 UI-R.1.6 · único dueño de rutas y distancias | 8, 10, 16, 17, 18, 22, 24 |
| #171 R.1.11 / #174 UI-R.1.11 · catálogo embebido y caché de rutas | 21, 22, 23 |
| #165 D.2.10 · las cargas y los centros de carga guardan solo el id de la localidad, validado contra una tabla local | 19 |
| #173 D.2.11 · backfill del id de localidad en cargas y centros | 19 |
| #167 S.6 · spike de ampliación del catálogo | 26 |
| #178 R.1.13 · cuentas de servicio de Supabase entre servicios | 13 |
| #179 R.1.14 · configurar en prod la cuenta de servicio y las credenciales | 13 |
| #180 R.1.15 · encender la autenticación en prod y retirar el interruptor | 13 |
| #181 R.1.16 · monitor y badges apuntando a `/geo` | 25 |
| #182 R.1.17 · consultar localidad y ruta por id | 27 |
| #183 R.1.18 · retirar la consulta de rutas por nombre | 15, 27 |
