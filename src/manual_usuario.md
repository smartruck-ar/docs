# Manual de usuario

Esta guía orientativa describe los flujos principales de uso en las cuatro interfaces web de **Smartruck**, siguiendo la navegación real de cada aplicación.

> **Nota:** Es posible que al probar la plataforma no funcione de la manera más actualizada el ambiente de producción. En dicho caso, acceder mediante el ambiente de **test**.

---

## 1. Landing pública

- **URLs:** `https://smartruck.com.ar` en producción (si no funciona, usar `https://smartruck.onrender.com/`) / `https://smartruck-test.onrender.com/` en testing.
- **Propósito:** Presenta la propuesta de valor de Smartruck en tres etapas (**01 Publicá**, **02 Cotizá**, **03 Gestioná**), incluye una vista previa interactiva de los tableros de Dador y Transportista y permite acceder directamente al portal correspondiente según el perfil del usuario.

---

## 2. Portal Dador

- **URLs:** `https://dador.smartruck.tech` (producción) / `https://dador-test.smartruck.tech` (testing).
- **Navegación principal:** **Panel**, **Mis cargas**, **Publicar Carga**, **Perfil** (y campana de notificaciones).

### Registro, documentación y depósitos

1. **Alta e ingreso:** El dador se registra con correo, contraseña, razón social, CUIT y aceptación obligatoria de Términos y Condiciones.
2. **Verificación de cuenta:** En **Perfil**, carga la documentación respaldatoria solicitada (almacenada de forma privada en Supabase Storage) para que el equipo de Backoffice valide la identidad de la empresa. Solo las cuentas verificadas pueden cotizar y publicar cargas.
3. **Depósitos habituales:** Desde la gestión de depósitos se pueden registrar ubicaciones frecuentes (provincia, localidad, dirección exacta y coordenadas) para reutilizarlas rápidamente al publicar nuevas ofertas.

### Publicación y cotización de cargas

1. Ingresar a **Publicar Carga**.
2. Seleccionar **categoría** (`Carga General`, `Refrigerado`, `Peligrosa / Regulada`, `Granos y Agricultura`, `Agroindustria` o `Ganadería / Hacienda`), **tipo de embalaje** y magnitud (peso o volumen según categoría).
3. Definir **origen** y **destino**: elegir localidad del catálogo oficial y completar dirección por buscador o seleccionando un pin en el mapa (validado dentro de un radio de `20 km`).
4. Indicar fechas de retiro y entrega límite y presionar cotización: el sistema calcula una **tarifa de referencia sugerida** (aplicando un **20%** de descuento sugerido de retorno cuando corresponde) y exige respetar el **piso mínimo del 90%** sobre el valor sugerido (con mínimo absoluto de `50.000 ARS`).
5. Confirmar para publicar la carga en estado `activa`.

### Seguimiento, cancelación, entrega y métricas

- **Mis cargas:** Permite filtrar y abrir el detalle de cada publicación en cualquiera de sus estados (`activa`, `bloqueada`, `reservada`, `en_camino`, `demorada`, `entregada`, `entrega_confirmada`, `cancelada`).
- **Edición o cancelación:** Una carga `activa` puede modificarse o cancelarse antes de ser tomada. Si ya fue `reservada`, el dador accede a los datos del transportista; si decide cancelar en esa instancia, el sistema reembolsa automáticamente el 100% de la comisión al transportista, cierra la carga en `cancelada` y registra una penalización de calificación (1 estrella).
- **Cierre de entrega y calificación:** Cuando el transportista marca el viaje como `entregada`, el dador confirma la recepción en el detalle de la carga para llevarla a `entrega_confirmada` y califica al transportista (1 a 5 estrellas).
- **Panel:** Resume métricas operativas reales (ahorros logísticos conseguidos frente a tarifa plena, kilómetros movilizados y cumplimiento de entregas).

---

## 3. Portal Transportista

- **URLs:** `https://transportista.smartruck.tech` (producción) / `https://transportista-test.smartruck.tech` (testing).
- **Navegación principal:** **Panel**, **Buscar cargas**, **Mis viajes**, **Mi flota**, **Calculadora** y menú de avatar (**Ver perfil**).

### Registro, verificación y gestión de flota

