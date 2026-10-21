# Riesgos del proyecto Smartruck

## Criterio de inclusión

Un ítem entra en la Tabla A solo si cumple las dos condiciones:

1. Puede producir un resultado negativo **de negocio o de operación** (plata, carga, reputación, cobertura, confianza, disponibilidad, datos).
2. **No está ya decidido y planificado** en un ADR o en el backlog. Si hay una decisión tomada, el ítem va a la Tabla B.

Un bug que no cambia el resultado comercial se trata como incidencia y no entra.

### Escalas

| Dimensión | Valores | Criterio |
|-----------|---------|----------|
| Probabilidad | Alta | La condición que lo dispara ya existe en el sistema o es el estado por defecto. |
| | Media | Requiere un disparador concreto (concurrencia, un tercero, una falla de proveedor, un deploy). |
| | Baja | Requiere una cadena de eventos poco habitual. |
| Impacto | Crítico | Se pierde el modelo de negocio: la carga no se vende, la plata se quema o la confianza se rompe de forma estructural. |
| | Alto | Pérdida material acotada (un viaje, un transportista, un corredor) o daño reputacional sensible. |
| | Medio-Alto | Molestia operativa con costo o imagen reputacional menor. |
| | Medio | Pérdida de eficiencia o fricción, sin efecto directo sobre la transacción. |

### Semáforo

Se conserva el criterio de la propuesta original:

- 🔴 **Rojo**: alta probabilidad con impacto crítico o alto, o probabilidad media con impacto crítico.
- 🟡 **Amarillo**: probabilidad media con impacto alto o medio-alto, o probabilidad alta con impacto medio, o probabilidad baja con impacto crítico.
- 🟢 **Verde**: combinaciones menores.

---

## Estado de los riesgos de la propuesta original

| Riesgo (propuesta) | Mitigación prevista | Estado en el sistema implementado |
|---|---|---|
| Condición de carrera en el Unlock | Locking optimista | **Mitigada por diseño de estado, no por locking.** Cuando un transportista bloquea, la carga pasa a `bloqueada` y deja de aparecer en la búsqueda, así que no hay dos transportistas compitiendo por la misma carga. Queda un residuo: el bloqueo no tiene vencimiento y no valida el estado previo (R-11). |
| Tercerización ("puenteo") | Transparencia y baja recurrencia del recorrido | **Vigente, y es de negocio.** La mitigación era técnica; el problema real es que no hay garantía, ni seguro por viaje, ni salida del pago (R-16). |
| Saturación por consultas geoespaciales | Índices espaciales | **Resuelta por decisión de arquitectura.** El ADR-001 (decisión D4) define el matching con PostGIS dentro del backend para el MVP, con vista `matching_loads` e índices GiST. Es trabajo planificado (Tabla B), no riesgo. |
| Inconsistencia en webhooks de pago | Claves de idempotencia | **Reformulada.** La firma del webhook se valida correctamente; el problema real es que no hay reconciliación del lado del servidor y el estado interno puede divergir del de MercadoPago (R-08). |

---

## Riesgos de negocio y técnicos

Ordenados por severidad, de más grave a menos grave.

### 🔴 R-16 — No hay garantía ni seguro de carga: el puenteo es el camino por defecto

- **Probabilidad**: Alta · **Impacto**: Crítico · **Semáforo**: 🔴

**Evidencia**: la propuesta justificaba el modelo "la plataforma no intermedia en el flete" con un blindaje de pólizas de seguro por viaje. En el sistema implementado no hay emisión de póliza ni servicio de seguro: lo único relacionado es un tipo de documento que el usuario puede subir (`INSURANCE_POLICY`, `smartruck-backend/src/domain/models/document.py:9`). Tampoco hay escrow, ni prueba de entrega por viaje, ni garantía de pago del flete.

**Qué pasa en el negocio**: la razón por la que un transportista dejaría de usar un grupo de WhatsApp —que la transacción tenga respaldo— no existe. El unlock fee es un costo puro frente a un WhatsApp gratuito. Salvo que la reputación dentro de la plataforma tenga valor real, el camino racional es cerrar el trato fuera y volver al grupo: **el riesgo de tercerización no se mitigó, se volvió el comportamiento por defecto**. Lo único que empuja a quedarse es la reputación, y esa reputación depende de viajes que el producto no puede garantizar (R-15).

**Mitigación**: sostener la promesa con lo que sí se controla —verificación obligatoria de ambos lados, historial visible con reseñas atadas a evidencia— y dejar la póliza por viaje como objetivo de mediano plazo, financiada con parte del fee.

### 🔴 R-11 — El bloqueo de oferta no tiene vencimiento ni valida el estado previo

- **Probabilidad**: Alta · **Impacto**: Crítico · **Semáforo**: 🔴

**Evidencia**: `LockLoadUseCase.lock` no mira el estado actual de la carga: la marca `bloqueada` y le asigna el transportista que viene en la URL (`smartruck-backend/src/application/use_cases/loads/lock_load_use_case.py:25`). No hay TTL ni marca de tiempo. La liberación depende de que el cliente llame explícitamente a `abort-lock`, algo que solo ocurre si el transportista cierra el drawer (`smartruck-transportista/src/views/loads/load-drawer.tsx:155`). Mientras la carga está `bloqueada` no aparece en la búsqueda (`smartruck-backend/src/application/use_cases/loads/search_loads_use_case.py:109`).

**Qué pasa en el negocio**: el bloqueo sí evita la carrera (la carga desaparece del tablero), pero deja dos problemas. Primero: un transportista que abre el checkout y cierra la pestaña deja la oferta **fuera del mercado de forma permanente**. Segundo: como el bloqueo no valida el estado, un transportista puede bloquear una carga que ya estaba reservada y pagada por otro, pisando la reserva y el pago acreditado. En un tablero con volumen bajo, cada oferta muerta es una venta perdida y una excusa para volver al canal informal.

