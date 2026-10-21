# Spec: Puntaje de las recomendaciones de cargas

## Problema

El transportista que pide recomendaciones para su viaje recibe las cargas cercanas ordenadas por id. No sabe cuál le conviene más, cuántos km va a hacer vacío ni cuánto se desvía si toma cada una.

## Solución

Cada carga recomendada viene con un puntaje de 0 a 100 y con los km de sus tramos: vacío de inicio, cargado, vacío de fin y desvío neto. La lista llega ordenada de la más conveniente a la menos conveniente, con un máximo de 20 cargas. El puntaje combina el ajuste al viaje (cuántos km de más le hace hacer la carga) y lo que paga por km realizado, tramos vacíos incluidos.

## Comportamientos

1. Como transportista, quiero que cada carga recomendada tenga un puntaje de 0 a 100, para saber cuál me conviene más sin hacer cuentas.
2. Como transportista, quiero ver los km del tramo vacío de inicio, del tramo cargado y del tramo vacío de fin de cada carga, para saber cuánto voy a manejar con y sin carga.
3. Como transportista, quiero ver el desvío neto de cada carga, para saber cuántos km de más hago respecto de mi viaje solicitado.
4. Como transportista, quiero que el desvío neto nunca sea negativo, para no ver números que no tienen sentido.
5. Como transportista, quiero que el puntaje premie las cargas que no me desvían del viaje solicitado, para hacer la menor cantidad de km de más.
6. Como transportista, quiero que el puntaje premie las cargas que pagan más por km realizado, contando los tramos vacíos, para cobrar más por cada km que manejo.
7. Como transportista, quiero que entre dos cargas con el mismo recorrido gane la que paga más, para que el precio decida cuando la ruta empata.
8. Como transportista, quiero que una carga solo tenga 100 cuando no me desvía nada y es la que mejor paga por km de las recomendadas, para que el 100 signifique "la mejor posible".
9. Como transportista, quiero recibir las recomendaciones ordenadas de mayor a menor puntaje, para ver primero las mejores.
10. Como transportista, quiero que a igual puntaje vaya primero la carga con mayor precio máximo, y si también empatan, la de id menor, para que el orden sea siempre el mismo.
11. Como transportista, quiero recibir como máximo 20 recomendaciones, para no tener que revisar una lista interminable.
12. Como transportista, quiero recibir todas las cargas puntuadas cuando son menos de 20, para no perder ninguna opción.
13. Como transportista, quiero que no se recomienden cargas sin precio máximo, para no ver cargas cuyo pago por km no se puede calcular.
14. Como transportista, quiero que una carga cuyo tramo no se pudo medir quede fuera de la lista y que el resto se recomiende igual, para no quedarme sin respuesta por una sola carga.
15. Como transportista, quiero recibir un error claro cuando el servicio de rutas no responde, para saber que el problema no es mi búsqueda.
16. Como equipo, queremos que cada carga descartada (sin precio máximo o con un tramo sin medir) quede registrada en el log con su id y el motivo, para poder investigar por qué no se recomendó.
17. Como equipo, queremos que los tramos se midan como distancia vial entre localidades, con el servicio de rutas, para que el puntaje use los mismos km que el resto de la plataforma.
18. Como equipo, queremos que cada tramo distinto se pida una sola vez al servicio de rutas, aunque lo compartan varias cargas, para no hacer llamadas de más.
19. Como equipo, queremos que los tramos se pidan en tandas que respeten el máximo del servicio de rutas, para que la recomendación no falle cuando hay muchas cargas candidatas.
20. Como equipo, queremos que los pesos del puntaje y el máximo de recomendaciones sean constantes del dominio, para ajustarlos con datos reales sin tocar la fórmula.

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
- **Fórmula del puntaje** (servicio de dominio nuevo, por ejemplo `LoadScorer`):
  - km realizados = tramo vacío de inicio + tramo cargado + tramo vacío de fin.
  - Ajuste al viaje = km del viaje solicitado / km realizados. Va de 0 a 1.
  - Plata = (precio máximo / km realizados) dividido por el mejor precio por km realizado entre las cargas puntuadas del mismo pedido. Va de 0 a 1.
  - Puntaje = redondeo de 100 × (0,5 × ajuste al viaje + 0,5 × plata). Es un entero de 0 a 100.
  - Desvío neto = km realizados − km del viaje solicitado, recortado a 0.
