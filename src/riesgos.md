# Riesgos del proyecto Smartruck

## Propósito

Hoy el sistema está implementado y desplegado. Los riesgos que importan ya no son los del diseño, sino los **de negocio de la plataforma en operación**: el marketplace con dos lados que hay que llenar, el dinero que se cobra y no se devuelve, la confianza que se promete y no se respalda, y la operación que queda en manos de un equipo que se gradúa.

Este documento:

1. Documenta el estado real de los cinco riesgos de la propuesta (vigentes, superados o convertidos en otro riesgo).
2. Documenta los riesgos de negocio nuevos, con evidencia en el código y con la ponderación ya asignada para que puedan volcarse tal cual a una matriz.
3. Cierra con la matriz consolidada y con el detalle de cada riesgo ordenado de más a menos severidad.

## Cómo se construyó esta lista

- **Fuente primaria**: el código de los repositorios desplegados
- **Criterio de inclusión**: un riesgo entra si puede producir un resultado negativo **de negocio** (plata, carga, reputación, cobertura, confianza, continuidad), no solo un incidente técnico. Un bug que no cambia el resultado comercial se trata como incidencia.
- **Regla de ponderación**: la probabilidad se estima por la evidencia observada (si la condición ya está escrita en el código, la probabilidad es alta); el impacto se estima por el tamaño de la pérdida para el usuario o para el modelo de negocio.

### Escalas

| Dimensión | Valores | Criterio |
|-----------|---------|----------|
| Probabilidad | Alta | La condición que lo dispara ya existe en el sistema o es el estado por defecto. |
| | Media | Requiere un disparador concreto (concurrencia, un tercero, una falla de proveedor). |
| | Baja | Requiere una cadena de eventos poco habitual. |
| Impacto | Crítico | Se pierde el modelo de negocio: la carga no se vende, la plata se quema o la confianza se rompe de forma estructural. |
| | Alto | Pérdida material acotada (un viaje, un transportista, un corredor) o daño reputacional sensible. |
| | Medio | Molestia operativa o pérdida de eficiencia sin efecto directo sobre la transacción. |

### Semáforo

Se conserva el criterio de la propuesta original para que la matriz sea legible de un vistazo:

- 🔴 **Rojo**: alta probabilidad con impacto crítico o alto, o probabilidad media con impacto crítico.
- 🟡 **Amarillo**: probabilidad media con impacto alto, o probabilidad alta con impacto medio.
- 🟢 **Verde**: combinaciones de probabilidad e impacto menores.

---

## Estado de los riesgos de la propuesta original

| Riesgo (propuesta) | Mitigación prevista | Estado en el sistema implementado |
|---|---|---|
| Condición de carrera en el Unlock | Locking optimista | **Vigente y agravado.** No hay locking optimista ni validación de estado en el bloqueo: el bloqueo pisa cualquier carga, incluso una ya reservada por otro (`smartruck-backend/src/application/use_cases/loads/lock_load_use_case.py:25`). Pasa a ser R-11 y R-12. |
| Tercerización ("puenteo") | Transparencia y baja recurrencia del recorrido | **Vigente, cambiar de categoría.** La mitigación era técnica; el problema real es de negocio: sin garantía, sin seguro por viaje y sin salida del pago, el canal informal es más barato para el transportista. Ver R-16. |
| Saturación por consultas geoespaciales | Índices espaciales | **Reformulado.** No se implementó PostGIS: el matching puntúa en memoria sobre todo el catálogo (`smartruck-backend/src/application/use_cases/loads/search_loads_use_case.py:87`). El riesgo real es de costo por búsqueda y de cobertura del catálogo (R-03 y R-18). |
| Inconsistencia en webhooks de pago | Claves de idempotencia | **Mitigado a medias.** La revalidación contra MercadoPago antes de reservar sí es fuerte (`smartruck-backend/src/application/use_cases/loads/unlock_load_use_case.py:46`), pero la creación del pago no es idempotente ni valida el estado de la oferta (R-08). |
| Pérdida de estado offline del chofer | Patrón offline-first | **Vigente, y pasó a ser de negocio.** No hay PWA ni service worker en ningún portal. En ruta, sin conexión, la app no sirve y el transportista vuelve al grupo de WhatsApp (R-19). |

---

## Riesgos de negocio del sistema implementado

Ordenados por severidad (impacto y probabilidad combinados), de más grave a menos grave.

### 🔴 R-01 — La plataforma arranca vacía: arranque en frío del marketplace

- **Probabilidad**: Alta · **Impacto**: Crítico · **Semáforo**: 🔴

