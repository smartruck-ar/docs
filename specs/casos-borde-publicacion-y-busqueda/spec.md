# Spec: Casos borde de publicación y búsqueda

## Problema

El dador puede publicar una carga con un retiro tan cercano que nadie llega a tomarla, y el transportista puede ver y pagar una carga que está por vencer. Si la toma con dos horas de anticipación y el dador no responde, pagó el unlock fee para nada. Las reglas de tiempo están repartidas entre el backend y la documentación, y no coinciden.

## Solución

Una carga solo se puede publicar con un margen mínimo de anticipación respecto del retiro, y solo se muestra al transportista si todavía hay tiempo razonable para retirarla. Las reglas viven en el backend, son las mismas en el formulario y en la búsqueda, y quedan escritas una sola vez en la documentación.

## Comportamientos

**Publicar**

1. Como dador, quiero recibir un error claro si publico una carga para retirar hoy a una hora que ya pasó, para no publicar algo que nadie puede retirar.
2. Como dador, quiero recibir un error claro si el retiro no respeta el margen mínimo de anticipación, para saber a partir de cuándo puedo publicar.
3. Como dador, quiero que el formulario me avise el margen antes de enviar, para corregir la fecha sin recibir el error.
4. Como dador, quiero que el margen se cuente en días hábiles y se calcule en hora argentina, para que no dependa del huso horario de mi cliente.

**Buscar**

5. Como transportista, quiero que no se me recomienden cargas cuyo retiro está dentro de las próximas 2 horas, para no pagar por una carga que el dador no llega a confirmar.
6. Como transportista, quiero que la búsqueda y el detalle usen la misma regla de vencimiento, para no ver una carga en una pantalla y que no esté en la otra.
7. Como transportista, quiero que una carga que pasó a estar próxima a vencer mientras yo la miraba no se pueda desbloquear, para no pagar por una carga que ya no cumple la regla.
8. Como transportista, quiero recibir un error claro si intento desbloquear una carga ya vencida, que me diga que ya no está disponible, para entender por qué no puedo.

**Consistencia**

9. Como equipo, queremos que los márgenes (días hábiles de anticipación para publicar y 2 horas para buscar) sean parámetros del backend y no valores repetidos en cada front, para cambiarlos en un solo lugar.
10. Como equipo, queremos que la documentación describa cada regla de tiempo una sola vez y que coincida con el backend, para que no haya dos versiones.

## Decisiones de implementación

- **Repos:** `smartruck-backend` (reglas), `smartruck-dador` y `smartruck-transportista` (mensajes y formulario), `docs` (una sola descripción de las reglas).
- **Reglas en el dominio.** Las reglas de margen viven en un único lugar del dominio de cargas y las usan publicar, la búsqueda y el desbloqueo. No se duplican en los casos de uso.
- **Hora argentina.** Todas las comparaciones usan la hora argentina, como ya hace la publicación completa.
- **Días hábiles.** Se cuentan lunes a viernes. Los feriados quedan fuera de este spec.
- **Relación con otros specs.** `publicar-carga-completa` ya rechaza un retiro anterior a «ahora» (#219) y la búsqueda ya descarta cargas con retiro pasado (#198, #210). Este spec agrega el margen mínimo, y las 2 horas de la búsqueda no reemplazan esas reglas, las extienden.

## Decisiones de testing

- **Seam:** los casos de uso de publicar, buscar y desbloquear, con un reloj inyectado.
- Un buen test fija la hora «ahora» y verifica que una carga entra o no, justo en el borde: un minuto antes y un minuto después del margen.
- Se cubre el cruce de fin de semana y el cambio de día en hora argentina.
- Los escenarios Gherkin no se copian acá: viven en los `.feature` y en cada historia.

## Fuera de alcance

- Feriados nacionales y provinciales.
- Avisar al dador que su carga está por vencer sin que nadie la haya tomado: va en `notificaciones-activas`.
- La devolución del fee si el dador no responde: va en `pagos-y-plazos`.

## Notas

**Decisiones abiertas** (esta parte no pasó por la entrevista; vienen de tu lista y no las inventé):

1. **Cuánta anticipación para publicar.** Dijiste «capaz podemos hacer que sea con un día hábil de anticipación». Falta confirmar si es un día hábil completo o desde cierta hora del día anterior.
2. **Las 2 horas de la búsqueda.** Es un ejemplo tuyo. Falta confirmar si es un valor fijo para todas las cargas o si depende de algo (por ejemplo, la distancia al origen).
3. **Qué pasa con una carga que ya está bloqueada y entra en el margen.** Por defecto, el bloqueo en curso se respeta y se paga normalmente.
4. **Si el margen de publicación se aplica también a los centros de carga recurrentes.** Por defecto, sí.

## Historias derivadas

_Lo completa `/to-tickets`. No lo escribas a mano._

| Historia | Cubre (de este spec) |
| --- | --- |
| #262 | Margen mínimo para publicar (1 a 4, 9) |
| #263 | Búsqueda sin cargas que vencen en 2 h (5, 6, 9) |
| #264 | Desbloqueo de una carga vencida (7, 8) |