- **Constantes del dominio:** peso del ajuste al viaje = 0,5, peso de la plata = 0,5 y máximo de recomendaciones = 20. Viven junto a la tolerancia de cercanía del 20%.
- **Orden:** puntaje descendente; a igual puntaje, precio máximo descendente; después id ascendente.
- **Errores:**
  - Si el batch falla (no responde, timeout o error del servicio de rutas), el pedido entero falla.
  - Si falta el tramo de una carga, esa carga se descarta con un `warn` que incluye el id de la carga y el par de localidades faltante.
  - Una carga sin precio máximo se descarta con un `warn` que incluye su id y el motivo "sin precio máximo".
- **Contrato de la respuesta:** cada recomendación conserva los datos públicos actuales (incluidos `offerer_id` y `max_price`) y agrega `score`, `loaded_km`, `empty_start_km`, `empty_end_km` y `detour_km`.
- **Sin cambios de esquema:** no hay migraciones.

## Decisiones de testing

- **Seam principal:** el endpoint `POST /loads/recommendations`, con escenarios de aceptación pytest-bdd en `recomendar_cargas.feature` (como REC 01 y REC 02). Cubre el puntaje, los km de los tramos, el orden, el desempate, el máximo de 20, las cargas descartadas y el error cuando el servicio de rutas falla.
- **Fake del servicio de rutas:** el fake de aceptación hoy devuelve una sola distancia para todo. Hay que ampliarlo para que devuelva una distancia por par de localidades y para que pueda omitir un par (el caso del tramo faltante).
- **Seam secundario:** el adaptador del servicio de rutas, con unitarios que usan un opener falso (como el test de la URL del batch). Cubre solo lo que el fake de aceptación no ve: las tandas de 200 pares y los pares sin repetir.
- **Unitarios internos:** el ciclo outside-in de `bdd-tdd-execution` va a crear unitarios del servicio de dominio del puntaje (fórmula, recorte del desvío, redondeo) y del caso de uso con `MagicMock(spec=...)`, siguiendo `pytest-unit`.
- **Qué hace bueno a un test:** verifica el comportamiento por la interfaz pública con datos conocidos (por ejemplo, tres cargas con km y precios fijos y sus puntajes esperados). No verifica cómo está hecho por dentro.
- **Tests parecidos en el código:** los steps de `recomendar_cargas_steps.py` (REC 01 y REC 02), `test_recommend_loads_use_case.py` y `test_routes_service_distance.py`.
- **Escenarios existentes:** el step de datos públicos de REC 01 hoy exige que `score` y `empty_km` no aparezcan. Se actualiza para el contrato nuevo.

## Fuera de alcance

- Tope de cargas candidatas antes de puntuar (escenario de "muchas cargas").
- Medir los tramos entre pines en lugar de entre localidades.
- Autenticación y rol del endpoint de recomendaciones.
- Filtros de remolque, peso y fecha.
- Tolerancia de cercanía elegida por el transportista.
- Búsqueda en el corredor (Tier 2).
- Mínimo de km por lado del cuadrado en viajes cortos.
- Pin exacto obligatorio al publicar y el arreglo del front del dador que hoy descarta las coordenadas de la dirección elegida.
- Respuesta 503 específica cuando falla el servicio de rutas. Este spec solo pide que el pedido falle; el código HTTP se define en su propia historia.

## Notas

- El puntaje de una carga depende de las demás cargas del mismo pedido, porque la plata se compara contra el mejor precio por km de la respuesta. Una misma carga puede tener distinto puntaje en dos búsquedas distintas.
- El castigo por km vacíos está dentro de la plata: una carga que obliga a andar vacío reparte su pago en más km realizados.
- Ejemplo de referencia con el viaje Buenos Aires → Córdoba (696 km): Buenos Aires → Córdoba con $1.393.000 da 100; Pilar → Alta Gracia (735 km realizados, $1.338.000) da 93; Buenos Aires → Rosario (700 km realizados, $600.000) da 71.
- Vocabulario en el glosario: viaje solicitado, tramo vacío de inicio, tramo cargado, tramo vacío de fin, desvío neto, ajuste al viaje y puntaje.

## Historias derivadas

_Lo completa `/to-tickets`. No lo escribas a mano._

| Historia | Cubre (de este spec) |
| --- | --- |