**Mitigación**: TTL de bloqueo con liberación automática (por ejemplo 15 minutos, alineado con la expiración de la preferencia de MercadoPago, que ya existe: `smartruck-backend/src/infrastructure/outbound/gateways/mercadopago_payment_gateway.py:66`); validar la transición `activa` → `bloqueada` antes de bloquear.

### 🔴 R-13 — Una carga reservada no se puede cancelar: el viaje que no ocurre deja todo bloqueado

- **Probabilidad**: Media · **Impacto**: Crítico · **Semáforo**: 🔴

**Evidencia**: el estado de la carga no tiene `cancelada` ni `rechazada` (`smartruck-backend/src/domain/load_status.py:4`). El dador solo puede pasar `entregada` → `entrega_confirmada` (`smartruck-backend/src/application/use_cases/manage_load_by_offerer_use_case.py:44`), y el transportista solo puede mover la carga a `en_camino`, `demorada` o `entregada` (`smartruck-backend/src/application/use_cases/manage_load_by_transporter_use_case.py:58`). El camión queda `ocupado` hasta que la carga llega a `entregada` (`smartruck-backend/src/application/use_cases/loads/assign_truck_to_load_use_case.py:29` y `manage_load_by_transporter_use_case.py:98`).

**Qué pasa en el negocio**: si el viaje se cae (el dador no aparece, la mercadería no está, el transportista se arrepiente), **no existe ninguna salida**. El transportista queda con el camión bloqueado, una carga reservada que no puede iniciar y el unlock fee pagado. El dador tampoco puede liberar la oferta. Ambos quedan atrapados en un error que el producto no sabe resolver y que se resuelve por teléfono: es el peor momento posible para la reputación.

**Mitigación**: agregar el estado `cancelada` con actor y motivo; liberar camión y semirremolque automáticamente; definir la regla de devolución del fee según quién cancela y en qué momento.

### 🔴 R-07 — El unlock fee no se devuelve y no hay mecanismo de disputa

- **Probabilidad**: Media · **Impacto**: Crítico · **Semáforo**: 🔴

**Evidencia**: no existe refund, ni chargeback, ni estado de disputa en el backend (búsqueda de `refund`, `reembolso`, `chargeback` y `disputa` en `smartruck-backend/src`: sin resultados). La propuesta sí lo prometía: "si alguna de las dos partes decide retirarse o cancelar por distintos motivos, el dinero será devuelto".

**Qué pasa en el negocio**: el unlock fee es un pago sin cobertura. Si el transportista paga y el dador no aparece, la plata se pierde. Si el transportista paga y después se arrepiente, la plata se pierde. Cada caso se convierte en un reclamo que la plataforma no tiene cómo contestar, y un reclamo sin respuesta es una razón excelente para volver al canal informal. El fee deja de ser "el precio de acceder a la oportunidad" y pasa a ser "el peaje que se paga por el riesgo".

**Mitigación**: definir y construir la política de devolución (plazo, responsable, casos); devolver el fee cuando la carga se cancela por responsabilidad del dador; registrar los pagos aprobados sin carga reservada para poder compensarlos.

### 🔴 R-08 — El estado interno del pago puede divergir del de MercadoPago

- **Probabilidad**: Media · **Impacto**: Crítico · **Semáforo**: 🔴

**Evidencia**: la firma del webhook se valida bien (`smartruck-backend/src/infrastructure/inbound/http_controllers/payments_controller.py:141`) y el unlock revalida contra MercadoPago antes de reservar (`smartruck-backend/src/application/use_cases/loads/unlock_load_use_case.py:46`). Lo que falta es la reconciliación: no hay ningún barrido del lado del servidor que compare los pagos locales con los del proveedor. La única reparación automática es el webhook, y la única reparación manual es que el transportista siga con la app abierta y llame a `POST /payments/{id}/sync` (`payments_controller.py:203`). Además, `ProcessPaymentNotificationUseCase.process` sobrescribe el estado local con el que informe el proveedor en ese momento, sin impedir una regresión (`smartruck-backend/src/application/use_cases/payments/process_payment_notification_use_case.py:19`), y la preferencia declara una `back_urls.pending` (`mercadopago_payment_gateway.py:55`), o sea que hay métodos de pago cuyo ciclo no llega a `approved` de inmediato.

**Qué pasa en el negocio**: si el webhook se pierde, el transportista ya pagó pero el sistema sigue viendo el pago como `PENDING`: la carga queda `bloqueada` (R-11) y la oferta muere. Nadie se entera hasta que alguien reclama. Con un pago en estado `pending` (por ejemplo, una transferencia), el desbloqueo se rechaza hasta que el proveedor lo aprueba, y si el transportista se va, la plata queda en el limbo del proveedor y la carga bloqueada.

**Mitigación**: barrido de reconciliación periódico que compare pagos locales con MercadoPago y marque los divergentes; no permitir que el estado local retroceda (ignorar notificaciones tardías); manejar explícitamente el estado `pending` con una espera visible para el usuario en lugar de un rechazo.

### 🔴 R-12 — La identidad transaccional viene de la URL y las rutas críticas no validan al usuario

- **Probabilidad**: Media · **Impacto**: Crítico · **Semáforo**: 🔴

**Evidencia**: las rutas de bloqueo, desbloqueo y abort-lock reciben el `transporter_id` como parámetro de path y no declaran ninguna dependencia de autenticación (`smartruck-backend/src/infrastructure/inbound/http_controllers/loads_controller.py:903` a `:943`). El API Gateway es público y sin política de seguridad (`smartruck-infra/modules/api_gateway/main.tf`, "Punto de entrada público SMARTRUCK"), y tampoco tiene rate limiting (la única regla de WAF vive en la zona de Cloudflare y cubre otro host, ver R-26).

**Qué pasa en el negocio**: un tercero puede bloquear ofertas (denegación de servicio sobre un inventario que es escaso por definición), suplantar a un transportista en un desbloqueo y generar o contestar disputas a nombre de terceros. Con un modelo basado en reputación y cobro, esto no es un detalle de seguridad: es un riesgo de integridad del marketplace. Un solo incidente de suplantación publicado alcanza para romper la confianza de los transportistas legítimos.