1. **Alta e ingreso:** Registro con datos de la empresa transportista y aceptación obligatoria de Términos y Condiciones.
2. **Ver perfil:** Carga de documentación comercial/identidad para habilitación administrativa. El portal permite explorar el mapa y la calculadora antes de completar toda la flota.
3. **Mi flota:** Alta, edición y baja de **camiones** y **remolques** (con tipo de carrocería y capacidad) que luego serán validados al momento de asignar unidades a un viaje.

### Calculadora de retorno vacío

- En **Calculadora**, el transportista ingresa un trayecto de regreso en vacío para visualizar el **costo hundido estimado** (`28 L/100 km`, gasoil a `2400 ARS/L`, peaje base `35.000 ARS` y `2,68 kg CO2/L`), contrastando el costo de volver sin carga frente al margen de tomar un flete de retorno.

### Búsqueda inteligente y reserva con pago

1. **Buscar cargas:** Ingresar localidad de origen, destino de regreso, ventana temporal (retiro mínimo/máximo y entrega límite) y filtros opcionales de categoría o tipo de remolque.
2. **Priorización automática:** El mapa y listado ordenan las cargas compatibles por puntaje (`LoadScorer`: aprovechamiento >= **25%** y tarifa por kilómetro). Si la búsqueda cercana (Tier 1) devuelve menos de 3 opciones puntuables, amplía automáticamente la búsqueda sobre el corredor vial de la ruta (Tier 2).
3. **Bloqueo exclusivo y pago:** Al elegir una carga se muestra el detalle de la **tarifa de desbloqueo** (*unlock fee*) y se activa un bloqueo exclusivo por **10 minutos** mientras se completa el pago en **MercadoPago**. Si se cancela antes de pagar o vence el tiempo, la carga vuelve a estar disponible.
4. **Post-pago:** Confirmado el pago, la carga pasa a `reservada`, se habilitan los datos de contacto del dador y el transportista recibe notificaciones in-app y correo de confirmación con enlace directo para buscar cargas de continuación o retorno.

### Asignación de flota, viaje y métricas

- **Mis viajes:** En el detalle de una carga `reservada`, el transportista debe asignar un **camión** y un **remolque** válidos (`valid-units`) y confirmar la reserva operativa.
- **Avance del traslado:** Actualizar estado a `en_camino` al iniciar el viaje, informar `demorada` ante contingencias o marcar `entregada` al completar la descarga. Una vez que el dador confirma la entrega (`entrega_confirmada`), queda habilitada la calificación hacia el dador.
- **Cancelación de reserva:** Si el transportista cancela una reserva, las unidades asignadas se liberan y la carga regresa a `activa` (si la fecha de retiro sigue vigente; caso contrario pasa a `cancelada`), sin reembolso de la tarifa de desbloqueo y con penalización de calificación (1 estrella).
- **Panel:** Muestra kilómetros en vacío evitados, costo hundido rescatado, ingreso marginal neto por kilómetro, litros de gasoil ahorrados y emisiones de CO2 evitadas.

---

## 4. Portal Backoffice

- **URL:** `https://smartruck-backoffice.onrender.com/` (acceso exclusivo para cuentas con rol administrador).
- **Navegación principal:** **Usuarios**, **Tarifas**, **Perfil**.

### Revisión documental de usuarios

1. En **Usuarios**, filtrar cuentas de dadores o transportistas según estado documental (pendiente, aprobado, rechazado).
2. Abrir el detalle de usuario para previsualizar o descargar los archivos cargados mediante URLs firmadas temporales.
3. Aprobar la cuenta para habilitar su operación completa en portales o rechazar indicando el motivo correspondiente.

### Gobierno de tarifas de referencia

En **Tarifas**, el operador administrativo dispone de tres capacidades principales:

1. **Tarifas por categoría:** Configurar el modo de cálculo (`BASE` en ARS/km o `EXTERNAL_SOURCE` con porcentaje de ajuste configurable), definir la fecha de entrada en vigencia (`effective_from`) y consultar el historial de cambios por categoría.
2. **Importación de grillas FADEEAC (PDF):** Cargar documentos PDF oficiales de matrices distancia-tonelaje mediante el diálogo de importación para actualizar automáticamente la tabla de referencia utilizada por el cotizador.
3. **Tarifas por vehículo (Hacienda):** Administrar los valores de referencia asociados a configuraciones específicas de transporte de hacienda.
