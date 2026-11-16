# `smartruck-backoffice`

Portal web administrativo interno de **Smartruck** (`v0.5.0`), construido con **TanStack Start**, **React 19** y **TypeScript** sobre **Vite 8** y **Nitro SSR**, destinado a operadores con rol administrador.

---

## Funcionalidades implementadas

- **Autenticación administrativa (`/login`):** Sesión dedicada mediante Supabase Auth restringida a cuentas administradoras (`require_admin` en backend).
- **Auditoría documental y habilitación de usuarios (`Usuarios`):** Listado de dadores y transportistas filtrable por estado documental, inspección de constancias privadas en el detalle de cuenta (URLs firmadas) y aprobación o rechazo con motivo.
- **Gobierno de tarifas (`Tarifas`):**
  - Administración de tarifas por categoría en modo `BASE` (ARS/km) o `EXTERNAL_SOURCE` (`adjustment_percentage` configurable), con fecha de vigencia (`effective_from`) e historial completo.
  - Importación de grillas distancia-tonelaje **FADEEAC desde PDF** mediante carga de archivo hacia `smartruck-backend`.
  - Gestión CRUD de tarifas por tipo de vehículo para transporte de hacienda.

---

## Stack tecnológico

| Área | Herramientas |
| :--- | :--- |
| **Runtime y gestor** | Node.js 22+, npm |
| **Framework UI / SSR** | React 19.2, TypeScript 5.8, TanStack Start / Router / Query, Vite 8.2, Nitro |
| **Estilos y UI** | Tailwind CSS v4.2, Radix UI, Lucide, Sonner |
| **Integración y calidad** | `@supabase/supabase-js`, Axios, Vitest, ESLint, Prettier, **Gitleaks** |
| **Despliegue** | Docker Nitro -> **GHCR** -> **Render** (`smartruck-backoffice.onrender.com`) |

---

## Scripts locales principales

```bash
./scripts/dev_app         # Inicia servidor de desarrollo local
./scripts/run_lint        # Verifica tsc, ESLint y Prettier
./scripts/run_all_tests   # Ejecuta la suite de pruebas en Vitest
```

---

## Más información

- [Arquitectura de `smartruck-backoffice`](./arquitectura.md)
- [Links de referencia](./links.md)
