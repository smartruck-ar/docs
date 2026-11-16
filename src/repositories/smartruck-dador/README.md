# `smartruck-dador`

Portal web dedicado a **dadores de carga** (`v1.2.0`), construido con **TanStack Start**, **React 19** y **TypeScript**, con renderizado híbrido SSR vía **Nitro** y estilado mediante **Tailwind CSS v4**.

---

## Funcionalidades implementadas

- **Autenticación y alta legal:** Registro, inicio de sesión, confirmación de correo y diálogo obligatorio de Términos y Condiciones (`TermsAndConditionsDialog`) integrado con Supabase Auth.
- **Verificación documental y depósitos:** Subida directa de constancias por URL firmada y ABM de depósitos frecuentes reutilizables al publicar cargas.
- **Publicación y cotización previa:** Formulario guiado con selección de categoría/embalaje, búsqueda de direcciones (Geoapify/Georef vía `smartruck-backend`), mapa dual (**Leaflet** y **MapLibre GL**) para pin manual y cotización previa en línea con piso mínimo del 90% del sugerido.
- **Gestión de ofertas (`Mis cargas`) y notificaciones:** Seguimiento de estados (`LoadStatus`), cancelación con reembolso automático si la carga estaba `reservada`, confirmación de entrega (`entrega_confirmada`), calificación de transportistas y centro de notificaciones.
- **Tablero de métricas (`Panel`):** Visualización gráfica con **Recharts** de métricas reales obtenidas del backend (`/offerers/{id}/metrics`).

---

## Stack tecnológico

| Área | Herramientas |
| :--- | :--- |
| **Runtime y gestor** | Node.js 22+, npm |
| **Framework UI / SSR** | React 19.2, TypeScript 5.8, TanStack Start / Router / Query, Vite 8.2, Nitro |
| **Estilos y componentes** | Tailwind CSS v4.2, Radix UI, Lucide |
| **Mapas y visualización** | Leaflet, MapLibre GL, Recharts |
| **Integración y pruebas** | `@supabase/supabase-js`, Axios, Vitest, ESLint, Prettier, **Gitleaks** |
| **Despliegue** | Docker Nitro -> **GHCR** -> **Render** (`dador-test.smartruck.tech` / `dador.smartruck.tech`) |

---

## Scripts locales principales

```bash
npm run dev                  # Ejecuta servidor local de desarrollo (Vite / Start)
./scripts/dev_against_test   # Apunta el frontend local contra el backend y geo-service en test
./scripts/run_lint           # Verifica tipos (tsc), ESLint y formato
./scripts/run_all_tests      # Ejecuta la suite de pruebas en Vitest
```

---

## Más información

- [Arquitectura de `smartruck-dador`](./arquitectura.md)
- [Links de referencia](./links.md)
