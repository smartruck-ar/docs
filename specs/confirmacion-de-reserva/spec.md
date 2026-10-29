# Spec: Confirmación de reserva con búsqueda de retorno

## Problema

Cuando un transportista reserva una carga, no recibe nada que le confirme la reserva fuera de la pantalla de pago. Además, para no volver vacío tiene que armar a mano la búsqueda de su próxima carga: desde dónde, hasta dónde, qué días y con qué remolque.

## Solución

Al reservar una carga, el transportista recibe una confirmación de reserva: una notificación en el portal que lo invita a buscar cargas de regreso y abre la búsqueda de retorno, y un email con los datos del viaje. El email trae dos botones:

- uno lleva al detalle del viaje en el portal;
- otro abre la búsqueda de retorno ya armada: el viaje inverso al de la carga reservada (de donde la entrega a donde la retiró), con retiro el día de entrega o el siguiente y el mismo tipo de remolque. El portal completa el formulario y busca solo, así que el transportista ve las recomendaciones sin tocar nada.

El backend no busca cargas al reservar: la búsqueda corre cuando el transportista abre el link, con las cargas disponibles en ese momento.

## Comportamientos

1. Como transportista, quiero recibir una notificación en el portal cuando reservo una carga, que me invite a buscar cargas de regreso desde donde la entrego hasta donde la retiré, para tener la confirmación junto con mis otros avisos y pensar en la vuelta. → #234
2. Como transportista, quiero que al tocar esa notificación se abra la búsqueda de retorno, para encontrar mi próxima carga sin armarla. → #235
3. Como transportista, quiero recibir un email de confirmación de reserva con la carga mostrada como en las tarjetas de la búsqueda (ruta, tipo de carga, peso, distancia y remolque), el retiro y la entrega límite con fecha, hora y dirección, para tener los datos del viaje a mano → #236
4. Como transportista, quiero que el email tenga un botón al detalle del viaje en el portal, para entrar directo a mi reserva. → #236
5. Como transportista, quiero que el email tenga un botón "Buscá tu carga de retorno: <destino> → <origen>", para encontrar la próxima carga sin armar la búsqueda. → #236
6. Como transportista, quiero que la búsqueda de retorno salga de la localidad donde entrego y vaya a la localidad donde retiré, para volver a mi punto de partida. → #236
7. Como transportista, quiero que la búsqueda de retorno busque cargas con retiro el día de entrega de la carga reservada o el día siguiente, para encadenar los viajes. → #236
8. Como transportista, quiero que la búsqueda de retorno filtre por el tipo de remolque que pide la carga reservada y no por tipo de carga, para ver cargas que mi equipo puede llevar. → #236
9. Como transportista, quiero que si la carga reservada no pide un tipo de remolque, la búsqueda de retorno vaya sin ese filtro, para no perder opciones. → #236
10. Como transportista, quiero que los links del email me lleven al portal del ambiente donde reservé (test o prod), para no terminar en otro ambiente. → #236
11. Como transportista, quiero que la reserva responda sin esperar el envío del email, para no demorar el pago. → #236
12. Como transportista, quiero que la reserva quede hecha aunque falle el envío del email, para no perder la carga por un problema de correo. → #236
13. Como transportista, quiero que si desbloqueo de nuevo una carga que ya reservé no me llegue otra notificación ni otro email, para no recibir avisos repetidos. → #234, #236
14. Como transportista, quiero que al abrir el portal con una búsqueda de retorno se completen origen, destino, ventana de retiro y tipo de remolque, para no cargarlos a mano. → #237
15. Como transportista, quiero que con esos datos completos el portal busque las recomendaciones solo, para ahorrarme el clic. → #237
16. Como transportista, quiero que si abro el link sin sesión, después de entrar vuelva a la búsqueda de retorno con los mismos datos, para no perder el link. → #238
17. Como transportista, quiero que el link al detalle del viaje también me devuelva ahí después de entrar, para no tener que buscarlo. → #238
18. Como transportista, quiero que si abro un link viejo cuyo primer día de retiro ya pasó, la búsqueda arranque hoy, para no recibir un error por una fecha vencida. → #237
19. Como transportista, quiero que si ya pasaron los dos días de retiro, la búsqueda vaya sin fechas, para ver igual las cargas de esa ruta. → #237
20. Como transportista, quiero que si una localidad del link no existe, el portal complete lo que pueda y no busque, para terminar la búsqueda yo. → #237
21. Como transportista, quiero que si el tipo de remolque del link no existe, el portal lo ignore y busque igual, para no quedarme sin resultados por un dato viejo. → #237
22. Como transportista, quiero que después de la búsqueda automática la dirección del portal quede sin los datos del link, para que al recargar no se pise lo que cambié a mano. → #237
23. Como equipo, queremos que la vuelta después del login acepte solo rutas internas del portal, para que el link no sirva para mandar a alguien a otro sitio. → #238
24. Como equipo, queremos que cada envío fallido quede en el log con el id de la carga y el motivo, sin la API key, el email ni los datos del transportista, para investigar sin exponer datos. → #236
25. Como equipo, queremos que el envío de emails sea un puerto genérico de notificaciones por email, para reusarlo en otros avisos. → #236
26. Como equipo, queremos que la plantilla del email viva en Resend, para cambiar el texto y el diseño sin deploy. → #236
27. Como equipo, queremos que la API key de Resend llegue como secreto por ambiente y nunca esté en el código, para no exponerla. → #236
28. Como equipo, queremos que en local, sin API key, el backend arranque y el email solo quede en el log, y que en test y prod el backend no arranque sin ella, para desarrollar sin Resend y no desplegar sin email. → #236