La siembra de datos de ejemplo solo corre en ambiente de desarrollo (`smartruck-backend/src/infrastructure/api.py:81`, `should_bootstrap_database` devuelve `True` únicamente si `APP_MODE == "development"`). En producción no hay cargas, ni transportistas, ni corredores de arranque.

**Qué pasa en el negocio**: un marketplace de dos lados sin oferta inicial es un tablero vacío. El transportista que entra, busca y no encuentra cargas, vuelve al grupo de WhatsApp y no vuelve. El dador que publica y no recibe alertas, cancela su cuenta. El efecto es una espiral de liquidez inversa: sin carga no hay transportista, sin transportista no hay carga.

**Mitigación**: campaña de lanzamiento con corredor único (por ejemplo, Rosario–Buenos Aires) y oferta garantizada en las primeras semanas; carga inicial sembrada en producción con datos reales anonimizados; seguimiento de la tasa de "primer transportista que encuentra carga" como métrica de producto.

### 🔴 R-02 — El transportista no recibe avisos: no existe la alerta de cargas por ruta

- **Probabilidad**: Alta · **Impacto**: Crítico · **Semáforo**: 🔴

La "Alerta de cargas por ruta" fue una de las funciones principales del MVP en la propuesta. En el sistema implementado no existe: los tipos de notificación son únicamente eventos del ciclo de vida de la carga hacia el dador — `reservada`, `en_camino`, `demorada`, `entregada`, `entrega_confirmada` — (`smartruck-backend/src/domain/models/notification_type.py:4`). No hay tipo de notificación de "carga disponible", ni rutas guardadas, ni preferencias de búsqueda persistidas (el backend no tiene entidad de preferencias), ni polling en el portal del transportista (no hay `refetchInterval` en las queries de TanStack).

**Qué pasa en el negocio**: el transportista tiene que buscar manualmente cada vez que quiere trabajar, con origen y destino. Eso convierte el producto en un tablón de búsqueda y elimina la propuesta de valor central ("te avisamos cuando hay carga en tu vuelta"). Un transportista que no busca, no compra; el coste de adquisición sube y la retención se desploma.

**Mitigación**: al menos un canal de aviso (notificación in-app por coincidencia de ruta, con polling o realtime) + filtros guardados de origen/destino y tipo de carga; a corto plazo, un resumen diario por correo o WhatsApp con las cargas nuevas del corredor.

### 🔴 R-05 — La tarifa de desbloqueo está hardcodeada, con tipo de cambio fijo y sin IVA

- **Probabilidad**: Alta · **Impacto**: Crítico · **Semáforo**: 🔴

La tarifa se calcula con constantes en el código: 5 USD base + 0,04 USD por km, convertidos a pesos con un tipo de cambio fijo de 1500 (`smartruck-backend/src/domain/unlock_fee.py:8`). El precio sugerido de la carga usa otra constante fija de 2000 ARS/km (`smartruck-backend/src/domain/models/pricing.py:4`). La distancia usada para el fee es geodésica, no la distancia vial que ve el usuario en pantalla.

**Qué pasa en el negocio**: el ingreso de la plataforma es un número congelado en el código. Un movimiento del tipo de cambio erosiona el margen directamente: con un ticket de ~25 USD, un desvío del 30% en el tipo de cambio se come la totalidad de la ganancia. Además, dos fuentes de precio (la del fee y la del flete) no se vinculan entre sí, así que el transportista que calcula su margen con el precio sugerido no sabe cuánto le cuesta realmente entrar a la oferta.

**Mitigación**: mover la tarifa a una tabla de configuración editable (base, por km, tipo de cambio, IVA) con vigencia; mostrar el desglose (base + km + IVA) en la pantalla de checkout; recalcular el fee al momento de cobrar y no solo al consultar.

### 🔴 R-11 — El bloqueo de oferta no tiene vencimiento ni valida el estado previo

- **Probabilidad**: Alta · **Impacto**: Crítico · **Semáforo**: 🔴

`LockLoadUseCase.lock` no mira el estado actual de la carga: la marca `bloqueada` y le asigna el transportista que venga en la URL (`smartruck-backend/src/application/use_cases/loads/lock_load_use_case.py:25`). No hay TTL ni marca de tiempo. La liberación depende de que el cliente llame explícitamente a `abort-lock`, algo que solo ocurre si el transportista cierra el drawer (`smartruck-transportista/src/views/loads/load-drawer.tsx:155`). Mientras la carga está `bloqueada`, desaparece del resultado de búsqueda (`smartruck-backend/src/application/use_cases/loads/search_loads_use_case.py:109`).

**Qué pasa en el negocio**: un transportista que abre el checkout y cierra la pestaña (o pierde conexión) deja la oferta **fuera del mercado de forma permanente**. Peor: como el bloqueo no valida el estado, un transportista puede bloquear una carga que ya estaba reservada y pagada por otro, pisando la reserva y el pago ya acreditado. En un tablero con volumen bajo, cada oferta muerta es una venta perdida y una excusa para volver al canal informal.

