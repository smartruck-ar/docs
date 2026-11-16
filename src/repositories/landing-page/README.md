# `landing-page`

Sitio web institucional de **Smartruck** (`v1.2.0`), desarrollado en **React 19** con **JavaScript puro**, **Vite 7** y **Tailwind CSS v4**, desplegado como sitio estático en **Cloudflare Pages**.

---

## Qué incluye

- **Narrativa del proceso en 3 pasos:** Presenta el flujo operativo (**01 Publicá**, **02 Cotizá**, **03 Gestioná**) con iconografía Lucide y animaciones de entrada progresiva respetando `prefers-reduced-motion`.
- **Vista previa interactiva de portales:** Carrusel alternante (`PlatformHeroPreview`, rotación cada 10 s reiniciada en interacción) con capturas reales de los tableros de Dador de cargas y Transportista.
- **Derivación por rol (`RoleAction.jsx` / `role-url.js`):** Enlaza al usuario directamente hacia el portal correspondiente (`dador.smartruck.tech` / `transportista.smartruck.tech` o sus equivalentes de `test`).

---

## Stack y despliegue

| Área | Detalle |
| :--- | :--- |
| **Lenguaje y UI** | JavaScript (`ES Modules`, `.jsx`), React 19.1, Tailwind CSS v4.1, Lucide |
| **Bundler y pruebas** | Vite 7.1, Vitest, ESLint |
| **Controles en CI** | `scripts/required-checks.js`, `scripts/security-check.js`, **Gitleaks** |
| **Alojamiento** | **Cloudflare Pages** (`smartruck.com.ar` en producción; alternativa `https://smartruck.onrender.com/`) y acceso `test` en `https://smartruck-test.onrender.com/` |

---

## Scripts principales

```bash
npm run dev                # Servidor local de Vite
./scripts/run_lint         # Verificación de estilo e integridad
./scripts/run_all_tests    # Suite Vitest y chequeos de seguridad
./scripts/release_to_test  # Publicación en Cloudflare Pages (test)
./scripts/release_to_prod  # Publicación en Cloudflare Pages (producción)
```

---

## Más información

- [Arquitectura de `landing-page`](./arquitectura.md)
- [Links de referencia](./links.md)
