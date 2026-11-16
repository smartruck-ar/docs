# Glosario

Definiciones canónicas del dominio de **Smartruck** y límites entre servicios.

---

## Actores del sistema

- **Dador de carga (Oferente):** Empresa verificada que publica cargas a transportar, define origen/destino, categoría y fechas, acepta cotizaciones dentro del piso mínimo vigente y confirma la entrega recibida.
- **Transportista (PyME transportista):** Empresa de transporte automotor que administra su flota de camiones y remolques, busca cargas compatibles en ruta o cercanía, abona la tarifa de desbloqueo y ejecuta el viaje.
- **Administrador de Backoffice:** Operador interno con permisos elevados encargado de auditar la documentación legal de los usuarios y gobernar las tablas de tarifas de referencia.

---

## Conceptos y entidades del dominio

- **Oferta de carga (`Load`):** Publicación creada por un dador verificado que describe una necesidad de traslado: origen, destino, categoría (`CARGA_GENERAL`, `REFRIGERADO`, `PELIGROSA_REGULADA`, `GRANOS_Y_AGRICULTURA`, `AGROINDUSTRIA`, `GANADERIA_HACIENDA`), embalaje (7 tipos), magnitud (peso o volumen), ventana temporal (`pickup_date`, entrega), tarifas (`suggested_price`, `min_price`, `max_price`) y distancia vial.
- **Estados de carga (`LoadStatus`):** Ciclo de vida oficial representado en backend:
  - `activa`: disponible para recibir bloqueo/reserva.
  - `bloqueada`: reservada temporalmente (`10 minutos`) durante un checkout de MercadoPago en curso.
  - `reservada`: desbloqueo abonado y datos de contacto liberados; espera asignación operativa de unidades o inicio de viaje.
  - `en_camino`: viaje iniciado por el transportista.
  - `demorada`: viaje en curso con contingencia informada por el transportista.
  - `entregada`: descarga declarada por el transportista, pendiente de confirmación del dador.
  - `entrega_confirmada`: recepción confirmada por el dador; habilita calificaciones mutuas.
  - `cancelada`: cierre definitivo por cancelación del dador o cierre tras vencimiento al cancelar el transportista.
- **Depósito (`Depot`):** Ubicación recurrente registrada por un dador (provincia, localidad, dirección y pin validado) para agilizar futuras publicaciones.
- **Camión y Remolque (`Truck` / `Trailer`):** Unidades de flota cargadas por el transportista. Para formalizar una reserva operativa (`/reserve`) es obligatorio asignar un camión y un remolque válidos para la carga (`/valid-units`).
- **Tarifa de referencia, descuento de retorno y piso mínimo:** Valor orientativo calculado por `QuoteLoadUseCase` usando tarifas base por km o grillas externas FADEEAC/vehículo administradas en Backoffice. Aplica un descuento de retorno del **20%** (`0.8`) sobre la referencia cuando corresponde y fija un piso mínimo del **90%** sobre lo sugerido (mínimo absoluto `50.000 ARS`).
- **Tarifa de desbloqueo (*Unlock fee*):** Comisión abonada por el transportista en MercadoPago para acceder al contacto del dador (`(5 + 0,04 * distancia_km) * 1500 ARS` en dominio backend). Si el dador cancela una carga ya reservada, se reembolsa automáticamente al 100%.
- **Bloqueo exclusivo (*Lock*):** Reserva atómica en PostgreSQL (`reserved_until = NOW + 600 s`) que evita compras concurrentes de la misma carga mientras dura el pago.
- **Matching inteligente (Tier 1 / Tier 2):** Búsqueda geoespacial en PostGIS. **Tier 1** filtra cargas cercanas al origen y destino (`max(0,20 * D_nominal, 15 km)`); si aporta menos de 3 resultados puntuables, **Tier 2** amplía al corredor vial real (`PassThroughZone`) entre origen y destino. `LoadScorer` exige un aprovechamiento cargado mínimo del **25%** y ordena según proporción cargada y tarifa por kilómetro.
- **Calificación (`Rating`):** Puntuación de 1 a 5 estrellas emitida entre dador y transportista tras confirmarse la entrega, o asignada automáticamente con 1 estrella ante cancelación unilateral post-reserva.
- **Notificación (`Notification`):** Registro persistido para campana in-app y disparador de correos transaccionales vía **Resend** ante eventos críticos (reserva, cancelación, entrega, verificación).

---

## Responsabilidades geográficas

- **`geo-service` (`microservice-routes`):** Único dueño del catálogo cerrado oficial (24 provincias y 150 localidades), resolución de localidad más cercana (`50 km` por defecto) y cálculo de rutas interurbanas (11.175 pares OSRM/OSM precalculados, fallback a Mapbox Directions `no-store` y fallback Haversine `1,25` a `60 km/h`). **No** gestiona direcciones por calle ni geocodificación inversa.
- **Direcciones urbanas (`smartruck-backend`):** El backend resuelve `/localizaciones/direcciones` y `/localizaciones/reversa` integrando **Geoapify** (primario) y **Georef** (fallback de autocompletado), validando pines manuales dentro de `20 km` respecto de la localidad.

---

## Mapa de repositorios en `smartruck-ar`

| Repositorio | Rol actual |
| :--- | :--- |
| `smartruck-backend` | API REST FastAPI hexagonal, matching PostGIS, pagos, cancelaciones, métricas y tarifarios. |
| `microservice-routes` (`geo-service`) | Microservicio Cloudflare Workers para catálogo cerrado de localidades y rutas interurbanas. |
| `smartruck-dador` | Portal web TanStack Start + React para dadores de carga. |
| `smartruck-transportista` | Portal web TanStack Start + React con mapa, calculadora de retorno y checkout. |
| `smartruck-backoffice` | Consola web TanStack Start + React para auditoría de usuarios y tarifarios FADEEAC. |
| `landing-page` | Sitio público React + Vite en Cloudflare Pages. |
| `smartruck-infra` | Provisionamiento Terraform (GCP Cloud Run, API Gateway, Cloudflare DNS/WAF, Datadog). |
| `smartruck-ai` | Workspace compartido, scripts multirepo, reglas y skills de ingeniería. |
| `docs` | Documentación técnica publicada (mdBook), ADRs y especificaciones (`docs/specs/`). |
| `roadmap` | Tablero ágil en GitHub Projects y plantillas de automatización de tickets. |
| `smartruck-informe` | Fuentes LaTeX/Markdown del Informe Final, Ficha Ejecutiva y Long Paper. |
| `smartruck-audit`, `cloud-template`, `infra-template` | Repositorios históricos / locales de etapas iniciales del proyecto. |