**Mitigación**: TTL de bloqueo con liberación automática (por ejemplo, 15 minutos, alineado con la expiración de la preferencia de MercadoPago, que ya existe: `smartruck-backend/src/infrastructure/outbound/gateways/mercadopago_payment_gateway.py:66`); validar la transición de estado antes de bloquear (solo `activa` → `bloqueada`); devolver la carga a `activa` de forma idempotente cuando expira la preferencia de pago.

### 🔴 R-13 — Una carga reservada no se puede cancelar: el viaje que no ocurre deja todo bloqueado

- **Probabilidad**: Media · **Impacto**: Crítico · **Semáforo**: 🔴

El estado de la carga no tiene `cancelada` ni `rechazada` (`smartruck-backend/src/domain/load_status.py:4`). El dador solo puede pasar `entregada` → `entrega_confirmada` (`smartruck-backend/src/application/use_cases/manage_load_by_offerer_use_case.py:44`), y el transportista solo puede mover la carga a `en_camino`, `demorada` o `entregada` (`smartruck-backend/src/application/use_cases/manage_load_by_transporter_use_case.py:58`). El camión queda `ocupado` hasta que la carga llega a `entregada` (`smartruck-backend/src/application/use_cases/loads/assign_truck_to_load_use_case.py:29` y `manage_load_by_transporter_use_case.py:98`).

**Qué pasa en el negocio**: si el viaje se cae (el dador no aparece, la mercadería no está, el transportista se arrepiente), **no existe ninguna salida**. El transportista queda con el camión bloqueado, con una carga reservada que no puede iniciar y con el unlock fee pagado. El dador tampoco puede liberar la oferta. Ambos quedan atrapados en un error que el producto no sabe resolver y que se resuelve en el teléfono: es el peor momento posible para la reputación de la plataforma.

**Mitigación**: agregar el estado `cancelada` con actor y motivo; liberar camión y semirremolque automáticamente; definir la regla de devolución del unlock fee según quién cancela y en qué momento.

### 🔴 R-16 — No hay garantía ni seguro de carga: el puenteo es el camino por defecto

- **Probabilidad**: Alta · **Impacto**: Crítico · **Semáforo**: 🔴

La propuesta justificaba el modelo "la plataforma no intermedia en el flete" con un blindaje: emisión de pólizas de seguro de carga por viaje. En el sistema implementado no hay ninguna emisión de póliza ni servicio de seguro: lo único relacionado es un tipo de documento que el usuario puede subir (`INSURANCE_POLICY`, `smartruck-backend/src/domain/models/document.py:8`). Tampoco hay escrow, ni prueba de entrega electrónica, ni garantía de pago del flete.

**Qué pasa en el negocio**: la razón por la que un transportista dejaría de usar un grupo de WhatsApp —que la transacción tenga respaldo— no existe. El precio de la plataforma (el unlock fee) es un costo puro frente a un WhatsApp gratuito. Salvo que la reputación dentro de la plataforma tenga valor real para el transportista, el camino racional es cerrar el trato fuera y volver al grupo. Es decir: **el riesgo de tercerización de la propuesta no se mitigó, se volvió el comportamiento por defecto**. Lo único que empuja al transportista a quedarse es la reputación, y esa reputación depende de viajes que el producto no puede garantizar (ver R-15).

**Mitigación**: si no hay seguro por viaje, el producto tiene que sostener la promesa con lo que sí controla: verificación obligatoria de ambos lados, historial visible con reseñas verificadas, y una mecánica de reputación que no se pueda negociar (ver R-15). En el horizonte de mediano plazo, póliza por viaje financiada con parte del fee.

### 🔴 R-17 — La verificación manual es el cuello de botella del ingreso y depende de una sola persona

- **Probabilidad**: Alta · **Impacto**: Crítico · **Semáforo**: 🔴

Toda operación del negocio exige perfil `VERIFIED`: `require_verified_offerer` y `require_transporter` rechazan con 403 a quien no lo esté (`smartruck-backend/src/infrastructure/inbound/dependencies/authentication.py:170` y `:192`). El alta de un usuario nace en `PENDING` (`smartruck-backend/src/application/use_cases/transporters/create_transporter_use_case.py:25`) y el único que puede promoverlo es un administrador del backoffice, revisando documentos uno por uno (`smartruck-backend/src/application/use_cases/admin/verify_user_use_case.py`).

