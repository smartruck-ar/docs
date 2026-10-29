# Spec: Búsqueda de paso en las recomendaciones de cargas

## Problema

Hoy una carga se recomienda solo si su origen queda cerca del origen del viaje solicitado y su destino cerca de su destino. Cuando no hay coincidencias, el transportista se queda sin opciones aunque haya cargas en su camino que le cubren buena parte del viaje: pide Buenos Aires → Córdoba y solo existe Zárate → Rosario; pide Mendoza → Goya y hay Mendoza → Rosario.

## Solución

Si la búsqueda cercana deja menos de 3 recomendaciones, la recomendación sale sola a una búsqueda de paso: cargas que están en el camino del viaje solicitado y lo acercan al destino. Las de las dos búsquedas se puntúan juntas y llegan en una sola lista, con el mismo formato y como máximo 20. En ninguna de las dos búsquedas se recomienda una carga en la que el camión va casi todo el recorrido vacío.

## Comportamientos

1. Como transportista, quiero que cuando la búsqueda cercana deje menos de 3 recomendaciones se busquen también cargas de paso, para tener opciones aunque no haya coincidencias.
2. Como transportista, quiero que la búsqueda de paso corra sola en el mismo pedido, para no tener que buscar de nuevo.
3. Como transportista, quiero que con 3 o más recomendaciones de la búsqueda cercana no se busquen cargas de paso, para ver primero las coincidencias y recibir la respuesta sin trabajo de más.
4. Como transportista, quiero que las cargas de paso tengan su origen y su destino en el camino de mi viaje, para no ver cargas lejos de mi recorrido.
5. Como transportista, quiero que la zona de paso sea proporcionalmente más ancha en viajes cortos y más ajustada en viajes largos, para no perderme cargas en viajes cortos ni ver medio país en viajes largos.
6. Como transportista, quiero que no se recomienden cargas de paso que me dejan más lejos de mi destino que donde las cargo, para no ver cargas en sentido contrario.
7. Como transportista, quiero ver en una sola lista, ordenadas por puntaje, las cargas de la búsqueda cercana y las de paso, para compararlas con la misma vara.
8. Como transportista, quiero que una carga de la búsqueda cercana siga en la lista aunque quede fuera de la zona de paso, para no perder una opción que ya se había encontrado.
9. Como transportista, quiero que no se recomiende ninguna carga en la que voy cargado menos del 25% de los km realizados, en ninguna de las dos búsquedas, para no ver cargas que me hacen viajar casi vacío.
10. Como transportista, quiero que las menos de 3 recomendaciones se cuenten después de descartar las que no se pueden recomendar, para que la búsqueda de paso entre cuando de verdad me faltan opciones.
11. Como transportista, quiero recibir las recomendaciones de la búsqueda cercana cuando la búsqueda de paso no puede medir sus tramos, para no recibir un error teniendo opciones.
12. Como transportista, quiero recibir la respuesta en un tiempo acotado aunque haya muchas cargas en la zona de paso, para no esperar más porque haya más cargas publicadas.
13. Como transportista, quiero que cuando no se pueden medir todas las cargas de paso se midan las de mejor puntaje estimado, para no perder las que más me convienen.
14. Como transportista, quiero que las cargas de paso lleguen con el mismo formato que las demás (km de cada tramo, desvío neto y puntaje), para leerlas igual.
15. Como equipo, queremos que la línea de resumen del log diga si entró la búsqueda de paso, con cuántas recomendaciones venía la búsqueda cercana, el margen de la zona, cuántas candidatas trajo la base, si actuó el presupuesto de pares y cuántas dejó afuera, y las descartadas por aprovechamiento mínimo, para verificar las decisiones de este spec con datos reales.
16. Como equipo, queremos un `warn` cuando la búsqueda de paso falla y se devuelven solo las de la búsqueda cercana, para investigar la falla.
17. Como equipo, queremos que la consulta de cargas candidatas no traiga el trazado de la carga, en las dos búsquedas, para que la memoria del pedido no dependa del tamaño de los trazados.
18. Como equipo, queremos que la recomendación nunca guarde cargas, para que una carga leída sin su trazado no lo borre en la base.
19. Como equipo, queremos confirmar con `EXPLAIN ANALYZE` sobre datos sembrados que la consulta de la búsqueda de paso entra por los índices de los pines, para no sumar una consulta que recorra toda la tabla.

## Decisiones de implementación

- **Repo:** `smartruck-backend`. Extiende el caso de uso de recomendación del spec `puntaje-recomendaciones`. Vocabulario nuevo en el glosario: búsqueda cercana, búsqueda de paso, carga de paso y aprovechamiento mínimo. ADR nuevo: 0004.