**Mitigación**: derivar el actor del token verificado y eliminar el `transporter_id` del path; exigir sesión en todas las rutas transaccionales; verificar que el actor coincide con el dueño de la oferta bloqueada.

### 🔴 R-28 — Fraude de dador: cobrar el unlock fee y no despachar

- **Probabilidad**: Media · **Impacto**: Crítico · **Semáforo**: 🔴

**Evidencia**: la publicación de cargas no tiene límite por oferente, ni velocity check, ni detección de patrón; el desbloqueo se produce contra un pago aprobado y el contacto se entrega después (`smartruck-backend/src/application/use_cases/loads/unlock_load_use_case.py:57`). La verificación es de identidad del usuario, no de solvencia ni de existencia de la carga.

**Qué pasa en el negocio**: el modelo: cobrar antes de que exista el flete es exactamente el incentivo del atacante. Un dador falso publica una carga atractiva, cobra el unlock fee a varios transportistas, entrega datos de contacto que no atienden y desaparece. El transportista pierde la plata; el daño se propaga como "...esa plataforma te hace perder plata". Con pocos usuarios, un solo caso de este tipo quema la confianza del lado de la oferta, que es el más difícil de recuperar. La probabilidad crece con el volumen: el fraude es más rentable cuando hay más transportistas mirando el tablero.

**Mitigación**: límites de publicaciones y de desbloqueos por oferente con alerta; encuesta de satisfacción post-viaje que detecte cargas fantasma; verificación reforzada para dadores nuevos o sin historial; registro auditado de los documentos y del contacto entregado.

### 🔴 R-29 — Cobro sin control previo: doble preferencia o pago de una oferta ajena

- **Probabilidad**: Media · **Impacto**: Crítico · **Semáforo**: 🔴

**Evidencia**: `CreatePaymentUseCase.create` no valida ni el estado de la carga ni quién la bloqueó: crea un `Payment` nuevo con un `uuid4` por llamada y abre una preferencia de MercadoPago (`smartruck-backend/src/application/use_cases/payments/create_payment_use_case.py:23`). La ruta `POST /payments` no declara dependencia de autenticación (`payments_controller.py:173`).

**Qué pasa en el negocio**: un doble clic o un reintento del navegador abre dos preferencias para la misma oferta y el transportista puede pagar dos veces. Peor: se puede pagar una oferta que no está bloqueada por quien paga, o que ya fue reservada por otro. En los dos casos la plata sale y la reserva no llega: la pérdida la asume el transportista.

**Mitigación**: clave de idempotencia por transportista y oferta; validar `bloqueada` + `transporter_id` antes de crear la preferencia; rechazar la creación si ya hay un pago aprobado para esa oferta.

### 🔴 R-17 — La verificación manual es el cuello de botella del ingreso y depende de una sola persona

- **Probabilidad**: Alta · **Impacto**: Crítico · **Semáforo**: 🔴

**Evidencia**: toda operación del negocio exige perfil `VERIFIED`: `require_verified_offerer` y `require_transporter` rechazan con 403 a quien no lo esté (`smartruck-backend/src/infrastructure/inbound/dependencies/authentication.py:170` y `:192`). El alta nace en `PENDING` (`smartruck-backend/src/application/use_cases/transporters/create_transporter_use_case.py:25`) y el único que puede promoverlo es un administrador del backoffice revisando documentos uno por uno (`smartruck-backend/src/application/use_cases/admin/verify_user_use_case.py`). El rol `ADMIN` es un atributo del token (`authentication.py:144`).

**Qué pasa en el negocio**: el tiempo entre el registro y la primera operación no depende del sistema, depende de una agenda humana. En una campaña de lanzamiento con cientos de registros, la verificación se vuelve el cuello de botella de la liquidez: los transportistas se registran, quedan esperando y no pueden trabajar. Y como la aprobación depende de una sola persona con rol `ADMIN`, hay riesgo de persona clave: si esa persona no está, nadie verifica y nadie entra.

**Mitigación**: revisión por lotes con criterios y plantillas; autoaprobación de CUIT válido contra la fuente fiscal; SLA de verificación publicado; más de un administrador con capacidad de aprobar.

### 🔴 R-32 — Un flag de build puede dejar el portal en modo demo

- **Probabilidad**: Media · **Impacto**: Crítico · **Semáforo**: 🔴

**Evidencia**: los tres portales eligen entre adaptadores reales y adaptadores en memoria según `VITE_USE_STUB === "true"` (`smartruck-transportista/src/infrastructure/config/configuration.ts:44`, aplicado en nueve repositorios de `composition.ts`, incluidos documentos y perfil). Ese valor llega como **build argument** desde un secreto de GitHub (`smartruck-dador/.github/workflows/pipeline.yml:139`: `--build-arg "VITE_USE_STUB=${VITE_USE_STUB:-false}"`). Como se hornea en la imagen, cambiarlo exige un rebuild.

**Qué pasa en el negocio**: si el valor queda en `true` al construir producción, la imagen publicada sirve **cargas, ciudades, perfil y pagos falsos**. El transportista entra a un tablero de demostración, y el dador publica contra datos que nadie ve. Es el peor modo de falla posible: la aplicación responde 200, los tests pasan y el pipeline queda en verde. No hay ninguna aserción de arranque que rechace el modo stub en producción.

**Mitigación**: fallar el arranque si `useStub` es verdadero y el ambiente es `production`; mover el flag a una variable de ambiente documentada por ambiente en lugar de un secreto; agregarlo a la checklist de despliegue y verificar la imagen publicada antes de promoverla.

### 🔴 R-25 — Los secretos del pipeline quedan expuestos en los logs

- **Probabilidad**: Media-Alta · **Impacto**: Alto · **Semáforo**: 🔴

**Evidencia**: el deploy pasa los secretos como argumentos de línea de comandos: `gcloud run deploy ... --set-env-vars="^@@^DATABASE_URL=${DATABASE_URL}@@SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}@@MERCADOPAGO_ACCESS_TOKEN=${MERCADOPAGO_ACCESS_TOKEN}@@..."` (`smartruck-backend/.github/workflows/pipeline.yml:292`). Los valores vienen de Infisical (`Infisical/secrets-action`), no de secretos de GitHub, y por lo tanto **GitHub no los enmascara** en la salida del step.