**Qué pasa en el negocio**: el tiempo entre el registro y la primera operación no depende del sistema, depende de una agenda humana. En una campaña de lanzamiento con cientos de registros, la verificación se vuelve el cuello de botella de la liquidez: los transportistas se registran, quedan esperando y no pueden trabajar. Como el rol `ADMIN` es un atributo del token (`smartruck-backend/src/infrastructure/inbound/dependencies/authentication.py:144`), además hay un riesgo de persona clave: si esa persona no está, nadie verifica y nadie entra.

**Mitigación**: revisión por lotes con criterios y plantillas (reducir la verificación a la validación de CUIT y cobertura de la póliza, sin intervención manual en cada caso); autoaprobación de CUIT válido contra la fuente fiscal; SLA de verificación publicado; más de un administrador con la capacidad de aprobar.

### 🔴 R-07 — El dinero del unlock fee no tiene vuelta atrás ni mecanismo de disputa

- **Probabilidad**: Media · **Impacto**: Crítico · **Semáforo**: 🔴

No existe refund, ni chargeback, ni estado de disputa en el backend (búsqueda de `refund`, `reembolso`, `chargeback` y `disputa` en `smartruck-backend/src`: sin resultados). La propuesta sí lo prometía: "si alguna de las dos partes decide retirarse o cancelar por distintos motivos, el dinero será devuelto a la entidad y la oferta volverá a estar disponible".

**Qué pasa en el negocio**: el unlock fee es un pago sin cobertura. Si el transportista paga y el dador no aparece, la plata se pierde. Si el transportista paga y después se arrepiente, la plata se pierde. Cada caso de este tipo se convierte en un reclamo que la plataforma no tiene cómo contestar, y un reclamo sin respuesta es una razón excelente para volver al canal informal. El fee deja de ser "el precio de acceder a la oportunidad" y pasa a ser "el peaje que se paga por el riesgo".

**Mitigación**: definir la política de devolución (plazo, responsable, casos) y construirla en el flujo de pago; devolver el fee cuando la carga se cancela con responsabilidad del dador; registrar los pagos aprobados sin carga reservada para poder compensarlos.

### 🔴 R-08 — El pago no es idempotente ni valida el estado de la oferta

- **Probabilidad**: Media · **Impacto**: Crítico · **Semáforo**: 🔴

`CreatePaymentUseCase.create` no valida ni el estado de la carga ni quién la bloqueó: crea un `Payment` nuevo con un `uuid4` por llamada y abre una preferencia de MercadoPago (`smartruck-backend/src/application/use_cases/payments/create_payment_use_case.py:23`). La ruta `POST /payments` no declara dependencia de autenticación (`smartruck-backend/src/infrastructure/inbound/http_controllers/payments_controller.py:173`).

**Qué pasa en el negocio**: un doble clic o un reintento del navegador abre dos preferencias de pago para la misma oferta y el transportista puede pagar dos veces. Peor: se puede pagar una oferta que no está bloqueada por quien paga, o que ya fue reservada por otro. En los dos casos la plata sale y la reserva no llega: pérdida directa, con el transportista como único que la asume.

**Mitigación**: clave de idempotencia por transportista y oferta; validar `bloqueada` + `transporter_id` antes de crear la preferencia; rechazar la creación si ya hay un pago aprobado para esa oferta.

### 🔴 R-12 — La identidad transaccional viene de la URL y las rutas críticas no validan al usuario

- **Probabilidad**: Media · **Impacto**: Crítico · **Semáforo**: 🔴

Las rutas de bloqueo, desbloqueo y abort-lock reciben el `transporter_id` como parámetro de path y no declaran ninguna dependencia de autenticación (`smartruck-backend/src/infrastructure/inbound/http_controllers/loads_controller.py:903` a `:943`). El API Gateway es público y sin política de seguridad (`smartruck-infra/modules/api_gateway/main.tf`, "Punto de entrada público SMARTRUCK").

**Qué pasa en el negocio**: un tercero puede bloquear ofertas (denegación de servicio sobre el inventario, que es escaso por definición), suplantar a un transportista en un desbloqueo y generar o contestar disputas a nombre de terceros. Con un modelo de negocio basado en reputación y cobro, esto no es un detalle de seguridad: es un riesgo de integridad del marketplace. Un solo incidente de suplantación publicado alcanza para destruir la confianza de los transportistas legítimos.

**Mitigación**: derivar el actor del token verificado y eliminar el `transporter_id` del path; exigir sesión en todas las rutas de transacción; verificar que el actor coincide con el propietario de la oferta bloqueada.

### 🔴 R-14 — Después del desbloqueo la plataforma queda ciega

- **Probabilidad**: Alta · **Impacto**: Alto · **Semáforo**: 🔴

