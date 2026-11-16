# Arquitectura de `smartruck-backoffice`

La consola administrativa replica la estructura base de los portales **TanStack Start + Nitro** del proyecto, acotada exclusivamente a operaciones de gobierno y auditoría interna sobre `smartruck-backend`.

---

## Estructura de rutas y vistas (`src/`)

- **Rutas (`src/routes/`):**
  - `login.tsx`: acceso de operadores administrativos.
  - `_app.tsx` (layout `AppShell` con navegación **Usuarios**, **Tarifas**, **Perfil**):
    - `_app.users.tsx` y `_app.users_.$slug.$id.tsx`: listado general y detalle completo de verificación de cada dador o transportista.
    - `_app.rates.tsx`: gestión integral de tarifarios por categoría, vehículos e importación PDF.
    - `_app.profile.tsx`: perfil de sesión del operador.
- **Vistas (`src/views/`):**
  - `auth/`: contexto de autenticación administrativa (`auth-context`).
  - `users/` (`users-view.tsx`, `user-detail-view.tsx`): tablas filtrables, visor de documentos privados por URLs firmadas temporales y acciones de aprobación/rechazo.
  - `rates/` (`rates-view.tsx`): edición de tarifas por categoría (`BASE` / `EXTERNAL_SOURCE`), diálogo de carga de PDFs FADEEAC y gestión de tarifas por vehículo.

---

## Comunicación y seguridad

- Todas las operaciones llaman a los prefijos `/admin/users`, `/admin/documents` y `/admin/rates` en `smartruck-backend` adjuntando el token JWT de Supabase Auth.
- Las decisiones finales de autorización (`require_admin`) y el parseo de PDFs FADEEAC (`pdfplumber`) residen exclusivamente en `smartruck-backend`, manteniendo el portal como cliente ligero.
- El pipeline CI/CD valida lint, tipos, pruebas Vitest y secretos (`Gitleaks`), genera imagen Docker en **GHCR** y actualiza la instancia en **Render**.
