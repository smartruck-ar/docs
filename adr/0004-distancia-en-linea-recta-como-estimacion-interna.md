# 0004 - El backend usa distancia en línea recta solo como estimación interna

- **Estado:** aceptado (2026-10-29)
- **Precisa:** ADR 0001 ("los demás piden, nunca calculan"; "ninguno calcula distancias")

## Contexto

La búsqueda de paso (spec `busqueda-de-paso`) necesita decidir qué cargas vale la pena medir antes de pedir sus tramos al geo-service. Para eso calcula distancias en línea recta entre pines en tres lugares: la zona de la búsqueda (una elipse con focos en el origen y el destino del viaje solicitado), la regla de sentido (el destino de la carga queda más cerca del destino pedido que su origen) y el puntaje estimado que ordena las candidatas cuando no entran en el presupuesto del lote.

Pedir esas distancias al geo-service no es posible: son entre pines, no entre localidades, y pedirlas costaría justo el lote que se quiere ahorrar. La búsqueda cercana ya calculaba en el backend los cuadrados en km alrededor de cada extremo.

## Decisión

El backend puede calcular distancias en línea recta entre puntos **solo como estimación interna para filtrar u ordenar candidatas**. Nunca se muestran al usuario, nunca se usan para cobrar ni para puntuar la respuesta final, y nunca se guardan. Toda distancia que ve el usuario o que entra en el puntaje de la respuesta sale del geo-service.

## Consecuencias

- Sigue habiendo una sola fuente para las distancias de negocio: el geo-service.
- La estimación puede equivocarse (la ruta mide 1,19 veces la recta en la mediana del catálogo y hasta 3,7 veces cruzando el Paraná). Por eso solo decide a quién medir, nunca el resultado.
- Un uso nuevo de distancia en línea recta en el backend tiene que entrar en esta definición o pedir otro ADR.