Al desbloquear, el sistema marca la carga como `reservada`, expone los datos de contacto y notifica al dador (`smartruck-backend/src/application/use_cases/loads/unlock_load_use_case.py:57`). No hay registro de que el flete se pagara, ni comprobante de retiro, ni documento de entrega, ni verificación de que el transporte ocurrió: los estados los declara cada parte (`smartruck-backend/src/application/use_cases/manage_load_by_transporter_use_case.py:86`).

**Qué pasa en el negocio**: el punto exacto donde se mueven la carga y el dinero es el punto donde Smartruck deja de tener visibilidad. Sin trazabilidad, no hay base para resolver una disputa, ni para cobrar un seguro, ni para construir un historial confiable, ni para mejorar el matching con datos reales de viajes. La plataforma cobra una tarifa y después no sabe qué pasó: es un modelo que no puede evolucionar hacia nada más: el producto no puede evolucionar.

**Mitigación**: registrar hitos del viaje con autor y timestamp (reserva, retiro, llegada, entrega) y, como mínimo, un comprobante de entrega generado por la plataforma; es el insumo de la trazabilidad que la propuesta llamaba "pruebas de entrega electrónicas".

### 🔴 R-18 — El matching puntúa en memoria sobre todo el catálogo

- **Probabilidad**: Media (hoy) → Alta (al escalar) · **Impacto**: Alto · **Semáforo**: 🔴

`SearchLoadsUseCase` trae todas las localidades y todas las cargas, filtra por estado y calcula distancias y puntajes en memoria (`smartruck-backend/src/application/use_cases/loads/search_loads_use_case.py:87`). No usa la vista con PostGIS prevista, y la mejora está reconocido como trabajo pendiente (`docs/src/arquitectura.md:144`).

**Qué pasa en el negocio**: el costo de cada búsqueda crece con el tamaño del mercado, no con el tamaño del resultado. Con el catálogo completo (150 localidades) y cientos de cargas, la búsqueda se vuelve lenta justo en la pantalla que define la retención del transportista. Además el filtro es agresivo: se descartan cargas con score menor a 10 y con desvío mayor al 45% de la ruta principal (`search_loads_use_case.py:139`), así que el transportista puede ver "no hay cargas" cuando sí las hay. El falso negativo es peor que la lentitud: enseña al transportista que la plataforma está vacía.

**Mitigación**: mover el filtro por proximidad a la base (PostGIS o índice por bounding box) y calcular el score solo sobre los candidatos; revisar los umbrales de descarte con casos reales; medir p95 de la búsqueda como métrica de producto.

### 🔴 R-19 — No hay PWA ni modo offline: el usuario objetivo no puede usar la app en ruta

- **Probabilidad**: Alta · **Impacto**: Alto · **Semáforo**: 🔴

No hay service worker ni manifest en ninguno de los portales (búsqueda de `service worker` y `vite-plugin-pwa` en `smartruck-transportista` y `smartruck-dador`: sin resultados), y queda registrado como trabajo pendiente (`docs/src/arquitectura.md:146`). La propuesta definía la PWA como la respuesta a la "conexión inestable en ruta".

**Qué pasa en el negocio**: el usuario objetivo —el chofer de una PyME que trabaja en zonas de cobertura irregular— abre la app y no puede usarla. Vuelve al grupo de WhatsApp, que funciona sin señal. Cada uso fuera de la plataforma es una oportunidad perdida y, peor, un viaje que la plataforma no conoce. Es el escenario en el que el marketplace deja de existir en la práctica.

**Mitigación**: service worker con cache del catálogo de localidades y de las ofertas de la última consulta; cola offline de los hitos del viaje (reserva, en camino, entregado) para sincronizar cuando haya señal; instalabilidad de la PWA.

### 🔴 R-09 — El ticket es chico frente a la comisión y los costos fijos de la operación

- **Probabilidad**: Media-Alta · **Impacto**: Alto · **Semáforo**: 🔴

El ingreso por desbloqueo es 5 USD + 0,04 USD/km: para un viaje de 500 km, unos 25 USD. La plataforma no cobra comisión sobre el flete (es una decisión de diseño del modelo). El costo de operación es de estructura fija: cuatro portales en Render, Cloud Run, Datadog, Cloudflare Workers, Mapbox, Supabase y MercadoPago, este último con comisión porcentual más un cargo fijo por ticket.

**Qué pasa en el negocio**: con un ticket de ~25 USD, el cargo fijo de la pasarela de pago se lleva una porción material del ingreso, y el resto tiene que cubrir la infraestructura y el soporte sin margen de error. El modelo no financia el crecimiento: necesita volumen, y el volumen necesita liquidez, y la liquidez necesita al transportista que ya está midiendo su ROI con la calculadora (R-20).