### Cuándo entra la búsqueda de paso

- **Regla:** la búsqueda cercana corre como hoy, entera (consulta, lote, descartes y puntaje). Si deja menos de 3 recomendaciones, ya con el aprovechamiento mínimo aplicado, corre la búsqueda de paso en el mismo pedido.
- **Por qué:** con coincidencias buenas, ampliar es trabajo de más y mete cargas peores. Contar las recomendaciones finales y no las candidatas de la base mide lo que ve el transportista: 5 candidatas pueden terminar en 2 recomendaciones. El lote de la búsqueda cercana que se "gasta" antes de decidir es chico, porque si quedan menos de 3 hay pocas cargas.
- **El 3** es una constante del dominio, junto a la tolerancia de la recomendación.

### Zona de paso: una elipse

- **Regla:** una carga es candidata si su pin de origen y su pin de destino caen dentro de una elipse con focos en el origen y el destino del viaje solicitado. Un punto está dentro si la distancia en línea recta al origen más la distancia al destino es como mucho la distancia entre los dos más el margen.
- **Por qué la elipse:**
  - Es ancha en el medio del viaje y finita en las puntas, igual que el costo real de desviarse: un punto al costado en la mitad de un viaje largo suma pocos km, uno detrás de una ciudad suma el ida y vuelta. Por eso agarra rutas alternativas, como Córdoba en Tucumán → Buenos Aires.
  - De lo que trae el índice, la base descarta entre el 14% y el 21%, contra el 18% al 30% del casco convexo de la ruta, porque la elipse tapa mejor el rectángulo con el que trabaja el índice GiST.
  - Medida sobre las 11.175 rutas del catálogo contra los km por ruta, en viajes largos fue la que menos cargas de paso perdió con las tres varas probadas (ver Notas).
- **Alternativas descartadas:** el casco convexo de la polilínea con margen (sigue la ruta, pero pierde las rutas alternativas y la base descarta más); el corredor alrededor de la polilínea (la base descarta más que con las otras dos y el polígono es el más pesado); la unión de casco y elipse (la que menos pierde, pero suma localidades, basura y la dependencia de la polilínea).
- **Costo aceptado:** la elipse no conoce la ruta real. Si la ruta se curva lejos de la línea recta, pierde cargas de paso: en Mendoza → Goya pierde Rosario y su zona (la ruta baja por ahí). Si ese hueco aparece en producción, la mejora ya medida es la unión con el casco.
- **Datos:** los extremos de la elipse son las coordenadas de las localidades del viaje solicitado que ya devuelve el geo-service con el viaje. No usa la polilínea.

### Tamaño de la zona: margen en curva

- **Regla:** margen = 20% × √(500 × km del viaje solicitado), con un mínimo de 15 km. Da 45 km (45%) en 100 km, 100 km (20%) en 500 km y 173 km (12%) en 1.500 km.
- **Por qué:** con un porcentaje fijo, la zona crece con el cuadrado del largo y en viajes largos se traga medio país (Jujuy → Buenos Aires). La curva baja sola el porcentaje con el largo, sin los saltos de unos escalones. En viajes largos baja las localidades de 59 a 45 en la mediana y la basura a un tercio; en viajes cortos es la que menos pierde.
- **Alternativas descartadas:** fijo (no pierde casi nada, pero triplica la basura en viajes largos); con tope de 100 km (pierde una de cada cinco cargas de paso en viajes largos); escalones (saltos: un viaje de 300 km y uno de 301 km dan zonas muy distintas).
- **Costo aceptado:** en viajes largos pierde entre el 4% y el 8% de las localidades de paso (con una vara de 150 a 200 km de desvío por ruta). El 20%, los 500 km y los 15 km son constantes del dominio, junto al 20% y los 15 km de la búsqueda cercana. Para ser más generoso se cambia el punto de los 500 km, no la fórmula.

### Sentido: la carga tiene que acercar al destino

- **Regla:** una carga de paso es candidata solo si su pin de destino queda más cerca, en línea recta, del destino del viaje solicitado que su pin de origen. Zárate → Rosario en Buenos Aires → Córdoba pasa (de 567 km a 375 km de Córdoba); Rosario → Zárate y Rosario → Buenos Aires no.
- **Por qué:** la elipse es simétrica y deja entrar cargas que van para atrás, que son la mitad de los pares posibles. Filtrarlas en la base corta a la mitad lo que se le pide al lote. Contra la verdad por ruta (después de entregarla queda menos ruta hasta el destino), acierta el 95,9%, y sus errores son casi empates: cargas que acercan 27 km en la mediana.
- **Alternativas descartadas:** comparar contra el origen pedido (descarta Zárate → Rosario); proyección sobre la recta origen → destino (acierta 94,1%); medir por ruta (suma un tramo por carga al lote, justo lo que se quiere ahorrar); no filtrar (duplica los tramos cargados y una contraria puede quedar entre las 20).
- **Complejidad:** son dos distancias por fila ya traída por el índice; la consulta sigue en O(log n + k).