**Qué pasa en el negocio**: quedan en el log del pipeline el acceso a la base, la service role key de Supabase (que administra usuarios y Storage) y el access token de MercadoPago (que cobra y recibe plata). Cualquiera con acceso al log del workflow —o el propio historial del runner self-hosted— puede tomar el control de la plataforma: cobrar, leer datos personales y acceder a la base. El equipo además rota los secretos con dificultad, porque no sabe cuáles quedaron expuestos.

**Mitigación**: pasar los secretos por archivo o por Secret Manager y referenciarlos desde la configuración, sin interpolarlos en el comando; revisar y rotar las credenciales expuestas; activar el enmascarado de secretos de Infisical en el runner.

### 🔴 R-22 — El smoke test solo verifica la versión: una integración rota llega a producción

- **Probabilidad**: Media · **Impacto**: Alto · **Semáforo**: 🔴

**Evidencia**: `scripts/smoke_test.sh` hace un `GET /version` y espera que el cuerpo contenga la versión del release. No toca la base, ni MercadoPago, ni Storage, ni el geo-service. El pipeline lo corre después de desplegar (y también antes, esperando la versión) y da por bueno el ambiente si esa respuesta llega (`smartruck-backend/.github/workflows/pipeline.yml:295`).

**Qué pasa en el negocio**: un release sin `SUPABASE_SERVICE_ROLE_KEY`, con un token de MercadoPago vencido, con el bucket `documents` inexistente o con el geo-service caído pasa el pipeline en verde y llega a producción. El defecto se descubre cuando un transportista intenta desbloquear y recibe un 500: es el usuario el detector de regresiones. Ya ocurrió: hubo que propagar `SUPABASE_SERVICE_ROLE_KEY` a los comandos de deploy porque el `gcloud deploy` no lo incluía.

**Mitigación**: extender el smoke test a un chequeo de dependencias reales (crear una preferencia de pago de prueba contra MercadoPago, firmar una URL de Storage, pedir una ruta al geo-service); correr los tests de aceptación contra el ambiente desplegado, no solo contra el código.

### 🔴 R-23 — Las migraciones se aplican contra producción antes de desplegar, y no hay reversión

- **Probabilidad**: Media · **Impacto**: Alto · **Semáforo**: 🔴

**Evidencia**: el job de producción aplica las migraciones de Alembic contra la base de Supabase de prod y recién después despliega la imagen nueva (`smartruck-backend/.github/workflows/pipeline.yml:266` a `:294`). Mientras la migración corre, la revisión anterior del servicio sigue atendiendo tráfico. No hay snapshot previo de la base ni migraciones de bajada.

**Qué pasa en el negocio**: si una migración no es retrocompatible con la versión que está sirviendo (por ejemplo, renombra una columna o cambia un tipo), el servicio en vivo se rompe **antes** de que exista el código que la usa. Con el backend caído, no hay desbloqueos, no hay cotizaciones y no hay búsquedas: la plataforma entera se cae por una migración. Y como no hay reversión, la única salida es un fix forward en caliente.

**Mitigación**: aplicar las migraciones de forma compatible hacia atrás (expand/contract); tomar un snapshot de la base antes de migrar en prod; separar el job de migración del job de deploy y poder correrlos en otro orden; documentar el procedimiento de reversión.

### 🔴 R-14 — Después del desbloqueo la plataforma queda ciega

- **Probabilidad**: Alta · **Impacto**: Alto · **Semáforo**: 🔴

**Evidencia**: al desbloquear, el sistema marca la carga como `reservada`, expone los datos de contacto y notifica al dador (`smartruck-backend/src/application/use_cases/loads/unlock_load_use_case.py:57`). No hay registro de que el flete se pagara, ni comprobante de retiro, ni documento de entrega atado a la carga: los estados los declara cada parte (`smartruck-backend/src/application/use_cases/manage_load_by_transporter_use_case.py:86`). El tipo de documento `WAYBILL` existe (`smartruck-backend/src/domain/models/document.py:9`), pero la tabla `documents` no tiene `load_id` (`smartruck-backend/src/infrastructure/outbound/persistence/models/document.py:6`): el remito existe, pero no está atado a un viaje, así que no sirve como prueba de una carga concreta.

**Qué pasa en el negocio**: el punto exacto donde se mueven la carga y el dinero es el punto donde Smartruck deja de tener visibilidad. Sin trazabilidad no hay base para resolver una disputa, ni para cobrar un seguro, ni para construir un historial confiable, ni para mejorar el matching con datos reales de viajes. La plataforma cobra una tarifa y después no sabe qué pasó.

**Mitigación**: registrar hitos del viaje con autor y timestamp (reserva, retiro, llegada, entrega) y atar el remito a la carga (`load_id` en `documents`); generar un comprobante de entrega por la plataforma, que es el insumo de las "pruebas de entrega electrónicas" de la propuesta.

### 🔴 R-09 — El ticket es chico frente a la comisión y los costos fijos de la operación

- **Probabilidad**: Media-Alta · **Impacto**: Alto · **Semáforo**: 🔴

**Evidencia**: el ingreso por desbloqueo es 5 USD + 0,04 USD/km: para un viaje de 500 km, unos 25 USD. La plataforma no cobra comisión sobre el flete (decisión de diseño del modelo). El costo es de estructura fija: cuatro portales en Render, Cloud Run, Datadog, Cloudflare Workers, Mapbox, Supabase y MercadoPago, este último con comisión porcentual más un cargo fijo por ticket.

**Qué pasa en el negocio**: con un ticket de ~25 USD, el cargo fijo de la pasarela se lleva una porción material del ingreso, y el resto tiene que cubrir infraestructura y soporte sin margen de error. El modelo no financia el crecimiento: necesita volumen, el volumen necesita liquidez, y la liquidez necesita al transportista que ya está midiendo su ROI con la calculadora (R-20).

