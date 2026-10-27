# Spec: Publicar una carga completa

## Problema

El dador puede publicar una carga sin pin, sin localidad o con solo un precio mínimo, y el sistema la acepta. Esa carga nunca aparece en las recomendaciones del transportista y nadie se entera. Lo mismo pasa con las cargas que salen de un centro de carga: el centro no guarda su pin, así que la carga sale sin él.

## Solución

Toda carga nueva sale con lo que la recomendación necesita: pin y localidad de cada extremo, precio máximo y fechas válidas en hora argentina. Si falta algo, el dador recibe un error claro que dice qué falta. Al elegir una dirección sugerida, un modal de confirmación muestra el mapa con el pin de la sugerencia fijo y la dirección completa, que el dador confirma o cambia. Los centros de carga guardan su pin, y la carga que sale de un centro lo copia.

## Comportamientos

**Publicar (backend)**

1. Como dador, quiero recibir un error claro si publico sin el pin de origen o de destino, para saber que tengo que marcarlo en el mapa. → #218
2. Como dador, quiero recibir un error claro si publico sin la localidad de origen o de destino, para saber que tengo que elegirla. → #218
3. Como dador, quiero recibir un error claro si publico con una localidad que no está en el catálogo, para elegir una que sí esté. → #218
4. Como dador, quiero recibir un error claro si publico sin precio máximo o con un precio máximo de 0 o menos, para saber que la carga necesita un precio. → #218
5. Como dador, quiero recibir un error claro si la fecha límite de entrega es anterior a la fecha de retiro, para corregir las fechas. → #219
6. Como dador, quiero recibir un error claro si la fecha de retiro ya pasó, para no publicar una carga que nadie puede retirar. → #219
7. Como dador, quiero que las fechas de mi carga se guarden en hora argentina aunque mi cliente las mande con otra zona horaria, para que el retiro y la entrega sean los que elegí. → #219
8. Como transportista, quiero que toda carga publicada tenga pin, localidad y precio máximo, para que pueda aparecer en mis recomendaciones. → #218
9. Como equipo, queremos que una carga activa se guarde siempre con el mismo estado escrito de la misma forma, para filtrar por estado sin parches. → #214

**Centros de carga (backend)**

10. Como dador, quiero recibir un error claro si creo un centro de carga sin pin, para saber que tengo que marcarlo en el mapa. → #220
11. Como dador, quiero recibir un error claro si creo un centro de carga sin localidad, para saber que tengo que elegirla. → #220
12. Como dador, quiero que el centro de carga guarde su pin y me lo devuelva, para reutilizarlo al publicar. → #220

**Front del dador**

13. Como dador, quiero que al elegir una dirección sugerida se abra un modal que muestre el mapa con el pin fijo y la dirección completa, para confirmarla o cambiarla sin marcar el pin a mano. → #217
14. Como dador, quiero tener que marcar el pin en el mapa cuando escribo una dirección sin elegir una sugerencia o cuando la búsqueda falla, para que la carga quede ubicada igual. → #217
15. Como dador, quiero que el botón de publicar quede deshabilitado mientras falte algo obligatorio (el pin de cada extremo, la dirección, la ciudad, las fechas, el tipo de carga o el plazo de pago) y que un aviso debajo me diga qué falta, para no recibir el error recién al enviar. → #217
16. Como dador, quiero que al elegir un centro de carga se copie su pin en la carga, para no marcarlo cada vez. → #221
17. Como dador, quiero que al elegir un centro de carga viejo sin pin el formulario me pida marcarlo en el mapa, para poder publicar igual. → #221
18. Como dador, quiero marcar el pin en el mapa al crear un centro de carga, para que quede guardado con el centro. → #221
19. Como dador, quiero ver un mensaje claro cuando el backend rechaza la carga o el centro por un dato faltante o inválido, para saber qué corregir. → #217, #221
20. Como dador, quiero que cuando marco el punto a mano y la dirección aproximada no trae número el selector me pregunte el número, para que la dirección que se guarda sea lo más completa posible. → #217

## Decisiones de implementación