## Decisiones de implementación

- **Repos:** `smartruck-backend` (reserva, notificación, email), `smartruck-transportista` (`/map` con parámetros y vuelta después del login) y Resend (automatización y plantilla, se configura a mano).
- **El backend no busca cargas al reservar.** Solo arma el link. La búsqueda la hace el recomendador que ya existe, cuando el portal abre el link. Así la reserva no depende del servicio de rutas ni del puntaje.
- **Reserva (caso de uso de desbloqueo):**
  - Si la carga ya está reservada por el mismo transportista, devuelve la carga sin guardar la notificación del transportista ni pedir el email.
  - Si no, además de lo que hace hoy, guarda en la misma transacción una notificación nueva para el transportista y arma la notificación por email.
- **Notificación en el portal:** un tipo nuevo, `reserva_confirmada`, que lleva `transporter_id` y el `load_id` de la carga reservada. Su mensaje no es fijo como el de los demás tipos: invita a buscar cargas de regreso con las localidades de la carga reservada, de su destino a su origen ("Encontrá cargas de regreso de Buenos Aires, CABA a Rosario, Santa Fe."). La notificación guarda esos parámetros (origen y destino) y el mensaje se arma con ellos. Al tocarla, el portal abre la búsqueda de retorno: arma el mismo link que el email con los datos de la carga reservada (localidades, fecha límite de entrega y tipo de remolque), que el transportista ya puede leer porque la reservó.
- **Puerto `EmailNotificationSender`** en el dominio. Recibe un `EmailNotification` con:
  - un tipo de notificación por email (primer valor: reserva confirmada);
  - el email del destinatario;
  - datos planos (texto, números, booleanos y fechas, sin listas ni objetos anidados, porque es lo que acepta Resend).

  El dominio no conoce Resend ni sus eventos.
- **Adaptador de Resend:**
  - Hace un solo `POST https://api.resend.com/events/send` con `event`, `email` y `payload`, `Authorization: Bearer <key>` y timeout corto.
  - Traduce el tipo de notificación al nombre del evento: `load.reserved`, una constante del adaptador.
  - Ante cualquier error o timeout, deja un warning en el log y no tira excepción.