**Mitigación**: modelar el punto de equilibrio con números reales (costo fijo mensual, costo por desbloqueo, comisión efectiva) antes de decidir cualquier inversión; explorar un cobro por publicación de carga (hoy gratuita) como fuente complementaria.

### 🔴 R-06 — El precio mostrado puede no ser el cobrado

- **Probabilidad**: Media · **Impacto**: Alto · **Semáforo**: 🔴

**Evidencia**: el portal del transportista calcula el fee por su cuenta cuando el backend no responde: `(5 + 0.04 × distancia) × 1500`, y le suma un 21% de IVA que el backend nunca cobra (`smartruck-transportista/src/views/checkout/checkout-flow.tsx:96`). El backend calcula el fee sobre la distancia **geodésica** (`smartruck-backend/src/domain/unlock_fee.py:19`), mientras el frontend usa la distancia **vial** que ve en el mapa.

**Qué pasa en el negocio**: hay dos verdades del precio. El total que se muestra puede no ser el que se cobra, ni en el monto ni en el IVA. Además de la pérdida de plata en el cobro, es un riesgo de precios: el precio publicado tiene que ser el precio cobrado, y la diferencia entre la pantalla y el cobro es un reclamo esperando a ocurrir.

**Mitigación**: una sola fuente de precio (el backend), con el front consumiendo el fee publicado y nunca recalculándolo; desglose explícito de base, kilómetros e IVA; si el backend no responde, mostrar indisponibilidad en lugar de un monto estimado.

### 🟡 R-30 — El dador no puede elegir transportista: gana el primero que desbloquea

- **Probabilidad**: Alta · **Impacto**: Medio-Alto · **Semáforo**: 🟡

**Evidencia**: el flujo implementado es de un solo ganador: el transportista bloquea, paga y reserva. No hay puja, ni contraoferta, ni ranking de candidatos, ni un endpoint que exponga varios transportistas interesados a un mismo dador. La cotización existente (`POST /loads/quote`) es el dador calculando el precio de su propia carga, no un transportista ofertando por ella.

**Qué pasa en el negocio**: la propuesta vendía negociación directa entre las partes; el producto implementado es un asignación por orden de llegada. El dador no puede comparar, no puede elegir por flota ni por reputación y no puede rechazar a un transportista que le sirve: queda el único camino, aceptar. Y el transportista compite por velocidad, no por precio ni por calidad. Es una de las razones por las que la plataforma no se vuelve indispensable (R-16).

**Mitigación**: exponer al dador los transportistas interesados (con reputación y flota) antes de que se pague el fee; permitir una contraoferta dentro de la plataforma; registrar la intención del transportista de forma gratuita, separándola del acceso de contacto.

### 🟡 R-26 — El rate limit de Cloudflare no cubre los endpoints que se usan

- **Probabilidad**: Media · **Impacto**: Medio-Alto · **Semáforo**: 🟡

**Evidencia**: la única regla de WAF matchea `starts_with(http.request.uri.path, "/routes")` para los hosts `api.smartruck.tech` y `api-test.smartruck.tech` (`smartruck-infra/modules/cloudflare_waf/main.tf`). Pero el geo-service expone y los consumidores llaman `/geo/routes`, `/geo/routes/batch` y `/geo/localities/*` (`smartruck-transportista/src/infrastructure/outbound/http/http-axios-route-repository.ts:16`, `smartruck-backend/src/infrastructure/outbound/http_client/routes_service_distance.py:64`). `/routes` quedó como alias legacy.

**Qué pasa en el negocio**: la protección que se construyó para el servicio de rutas no alcanza a las rutas que realmente se consumen. Un script puede pedir rutas y cotizaciones sin límite y agotar la cuota de Mapbox que la plataforma paga, degradando la cotización y la distancia de todos los usuarios. El mismo razonamiento aplica al API Gateway del backend, que está en otro host y no tiene ninguna regla de rate limiting.

**Mitigación**: corregir la expresión de la regla para cubrir `/geo/` y `/routes`; agregar rate limiting en el borde del API Gateway; cachear en el Worker las respuestas de Mapbox para acotar el consumo de cuota.

### 🟡 R-27 — El pool de conexiones no está dimensionado frente a las instancias de producción

- **Probabilidad**: Media · **Impacto**: Medio-Alto · **Semáforo**: 🟡

**Evidencia**: el motor se crea sin dimensionar el pool: `create_engine(url, pool_pre_ping=True)` (`smartruck-backend/src/infrastructure/outbound/persistence/engine.py:15`), con los valores por defecto de SQLAlchemy (5 conexiones más 10 de overflow por instancia). En producción Cloud Run corre con `max_instances = 5` (`smartruck-infra/environments/prod/variables.tf`) y `max_instance_request_concurrency = 80` (`smartruck-infra/modules/cloud_run/main.tf`). No se configura `pool_size`, `max_overflow` ni `pool_recycle`, y no hay verificación de que `DATABASE_URL` apunte al pooler de Supabase y no a la conexión directa.

**Qué pasa en el negocio**: en un pico de tráfico, las cinco instancias pueden abrir hasta 75 conexiones. Si apuntan a la conexión directa de Supabase, se agota el límite de conexiones del proyecto y el backend empieza a responder con errores de conexión: el mismo efecto de una caída, pero causado por el propio crecimiento de uso.

**Mitigación**: dimensionar el pool según el límite real de conexiones (`pool_size`, `max_overflow`, `pool_recycle`); apuntar al pooler en modo transaction; bajar `max_instance_request_concurrency` o el número de instancias en consecuencia; monitorear el uso de conexiones.

### 🟡 R-10 — Riesgo fiscal y de exposición legal sin resolver

- **Probabilidad**: Media · **Impacto**: Medio-Alto · **Semáforo**: 🟡

**Evidencia**: la plataforma cobra una tarifa por operación y el backend no tiene módulo de facturación electrónica (búsqueda de `factur`, `afip` e `iva` en `smartruck-backend/src`: sin resultados). Al mismo tiempo, el flete se paga fuera de la plataforma y la plataforma expone los datos de contacto directo tras el desbloqueo.

