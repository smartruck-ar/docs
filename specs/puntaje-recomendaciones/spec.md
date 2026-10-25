# Spec: Puntaje de las recomendaciones de cargas

## Problema

El transportista que pide recomendaciones para su viaje recibe las cargas cercanas ordenadas por id. No sabe cuál le conviene más, cuántos km va a hacer vacío ni cuánto se desvía si toma cada una.

## Solución

Cada carga recomendada viene con un puntaje de 0 a 100 y con los km de sus tramos: vacío de inicio, cargado, vacío de fin y desvío neto. La lista llega ordenada de la más conveniente a la menos conveniente, con un máximo de 20 cargas. El puntaje combina el aprovechamiento (qué parte de los km realizados el camión va con carga) y lo que paga por km realizado, tramos vacíos incluidos.

El transportista también puede acotar las recomendaciones por fechas: desde qué día puede retirar, hasta qué día puede retirar y hasta qué día puede entregar. Sin fechas, se recomiendan las cargas con retiro desde ahora.

## Comportamientos

1. Como transportista, quiero que cada carga recomendada tenga un puntaje de 0 a 100, para saber cuál me conviene más sin hacer cuentas. → #192
2. Como transportista, quiero ver los km del tramo vacío de inicio, del tramo cargado y del tramo vacío de fin de cada carga, para saber cuánto voy a manejar con y sin carga. → #190
3. Como transportista, quiero ver el desvío neto de cada carga, para saber cuántos km de más hago respecto de mi viaje solicitado. → #190
4. Como transportista, quiero que el desvío neto nunca sea negativo, para no ver números que no tienen sentido. → #190
5. Como transportista, quiero que el puntaje premie las cargas que me hacen andar menos km vacíos, para ir con carga la mayor parte del recorrido. → #192
6. Como transportista, quiero que el puntaje premie las cargas que pagan más por km realizado, contando los tramos vacíos, para cobrar más por cada km que manejo. → #192
7. Como transportista, quiero que entre dos cargas con el mismo recorrido gane la que paga más, para que el precio decida cuando la ruta empata. → #192
8. Como transportista, quiero que una carga solo tenga 100 cuando voy cargado todo el recorrido y es la que mejor paga por km de las recomendadas, para que el 100 signifique "la mejor posible". → #192
9. Como transportista, quiero recibir las recomendaciones ordenadas de mayor a menor puntaje, para ver primero las mejores. → #192
10. Como transportista, quiero que a igual puntaje vaya primero la carga con mayor precio máximo, y si también empatan, la de id menor, para que el orden sea siempre el mismo. → #195
11. Como transportista, quiero recibir como máximo 20 recomendaciones, para no tener que revisar una lista interminable. → #195
12. Como transportista, quiero recibir todas las cargas puntuadas cuando son menos de 20, para no perder ninguna opción. → #195
13. Como transportista, quiero que no se recomienden cargas sin precio máximo, para no ver cargas cuyo pago por km no se puede calcular. → #193
14. Como transportista, quiero que una carga cuyo tramo no se pudo medir quede fuera de la lista y que el resto se recomiende igual, para no quedarme sin respuesta por una sola carga. → #193
15. Como transportista, quiero recibir un error claro cuando el servicio de rutas no responde, para saber que el problema no es mi búsqueda. → #191
16. Como equipo, queremos que cada carga descartada (sin precio máximo o con un tramo sin medir) quede registrada en el log con su id y el motivo, para poder investigar por qué no se recomendó. → #193
21. Como transportista, quiero indicar desde qué día puedo retirar una carga, para ver solo las cargas con retiro desde ese día. → #204
22. Como transportista, quiero que si indico el día de hoy se sigan descartando las cargas cuya hora de retiro ya pasó, para no ver cargas que ya no puedo levantar. → #204
23. Como transportista, quiero recibir un error claro si indico un día de retiro anterior a hoy, para saber que la fecha no es válida. → #204
24. Como transportista, quiero indicar hasta qué día puedo retirar una carga, incluido todo ese día, para ver solo las cargas que puedo retirar dentro de mi ventana. → #205
25. Como transportista, quiero recibir un error claro si el último día de retiro es anterior al primero o anterior a hoy, para saber que el rango no puede devolver cargas. → #205
26. Como transportista, quiero indicar hasta qué día puedo entregar una carga, incluido todo ese día, para ver solo las cargas cuya fecha límite de entrega cumplo. → #206
27. Como transportista, quiero que las cargas sin fecha límite de entrega no se recomienden cuando indico una fecha máxima de entrega, para no ver cargas cuya entrega no puedo comprobar. → #206
28. Como transportista, quiero recibir un error claro si la fecha máxima de entrega es anterior a hoy o anterior al primer día de retiro, para saber que la fecha no es válida. → #206
17. Como equipo, queremos que los tramos se midan como distancia vial entre localidades, con el servicio de rutas, para que el puntaje use los mismos km que el resto de la plataforma. → #190
18. Como equipo, queremos que cada tramo distinto se pida una sola vez al servicio de rutas, aunque lo compartan varias cargas, para no hacer llamadas de más. → #190
19. Como equipo, queremos que los tramos se pidan en tandas que respeten el máximo del servicio de rutas, para que la recomendación no falle cuando hay muchas cargas candidatas. → #194
20. Como equipo, queremos que los pesos del puntaje y el máximo de recomendaciones sean constantes del dominio, para ajustarlos con datos reales sin tocar la fórmula. → #192