- **Disparo:** el controller del desbloqueo pasa el envío a `BackgroundTasks` de FastAPI, que corre en el mismo proceso, después de responder. Sin cola, sin tabla pendiente y sin reintentos.
- **Garantía de entrega: a lo sumo una vez.** Nunca hay duplicados, pero un email se puede perder, por ejemplo si Resend falla o si Cloud Run, que corre con CPU solo durante el pedido (`cpu_idle`), no llega a mandarlo. La notificación en el portal no se pierde porque está en la base. Para tener "al menos una vez" haría falta una fila pendiente y reintentos; se descartó.
- **Datos del email (payload):** claves en mayúsculas, como las variables de la plantilla de Resend, y todos los valores como texto ya formateado (la plantilla no formatea):

  | Clave | Valor | Ejemplo |
  | --- | --- | --- |
  | `LOAD_ID` | Número de la carga | `1042` |
  | `TRANSPORTER_NAME` | Nombre del transportista | `Transportes del Sur` |
  | `ORIGIN_NAME` / `DESTINATION_NAME` | Localidad sin provincia (lo que va antes de la coma) | `Buenos Aires` / `Córdoba` |
  | `PICKUP_DATE` / `DELIVERY_DEADLINE` | Fecha y hora como en las tarjetas del portal, hora argentina | `sáb 25 oct · 08:00` |
  | `PICKUP_ADDRESS` / `DELIVERY_ADDRESS` | Dirección de retiro y de entrega | `Av. Pellegrini 1500, Buenos Aires` |
  | `CARGO_TYPE` | Tipo de carga | `Cargas paletizadas` |
  | `WEIGHT` | Peso como en el portal | `24 TN` |
  | `DISTANCE_KM` | Km de la carga | `700` |
  | `TRAILER_TYPE` | Remolque con mayúscula inicial; `No especifica` si la carga no pide | `Sider` |
  | `TRIP_URL` | Link al detalle del viaje | ver "Links" |
  | `RETURN_SEARCH_URL` | Link a la búsqueda de retorno | ver "Links" |

  No lleva el pago del flete, el unlock fee ni sus datos de pago, las cargas sugeridas, el teléfono ni datos de contacto del dador. Si falta una clave, Resend no manda el email: las variables de la plantilla no tienen valor por defecto.
- **Links,** armados con `FRONTEND_URL`, que ya existe por ambiente y apunta al portal del transportista:
  - detalle: `/trips/<load_id>`;
  - búsqueda de retorno: `/map?origin=<id de localidad de destino>&destination=<id de localidad de origen>&pickup_from=<X>&pickup_to=<X+1>&trailer_type=<tipo>`.

  X es la fecha (`YYYY-MM-DD`, hora argentina) de la fecha límite de entrega de la carga reservada, que es obligatoria. Sin tipo de remolque, el parámetro no va. Los links no llevan tokens ni datos personales.
- **Resend:**
  - Una sola automatización, compartida por test y prod: evento `load.reserved` → Send Email con la plantilla publicada. La plantilla sale del ejemplo de confirmación de reserva, sin el pago del flete ni las cargas sugeridas.
  - Si el email no es un contacto, Resend lo crea. Si un contacto se dio de baja, Resend saltea el envío. Se acepta porque hoy no hay emails de marketing. Si se agregan, la confirmación pasa a `POST /emails`.
- **Secretos:**
  - `RESEND_API_KEY` vive en Infisical, una key por ambiente, y el pipeline la pasa a Cloud Run como hoy pasa las de MercadoPago.
  - El backend la lee con el patrón de configuración que ya existe y es obligatoria en test y prod. En `APP_MODE` local, si falta, se usa un sender que solo loguea.
  - Se usa la key de solo envío si `/events/send` la acepta; si no, acceso completo, y queda anotado.
- **Portal, `/map`:**
  - Valida los parámetros `origin`, `destination` (enteros), `pickup_from`, `pickup_to` (fechas) y `trailer_type`.
  - Resuelve las localidades por id con el repositorio de localidades que ya existe, que da nombre y coordenadas.
  - Completa el estado del panel de búsqueda y el filtro de tipo de remolque, manda el formulario y reemplaza la URL por `/map` sin parámetros.
  - Corrige las fechas vencidas: si `pickup_from` ya pasó, usa hoy; si también pasó `pickup_to`, va sin fechas.
  - Ignora un tipo de remolque que no está en el catálogo, y un parámetro inválido.
  - Si no resuelve origen y destino, no busca.
- **Portal, login:**
  - La guarda de sesión manda a `/login?redirect_to=<ruta y parámetros>`, con el mismo nombre de parámetro que ya usa la confirmación de cuenta.
  - Después de entrar, vuelve a `redirect_to` solo si es una ruta interna (empieza con `/` y no con `//`); si no, va al dashboard.
  - La sesión es por pestaña, así que un link desde el email siempre pasa por el login.

## Decisiones de testing