**Mitigación**: modelar el punto de equilibrio con números reales de la operación (costo fijo mensual, costo por desbloqueo, comisión efectiva) y publicarlo internamente antes de decidir cualquier inversión; explorar un cobro por publicación de carga (hoy gratuita) como fuente complementaria; paquetes con descuento por volumen para el volumen.

### 🟡 R-03 — Techo de cobertura: catálogo cerrado de 150 localidades, embebido en el build

- **Probabilidad**: Alta · **Impacto**: Alto · **Semáforo**: 🟡

El catálogo geográfico es cerrado: 24 provincias y 150 localidades (`microservice-routes/src/application/use-cases/list-localities.use-case.ts:7`), y los portales lo embeben en su build (`microservice-routes/src/infrastructure/outbound/persistence/repositories/postgres-locality-repository.ts:62`). Fuera de ese catálogo, una carga no se puede publicar (el backend valida los ids de localidad contra su tabla local) ni se puede encontrar.

**Qué pasa en el negocio**: la plataforma sirve solo donde el catálogo dice que sirve. Un transportista que trabaja un corredor no catalogado literalmente no puede operar, y un dador de esa zona no puede publicar. Ampliar la cobertura no es agregar un dato: es una migración, un sincronismo del catálogo y un rebuild de los tres portales. Es un techo de crecimiento con costo de expansión alto, y es también el techo del valor de la calculadora de ahorro, que solo razona sobre los corredores que el producto cubre.

**Mitigación**: decidir explícitamente la estrategia de cobertura (crecer por corredor en vez de por foco geográfico) y automatizar el pipeline de ampliación del catálogo (migración + sync + release); medir la tasa de rechazos por localidad inexistente como señal de demanda no cubierta.

### 🟡 R-04 — Las ofertas no tienen vencimiento y el tablero se ensucia

- **Probabilidad**: Alta · **Impacto**: Medio · **Semáforo**: 🟡

El listado de cargas filtra por disponibilidad y por vencimiento (`smartruck-backend/src/application/builders/load_filters_builder.py:18`), pero la búsqueda no usa ninguno de los dos filtros: trae todas las cargas con `get_all()` y solo mira el estado (`smartruck-backend/src/application/use_cases/loads/search_loads_use_case.py:108` y `smartruck-backend/src/infrastructure/outbound/persistence/repositories/postgres_load_repository.py:117`). Una carga cuyo `delivery_deadline` ya venció sigue apareciendo en los resultados.

**Qué pasa en el negocio**: el transportista encuentra una carga, la toma y descubre que la ventana de carga ya pasó. Cada ocurrencia es una fricción innecesaria en el momento de mayor valor de la relación. Sumado a R-11 (cargas bloqueadas que nunca se liberan), el tablero se degrada hacia inventario muerto, y un tablero con ruido enseña al transportista a desconfiar de los resultados.

**Mitigación**: aplicar el filtro de vencimiento en la búsqueda con el mismo `NotExpiredLoadsFilter` que ya existe; barrido periódico de cargas vencidas y bloqueadas huérfanas; mostrar la ventana de tiempo en la tarjeta de oferta.

### 🟡 R-06 — El precio mostrado puede no ser el cobrado

- **Probabilidad**: Media · **Impacto**: Alto · **Semáforo**: 🟡

El portal del transportista calcula el fee por su cuenta cuando el backend no responde: `(5 + 0.04 × distancia) × 1500`, y le suma un 21% de IVA que el backend nunca cobra (`smartruck-transportista/src/views/checkout/checkout-flow.tsx:96`). El backend calcula el fee sobre la distancia **geodésica** (`smartruck-backend/src/domain/unlock_fee.py:19`), mientras el frontend usa la distancia **vial** que ve en el mapa.

**Qué pasa en el negocio**: hay dos verdades del precio. El total que se muestra al usuario puede no ser el que se cobra, ni en el monto ni en el IVA. Además de la pérdida de plata en el cobro, es un riesgo de precios: en Argentina, el precio publicado debe ser el precio cobrado, y la diferencia entre la pantalla y el cobro es un reclamo esperando a ocurrir.

**Mitigación**: una sola fuente de precio (el backend), con el front consumiendo el fee publicado y nunca recalculándolo; desglose explícito de base, km e IVA; si el backend no responde, no mostrar un monto estimado sino un estado de indisponibilidad.

### 🟡 R-15 — La reputación se puede negociar sin que exista viaje

- **Probabilidad**: Media · **Impacto**: Medio-Alto · **Semáforo**: 🟡

Una carga se puede calificar cuando está entregada **o cuando su `delivery_deadline` venció** (`smartruck-backend/src/domain/models/load.py:51`), y cada actor califica una sola vez por carga (`smartruck-backend/src/application/use_cases/ratings/rate_load_use_case.py:63`). No hay evidencia ni documento que respalde la calificación: es una declaración de las dos partes.

