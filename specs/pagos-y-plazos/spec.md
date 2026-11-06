# Spec: Unlock fee y cierre de pagos

## Problema

El backend ya bloquea la carga por 10 minutos reales, reembolsa los pagos tardíos o con monto distinto y deja cancelar a dador y transportista. Lo que falta es lo que quedó atrás: el unlock fee se calcula con una distancia en línea recta propia del backend, distinta de la que ve el transportista en el mapa, y el portal tiene su propio cálculo con IVA que el backend no cobra. Además las historias de cancelación están abiertas con el cuerpo vacío.

## Solución

El unlock fee se calcula una sola vez, en el backend, con la distancia vial del servicio de geografía, y el portal muestra solo ese valor. Las historias de cancelación y de bloqueo consistente quedan cerradas contra lo que ya está hecho, sin rehacerlo.

## Comportamientos

**Unlock fee (pendiente)**

1. Como transportista, quiero que el unlock fee sea `5 + 0,04 × d` USD, con `d` la distancia vial del viaje, para pagar lo mismo que dice el informe.
2. Como transportista, quiero que el backend calcule la distancia con el servicio de geografía y no en línea recta, para que el fee coincida con el trazado que veo en el mapa.
3. Como transportista, quiero recibir un error claro si no se puede calcular la distancia, para no pagar un monto aproximado.
4. Como transportista, quiero que el portal muestre solo el fee que devuelve el backend, sin recalcularlo ni sumarle IVA, para ver siempre el monto que se cobra.
5. Como equipo, queremos que el tipo de cambio de USD a pesos sea configuración y no una constante en el dominio, para cambiarlo sin tocar código.

**Ya implementado (se cubre con tests y se cierran las historias)**

6. Como transportista, quiero que la carga quede bloqueada a mi nombre hasta una hora de vencimiento guardada, para tener 10 minutos reales para pagar. _(T.2.32)_
7. Como transportista, quiero que si no pago a tiempo la carga vuelva sola al catálogo sin cargo, o abortar antes de que venza. _(T.2.32)_
8. Como transportista, quiero que otro transportista pueda tomar una carga con el bloqueo vencido. _(T.2.32)_
9. Como transportista, quiero que un pago tardío con la carga ya tomada, o con monto o moneda distintos, se reembolse al 100 %. _(T.2.32)_
10. Como dador, quiero cancelar una carga ya reservada, que el transportista reciba el reembolso del unlock fee y que mi cancelación me penalice con una estrella. _(D.2.22)_
11. Como transportista, quiero cancelar una carga que reservé, sin reembolso, y que mi cancelación me penalice. _(T.2.39)_

## Decisiones de implementación

- **Repos:** `smartruck-backend` (fee) y `smartruck-transportista` (mostrar el fee) y `geo-service` (se consume, no se modifica).
- **Unlock fee.** El caso de uso que lo calcula pide la distancia al servicio de geografía, igual que ya hace la cotización de la carga, y la pasa al dominio. El dominio deja de depender del cálculo en línea recta. El tipo de cambio entra por configuración. No hay IVA. El fee sigue siendo una cuenta en dólares convertida a pesos.
- **Qué dejar como está.** La actualización condicional atómica, el vencimiento en la carga, el reembolso automático y las cancelaciones no se tocan.

## Decisiones de testing

- **Seam:** los casos de uso de cotizar el fee y de desbloquear, con el servicio de geografía simulado.
- Un buen test fija una distancia conocida y verifica el monto.
- Para lo ya implementado, alcanza con confirmar que cada comportamiento tiene un escenario que lo cubre. Los escenarios Gherkin no se copian acá: viven en los `.feature` y en cada historia.

## Fuera de alcance

- El cooldown anti-acaparamiento tras una reserva expirada: hoy vive solo en el navegador y el equipo no lo pidió; se puede reabrir.
- Cambiar las reglas de cancelación y reembolso que ya están.
- Disputas y mediación una vez que la carga salió.
- Facturación electrónica del unlock fee.
- El flete sugerido: va en `tarifas-por-categoria`.

## Notas

**Estado verificado en el código** (backend actualizado al 4/11): el vencimiento de la reserva, el desbloqueo atómico, el reembolso por pago tardío o con monto distinto, y la cancelación de dador y transportista están implementados. No verifiqué el valor configurado del TTL (el informe dice 600 s) ni que la búsqueda trate un bloqueo vencido como carga activa. Conviene que quien tome la historia lo compruebe.

**Decisiones abiertas:**

1. **Qué pasa si el servicio de geografía no responde al cotizar.** Propongo rechazar con un error claro, sin fallback aproximado.
2. **El informe dice que el fee «oscila entre 10 y 30 USD»,** pero la fórmula solo da eso entre 125 y 625 km. El spec sigue la fórmula.
3. Las historias #247 (D.2.22), #248 (T.2.39) y #227 (T.2.32) están abiertas con el cuerpo vacío o corto. Hay que completar su texto y sus escenarios contra lo implementado y cerrarlas, no crear otras.

## Historias derivadas

_Lo completa `/to-tickets`. No lo escribas a mano._

| Historia | Cubre (de este spec) |
| --- | --- |
| #260 | Unlock fee vial desde el geo-service (1, 2, 3, 5) |
| #261 | El portal muestra solo el fee del backend (4) |