**Qué pasa en el negocio**: por un lado, cobrar una tarifa electrónica sin respaldo de facturación es una exposición fiscal directa para quien opera el servicio. Por el otro, al aparecer en la cadena de la transacción, la plataforma queda expuesta a reclamos por hechos que no controla (mercadería dañada, flete no pagado) sin un mecanismo formal de resolución. La posición de "no intervenimos en el flete" protege el modelo de negocio, pero no neutraliza la responsabilidad percibida.

**Mitigación**: documentar el rol de la plataforma (proveedor de software, no de transporte) en los términos de uso; emitir factura electrónica por la tarifa cobrada; establecer un canal de soporte y una política de reclamo documentada.

### 🟡 R-15 — La reputación se puede negociar sin que exista viaje

- **Probabilidad**: Media · **Impacto**: Medio-Alto · **Semáforo**: 🟡

**Evidencia**: una carga se puede calificar cuando está entregada **o cuando su `delivery_deadline` venció** (`smartruck-backend/src/domain/models/load.py:51`), y cada actor califica una sola vez por carga (`smartruck-backend/src/application/use_cases/ratings/rate_load_use_case.py:63`). No hay evidencia ni documento que respalde la calificación: es una declaración de las dos partes.

**Qué pasa en el negocio**: un dador que no recibió la carga puede dejar una calificación negativa una vez vencido el plazo, y el transportista que nunca recogió la carga puede devolverla. Como la reputación es el activo que justifica quedarse en la plataforma (R-16), permitir que se negocie sin evidencia destruye el activo: los actores con mejor historial son exactamente los que más pueden perder por una puntuación injusta.

**Mitigación**: atar la calificación a un hito verificable (entrega confirmada o evidencia adjunta) y no al vencimiento del plazo; habilitar la respuesta pública del calificado; ponderar la puntuación por peso del viaje.

### 🟡 R-31 — Datos personales y documentos sin política de protección de datos

- **Probabilidad**: Media · **Impacto**: Medio-Alto · **Semáforo**: 🟡

**Evidencia**: la plataforma almacena constancias de CUIT, pólizas de seguro y remitos en un bucket privado de Supabase Storage, con URLs firmadas de 10 minutos (`smartruck-backend/src/domain/models/document.py:6`, `smartruck-backend/src/infrastructure/outbound/gateways/supabase_storage_gateway.py:72`), expone datos de contacto de las partes tras el desbloqueo y registra IP y actor en la auditoría de documentos (`smartruck-backend/src/infrastructure/outbound/persistence/models/document.py:25`). En la documentación y en los tres portales no hay aviso de privacidad, términos y condiciones ni consentimiento (búsqueda de `privacidad`, `términos` y `consentimiento` en `docs/` y en los portales: sin resultados).

**Qué pasa en el negocio**: se guardan datos personales de terceros sin información al usuario, sin base de consentimiento y sin política de tratamiento, en un contexto que además se expone públicamente. Desde el punto de vista legal, hay exposición a la normativa de protección de datos y a reclamos de los titulares de los documentos. Desde el punto de vista operativo, una filtración de ese bucket expone constancias de CUIT y pólizas de transportistas: un incidente así destruye la confianza en el canal verificado, que es el activo central del producto.

**Mitigación**: aviso de privacidad y términos de uso versionados, con consentimiento explícito en el alta; inventario de datos personales y política de retención; registro de auditoría consultable y alertas sobre accesos anómalos; evaluar la necesidad de cifrar el bucket o delegar la custodia documental.

### 🟡 R-21 — Continuidad: sin equipo, sin soporte y con las cuentas atadas a personas

- **Probabilidad**: Alta · **Impacto**: Medio-Alto · **Semáforo**: 🟡

**Evidencia**: el producto y su operación dependen hoy de un equipo de cuatro estudiantes que se gradúa al cierre del cuatrimestre (propuesta, equipo 179). No hay proceso de soporte al usuario, ni guardia, ni SLA, ni plan de continuidad. Las cuentas de terceros que hacen funcionar la plataforma (MercadoPago para cobrar, Cloudflare para el DNS y el geo-service, GCP para el deploy, Supabase para datos y auth, Render para los portales, Datadog para los logs) están a nombre de personas o de cuentas sin institución detrás.

**Qué pasa en el negocio**: sin dueño de la operación, los incidentes se acumulan y cada uno degrada la confianza de un actor que, por definición, tiene alternativa (WhatsApp). Y si la titularidad de las cuentas es personal, no hay continuidad posible: el día que el equipo se disuelve, se pierde el cobro, el DNS o el despliegue, no solo el código. Es el riesgo que convierte todos los demás en irrecuperables.

**Mitigación**: transferir la titularidad de las cuentas a una organización o a los tutores antes del cierre; definir un responsable de operación y un canal de soporte publicado con tiempos de respuesta; dejar un checklist de cierre con los puntos que requieren atención continua (tarifa, catálogo, verificaciones pendientes, dependencias).

### 🟡 R-24 — El despliegue es todo o nada y no hay procedimiento de reversión

- **Probabilidad**: Media · **Impacto**: Medio-Alto · **Semáforo**: 🟡

**Evidencia**: el job de producción hace un `gcloud run deploy` único, sin división de tráfico, sin canary y sin paso de verificación posterior más allá del `GET /version` (`smartruck-backend/.github/workflows/pipeline.yml:284`). La reversión de un release roto depende de que alguien recuerde el tag anterior y lo vuelva a desplegar a mano. Además, `lifecycle { ignore_changes = [template[0].containers[0].env] }` (`smartruck-infra/modules/cloud_run/main.tf`) deja las variables de entorno fuera del estado de Terraform: la configuración real del servicio vive fuera del control de versiones.