## Decisiones de implementación

- **Repo:** `smartruck-backend`. Extiende la recomendación de T.2.15 (`roadmap#150`), que hoy busca las cargas activas cuyo pin cae en un cuadrado del 20% de los km del viaje alrededor de cada extremo y las devuelve ordenadas por id.
- **Flujo del caso de uso de recomendación:**
  1. Pide al servicio de rutas el viaje solicitado.
  2. Busca las cargas candidatas con la búsqueda por cuadrados que ya existe.
  3. Descarta las que no tienen precio máximo.
  4. Pide al servicio de rutas los tramos de las candidatas: vacío de inicio (origen solicitado → origen de la carga), cargado (origen → destino de la carga) y vacío de fin (destino de la carga → destino solicitado).
  5. Descarta las cargas con algún tramo faltante.
  6. Puntúa, ordena y corta en 20.
- **Tramos:** distancia vial entre localidades (ids de localidad del servicio de rutas), no entre pines. El tramo cargado también se pide al servicio de rutas, porque publicar una carga ya no guarda su distancia (R.1.6). Los pares repetidos se piden una sola vez.
- **Batch del servicio de rutas:** el puerto `RouteDistance` ya tiene la consulta en lote. El adaptador parte los pares en tandas de hasta 200, que es el máximo de pares por llamada del servicio de rutas.
- **Fórmula del puntaje:**
  - km realizados = tramo vacío de inicio + tramo cargado + tramo vacío de fin.
  - Aprovechamiento = km del tramo cargado / km realizados. Va de 0 a 1 y nunca lo supera, porque los km cargados son parte de los realizados.
  - Plata = (precio máximo / km realizados) dividido por el mejor precio por km realizado entre las cargas puntuadas del mismo pedido. Va de 0 a 1.
  - Puntaje = 100 × (0,5 × aprovechamiento + 0,5 × plata), redondeado medio para arriba (62,5 da 63). Es un entero de 0 a 100.
  - Desvío neto = km realizados − km del viaje solicitado, recortado a 0. Se informa, pero no entra en el puntaje.
- **Diseño en el dominio:**
  - `RequestedTrip.carry(load, leg_km)` arma la `CarriedLoad`: la carga con los km de sus tres tramos.
  - `CarriedLoad` calcula su aprovechamiento (`loaded_ratio`) y su plata por km (`price_per_km`).
  - El servicio de dominio `LoadScorer.rank(trip, carried_loads)` busca el mejor precio por km de la lista, puntúa cada carga y devuelve las `Recommendation` ordenadas de mayor a menor puntaje. Es el dueño de la fórmula.
  - `Recommendation` tiene su puntaje y deriva su desvío neto.
  - El caso de uso recibe el `LoadScorer` por constructor. Sus unitarios usan el `LoadScorer` real y mockean solo los puertos.
- **Constantes del dominio:** los pesos del aprovechamiento (0,5) y de la plata (0,5) son constantes de clase del `LoadScorer`, porque son parte de su fórmula. El máximo de recomendaciones (20) se define en #195.
- **Orden:** puntaje descendente; a igual puntaje, precio máximo descendente; después id ascendente.
- **Errores:**
  - Si el batch falla (no responde, timeout o error del servicio de rutas), el pedido entero falla con 503 y un mensaje claro, como al cotizar una carga.
  - Si falta el tramo de una carga, esa carga se descarta con un `warn` que incluye el id de la carga y el par de localidades faltante.
  - Una carga sin precio máximo se descarta con un `warn` que incluye su id y el motivo "sin precio máximo".
- **Contrato de la respuesta:** cada recomendación conserva los datos públicos actuales (incluidos `offerer_id` y `max_price`) y agrega `score`, `loaded_km`, `empty_start_km`, `empty_end_km` y `detour_km`.
- **Sin cambios de esquema:** no hay migraciones.

### Filtros de fecha

