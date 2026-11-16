# Descripción del proyecto

**Smartruck** surge como respuesta a un problema estructural del transporte automotor de cargas en Argentina: la alta proporción de kilómetros recorridos en vacío (*deadhead miles*), especialmente en viajes de retorno tras una entrega. Para una empresa de logística o dador de cargas esto implica fletes más costosos; para una PyME transportista, pérdida directa de margen operativo y desgaste de flota sin ingresos que lo compensen.

## Problema que aborda

1. **Asimetría de información e intermediación informal:** Muchos fletes de retorno se coordinan por teléfono o mensajería sin visibilidad geográfica ni criterios homogéneos de precio.
2. **Desconocimiento del costo hundido real:** Los transportistas suelen evaluar un viaje de vuelta solo por el precio ofrecido sin cuantificar el combustible, los peajes y el costo operativo que igualmente afrontarán si regresan vacíos.
3. **Competencia desordenada y reservas ambiguas:** Sin exclusividad temporal durante el pago, dos transportistas pueden intentar tomar la misma carga al mismo tiempo y generar cancelaciones o fricciones posteriores.

## Modelo de negocio y propuesta de valor

Smartruck actúa como **plataforma de intermediación informativa** (*marketplace* B2B): no cobra ni administra el monto total del flete ni asume la responsabilidad del transporte físico. El acuerdo contractual del traslado se realiza directamente entre las partes una vez conectadas.

El modelo operativo se apoya en tres pilares:

- **Precios de referencia y tarifa de retorno:** El sistema calcula una tarifa sugerida para el dador según categoría de carga, origen, destino, distancia vial, volumen/peso o tarifarios externos importados (FADEEAC), aplicando un descuento sugerido del **20%** sobre la referencia base para reflejar oportunidades de retorno y un **piso mínimo del 90%** sobre la tarifa sugerida para evitar ofertas inviables.
- **Matching geográfico de cercanía y de paso:** El backend combina PostGIS y el servicio geográfico (`geo-service`) para recomendar cargas cercanas al origen/destino del transportista (Tier 1) o ubicadas sobre el corredor vial de su ruta cuando la búsqueda cercana arroja pocos resultados (Tier 2).
- **Tarifa de desbloqueo (*unlock fee*) con reserva exclusiva:** Para visualizar los datos completos de contacto del dador y formalizar la reserva, el transportista abona una comisión proporcional a la distancia a través de **MercadoPago**, protegida por un bloqueo transaccional de **10 minutos** sobre la carga.

## Actores del sistema

| Actor | Prefijo | Responsabilidad principal |
| :--- | :---: | :--- |
| **Dador de carga (Oferente)** | `D` | Registra su empresa, valida su CUIT mediante documentación, configura sus depósitos habituales, cotiza y publica cargas, realiza el seguimiento de entregas, puede cancelar cargas y califica al transportista. |
| **Transportista (PyME transportista)** | `T` | Administra su flota (camiones y remolques), estima costos de retorno vacío con la calculadora, busca cargas en el mapa o sobre su ruta, abona el desbloqueo, asigna unidades, gestiona el viaje (`en_camino`, `entregada`) y califica al dador. |
| **Operador de Backoffice** | `B` | Audita documentación comercial y de identidad para aprobar o rechazar cuentas, gestiona categorías/tarifas de referencia base, importa matrices distancia-tonelaje de FADEEAC en PDF y administra tarifas por tipo de vehículo. |
| **Plataforma y servicios** | `R` / `S` | Proveen cálculo de rutas interurbanas y catálogo cerrado de localidades (`geo-service`), autenticación JWT ES256 (Supabase), correos transaccionales (`Resend`), pagos (`MercadoPago`) e infraestructura declarativa en la nube (`smartruck-infra`). |

## Ecosistema de aplicaciones y servicios

| Pieza | Repositorio | Rol dentro de Smartruck |
| :--- | :--- | :--- |
| **Landing institucional** | [`landing-page`](https://github.com/smartruck-ar/landing-page) | Sitio público de presentación e ingreso por rol en `smartruck.com.ar`. |
| **Portal Dador** | [`smartruck-dador`](https://github.com/smartruck-ar/smartruck-dador) | Aplicación web SSR/React para dadores de carga (`dador.smartruck.tech`). |
| **Portal Transportista** | [`smartruck-transportista`](https://github.com/smartruck-ar/smartruck-transportista) | Aplicación web SSR/React con mapa interactivo, calculadora y checkout (`transportista.smartruck.tech`). |
| **Portal Backoffice** | [`smartruck-backoffice`](https://github.com/smartruck-ar/smartruck-backoffice) | Consola web interna para verificación de usuarios y administración tarifaria. |
| **Backend Core** | [`smartruck-backend`](https://github.com/smartruck-ar/smartruck-backend) | API REST FastAPI con arquitectura hexagonal, PostGIS, matching, pagos, cancelaciones, notificaciones y métricas. |
| **Geo-service** | [`microservice-routes`](https://github.com/smartruck-ar/microservice-routes) | Microservicio en Cloudflare Workers que expone localidades, cercanía y rutas interurbanas. |
| **Infraestructura** | [`smartruck-infra`](https://github.com/smartruck-ar/smartruck-infra) | Código Terraform para GCP Cloud Run, API Gateway, Cloudflare DNS/WAF, WIF y observabilidad Datadog. |
| **Ecosistema AI** | [`smartruck-ai`](https://github.com/smartruck-ar/smartruck-ai) | Configuración compartida de workspace, reglas de calidad, scripts y skills para agentes. |
