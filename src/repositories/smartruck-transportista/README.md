# `smartruck-transportista`

Portal web orientado a **PyMEs y transportistas de carga pesada** (`v3.1.2`), desarrollado con **TanStack Start**, **React 19** y **TypeScript** sobre **Vite 8** y **Nitro SSR**, con mapa interactivo **MapLibre GL** y visualización **Recharts**.

---

## Funcionalidades implementadas

- **Acceso inmediato y gestión de flota:** Registro con `TermsAndConditionsDialog`, exploración abierta del mapa y la calculadora desde el primer ingreso, verificación documental en **Ver perfil** y CRUD completo de camiones y remolques en **Mi flota**.
- **Calculadora de retorno vacío (`empty-return-cost.ts`):** Simulador económico y ambiental de retorno sin carga alineado con los supuestos del backend (`28 L/100 km`, `2400 ARS/L`, `35.000 ARS` peaje base, `2,68 kg CO2/L`).
- **Mapa interactivo y matching inteligente (`Buscar cargas`):** Visualización en **MapLibre GL** de recomendaciones devueltas por `POST /loads/recommendations` (Tier 1 cercano y Tier 2 sobre corredor vial), ordenadas por puntaje y ganancia marginal.
- **Checkout exclusivo y desbloqueo (`CheckoutFlow`):** Muestra de comisión de desbloqueo (`/unlock-fee`, con contingencia cliente si falla), bloqueo atómico de 10 minutos, pago en **MercadoPago Checkout Pro**, sincronización post-pago y liberación de contacto del dador.
- **Ejecución de viajes (`Mis viajes`) y métricas (`Panel`):** Asignación obligatoria de camión y remolque válidos (`/valid-units`), actualización de estado (`en_camino`, `demorada`, `entregada`), cancelación de reserva, calificaciones, notificaciones y tablero real (`/transporters/{id}/metrics`).

---

## Stack tecnológico

| Área | Herramientas |
| :--- | :--- |
| **Runtime y gestor** | Node.js 22+, npm |
| **Framework UI / SSR** | React 19.2, TypeScript 5.8, TanStack Start / Router / Query, Vite 8.2, Nitro |
| **Estilos y componentes** | Tailwind CSS v4.2, Radix UI, Lucide |
| **Mapas y gráficos** | **MapLibre GL**, **Recharts** |
| **Integración y pruebas** | `@supabase/supabase-js`, Axios, **Vitest** + **`happy-dom`** *(sin Playwright ni Bun)*, ESLint, Prettier, **Gitleaks** |
| **Despliegue** | Docker Nitro -> **GHCR** -> **Render** (`transportista-test.smartruck.tech` / `transportista.smartruck.tech`) |

---

## Scripts locales principales

```bash
./scripts/dev_app            # Inicia servidor local de desarrollo
./scripts/dev_against_test   # Ejecuta contra backend y geo-service en ambiente test
./scripts/run_lint           # Ejecuta tsc, ESLint y Prettier
./scripts/run_all_tests      # Ejecuta pruebas unitarias y de componentes con Vitest + happy-dom
```

---

## Más información

- [Arquitectura de `smartruck-transportista`](./arquitectura.md)
- [Links de referencia](./links.md)