**Qué pasa en el negocio**: un release que pasa el smoke test pero rompe una funcionalidad entra completo a producción, sin forma automática de volver atrás. Y como las variables de entorno no están en el estado de Terraform, un `terraform apply` no corrige ni muestra la deriva de configuración: la diferencia entre "lo que dice la infraestructura" y "lo que corre en producción" solo se ve leyendo el job de deploy.

**Mitigación**: documentar el procedimiento de rollback con el tag anterior y probarlo una vez antes de necesitarlo; sumar un paso de verificación post-despliegue con flujo real; mover las variables de entorno a Terraform o a un gestor de secretos para eliminar la deriva.

### 🟡 R-04 — Las ofertas no tienen vencimiento y el tablero se ensucia

- **Probabilidad**: Alta · **Impacto**: Medio · **Semáforo**: 🟡

**Evidencia**: el listado de cargas filtra por disponibilidad y por vencimiento (`smartruck-backend/src/application/builders/load_filters_builder.py:18`), pero la búsqueda no usa ninguno de los dos filtros: trae todas las cargas con `get_all()` y solo mira el estado (`smartruck-backend/src/application/use_cases/loads/search_loads_use_case.py:108` y `smartruck-backend/src/infrastructure/outbound/persistence/repositories/postgres_load_repository.py:117`). Una carga cuyo `delivery_deadline` ya venció sigue apareciendo en los resultados.

**Qué pasa en el negocio**: el transportista encuentra una carga, la toma y descubre que la ventana de carga ya pasó. Sumado a R-11 (cargas bloqueadas que nunca se liberan), el tablero degrada hacia inventario muerto, y un tablero con ruido enseña al transportista a desconfiar de los resultados. La reescritura del matching con PostGIS (Tabla B) va a reescribir esta consulta, pero hasta que llegue, el defecto está en producción.

**Mitigación**: aplicar el filtro de vencimiento en la búsqueda con el `NotExpiredLoadsFilter` que ya existe; barrido periódico de cargas vencidas y bloqueadas huérfanas; mostrar la ventana de tiempo en la tarjeta de oferta.

### 🟡 R-20 — Inconsistencia entre los números que muestra el producto y los que usa el sistema

- **Probabilidad**: Media · **Impacto**: Medio · **Semáforo**: 🟡

**Evidencia**: la calculadora de retorno del portal del transportista usa constantes fijas: gasoil 1.200 $/L, consumo 30 L/100km, peaje 35.000 (`smartruck-transportista/src/domain/empty-return-cost.ts:2`). El backend usa otros valores: gasoil 2.000 $/L y 0,3 L/km (`smartruck-backend/src/application/use_cases/loads/search_loads_use_case.py:15`), y tarifa de 2.000 ARS/km (`smartruck-backend/src/domain/models/pricing.py:4`). Además, el monto estimado que ve el transportista es el `max_price` que puso el dador, no un precio de mercado (`search_loads_use_case.py:177`). El propio archivo de la calculadora aclara que es un cálculo provisional hasta que lo haga la API.

**Qué pasa en el negocio**: el producto muestra dos precios de combustible y dos tarifas por kilómetro, y un estimado de ingreso que es el techo del rango del dador. La promesa de ahorro —el argumento de venta central— se calcula con supuestos que el propio sistema contradice. Un transportista que chequee los números (y los transportistas chequean los números: es su oficio) encuentra la contradicción y pierde confianza en todo el resto.

**Mitigación**: que la calculadora consuma los mismos valores que usa el backend, o que el backend exponga un endpoint de simulación; mostrar el supuesto con su fecha de vigencia; mostrar un estimado de mercado en lugar del techo del dador.

### 🟡 R-33 — No hay procedimiento de recuperación ante pérdida de datos

- **Probabilidad**: Baja · **Impacto**: Crítico · **Semáforo**: 🟡

**Evidencia**: en el repositorio no hay ningún script de backup ni de restore, ni el pipeline documenta un snapshot previo a las migraciones (R-23). La base vive en Supabase, con los respaldos del proveedor, pero no hay procedimiento propio que definir qué se restaura, en qué orden y con qué criterios.

**Qué pasa en el negocio**: una pérdida o corrupción de la base no solo borra las cargas: borra el historial de viajes, las calificaciones y la reputación, que es el activo que justifica quedarse en la plataforma. Sin el historial, el producto vuelve a ser un tablón vacío: se pierde el activo de confianza que justificaba el esfuerzo comercial.

**Mitigación**: documentar el procedimiento de restore y probarlo una vez contra un ambiente de pruebas; definir el punto de recuperación aceptable (RPO/RTO) y verificar que el plan de respaldos del proveedor lo cubra; versionar un export de los datos de negocio críticos.

---

## Tabla A — Matriz de riesgos

Ordenada de más a menos severidad. La columna **Acción** resume el primer movimiento concreto.

