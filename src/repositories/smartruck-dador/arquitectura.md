# Arquitectura de `smartruck-dador`

El portal organiza la lógica de pantallas y clientes bajo `src/`, separando el enrutamiento declarativo de TanStack Start respecto de las vistas orientadas por dominio.

---

## Estructura de rutas y vistas (`src/`)

- **Enrutamiento (`src/routes/`):**
  - Rutas públicas de autenticación: `login.tsx`, `signup.tsx`, `auth.confirm.tsx`.
  - Layout autenticado `_app.tsx` con rutas hijas `_app.dashboard.tsx` (**Panel**), `_app.my-loads.tsx`, `_app.my-loads_.$loadId.tsx` (**Mis cargas**), `_app.publish.tsx` (**Publicar Carga**) y `_app.profile.tsx` (**Perfil**).
- **Vistas funcionales (`src/views/`):**
  - `auth/`: flujos de registro, login y `TermsAndConditionsDialog`.
  - `dashboard/`: gráficos y tarjetas de métricas reales (Recharts).
  - `create-load-view/`: selector de categoría/embalaje, depósitos, consulta de cotización y mapa para dirección/pin.
  - `my-loads/` y `load-drawer/`: listado, detalle lateral, acciones de cancelación, confirmación de entrega y `ratings/`.
  - `profile/` y `documents/`: gestión de depósitos y subida directa de documentación mediante URLs firmadas.
  - `notifications/` y `layout/`: campana in-app, `NAV_ITEMS` en topbar/rail/móvil y adaptación responsive.

---

## Flujo de datos y dependencias externas

1. **Autenticación:** `supabase-js` gestiona la sesión del usuario y provee el JWT **ES256** adjuntado mediante interceptores de **Axios** en las llamadas al backend y a `geo-service`.
2. **Backend (`smartruck-backend` vía API Gateway):** Provee cotizaciones, creación y gestión de cargas, depósitos, direcciones por calle/pin (`/localizaciones/*`), URLs firmadas de documentos, calificaciones y métricas.
3. **Geografía interurbana (`geo-service`):** El portal consulta directamente las localidades aprobadas y rutas precalculadas desde `geo-service` sin almacenar listados locales estáticos (`ADR 0003`).

---

## Despliegue

Cada promoción (`./scripts/release_to_test` o `./scripts/release_to_prod`) ejecuta lint, verificación de tipos (`tsc`) y Vitest en GitHub Actions, construye la imagen Docker basada en el servidor Nitro, la publica en **GHCR** y dispara el hook de despliegue de **Render**.
