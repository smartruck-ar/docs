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
10. Como transportista, quiero que a igual puntaje vaya primero la carga con el retiro más próximo, después la de mayor precio máximo y, si también empatan, la de id menor, para que entre dos cargas igual de buenas vea primero la que puedo levantar antes y el orden sea siempre el mismo. → #195
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
29. Como transportista, quiero que si falla cualquiera de las tandas de tramos reciba el error claro de siempre y no una lista armada con una parte, para no ver puntajes que no son reales. → #194
30. Como transportista, quiero que dos cargas con localidades rotas en tandas distintas se descarten y el resto se recomiende igual, para no quedarme sin respuesta por datos ajenos. → #194
31. Como transportista, quiero recibir un error claro si no se pudo medir mi viaje con km viales, para no recibir una lista vacía que parezca "no hay cargas". → #213
32. Como transportista, quiero que no se recomienden cargas con algún tramo estimado, para que el puntaje use solo km viales. → #213
33. Como transportista, quiero que en un viaje corto se recomienden las cargas de toda mi ciudad, para no perder las que tienen el pin lejos del centro. → #215
34. Como transportista, quiero recibir una lista vacía, y no un error, cuando no hay cargas cercanas o todas se descartan, para saber que mi búsqueda funcionó. → #213
35. Como equipo, queremos que se evalúen como máximo 2.000 cargas candidatas, las más cercanas al viaje, y que quede un aviso en el log cuando se alcanza el tope, para que la consulta tenga un techo y sepamos cuándo empieza a actuar. → sin historia (postergada)
36. Como equipo, queremos una línea de resumen en el log por cada pedido (traídas, descartadas por motivo, si actuó el tope, tandas pedidas y devueltas), para entender por qué una carga no se recomendó. → sin historia (postergada)
37. Como equipo, queremos confirmar con datos sembrados que la consulta de candidatas entra por los índices de los pines y no recorre toda la tabla, para que escale. → sin historia (postergada)
38. Como transportista, quiero que al buscar la lista venga ordenada por mejor puntaje y poder ordenarla por retiro más próximo, mayor precio o más km cargados, para ver primero la que más me conviene y elegir otro criterio si quiero. → #216
39. Como transportista, quiero que sin búsqueda la lista venga ordenada por mayor precio y que no aparezca el orden por puntaje, para no ver un criterio que sin viaje no existe. → #216

## Decisiones de implementación

- **Repo:** `smartruck-backend`. Extiende la recomendación de T.2.15 (`roadmap#150`), que hoy busca las cargas activas cuyo pin cae en un cuadrado del 20% de los km del viaje alrededor de cada extremo y las devuelve ordenadas por id.
- **Flujo del caso de uso de recomendación:**
  1. Pide al servicio de rutas el viaje solicitado. Si no vuelve, o vuelve estimado, el pedido falla con 503.
  2. Busca las cargas candidatas con la búsqueda por cuadrados que ya existe, con el tope de candidatas.
  3. Descarta las que no tienen precio máximo.
  4. Pide al servicio de rutas los tramos de las candidatas: vacío de inicio (origen solicitado → origen de la carga), cargado (origen → destino de la carga) y vacío de fin (destino de la carga → destino solicitado).
  5. Descarta las cargas con algún tramo faltante o estimado.
  6. Puntúa, ordena y corta en 20.
  7. Escribe la línea de resumen del pedido.