### Qué hace la base y qué hace el dominio

- **Regla:** la base filtra con criterios sobre datos: elipse, sentido, estado activa, fechas y preferencias. El dominio aplica las reglas de negocio: el puntaje estimado, el presupuesto del lote, el aprovechamiento mínimo y el puntaje final. La fórmula del puntaje vive una sola vez, en el `LoadScorer`.
- **Por qué:** es el patrón repositorio que ya sigue el backend: el repositorio recibe criterios como objetos de valor (como `SearchArea` y `LoadDateFilter`) y el dominio decide qué conviene. Ordenar por conveniencia en SQL sería una regla de negocio en la infraestructura y copiaría la fórmula.
- **Diseño:**
  - Un objeto de valor del dominio para la zona de paso: sus dos focos, su margen y el destino hacia el que tienen que ir las cargas. El repositorio lo traduce a la consulta.
  - Un método del repositorio de cargas para las candidatas de paso, hermano del de la búsqueda cercana, con el mismo filtro de fechas y las mismas preferencias.
  - La consulta: los pines de origen y de destino contra el rectángulo que envuelve la elipse (`&&`, por los índices GiST que ya existen), después la condición exacta de la elipse y la de sentido con distancias sobre `geography`. El rectángulo es el exacto de la elipse rotada: con uno más grande la base descarta más que lo medido.
  - El margen sale de una función de la tolerancia de la recomendación, junto a la de la búsqueda cercana.

### Presupuesto del lote: 600 pares

- **Regla:** se juntan los tramos de todas las candidatas de paso, sin repetidos y sin los que quedan dentro de una misma localidad. Si son 600 pares o menos, se miden todos. Si son más, el dominio ordena las candidatas por puntaje estimado y las va sumando en ese orden hasta que sus tramos llenan los 600 pares; las que no entran no se miden. Después se puntúa con los km por ruta y salen las 20 mejores.
- **Puntaje estimado:** la misma fórmula del `LoadScorer` (aprovechamiento y plata por km comparada con la mejor del conjunto), con los km de cada tramo en línea recta entre pines. La mejor plata por km sale del conjunto de candidatas de paso.
- **Por qué:**
  - Lo caro no es la base sino el lote: los tramos crecen con las localidades de la zona al cuadrado. Con el catálogo lleno, un viaje largo pediría hasta 6.389 pares en el p99 y 10.319 en el peor caso (52 tandas). El presupuesto lo deja en 3 tandas como máximo, haya las cargas que haya.
  - Mide pares y no cargas porque eso es lo que cuesta: 300 cargas entre 5 localidades entran en una tanda.
  - Es el patrón de generación de candidatos y ranking: una etapa barata elige a quién medir y una cara decide el orden real. Cada orden usa datos distintos; no es ordenar dos veces lo mismo.
  - El puntaje estimado fue el único indicador que no perdió ninguna carga del top 20 en las simulaciones, con precios parejos y con precios dispersos. El desvío estimado prefiere cargas cortitas pegadas a la ruta y el aprovechamiento estimado no mira la plata.
  - Una carga mal estimada (Gualeguay → Ramallo mide 3,7 veces la recta) entra, se mide y cae al fondo; nunca se recomienda por error, porque el orden final es siempre con km por ruta.
- **Alternativas descartadas:** lista corta fija de N cargas (mira cargas y no el costo real); siempre las dos pasadas (ordena aunque no haga falta); top-k exacto con cotas (MPro): exacto, pero con tandas variables y la plata relativa complica las cotas; medir todo (hasta 52 tandas); cortar tandas (rompe el "todo o nada" del spec del Tier 1).
- **Costo aceptado:** es una heurística: una carga buena podría quedar sin medir si la línea recta se equivoca muchísimo justo con ella. Si aparece en producción, la mejora conocida es el top-k exacto con cotas.
- **Diseño:** el `LoadScorer` expone el orden completo además del ranking con corte en 20, para que el caso de uso ordene las candidatas estimadas sin duplicar la fórmula. Los 600 pares son una constante del dominio.