**Qué pasa en el negocio**: un dador que no recibió la carga puede dejar una calificación negativa una vez vencido el plazo, y el transportista que nunca recogió la carga puede devolverla. Como la reputación es el activo que justifica quedarse en la plataforma (R-16), permitir que se negocie sin evidencia destruye el activo: los actores con mejor historial son exactamente los que más pueden perder por una puntuación injusta.

**Mitigación**: atar la calificación a un hito verificable (entrega confirmada o evidencia adjunta) y no al vencimiento del plazo; habilitar la respuesta pública del calificado; ponderar la puntuación por peso del viaje.

### 🟡 R-10 — Riesgo fiscal y de exposición legal sin resolver

- **Probabilidad**: Media · **Impacto**: Medio-Alto · **Semáforo**: 🟡

La plataforma cobra una tarifa por operación y el backend no tiene módulo de facturación electrónica (búsqueda de `factur`, `afip` e `iva` en `smartruck-backend/src`: sin resultados). Al mismo tiempo, el flete se paga fuera de la plataforma, entre las partes, y la plataforma expone los datos de contacto directo tras el desbloqueo.

**Qué pasa en el negocio**: por un lado, cobrar una tarifa electrónica sin respaldo de facturación es una exposición fiscal directa para quien opera el servicio. Por el otro, al aparecer en la cadena de la transacción, la plataforma queda expuesta a reclamos de las partes por hechos que no controla (mercadería dañada, flete no pagado) sin un mecanismo formal de resolución. La posición de "no intervenimos en el flete" protege el modelo de negocio, pero no neutraliza la responsabilidad percibida.

**Mitigación**: documentar el modelo de rol de la plataforma (proveedor de software, no de transporte) en los términos de uso; emitir factura electrónica por la tarifa cobrada; establecer un canal de soporte y una política de reclamo documentada.

### 🟡 R-20 — Inconsistencia entre los números que muestra el producto y los que usa el sistema

- **Probabilidad**: Media · **Impacto**: Medio · **Semáforo**: 🟡

La calculadora de retorno del portal del transportista usa constantes fijas: gasoil 1.200 $/L, consumo 30 L/100km, peaje 35.000 (`smartruck-transportista/src/domain/empty-return-cost.ts:2`). El backend usa otros valores: gasoil 2.000 $/L y 0,3 L/km (`smartruck-backend/src/application/use_cases/loads/search_loads_use_case.py:15`), y tarifa de 2.000 ARS/km (`smartruck-backend/src/domain/models/pricing.py:4`). El propio archivo de la calculadora aclara que es un cálculo provisional hasta que lo haga la API.

**Qué pasa en el negocio**: el producto muestra dos precios de combustible y dos tarifas por kilómetro. La promesa de ahorro —el argumento de venta central— se calcula con supuestos que el propio sistema contradice. Un transportista que chequee los números (y los transportistas chequean los números: es su oficio) encuentra la contradicción y pierde confianza en todo el resto.

**Mitigación**: que la calculadora consuma los mismos valores que usa el backend (o que el backend exponga un endpoint de simulación); mostrar el supuesto con su fecha de vigencia y marcarlo como estimación; versionar los supuestos de mercado.

### 🟡 R-21 — Continuidad: el sistema queda sin equipo ni soporte

- **Probabilidad**: Alta · **Impacto**: Medio-Alto · **Semáforo**: 🟡

El producto y su operación dependen hoy de un equipo de cuatro estudiantes que se gradúa al cierre del cuatrimestre (propuesta, equipo 179). No hay proceso de soporte al usuario, ni guardia, ni SLA, ni plan de continuidad documentado. Varios de los riesgos anteriores (tarifa hardcodeada, catálogo desactualizado, verificaciones atascadas) solo se agravan o se corrigen si alguien los mira.

**Qué pasa en el negocio**: sin dueño de la operación, los incidentes se acumulan y cada uno degrada la confianza de un actor que, por definición, tiene alternativa (WhatsApp). Un marketplace que no responde es un marketplace que se vacía, sin importar cuán bueno era el producto.

**Mitigación**: definir antes del cierre un responsable de operación (rotativo entre los tutores o el equipo), un canal de soporte publicado con tiempos de respuesta, y un checklist de cierre con los puntos que requieren atención continua (tarifa, catálogo, verificaciones pendientes).

---

## Matriz consolidada

Lista ordenada de más a menos severidad. La columna **Acción** resume el primer movimiento concreto; el detalle está en la sección correspondiente.