- **Contrato del pedido:** tres campos opcionales de tipo fecha (`YYYY-MM-DD`) en `POST /loads/recommendations`: `pickup_from`, `pickup_to` y `delivery_deadline_max`. Un formato inválido da el 422 de siempre. Una fecha que no puede devolver nada da un 422 con un código en el detalle, como `VIAJE_DENTRO_DE_LA_MISMA_LOCALIDAD`.
- **Solo fecha, siempre hora de Argentina:** el transportista no indica hora. La hora actual sale de `DateTimeProvider`.
- **Piso de retiro:** sin `pickup_from`, el piso es `ahora`, como ya hace T.2.20 (`roadmap#198`). Con `pickup_from`, el piso es el mayor entre `ahora` y las 00:00 de esa fecha. Con `pickup_from` igual a hoy el piso es `ahora`; con una fecha futura, las 00:00 de ese día. La fecha nunca recupera cargas con retiro pasado.
- **Techo de retiro:** `pickup_to` es inclusivo hasta las 23:59:59 de ese día. En el código el techo es el último instante del día (`23:59:59.999999`), así que una carga con retiro a las 23:59:59,5 también entra.
- **Fecha máxima de entrega:** `delivery_deadline_max` es inclusiva hasta las 23:59:59 de ese día y compara contra la fecha límite de entrega de la carga (`delivery_deadline <= máximo`). Una carga sin fecha límite de entrega no se recomienda cuando se indica este filtro.
- **Errores (422, con el código en el detalle):**
  - `pickup_from` anterior a hoy: `RETIRO_DESDE_ANTERIOR_A_HOY`.
  - `pickup_to` anterior a hoy: `RETIRO_HASTA_ANTERIOR_A_HOY`. Anterior a `pickup_from`: `RETIRO_HASTA_ANTERIOR_A_RETIRO_DESDE`.
  - Orden de validación: si hay más de un error, sale el primero de estos tres: `pickup_from` anterior a hoy, `pickup_to` anterior a hoy, `pickup_to` anterior a `pickup_from`. Un `pickup_to` igual a `pickup_from` es válido (rango de un solo día).
  - `delivery_deadline_max` anterior a hoy: `ENTREGA_MAXIMA_ANTERIOR_A_HOY`. Anterior a `pickup_from`: `ENTREGA_MAXIMA_ANTERIOR_A_RETIRO_DESDE`. No se compara con `pickup_to`: una carga con retiro temprano puede cumplir un máximo de entrega cercano.
- **Diseño en el dominio:** un objeto de valor `PickupWindow`, que se construye con las fechas pedidas y la hora actual, se valida a sí mismo y expone el piso y el techo de retiro. Lanza un error de dominio que el mapper traduce a 422. `LoadPreferences` no cambia: sigue con los tipos de carga y de remolque. La fecha máxima de entrega no pasa por esa ventana: un objeto de valor propio, `DeliveryDeadlineLimit`, la valida contra hoy y contra `pickup_from` y expone el techo de entrega. Al puerto entra dentro de `LoadDateFilter`, junto al piso y al techo de retiro, y no como parámetro suelto, porque con un parámetro más `get_available_within` superaba el máximo de cinco argumentos que impone el linter.
- **Dónde se filtra:** en la consulta de cargas candidatas del repositorio, junto al piso de retiro que ya existe.
- **Orden de las historias:** primero `pickup_from`, que trae el cableado (campos, mapper, puerto, consulta y su 422); después `pickup_to`, y por último `delivery_deadline_max`. Son tres historias.

## Decisiones de testing

- **Seam principal:** el endpoint `POST /loads/recommendations`, con escenarios de aceptación pytest-bdd en `recomendar_cargas.feature` (como REC 01 y REC 02). Cubre el puntaje, los km de los tramos, el orden, el desempate, el máximo de 20, las cargas descartadas y el error cuando el servicio de rutas falla.
- **Fake del servicio de rutas:** el fake de aceptación hoy devuelve una sola distancia para todo. Hay que ampliarlo para que devuelva una distancia por par de localidades y para que pueda omitir un par (el caso del tramo faltante).
- **Seam secundario:** el adaptador del servicio de rutas, con unitarios que usan un opener falso (como el test de la URL del batch). Cubre solo lo que el fake de aceptación no ve: las tandas de 200 pares y los pares sin repetir.
- **Unitarios internos:** el ciclo outside-in de `bdd-tdd-execution` va a crear unitarios del servicio de dominio del puntaje (fórmula, recorte del desvío, redondeo) y del caso de uso con `MagicMock(spec=...)`, siguiendo `pytest-unit`.
- **Qué hace bueno a un test:** verifica el comportamiento por la interfaz pública con datos conocidos (por ejemplo, tres cargas con km y precios fijos y sus puntajes esperados). No verifica cómo está hecho por dentro.
- **Tests parecidos en el código:** los steps de `recomendar_cargas_steps.py` (REC 01 y REC 02), `test_recommend_loads_use_case.py` y `test_routes_service_distance.py`.
- **Escenarios existentes:** el step de datos públicos de REC 01 hoy exige que `score` y `empty_km` no aparezcan. Se actualiza para el contrato nuevo.
- **Filtros de fecha:** mismo seam principal (el endpoint de recomendaciones), en la regla "Fecha de retiro" de `recomendar_cargas.feature` (como REC 13 y REC 14) y una regla nueva para la fecha de entrega. Los unitarios de `PickupWindow` cubren el piso, el techo y los errores; el repositorio se prueba con la integración existente.