| ID | Riesgo | Prob. | Impacto | Semáforo | Acción inmediata |
|----|--------|-------|---------|----------|------------------|
| R-16 | Sin garantía ni seguro: el puenteo es el camino por defecto | Alta | Crítico | 🔴 | Reputación atada a evidencia + plan de póliza por viaje |
| R-11 | Bloqueo sin TTL ni validación de estado | Alta | Crítico | 🔴 | TTL de bloqueo + transición `activa` → `bloqueada` válida |
| R-17 | Verificación manual: cuello de botella y persona clave | Alta | Crítico | 🔴 | Autoaprobación de CUIT + revisión por lotes + SLA |
| R-32 | Un flag de build puede dejar el portal en modo demo | Media | Crítico | 🔴 | Fallar el arranque en stub + llevar el flag a variable de ambiente |
| R-07 | El unlock fee no se devuelve ni se disputa | Media | Crítico | 🔴 | Política de devolución + compensación automática |
| R-08 | El estado del pago puede divergir del de MercadoPago | Media | Crítico | 🔴 | Barrido de reconciliación + sin regresión de estado |
| R-12 | Identidad transaccional desde la URL, rutas sin sesión | Media | Crítico | 🔴 | Actor desde el token + sesión en rutas transaccionales |
| R-13 | La carga reservada no se puede cancelar | Media | Crítico | 🔴 | Estado `cancelada` con actor y motivo + liberación de flota |
| R-28 | Fraude de dador: cobrar el fee y no despachar | Media | Crítico | 🔴 | Límites por oferente + encuesta post-viaje |
| R-29 | Cobro sin control previo: doble preferencia o oferta ajena | Media | Crítico | 🔴 | Idempotencia + validar `bloqueada` antes de cobrar |
| R-25 | Secretos del pipeline expuestos en los logs | Media-Alta | Alto | 🔴 | Secretos por archivo/gestor + rotación de credenciales |
| R-22 | El smoke test solo verifica la versión | Media | Alto | 🔴 | Smoke test de dependencias reales |
| R-23 | Migración contra prod antes del deploy, sin reversión | Media | Alto | 🔴 | Migraciones compatibles + snapshot previo |
| R-14 | La plataforma queda ciega después del desbloqueo | Alta | Alto | 🔴 | Hitos de viaje + remito atado a la carga |
| R-09 | Ticket chico frente a comisión y costos fijos | Media-Alta | Alto | 🔴 | Modelo de equilibrio con números reales |
| R-06 | El precio mostrado puede no ser el cobrado | Media | Alto | 🔴 | Una sola fuente de precio (backend) |
| R-30 | El dador no puede elegir transportista | Alta | Medio-Alto | 🟡 | Exponer candidatos antes del pago del fee |
| R-10 | Riesgo fiscal y de exposición legal | Media | Medio-Alto | 🟡 | Facturación electrónica + términos de uso |
| R-15 | Reputación negociable sin evidencia | Media | Medio-Alto | 🟡 | Calificación atada a hito verificable |
| R-21 | Continuidad: sin equipo, sin soporte, cuentas atadas a personas | Alta | Medio-Alto | 🟡 | Transferir titularidad de cuentas + responsable de operación |
| R-24 | Deploy todo o nada, sin rollback ni verificación posterior | Media | Medio-Alto | 🟡 | Procedimiento de rollback probado + verificación post-deploy |
| R-26 | El rate limit de Cloudflare no cubre `/geo/*` | Media | Medio-Alto | 🟡 | Corregir la expresión del WAF + rate limit en el gateway |
| R-27 | Pool de conexiones sin dimensionar | Media | Medio-Alto | 🟡 | Dimensionar el pool y apuntar al pooler de Supabase |
| R-31 | Datos personales y documentos sin política de protección | Media | Medio-Alto | 🟡 | Aviso de privacidad, consentimiento y política de retención |
| R-33 | Sin procedimiento de recuperación ante pérdida de datos | Baja | Crítico | 🟡 | Documentar y probar el restore |
| R-04 | Ofertas vencidas en la búsqueda: el tablero se ensucia | Alta | Medio | 🟡 | Aplicar el filtro de vencimiento en la búsqueda |
| R-20 | Números del producto contradicen al sistema | Media | Medio | 🟡 | Calculadora contra los valores del backend |

## Tabla B — Trabajo planificado (no son riesgos)

Decidido en un ADR o en el backlog; se va a atacar paulatinamente. **No son riesgos del MVP**: no corresponde ponderarlos en la matriz.

| ID | Ítem | Decisión | Dónde está |
|----|------|----------|------------|
| B-01 | Matching con PostGIS en el backend, vista `matching_loads` e índices GiST | ADR-001, decisión D4 | `ADR-001-arquitectura-smartruck-y-descomposicion.md`, borradores de tickets M1–M10 |
| B-02 | Alerta de cargas por ruta y preferencias guardadas del transportista | Alcance del MVP | Sin tipo de notificación ni entidad de preferencias en el backend |
| B-03 | Tarifa de desbloqueo configurable (base, por km, tipo de cambio, IVA) con vigencia | Pendiente de diseño | `smartruck-backend/src/domain/unlock_fee.py` |
| B-04 | Ampliación del catálogo de localidades (150) y su copia en el borde | ADR-0002, catálogo cerrado | `microservice-routes/src/application/use-cases/list-localities.use-case.ts` |
| B-05 | Resiliencia del geo-service en el borde (stale-if-error, monitor de health) | ADR-0003 | `docs/adr/0003-resiliencia-en-el-geo-service-y-no-en-los-frontends.md` |
| B-06 | Arranque con oferta garantizada en un corredor (siembra y campaña) | Decisión operativa | `smartruck-backend/src/infrastructure/api.py:81` (la siembra solo corre en desarrollo) |

## Riesgos aceptados

Ya evaluados y aceptados por el equipo; se documentan para que no se confundan con pendientes.

| Riesgo | Decisión |
|--------|----------|
| Caída total de Cloudflare (DNS, WAF y geo-service en el mismo proveedor) | Aceptado hasta que el monitor de `/geo/health` indique lo contrario (ADR-0003) |
| Catálogo o ruta nunca consultada durante una caída de la base: sin copia en el borde, se informa "no disponible" | Aceptado (ADR-0003) |
| Copia en el borde por centro de datos de la Cache API de Workers (sin réplica) | Aceptado, la elección de tecnología se resuelve en la historia #171 (ADR-0003) |

---

## Lectura por probabilidad

- - **Probabilidad alta** (7): R-04, R-11, R-14, R-16, R-17, R-21, R-30. Son condiciones que el sistema tiene hoy escritas en el código o que son consecuencia directa de cómo se opera.
- **Probabilidad media-alta** (2): R-09 y R-25, que dependen del volumen de transacciones y de la exposición de los logs del pipeline.
- **Probabilidad media** (17): R-06, R-07, R-08, R-10, R-12, R-13, R-15, R-20, R-22, R-23, R-24, R-26, R-27, R-28, R-29, R-31, R-32. Todas con un disparador concreto: concurrencia, abandono de una de las partes, un tercero, un deploy o el paso del tiempo.
- **Probabilidad baja** (1): R-33, que requiere una pérdida de datos no prevista.

**Ninguno de los riesgos de la Tabla A depende de un evento excepcional**: todos son el comportamiento normal del sistema bajo carga, bajo abandono o en un deploy.