- Un buen test verifica comportamiento por la interfaz pública (HTTP en el backend, la pantalla en el portal), no la implementación.
- **Seam 1: endpoint de desbloqueo** (aceptación, junto a la característica de desbloquear carga). Un `FakeEmailNotificationSender` reemplaza al adaptador con `dependency_overrides`, igual que el gateway de pagos falso. El `TestClient` corre las `BackgroundTasks` al terminar la respuesta. Verifica:
  - la notificación del transportista, por el endpoint de notificaciones;
  - la notificación por email: tipo, destinatario, datos y links con ids invertidos, la ventana X / X+1 y el remolque;
  - que desbloquear de nuevo no repite nada;
  - que un sender que falla no rompe la reserva.
- **Seam 2: adaptador de Resend** (integración, con un transporte HTTP falso). Verifica:
  - URL, encabezado `Bearer`, `event`, `email` y `payload`;
  - que un error, un 4xx, un 5xx o un timeout no tiran excepción;
  - que el log no incluye la key, el email ni el payload.

  Antecedente: los tests del cliente del servicio de rutas.
- **Seam 3: pantalla `/map` con parámetros** (unidad de presentación, con repositorios falsos), extendiendo los tests del panel de búsqueda. Verifica:
  - que completa el formulario y llama al recomendador con la query esperada;
  - que no busca con un id inexistente;
  - que corrige fechas vencidas;
  - que ignora un remolque desconocido;
  - que limpia la URL.
- **Seam 4: login con `redirect_to`**, extendiendo los tests de la vista de login. Verifica que vuelve a una ruta interna y que ignora una externa.
- **Seam 5: campana de notificaciones**, extendiendo sus tests de presentación. Verifica que tocar una notificación `reserva_confirmada` navega a `/map` con los parámetros de la búsqueda de retorno de esa carga.
- Los escenarios Gherkin viven en los `.feature` y en cada historia.

## Fuera de alcance

- Buscar cargas en el backend al reservar (con destino libre, orden por precio o puntaje).
- Avisar a transportistas cuando se publica una carga.
- Mandar el email más cerca de la fecha de entrega. Si se quiere, se arma con un paso Delay en la automatización de Resend, sin cambiar el backend.
- Reintentos y garantía de "al menos una vez".
- Baja de los emails y emails de marketing.
- Pasar los secretos de Cloud Run a Secret Manager (`--set-secrets`). Es una historia aparte que afecta a todos los secretos.

## Notas

- **Antes de implementar, a mano:**
  1. crear las dos API keys en Resend y cargar `RESEND_API_KEY` en los ambientes test y prod de Infisical;
  2. confirmar con una llamada en test que `POST /events/send` responde `202` con la key de solo envío (también confirma que Automations está en el plan);
  3. crear la automatización `load.reserved` y publicar la plantilla.
- El payload lleva datos personales del transportista y direcciones de la carga: Resend pasa a tratar datos personales (Ley 25.326). Se manda solo lo mínimo para el email.
- Ejemplo: se reserva la carga #1042 Buenos Aires (id 123) → Córdoba (id 456), con entrega límite el 28/10 y remolque sider. Link de retorno: `/map?origin=456&destination=123&pickup_from=2026-10-28&pickup_to=2026-10-29&trailer_type=sider`.
- Glosario: "Confirmación de reserva" y "Búsqueda de retorno".
- La plantilla publicada en Resend está copiada en `email.html`, en esta misma carpeta. Si se cambia en Resend, se actualiza la copia.

## Historias derivadas

| Historia | Cubre (de este spec) |
| --- | --- |
| #234 T.6.3 - Como transportista, Quiero recibir una notificación en el portal cuando reservo una carga… | Comportamientos 1 y 13 (notificación); decisiones "Reserva (caso de uso de desbloqueo)" y "Notificación en el portal" |
| #235 UI-T.6.4 - Como transportista, Quiero que la notificación de reserva confirmada me abra la búsqueda de retorno… | Comportamiento 2; decisión "Notificación en el portal" (link armado en el portal) |
| #236 T.6.5 - Como transportista, Quiero recibir un email de confirmación de reserva con los datos del viaje y la búsqueda de retorno… | Comportamientos 3 a 13 (email) y 24 a 28; decisiones de puerto, adaptador de Resend, disparo, payload, links, Resend y secretos |
| #237 UI-T.6.6 - Como transportista, Quiero que al abrir la búsqueda de retorno el portal complete los datos y busque solo… | Comportamientos 14, 15 y 18 a 22; decisión "Portal, /map" |
| #238 UI-T.6.7 - Como transportista, Quiero volver a la página que abrí después de iniciar sesión… | Comportamientos 16, 17 y 23; decisión "Portal, login" |