- **Repos:** `smartruck-backend` (publicar y centros de carga) y `smartruck-dador` (formulario de la carga y modal del centro).
- **Pin obligatorio, sin geocodificar en el backend.** El backend exige latitud y longitud de los dos extremos y no las completa con un proveedor. Por qué: el pin es la entrada del filtro de candidatas de la recomendación; si es opcional existe una carga activa invisible que nadie eligió. Geocodificar en el backend haría depender a publicar de un proveedor y guardaría un punto que el dador no confirmó. Usar el centro de la localidad inventaría un dato.
- **De dónde sale el pin en el front.** La búsqueda de direcciones del backend ya devuelve coordenadas en cada sugerencia; hoy el front las descarta. Al elegir una sugerencia con coordenadas se abre un modal de confirmación, distinto del selector de punto: muestra el mapa con el pin de la sugerencia fijo (no se mueve) y la dirección completa. El texto de la sugerencia se ve en el campo apenas se elige; «Confirmar dirección» carga en el formulario el pin de la sugerencia; «Cambiar dirección» cierra el modal, borra el texto y el pin, y deja el campo vacío y enfocado. Cerrar el modal con Escape equivale a «Cambiar dirección». Una dirección sugerida ya confirmada se cambia con «Cambiar dirección» en la tarjeta del campo, no con «Modificar en el mapa», que queda solo para los puntos marcados a mano: así el pin de una dirección sugerida no se mueve y lo guardado es siempre el texto de la sugerencia con su pin. Si la sugerencia no trae coordenadas, si el dador escribe la dirección sin elegir sugerencia o si la búsqueda falla, queda el texto en el campo, el link «¿No encontrás tu ubicación? Seleccionala en el mapa» y el botón de publicar deshabilitado hasta marcar el pin; el link abre el selector de punto de siempre. Al cambiar la localidad, el pin se borra (como ya pasa).
- **Publicar deshabilitado y errores al salir del campo.** El botón de publicar (con el precio estimado o con el manual) queda deshabilitado mientras falte o sea inválido algún dato obligatorio, y debajo muestra «Falta completar o corregir: …» con los datos que faltan. Los errores en rojo de cada campo aparecen cuando el dador sale del campo, no mientras escribe; el error del pin cuelga del campo del pin y se revisa al salir del campo de dirección. El formulario valida en modo `onTouched`.
- **Número de calle en el selector de punto.** Si el dador marca el punto a mano y la consulta inversa devuelve una dirección no exacta (`is_exact_address` en `false`: solo la calle), el selector pregunta el número con un campo que acepta solo dígitos y la opción «Sin numeración». Con número, la dirección final lo inserta antes de la primera coma («San Martín 123, Concepción del Uruguay, …»), se muestra antes de confirmar y es la que se guarda con el pin exacto. Campo vacío y «Sin numeración» dan el mismo resultado: la dirección queda como la aproximada. Tocar o mover el pin borra el número y la opción, y la aproximada se recalcula. Es solo del front: no toca el backend ni hace consultas nuevas, y no afecta al modal de confirmación de la dirección sugerida.
- **Riesgo aceptado (licencia).** La sugerencia viene de Mapbox en modo temporal, que no permite guardar coordenadas. Se asume que el pin que el dador acepta en el mapa es dato suyo y se puede guardar. Cambiar de proveedor (por ejemplo Georef) queda fuera de este spec. El texto de la dirección tiene el mismo riesgo y sigue abierto, como dice `decision-proveedor-direcciones.md`.
- **Localidad obligatoria y validada.** `origin_locality_id` y `destination_locality_id` (ids del geo-service) son obligatorios y se validan contra la tabla local de ids válidos, como ya se hace cuando vienen.
- **Localidad y pin sin chequeo de consistencia (riesgo aceptado).** La localidad la elige el dador y el pin va aparte; no se valida que el pin caiga en esa localidad. Consecuencia: una carga con localidad Córdoba y pin en Buenos Aires entra como candidata por el pin y se puntúa con los km de Córdoba. Por qué: validarlo obliga a publicar a depender del geo-service (`nearest`), que no tiene copia en el borde. Se retoma junto con la limpieza de los datos viejos.
- **Precio máximo obligatorio y mayor a 0.** El precio mínimo sigue opcional. Por qué: el puntaje divide por el precio máximo; hoy alcanza con un precio mínimo y esa carga se descarta siempre en la recomendación. El front ya manda siempre el máximo.
- **Fechas.** La fecha de retiro y la fecha límite de entrega ya son obligatorias. Se suma que la entrega no puede ser anterior al retiro y que el retiro no puede estar en el pasado, sin margen, comparado contra la hora de `DateTimeProvider`. Una fecha sin zona se toma como hora argentina; una con zona se convierte a hora argentina antes de guardarla. Por qué: los filtros de fecha de la recomendación (00:00 y 23:59:59) suponen que lo guardado está en hora argentina. Se normaliza en lugar de rechazar para no castigar a un cliente que manda bien el instante.
- **La hora sale siempre del puerto `DateTimeProvider`** inyectado por constructor, en hora argentina. Nunca `datetime.now()`. El seed también se corrige para usar hora argentina.
- **Peso:** sigue opcional; entra con #147.
- **Errores de publicar:** 400 con el código al principio del detalle, como el resto del endpoint. Códigos nuevos: `PIN_OBLIGATORIO` y `LOCALIDAD_OBLIGATORIA` (con el extremo en el mensaje), `PRECIO_MAXIMO_OBLIGATORIO`, `ENTREGA_ANTERIOR_AL_RETIRO` y `RETIRO_EN_EL_PASADO`. Se mantiene `LOCALIDAD_INVALIDA`. Las reglas viven en el dominio (la carga se valida a sí misma o un objeto de valor del extremo), no en el controlador; el controlador solo traduce cada error de dominio a su código.
- **Estado normalizado.** Publicar y el seed usan el valor del enum de estados (`activa`, en minúsculas, como el resto de los estados y como esperan los dos fronts). Una migración pasa a minúsculas los estados guardados con otra forma. Se sacan los parches que comparan en mayúsculas (la consulta de candidatas, la búsqueda y el borrado). Índices nuevos solo si el `EXPLAIN ANALYZE` del spec de puntaje los pide.
- **Centros de carga:** migración que agrega latitud y longitud, nullable para los centros existentes. Crear un centro exige pin y localidad. La respuesta del centro devuelve el pin. El backend de cargas no sabe si una carga salió de un centro: el front copia el pin del centro y lo manda como cualquier pin. No existe un endpoint para editar centros; un centro viejo sin pin hace que el front pida marcar el mapa al publicar desde él.
- **Lo que no cambia:** el pedido de publicar sigue aceptando los campos viejos (`origin_id`, el nombre `origin`, `coordinates`, `min_price`) y el backend sigue llenando la tabla vieja de ubicaciones por dentro. Con el pin obligatorio, esa tabla se completa con el pin y no con el proveedor. Publicar sigue guardando la distancia de la carga (#203) con falla suave.
- **Orden de release:** el front del dador sale a test antes que la validación del backend, o en el mismo release. Si el backend exige el pin primero, el dador no puede publicar escribiendo la dirección.

## Decisiones de testing

- **Ciclo:** BDD + TDD en baby steps, como en este repo: escenario `@wip` primero, outside-in, un test por vez, commits atómicos con push en `main` (ver `bdd-tdd-execution`). Arquitectura hexagonal, repositorios como puertos, inyección por constructor, MVC en el borde HTTP, DDD sin modelos anémicos.
- **Seam principal (backend):** los endpoints `POST` de publicar una carga y de crear un centro de carga, con escenarios pytest-bdd en `crear_oferta_carga.feature` y en el feature de centros de carga.
- **Escenarios que cambian:** COC-14 ("se crea aunque la localidad no esté en el catálogo") y COC-LOC 03 ("sin id de localidad se publica como hasta ahora") pasan a ser rechazos. Los demás escenarios de publicar suman localidad y pin sin cambiar lo que prueban.
- **Seam secundario (backend):** integración del repositorio de cargas para la migración del estado y para que una carga publicada quede con `activa`.
- **Front del dador:** vitest de integración sobre el formulario de la carga y el modal del centro: la sugerencia abre el modal de confirmación con el pin fijo, confirmar carga el texto y el pin, cambiar los borra, no deja publicar sin pin, el centro copia su pin, el centro viejo pide el mapa y se muestran los errores del backend.
- **Qué hace bueno a un test:** verifica el comportamiento por la interfaz pública (el endpoint o la pantalla) con datos fijos; nunca usa la hora de la máquina (fechas fijas o `StubDateTimeProvider`).
- **Tests parecidos:** COC-LOC 01 a 03 y COC-18 en `crear_oferta_carga.feature`; DEP 07 y 08 en centros de carga; los tests del formulario de creación de carga del dador.

## Fuera de alcance

- Cambiar el proveedor de direcciones (Georef u otro) y el riesgo de licencia del texto de la dirección.
- Validar que el pin caiga en la localidad elegida.
- Limpiar el pedido de publicar de los campos viejos y sacar la tabla vieja de ubicaciones de las cargas; rechazar campos desconocidos en el pedido. Va en un spec propio.
- Peso obligatorio (#147) y capacidad del remolque.
- Editar centros de carga.
- Completar pin o localidad de cargas y centros ya creados: prod no tiene cargas ni centros, y lo viejo de test queda invisible para la recomendación.

## Notas

- El 2026-10-25 se sacó del despliegue el backfill de localidades de D.2.11 (#173), en un commit firmado con #148. El motivo no está escrito: consultarlo con quien lo hizo antes de cerrar o reescribir #148 y #173.
- `spec centralizacion-geografia` y el README del backend todavía dicen que publicar no guarda la distancia; #203 lo cambió el 2026-10-24. Se corrigen junto con este spec.
- El front del dador manda `vehicle_type` y el backend lo ignora sin avisar. Se resuelve en la limpieza del pedido.
- Relacionado: `docs/specs/puntaje-recomendaciones/spec.md` (lo que la recomendación hace con estas cargas).

## Historias derivadas

| Historia | Cubre (de este spec) |
| --- | --- |
| #214 Como desarrollador, Quiero que el estado activa de una carga se guarde siempre igual… | Comportamiento 9; decisión "Estado normalizado" |
| #217 UI-Como dador, Quiero que al elegir una dirección sugerida el mapa ponga el pin… | Comportamientos 13, 14, 15, 19 y 20; decisiones "De dónde sale el pin en el front" y "Orden de release" |
| #218 Como dador, Quiero recibir un error claro si publico sin pin, sin localidad o sin precio máximo… | Comportamientos 1, 2, 3, 4 y 8 |
| #219 Como dador, Quiero recibir un error claro si las fechas de mi carga no tienen sentido… | Comportamientos 5, 6 y 7; decisión "Fechas" |
| #220 Como dador, Quiero que mi centro de carga guarde su pin y su localidad… | Comportamientos 10, 11 y 12; decisión "Centros de carga" |
| #221 UI-Como dador, Quiero marcar el pin al crear un centro de carga y que mis cargas lo copien… | Comportamientos 16, 17, 18 y 19 |
