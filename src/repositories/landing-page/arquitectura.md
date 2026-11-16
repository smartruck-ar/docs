# Arquitectura de `landing-page`

Aplicación *Single Page Application* (SPA) estática sin servidor SSR, optimizada para carga rápida en el borde a través de **Cloudflare Pages**.

---

## Estructura (`src/`)

- `src/main.jsx` e `src/index.css`: punto de entrada React y hoja de estilos Tailwind v4.
- `src/App.jsx`: landing principal, bloques de proceso (`processSteps`), carrusel hero (`heroSlides`) y hook `useScrollReveal` con `IntersectionObserver` y failsafe por temporizador (6 s) para evitar contenido oculto ante bloqueos del navegador.
- `src/components/RoleAction.jsx` y `src/lib/role-url.js`: encapsulan la construcción de enlaces hacia los portales de Dador y Transportista según el entorno activo.

---

## Pipeline y seguridad

- A diferencia de los portales operativos (alojados como aplicaciones Nitro en Render), `landing-page` compila estáticos en `dist/` y los publica directamente en **Cloudflare Pages** con `wrangler`.
- Antes de publicar ejecuta controles locales dedicados (`scripts/security-check.js` y `scripts/required-checks.js`) junto a Vitest, ESLint y **Gitleaks** en GitHub Actions.