## Fuera de alcance

- Tope de cargas candidatas antes de puntuar (escenario de "muchas cargas").
- Medir los tramos entre pines en lugar de entre localidades.
- Autenticación y rol del endpoint de recomendaciones.
- Filtro de peso.
- Hacer obligatoria la fecha límite de entrega (`delivery_deadline`) al publicar una carga, como se hace con la fecha de retiro. Tiene que ser una historia aparte; hasta entonces, el filtro de fecha máxima de entrega descarta las cargas que no la tienen.
- Indicar hora en los filtros de fecha.
- Tolerancia de cercanía elegida por el transportista.
- Búsqueda en el corredor (Tier 2).
- Mínimo de km por lado del cuadrado en viajes cortos.
- Pin exacto obligatorio al publicar y el arreglo del front del dador que hoy descarta las coordenadas de la dirección elegida.

## Notas

- El puntaje de una carga depende de las demás cargas del mismo pedido, porque la plata se compara contra el mejor precio por km de la respuesta. Una misma carga puede tener distinto puntaje en dos búsquedas distintas.
- Los km vacíos castigan las dos mitades: bajan el aprovechamiento y reparten el pago de la carga en más km realizados.
- Ejemplo de referencia con el viaje Buenos Aires → Córdoba (696 km): Buenos Aires → Córdoba con $1.393.000 da 100; Pilar → Alta Gracia (650 km cargados de 735 realizados, $1.338.000) da 90; Buenos Aires → Rosario (300 km cargados de 700 realizados, $600.000) da 43.
- Vocabulario en el glosario: viaje solicitado, tramo vacío de inicio, tramo cargado, tramo vacío de fin, desvío neto, km realizados, aprovechamiento, plata por km y puntaje.
- El aprovechamiento reemplazó al "ajuste al viaje" (km del viaje solicitado / km realizados) durante T.2.18: el ajuste no castigaba una carga con los mismos km que el viaje pero casi todos vacíos, y pasaba de 1 cuando los km realizados eran menos que los del viaje.
- Los límites de día de los filtros de fecha (las 00:00 de `pickup_from` y las 23:59:59 de `pickup_to` y de `delivery_deadline_max`) se calculan en hora de Argentina y dependen de que `pickup_date` y `delivery_deadline` se guarden en hora argentina. Hoy eso no está garantizado: queda pendiente en "publicar con datos completos" (zona horaria). Este spec no lo resuelve.

## Historias derivadas

| Historia | Cubre (de este spec) |
| --- | --- |
| #190 Como transportista, Quiero ver los km vacíos de inicio, cargados, vacíos de fin y el desvío neto de cada carga recomendada… | Comportamientos 2, 3, 4, 17 y 18; decisiones "Tramos" y "Batch del servicio de rutas" (pares sin repetir) |
| #191 Como transportista, Quiero recibir un error claro cuando el servicio de rutas no responde… | Comportamiento 15; decisión "Errores" (batch caído) |
| #192 Como transportista, Quiero que cada carga recomendada tenga un puntaje de 0 a 100 y que la lista venga ordenada de mayor a menor… | Comportamientos 1, 5, 6, 7, 8, 9 y 20; decisiones "Fórmula del puntaje" y "Constantes del dominio" |
| #193 Como transportista, Quiero que no se recomienden cargas sin precio máximo o con un tramo que no se pudo medir… | Comportamientos 13, 14 y 16; decisión "Errores" (cargas descartadas) |
| #194 Como transportista, Quiero recibir recomendaciones aunque haya muchas cargas candidatas… | Comportamiento 19; decisión "Batch del servicio de rutas" (tandas de 200) |
| #195 Como transportista, Quiero que las recomendaciones empatadas se ordenen siempre igual y recibir como máximo 20… | Comportamientos 10, 11 y 12; decisión "Orden" |
| #204 Como transportista, Quiero indicar desde qué día puedo retirar una carga… | Comportamientos 21, 22 y 23; decisiones "Contrato del pedido", "Piso de retiro" y "Diseño en el dominio" (cableado) |
| #205 Como transportista, Quiero indicar hasta qué día puedo retirar una carga… | Comportamientos 24 y 25; decisión "Techo de retiro" |
| #206 Como transportista, Quiero indicar hasta qué día puedo entregar una carga… | Comportamientos 26, 27 y 28; decisión "Fecha máxima de entrega" |