### Cómo se juntan las dos búsquedas

- **Regla:** se unen las cargas de la búsqueda cercana con las candidatas de paso, sin repetidas por id. Los tramos que ya midió la búsqueda cercana se reutilizan y no se vuelven a pedir. Todo se puntúa junto y salen las 20 mejores.
- **Por qué:** la elipse no contiene todo lo de la búsqueda cercana: los cuadrados llegan más lejos detrás de cada ciudad y la búsqueda cercana no filtra el sentido. Si la búsqueda de paso reemplazara a la cercana, se perderían cargas ya encontradas.
- **Costo aceptado:** los puntajes de las cargas cercanas pueden cambiar, porque la plata se compara contra la mejor del conjunto nuevo.

### Aprovechamiento mínimo: 25%

- **Regla:** no se recomienda una carga con aprovechamiento menor al 25%, en ninguna de las dos búsquedas. Se descarta con un `warn` y el motivo "aprovechamiento bajo", como las demás descartadas, y cuenta para el "menos de 3".
- **Por qué:** un piso por puntaje (≥ 50) no sirve porque el puntaje es relativo: una carga puede desaparecer solo porque apareció otra mejor (Buenos Aires → Rosario pasa de 71 a 43 si aparece Buenos Aires → Córdoba) y una carga sola siempre pasa. El aprovechamiento es de la carga misma y no cambia por las demás. El 25% saca lo que es casi todo vacío (Zárate → Campana, 1%; Rosario → San Lorenzo, 4%) y deja la carga de paso de referencia, Zárate → Rosario (30%).
- **Costo aceptado:** cambia la búsqueda cercana ya liberada, y una carga corta que paga muchísimo con poco aprovechamiento queda afuera. El 25% es una constante del dominio, junto a los pesos del `LoadScorer`.

### Errores

- **Regla:** si el lote de la búsqueda de paso falla (servicio caído, timeout o cualquier tanda), se devuelven las recomendaciones de la búsqueda cercana con 200 y un `warn` con el motivo. Las localidades desconocidas se tratan como en la búsqueda cercana: se descartan esas cargas y se vuelve a pedir una vez; si vuelve a fallar, se degrada igual.
- **Por qué:** la búsqueda de paso mejora una respuesta que ya está bien. El "todo o nada" del Tier 1 evita puntuar con un conjunto a medias, y el de la búsqueda cercana está completo. Un 503 escondería opciones válidas.
- **Si falla la búsqueda cercana,** todo sigue como hoy: 503 `RECOMENDACIONES_NO_DISPONIBLES`.

### Trazado y memoria

- **Regla:** las consultas de candidatas de las dos búsquedas no leen el trazado de la carga; esas cargas se arman sin trazado.
- **Por qué:** es la única columna pesada y la recomendación no la usa (la respuesta no lo devuelve). Con 10.000 cargas y trazados de 1.000 puntos, el pedido pasaría 1 GB de memoria, y la instancia de Cloud Run tiene 512 MiB. Sin el trazado, 10.000 cargas son unos 5 MB.
- **Costo aceptado:** una carga leída así, si se guardara, borraría su trazado. La recomendación nunca guarda cargas y un test lo verifica.
- **Sin tope de candidatas:** el lote ya está acotado por el presupuesto de pares y la memoria por sacar el trazado. El tope de 2.000 del spec del Tier 1 sigue postergado; el conteo de candidatas en el log avisa si algún día hace falta.

### Observabilidad

- La línea `info` de resumen del pedido suma: si entró la búsqueda de paso y con cuántas recomendaciones venía la búsqueda cercana, el margen de la zona, las candidatas que trajo la base, si actuó el presupuesto de pares y cuántas candidatas dejó sin medir, y las descartadas por aprovechamiento mínimo. Nada de esto va en la respuesta.
- `warn` cuando la búsqueda de paso falla y se devuelven solo las cercanas.

### Contrato

- **Sin cambios** en `POST /loads/recommendations`, ni en el pedido ni en la respuesta. Las cargas de paso llegan con los mismos campos; sus km de tramos y su desvío neto ya cuentan qué tan de paso son. Una marca "de paso" queda para cuando el front la pida.
- **Sin cambios de esquema.** Si `EXPLAIN ANALYZE` lo pide, un índice parcial de los pines sobre las cargas activas.

### Distancia en línea recta

- La elipse, el sentido y el puntaje estimado calculan distancias en línea recta en el backend. El ADR 0004 precisa el 0001: es válido solo como estimación interna para filtrar u ordenar candidatas, nunca para mostrar, cobrar ni puntuar la respuesta.