| ID | Riesgo | Prob. | Impacto | Semáforo | Acción inmediata |
|----|--------|-------|---------|----------|------------------|
| R-01 | Arranque en frío: producción vacía | Alta | Crítico | 🔴 | Siembra inicial en producción + campaña de un corredor |
| R-02 | Sin alerta de cargas por ruta | Alta | Crítico | 🔴 | Canal de aviso por coincidencia de ruta + filtros guardados |
| R-05 | Tarifa de desbloqueo hardcodeada, sin IVA | Alta | Crítico | 🔴 | Tarifa como configuración editable, con vigencia |
| R-11 | Bloqueo sin TTL y sin validación de estado | Alta | Crítico | 🔴 | TTL de bloqueo + transición de estado válida |
| R-13 | La carga reservada no se puede cancelar | Media | Crítico | 🔴 | Estado `cancelada` con actor y motivo + liberación de flota |
| R-16 | Sin garantía ni seguro: el puenteo es el camino por defecto | Alta | Crítico | 🔴 | Mecánica de reputación no negociable + plan de póliza |
| R-17 | Verificación manual, cuello de botella de una persona | Alta | Crítico | 🔴 | Autoaprobación de CUIT + revisión por lotes + SLA |
| R-14 | Plataforma ciega después del desbloqueo | Alta | Alto | 🔴 | Hitos de viaje con autor y evidencia |
| R-18 | Matching en memoria sobre todo el catálogo | Media | Alto | 🔴 | Filtro por proximidad en base + medir p95 |
| R-19 | Sin PWA ni modo offline | Alta | Alto | 🔴 | Service worker + cola offline de hitos |
| R-09 | Ticket chico frente a costos fijos y comisión | Media-Alta | Alto | 🔴 | Modelo de equilibrio con números reales |
| R-07 | El fee no se devuelve ni se disputa | Media | Crítico | 🔴 | Política de devolución + compensación automática |
| R-08 | Pago no idempotente ni validado | Media | Crítico | 🔴 | Clave de idempotencia + validación de estado al cobrar |
| R-12 | Identidad transaccional desde la URL, rutas sin sesión | Media | Crítico | 🔴 | Actor desde el token + sesión en rutas de transacción |
| R-03 | Cobertura geográfica cerrada (150 localidades) | Alta | Alto | 🟡 | Estrategia de cobertura por corredor + pipeline automatizado |
| R-06 | El precio mostrado puede no ser el cobrado | Media | Alto | 🟡 | Una sola fuente de precio (backend) |
| R-15 | Reputación negociable sin evidencia | Media | Medio-Alto | 🟡 | Calificación atada a hito verificable |
| R-10 | Riesgo fiscal y de exposición legal | Media | Medio-Alto | 🟡 | Facturación electrónica + términos de uso + canal de reclamos |
| R-04 | Ofertas sin vencimiento en la búsqueda | Alta | Medio | 🟡 | Aplicar filtro de vencimiento + barrido de huérfanas |
| R-20 | Números del producto contradicen al sistema | Media | Medio | 🟡 | Calculadora contra los valores del backend |
| R-21 | Continuidad sin equipo ni soporte | Alta | Medio-Alto | 🟡 | Dueño de operación + checklist de cierre |

### Lectura por probabilidad

- **Probabilidad alta** (11): R-01, R-02, R-03, R-04, R-05, R-11, R-14, R-16, R-17, R-19, R-21. Son condiciones que el sistema tiene hoy escritas en el código o que son consecuencia directa de cómo se opera.
- **Probabilidad media-alta** (1): R-09, que depende del volumen de transacciones y del mix de tickets.
- **Probabilidad media** (8): R-06, R-07, R-08, R-10, R-12, R-15, R-18, R-20. Todas con un disparador concreto (concurrencia, abandono de una de las partes, un tercero, o el simple paso del tiempo).
- **Probabilidad baja**: ninguno. Ningún riesgo de este documento depende de un evento excepcional: todos son el comportamiento normal del sistema bajo carga o bajo abandono.

### Riesgos que se pueden cubrir sin tocar el producto

Un subconjunto importante se resuelve con proceso y no con código, y por lo tanto no debería competir con el backlog técnico:

- R-01 (campaña de lanzamiento y siembra).
- R-07 (política de devolución publicada y aplicada a mano al principio).
- R-10 (términos de uso, factura electrónica, canal de reclamos).
- R-16 (definición de qué es la promesa de la plataforma hacia el transportista).
- R-21 (dueño de operación y checklist de cierre).

---

## Trazabilidad

- Propuesta original: `Equipo179_PropuestaTrabajoProfesional_1c2026.docx.txt`.
- Arquitectura implementada: [Arquitectura](./arquitectura.md).
- Descripción del proyecto: [Descripción del proyecto](./proyecto.md).
- Repositorios y particularidades: [Repositories](./repositories/README.md).
