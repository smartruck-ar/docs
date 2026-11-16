# Arquitectura de `smartruck-transportista`

El portal sigue el mismo patrón modular de TanStack Start + vistas por dominio que `smartruck-dador`, incorporando lógica específica de costo hundido en cliente y flujos de pago con MercadoPago.

---

## Estructura principal (`src/`)

- **Rutas (`src/routes/`):**
  - Autenticación y retornos de pago: `login.tsx`, `signup.tsx`, `auth.confirm.tsx`, `payments.return.tsx`, `payment.success.tsx`.
  - Shell autenticado `_app.tsx`: `_app.dashboard.tsx` (**Panel**), `_app.map.tsx` (**Buscar cargas**), `_app.trips.tsx` y `_app.trips_.$trip_id.tsx` (**Mis viajes**), `_app.fleet.tsx` (**Mi flota**), `_app.calculator.tsx` (**Calculadora**) y `_app.profile.tsx` (**Perfil**).
- **Dominio local (`src/domain/`):** Modela utilidades puras de presentación y simulación, como `empty-return-cost.ts` (`2400 ARS/L`, `28 L/100 km`, `35.000 ARS`, `2,68 kg CO2/L`), garantizando coherencia con `FleetAssumptions` del backend.
- **Vistas por capacidad (`src/views/`):**
  - `map/` y `loads/`: filtros por origen/destino/fechas/categoría, renderizado de marcadores y corredores sobre **MapLibre GL**, puntajes y comparación de margen.
  - `checkout/` (`checkout-flow.tsx`) y `payments/`: gestión del lock temporal de 10 minutos, consulta al endpoint de tarifa de desbloqueo, redirección a MercadoPago y verificación de retorno.
  - `fleet/` y `trips/`: CRUD de unidades tractoras/remolques, validación de unidades compatibles para una carga y seguimiento operativo del viaje.
  - `calculator/`, `dashboard/`, `ratings/`, `documents/`, `notifications/` y `layout/` (`COMPACT_NAV_ITEMS`).

---

## Integración con servicios y despliegue

- **Autenticación y contratos:** Sesiones Supabase Auth (JWT **ES256**), consultas transaccionales vía Axios hacia `smartruck-backend` (API Gateway) y consumo directo de localidades y polilíneas desde `geo-service`.
- **Pipeline de entrega:** Cada release (`./scripts/release_to_test` o `./scripts/release_to_prod`) valida lint, tipos y pruebas en Vitest (`happy-dom`), construye imagen Nitro en **GHCR** y actualiza el servicio web en **Render**.
