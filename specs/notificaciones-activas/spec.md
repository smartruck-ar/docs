# Spec: Notificaciones activas

## Problema

Las notificaciones de hoy son una lista que el usuario tiene que abrir para enterarse. Si algo importante pasa (una reserva, un pago, una cancelación, una carga por vencer) nadie le avisa, y la sección de notificaciones del portal es difícil de recorrer.

## Solución

El sistema avisa de forma activa los eventos que importan, sin que el usuario tenga que entrar a buscarlos: una notificación en el portal con un indicador visible, y un email para los eventos críticos. La sección de notificaciones del portal se ordena, distingue lo leído de lo no leído y lleva al lugar donde el usuario puede actuar.

## Comportamientos

**Avisos pendientes**

1. Como transportista, quiero recibir un aviso cuando se vence el bloqueo de una carga que estaba por pagar, para saber que la perdí.
2. Como transportista, quiero recibir un aviso cuando se me devuelve plata por un pago tardío o con monto incorrecto, para saber que el dinero vuelve.
3. Como dador, quiero recibir un aviso cuando mi carga está por vencer sin que nadie la haya tomado, para ajustar el precio o la fecha.
4. Como dador y transportista, quiero recibir un aviso cuando el otro me califica, para enterarme de mi reputación.

**Ya existen** (no se rehacen): carga reservada, en camino, demorada, entregada, entrega confirmada, reserva confirmada, cancelada por el transportista y cancelada por el dador.

**Entrega**

5. Como usuario, quiero ver un indicador con la cantidad de avisos sin leer en todas las pantallas del portal, para no tener que abrir la lista para saber si hay algo nuevo.
6. Como usuario, quiero que los eventos críticos (reserva, cancelación, reembolso) también me lleguen por email, para enterarme aunque no tenga el portal abierto.
7. Como usuario, quiero que el aviso no se repita si el evento se procesa dos veces, para no recibir duplicados.
8. Como usuario, quiero que un fallo en el envío del email no frene la operación que lo originó, para que una reserva o un reembolso no se pierdan por un problema de correo.

**Sección de notificaciones del portal**

9. Como usuario, quiero ver mis notificaciones ordenadas de la más reciente a la más antigua, para empezar por lo último.
10. Como usuario, quiero distinguir a simple vista las leídas de las no leídas, para saber qué me falta ver.
11. Como usuario, quiero marcar una notificación o todas como leídas, para limpiar la lista.
12. Como usuario, quiero que al tocar una notificación me lleve al detalle de lo que pasó, para actuar de inmediato.
13. Como usuario, quiero que la sección funcione en el celular, para consultarla desde el camino.

## Decisiones de implementación

- **Repos:** `smartruck-backend` (eventos y envío), `smartruck-dador` y `smartruck-transportista` (indicador y sección).
- **Lo que ya existe.** El backend ya guarda notificaciones por dador y por transportista, las lista y las marca como leídas, y ya define ocho tipos (reservada, en camino, demorada, entregada, entrega confirmada, reserva confirmada, cancelada por el transportista y cancelada por el dador). Este spec agrega los tipos de aviso que faltan, el envío de email para los críticos y la mejora del portal. No cambia el modelo de lista y lectura.
- **Origen del aviso.** Lo emite el caso de uso que produce el evento (pago procesado, cancelación, vencimiento), no un trabajo aparte. Los avisos que dependen del paso del tiempo (carga por vencer, bloqueo vencido) necesitan un trabajo programado que hoy no existe.
- **Entrega asíncrona.** El email no demora la operación que lo origina y su fallo no la deshace, igual que en la confirmación de reserva.
- **Sin duplicados.** Cada aviso lleva una clave del evento que lo origina para no generarse dos veces.
- **Tiempo real.** El indicador se actualiza al abrir o refrescar el portal. No se usan conexiones persistentes en esta etapa.

## Decisiones de testing

- **Seam:** los casos de uso que originan los avisos, con un repositorio de notificaciones en memoria y el envío de email simulado.
- Un buen test verifica que el aviso exista (o no exista) tras el evento y que un fallo del email no cambie el resultado de la operación.
- Los escenarios Gherkin no se copian acá: viven en los `.feature` y en cada historia.

## Fuera de alcance

- Notificaciones push del navegador o del sistema operativo.
- Mensajes por WhatsApp o SMS.
- Preferencias por usuario para elegir qué avisos recibir.
- El contenido del email de confirmación de reserva: ya lo cubre `confirmacion-de-reserva`.

## Notas

**Decisiones abiertas** (esta parte no pasó por la entrevista; el único dato tuyo fue «generar alertas o notificaciones de forma activa y mejorar la sección de notificaciones del front»):

1. **Cuáles son los eventos que cuentan.** La lista de los comportamientos 1 a 4 es mi propuesta a partir de los demás specs. Hay que confirmar cuáles entran.
2. **Qué es «activa».** Supuse portal más email para los críticos. Si querés algo más (push o WhatsApp), cambia el alcance.
3. **Trabajo programado.** Los avisos 1 y 3 necesitan un proceso que corra cada tanto. Si no se quiere sumar uno ahora, esos dos avisos se postergan.
4. **Qué eventos son críticos** para mandar email.

## Historias derivadas

_Lo completa `/to-tickets`. No lo escribas a mano._

| Historia | Cubre (de este spec) |
| --- | --- |
| #265 | Aviso de bloqueo vencido (1) |
| #266 | Aviso de reembolso (2) |
| #267 | Aviso de carga por vencer (3) |
| #268 | Aviso de calificación recibida (4) |
| #269 | Email en eventos críticos (6, 7, 8) |
| #270 | Indicador y sección en el portal del transportista (5, 9 a 13) |
| #271 | Indicador y sección en el portal del dador (5, 9 a 13) |