- **Tramos:** distancia vial entre localidades (ids de localidad del servicio de rutas), no entre pines. El tramo cargado también se pide al servicio de rutas. Los pares repetidos se piden una sola vez. Publicar sí guarda la distancia de la carga desde #203, pero no se usa para el tramo cargado: puede faltar (servicio caído o estimación al publicar), y usarla solo cuando existe deja dos fuentes para el mismo dato y no evita las tandas en el peor caso.
- **Batch del servicio de rutas:** el puerto `RouteDistance` ya tiene la consulta en lote. El adaptador parte los pares en tandas de hasta 200 (el máximo del servicio de rutas, que hoy rechaza más con un 422 que termina en 503), las pide en serie y une los resultados. El caso de uso no se entera de las tandas: sigue pidiendo todos sus tramos en un solo llamado al puerto.
  - **Todo o nada:** si cualquier tanda falla, falla todo el pedido. Nunca se puntúa con un conjunto parcial, porque la plata se compara contra el mejor precio por km del conjunto: si se pierde la carga que mejor paga, las demás suben de puntaje sin motivo.
  - **Localidades desconocidas:** si una tanda responde 404 con `missing_locality_ids`, el adaptador sigue con las demás, junta todos los ids desconocidos y avisa una sola vez. El caso de uso hace lo de siempre: descarta esas cargas y vuelve a pedir una vez. Sin juntarlos, dos ids rotos en tandas distintas daban un 503 falso.
  - **En serie, no en paralelo:** con el catálogo actual son 4 tandas como máximo y cada una tarda menos de 0,1 s (README del servicio de rutas). El paralelo se evalúa solo si se mide que la latencia molesta.
  - **Cota medida:** con las 150 localidades, los pares únicos de un pedido no dependen de la cantidad de cargas sino de las localidades que caen en los cuadrados: 96 en la mediana, 597 en el p99 y 777 en el peor viaje (Bragado → Cafayate). El 22,9% de los viajes posibles puede pasar de 200.
  - **Por qué no subir el máximo del servicio de rutas:** corre el límite en lugar de quitarlo (vuelve a fallar si el catálogo crece) y obliga a tocar y liberar otro repo.
- **Candidatas:**
  - **Tope:** como máximo 2.000 cargas, ordenadas por cercanía en línea recta de los pines de la carga a los centros de las localidades pedidas (suma de las dos distancias). Si se alcanza el tope, `warn` en el log. Por qué: la base no conoce el puntaje antes de pedir los km viales; la cercanía es lo que más se le parece. Ordenar con `LIMIT` hace un top-N sobre las candidatas que ya filtró el índice: no es trabajo doble ni copia la fórmula del `LoadScorer`. Sin orden, el tope se quedaría con cualquiera. Con 2.000 no corta en el volumen del Tier 1. El tope no afecta las tandas: los pares están acotados por la geografía.
  - **Cuadrado:** la mitad del lado es el mayor entre el 20% de los km del viaje y 15 km. Por qué: en viajes cortos (Avellaneda → Buenos Aires mide 7,5 km, ±1,5 km) el 20% da un cuadrado más chico que la ciudad. Solo cambia los viajes de menos de 75 km (1,4% del catálogo). Los 15 km son un criterio (cubren una ciudad grande desde su centro), no un dato medido: se revisan con pines reales.
  - **Esquinas:** se aceptan (hasta 1,41 veces la mitad del lado). El puntaje ya castiga los km vacíos de más.
  - **Cuadrado con `&&` y no círculo con `ST_DWithin`:** `&&` es una sola pasada por el índice GiST; `ST_DWithin` hace esa misma pasada y además la distancia exacta de cada candidata, y sobre `geometry` en grados no mide km (habría que pasar a `geography` y crear otro índice).
  - **Constantes del dominio:** el 20%, los 15 km y las 2.000 viven juntas en la tolerancia de la recomendación. El tope llega al repositorio como parámetro.