## Decisiones de testing

- **Seam principal:** el endpoint `POST /loads/recommendations`, con escenarios de aceptación pytest-bdd en `recomendar_cargas.feature`, en una regla nueva "Cargas de paso". Cubre: entra con menos de 3 y no con 3; la carga de paso aparece (Zárate → Rosario en Buenos Aires → Córdoba); la contraria no aparece; una fuera de la elipse no aparece; la unión conserva una cercana fuera de la elipse; el aprovechamiento mínimo en las dos búsquedas y su efecto en el conteo; la búsqueda de paso que falla devuelve las cercanas; el presupuesto de pares mide las de mejor puntaje estimado.
- **Fake del servicio de rutas:** el de aceptación ya devuelve una distancia por par y puede fallar una tanda; hace falta que pueda fallar solo el lote de la búsqueda de paso (el segundo pedido) y contar los pares pedidos.
- **Repositorio de cargas:** integración con PostGIS para la elipse (dentro, fuera, detrás de una ciudad), el sentido y que no lee el trazado.
- **Unitarios internos:** el ciclo outside-in de `bdd-tdd-execution` va a crear los del margen en curva, el objeto de valor de la zona, el orden completo del `LoadScorer` y la selección por presupuesto en el caso de uso con `MagicMock(spec=...)`, siguiendo `pytest-unit`.
- **Qué hace bueno a un test:** verifica comportamiento por la interfaz pública con datos conocidos (cargas con pines, km y precios fijos y sus puntajes esperados), no cómo está hecho por dentro.
- **Tests parecidos en el código:** los steps de `recomendar_cargas_steps.py`, `test_recommend_loads_use_case.py`, `test_routes_service_distance.py` y la integración del repositorio de la búsqueda cercana.
- **Eficiencia:** `EXPLAIN ANALYZE` con cargas sembradas para un viaje largo, con y sin índice parcial; el resultado va al README del backend.
- **Ciclo:** BDD + TDD en baby steps, escenario `@wip` primero, commits atómicos con push en `main` (`bdd-tdd-execution`).

## Fuera de alcance

- Tolerancia elegida por el transportista, capacidad del remolque y autenticación.
- La unión de la elipse con el casco de la ruta (el hueco de Mendoza → Goya queda como límite conocido).
- Rutas alternativas que la elipse no cubre (Mendoza → Gualeguaychú por Buenos Aires).
- Tope de candidatas en la base (sigue postergado del Tier 1).
- Top-k exacto con cotas.
- Tandas en paralelo.
- Usar la distancia guardada de la carga para el tramo cargado.
- Una marca "de paso" en la respuesta y en el front del transportista.

## Notas

- **Mediciones:** todas sobre los datos del geo-service (las 11.175 rutas guardadas, con km por ruta y polilínea, y las 150 localidades del catálogo), usando las localidades como si fueran cargas. El método y las tablas están en `mediciones.md` de esta carpeta. No hay medición contra la base con cargas reales: la confirma `EXPLAIN ANALYZE`.
- **Mapa para ver las formas:** `mapa-cercania.html` en la raíz de la carpeta de trabajo dibuja los cuadrados, la elipse, el casco y el corredor con cada fórmula de margen sobre las 150 localidades.
- **El puntaje es relativo:** una carga puede tener distinto puntaje según qué otras aparecen. Por eso el piso es de aprovechamiento y no de puntaje.
- **Referencias del patrón:** generación de candidatos y ranking (Covington y Adams, "Deep Neural Networks for YouTube Recommendations", RecSys 2016); filtrar y refinar en bases espaciales (Brinkhoff, Kriegel, Schneider y Seeger, "Multi-Step Processing of Spatial Joins", SIGMOD 1994); top-k con predicados caros (Chang y Hwang, "Minimal Probing", SIGMOD 2002).
- **Pendiente del Tier 1 que sigue abierto:** el `EXPLAIN ANALYZE` de la búsqueda cercana no está anotado. La consulta exige origen y destino en su zona y cada pin tiene su índice: según el plan (un índice o los dos cruzados), el costo es por las cargas que salen o llegan a la zona, no por el resultado.
- **Discrepancia de docs:** `.smartruck/domain.md` dice que los ADRs viven en `docs/src/wiki/adr/` y se listan en `SUMMARY.md`; los existentes viven en `docs/adr/` y no están en `SUMMARY.md`. El 0004 sigue a los existentes.

## Historias derivadas

_Lo completa `/to-tickets`. No lo escribas a mano._

| Historia | Cubre (de este spec) |
| --- | --- |