- **Eficiencia:** `EXPLAIN ANALYZE` sobre datos sembrados para confirmar que la consulta entra por los índices de los pines. Con el estado normalizado (spec `publicar-carga-completa`), el filtro compara con `activa` sin `upper`. Índices parciales solo si la medición los pide. La recomendación no usa el trazado de la carga.
- **Observabilidad:** una línea `info` por pedido con el viaje y sus km, la mitad del lado, cuántas trajo la base, si actuó el tope, las descartadas por motivo (sin precio máximo, tramo sin medir, tramo estimado, localidad desconocida), las tandas pedidas y cuántas se devolvieron. Sin duración: Cloud Run ya registra la latencia de cada pedido. El aviso por cada carga descartada se mantiene. Nada de esto va en la respuesta. `LogManager` no filtra por nivel, así que se elige la etiqueta: `info` para el resumen y `warn` solo para el tope alcanzado y las descartadas.
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
- **Orden:** puntaje descendente; a igual puntaje, fecha de retiro ascendente (la más próxima primero; la consulta ya descarta el retiro pasado y publicar exige la fecha); después precio máximo descendente; después id ascendente.
- **Errores:**
  - Si el batch falla (no responde, timeout, error del servicio de rutas o cualquier tanda), el pedido entero falla con 503 `RECOMENDACIONES_NO_DISPONIBLES` y `Retry-After: 30`, como al cotizar una carga.
  - Si el viaje solicitado no vuelve en la respuesta, o vuelve estimado, también 503. Antes devolvía una lista vacía con 200, que se confunde con "no hay cargas".
  - Sin reintentos en el backend (salvo los que ya existen: token vencido y una vez ante localidades desconocidas). El `Retry-After` le dice al cliente cuándo volver; reintentar acá duplica la espera justo cuando el servicio está lento.
  - Si falta el tramo de una carga, esa carga se descarta con un `warn` que incluye el id de la carga y el par de localidades faltante.
  - Si el tramo de una carga viene estimado (`is_estimation`), esa carga se descarta con un `warn` y el motivo "tramo estimado". Por qué: las 11.175 rutas están guardadas, así que una estimación solo aparece si algo está roto, y publicar tampoco guarda una distancia estimada (#203).
  - Una carga sin precio máximo se descarta con un `warn` que incluye su id y el motivo "sin precio máximo".
  - Sin cargas cercanas, o con todas descartadas: 200 con la lista vacía.
- **Contrato de la respuesta:** cada recomendación conserva los datos públicos actuales (incluidos `offerer_id` y `max_price`) y agrega `score`, `loaded_km`, `empty_start_km`, `empty_end_km` y `detour_km`.
- **Sin cambios de esquema** en este spec. La normalización del estado de la carga es del spec `publicar-carga-completa`.

### Orden en el front del transportista

- **Repo:** `smartruck-transportista`. Hoy, con una búsqueda aplicada, el selector de orden está oculto y la lista usa el orden del backend (ya por puntaje); el selector solo existe sin búsqueda y no tiene la opción de puntaje. La historia lo muestra también con búsqueda, con "Mejor puntaje" por defecto.
- **Con búsqueda:** por defecto "Mejor puntaje" (el orden del backend). Opciones: retiro más próximo, mayor precio y más km cargados (en km, no en porcentaje: el porcentaje ya está en el puntaje).
- **Sin búsqueda:** por defecto "Mayor precio". Opciones: retiro más próximo, mayor precio y más km cargados (la distancia de la carga si es mayor a 0 y, si no, la de la ruta que el front ya pide al servicio de rutas; las cargas sin ninguna van al final). No aparece "Mejor puntaje".
- Las opciones de distancia que existen hoy se sacan.
- El máximo de 20 también protege al front: dibuja las rutas de todas las recomendaciones con un lote propio al servicio de rutas, que con 20 cargas son 60 pares como máximo.

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
- **Ciclo:** BDD + TDD en baby steps, como en este repo: escenario `@wip` primero, outside-in, un test por vez, commits atómicos con push en `main` (ver `bdd-tdd-execution`). Arquitectura hexagonal, repositorios como puertos, inyección por constructor, DDD sin modelos anémicos ni abstracciones especulativas.
- **Tier 1, mismo seam principal.** Escenarios nuevos en `recomendar_cargas.feature`: más de 200 tramos recomienda igual; falla de una tanda da 503; dos localidades rotas en tandas distintas; viaje solicitado ausente o estimado da 503; tramo estimado descarta la carga; cero cargas y todas descartadas dan lista vacía; más de 20 devuelve las 20 mejores y menos de 20 devuelve todas; desempate por retiro, precio e id; viaje corto con una carga de la misma ciudad lejos del centro; carga en la esquina del cuadrado. El fake del servicio de rutas suma: rechazar pedidos de más de 200 pares, fallar una tanda, marcar un par como estimado y omitir el viaje solicitado.
- **Adaptador del servicio de rutas:** unitarios con opener falso para lo que el fake de aceptación no ve: el corte en tandas, la unión de resultados, los ids desconocidos juntados entre tandas y el timeout.
- **Repositorio de cargas:** integración con un tope chico pasado como parámetro (por ejemplo 2) para probar que se quedan las más cercanas, sin sembrar 2.001 cargas. `EXPLAIN ANALYZE` con datos sembrados para el comportamiento 37; el resultado se anota en el README del backend.
- **Front del transportista:** vitest del orden por defecto con y sin búsqueda y de las opciones disponibles en cada caso.

## Fuera de alcance

- Medir los tramos entre pines en lugar de entre localidades.
- Autenticación y rol del endpoint de recomendaciones.
- Filtro de peso y capacidad del remolque.
- Indicar hora en los filtros de fecha.
- Tolerancia de cercanía elegida por el transportista.
- Búsqueda en el corredor (Tier 2).
- Recomendar viajes dentro de una misma localidad (sigue el 422 de REC 20).
- Tomar el tramo cargado de la distancia guardada en la carga.
- Subir el máximo de pares del lote en el servicio de rutas, pedir las tandas en paralelo y reintentar en el backend.
- Círculo exacto en lugar del cuadrado, e índices parciales salvo que la medición los pida.
- Contar las cargas activas sin pin o sin localidad: publicar ya no las acepta (spec `publicar-carga-completa`) y prod no tiene cargas.
- Lo de publicar (pin, localidad, precio máximo, fechas, centros de carga y front del dador): spec `publicar-carga-completa`.

## Notas

- El puntaje de una carga depende de las demás cargas del mismo pedido, porque la plata se compara contra el mejor precio por km de la respuesta. Una misma carga puede tener distinto puntaje en dos búsquedas distintas.
- Los km vacíos castigan las dos mitades: bajan el aprovechamiento y reparten el pago de la carga en más km realizados.
- Ejemplo de referencia con el viaje Buenos Aires → Córdoba (696 km): Buenos Aires → Córdoba con $1.393.000 da 100; Pilar → Alta Gracia (650 km cargados de 735 realizados, $1.338.000) da 90; Buenos Aires → Rosario (300 km cargados de 700 realizados, $600.000) da 43.
- Vocabulario en el glosario: viaje solicitado, tramo vacío de inicio, tramo cargado, tramo vacío de fin, desvío neto, km realizados, aprovechamiento, plata por km y puntaje.
- El aprovechamiento reemplazó al "ajuste al viaje" (km del viaje solicitado / km realizados) durante T.2.18: el ajuste no castigaba una carga con los mismos km que el viaje pero casi todos vacíos, y pasaba de 1 cuando los km realizados eran menos que los del viaje.
- Los límites de día de los filtros de fecha (las 00:00 de `pickup_from` y las 23:59:59 de `pickup_to` y de `delivery_deadline_max`) se calculan en hora de Argentina y dependen de que `pickup_date` y `delivery_deadline` se guarden en hora argentina. Lo garantiza el spec `publicar-carga-completa` (normaliza la zona horaria al publicar).
- **Riesgo abierto del servicio de rutas (sin verificar, no es de este spec):** el lote lee las rutas con todas las combinaciones de los ids pedidos a través de PostgREST, y Supabase hosted corta por defecto en 1.000 filas. Si corta, tramos guardados vuelven estimados y, con la decisión de descartar los tramos estimados, se pierden cargas buenas. Queda como pendiente del servicio de rutas; si aparece "tramo estimado" en los logs, es la primera sospecha.
- **Riesgo aceptado:** la localidad y el pin de una carga no se validan entre sí (spec `publicar-carga-completa`). Una carga con localidad y pin de ciudades distintas entra por el pin y se puntúa con los km de su localidad.
- **Comprobación final del Tier 1 en test**, con todas las historias de este spec y de `publicar-carga-completa` liberadas:
  1. Desde el front del dador, publicar una carga escribiendo la dirección (el pin sale de la sugerencia) y otra desde un centro de carga; comprobar que sin pin no deja publicar.
  2. Desde el front del transportista, buscar un viaje que incluya esas cargas y verlas ordenadas por mejor puntaje, con 20 como máximo.
  3. Buscar un viaje largo con muchas cargas de localidades variadas (más de 200 tramos) y comprobar que responde.
  4. Buscar un viaje corto del AMBA y comprobar que aparece una carga de la misma ciudad con el pin lejos del centro.
  5. Revisar en el log la línea de resumen de cada pedido.
- **Relacionado, no es de este spec:** `docs/borrador-bug-fecha-retiro-vs-entrega.md` (el listado devuelve cargas con retiro vencido y la tarjeta del transportista rotula la entrega como retiro). Afecta al orden "retiro más próximo" sin búsqueda.

## Historias derivadas

| Historia | Cubre (de este spec) |
| --- | --- |
| #190 Como transportista, Quiero ver los km vacíos de inicio, cargados, vacíos de fin y el desvío neto de cada carga recomendada… | Comportamientos 2, 3, 4, 17 y 18; decisiones "Tramos" y "Batch del servicio de rutas" (pares sin repetir) |
| #191 Como transportista, Quiero recibir un error claro cuando el servicio de rutas no responde… | Comportamiento 15; decisión "Errores" (batch caído) |
| #192 Como transportista, Quiero que cada carga recomendada tenga un puntaje de 0 a 100 y que la lista venga ordenada de mayor a menor… | Comportamientos 1, 5, 6, 7, 8, 9 y 20; decisiones "Fórmula del puntaje" y "Constantes del dominio" |
| #193 Como transportista, Quiero que no se recomienden cargas sin precio máximo o con un tramo que no se pudo medir… | Comportamientos 13, 14 y 16; decisión "Errores" (cargas descartadas) |
| #194 Como transportista, Quiero recibir recomendaciones aunque haya muchas cargas candidatas… | Comportamientos 19, 29 y 30; decisión "Batch del servicio de rutas" (tandas de 200, todo o nada, ids desconocidos juntados) |
| #195 Como transportista, Quiero recibir como máximo 20 recomendaciones y que las empatadas se ordenen por retiro más próximo, mayor precio y publicación… | Comportamientos 10, 11 y 12; decisión "Orden" |
| #204 Como transportista, Quiero indicar desde qué día puedo retirar una carga… | Comportamientos 21, 22 y 23; decisiones "Contrato del pedido", "Piso de retiro" y "Diseño en el dominio" (cableado) |
| #205 Como transportista, Quiero indicar hasta qué día puedo retirar una carga… | Comportamientos 24 y 25; decisión "Techo de retiro" |
| #206 Como transportista, Quiero indicar hasta qué día puedo entregar una carga… | Comportamientos 26, 27 y 28; decisión "Fecha máxima de entrega" |
| #213 Como transportista, Quiero que las recomendaciones usen solo km viales y recibir un error claro cuando no se pudo medir mi viaje… | Comportamientos 31, 32 y 34; decisión "Errores" |
| #215 Como transportista, Quiero que en un viaje corto se recomienden las cargas de toda mi ciudad… | Comportamiento 33; decisión "Candidatas" (cuadrado y esquinas) |
| #216 UI-Como transportista, Quiero que al buscar la lista venga ordenada por mejor puntaje y poder elegir otro orden… | Comportamientos 38 y 39; decisión "Orden en el front del transportista" |

Sin historia (postergadas por decisión del usuario): comportamientos 35 (tope de candidatas), 36 (resumen del log) y 37 (`EXPLAIN ANALYZE`).
