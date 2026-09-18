# Restyling de UI — referencia cruzada

Esta página es la referencia compartida del restyling de interfaz de Smartruck. Existe porque el pase se implementa primero en **smartruck-dador** y luego se replica de forma análoga en **smartruck-transportista**: los dos portales tienen que poder leer el mismo contrato.

Los cuerpos de ticket con criterios de aceptación viven en el tracker. Acá se documenta lo que **no** cambia entre repos.

## Alcance

- Renovación de la capa visual de los dos portales: tokens y theme, tipografía y escala, shell y estructura de outlet por vista, header/appbar, iconografía, transiciones entre vistas y estados de carga.
- **No** incluye cambios de comportamiento, de flujos de negocio ni de integración con el backend.

## Regla de portado: espejo, no extracción

Los dos portales comparten stack y vocabulario de tokens, pero **no comparten código**: no hay monorepo, ni workspace, ni paquete, ni submódulo. El restyling se replica copiando archivos, no extrayendo un paquete compartido.

Se extrae un paquete (`@smartruck/design-tokens`) **solo si aparece una tercera pasada de restyling**. Hasta entonces el costo de armar el workspace y tocar los dos repos en simultáneo no se justifica.

## Contrato de portado

| Qué | Regla |
|-----|-------|
| Nombres de token | **Idénticos** en los dos repos. Es la razón por la que el portado es casi 1:1. |
| Valores de token | Deben quedar idénticos salvo el acento por portal, si se aprueba. |
| `src/styles.css` | Único origen de verdad visual. Sin `tailwind.config.js` (Tailwind v4 es CSS-first). |
| Tokens de color | Siempre `oklch()` como custom property en `:root` / `.dark`, mapeados en `@theme inline`. |
| Componentes UI | `src/components/ui/` (shadcn). El portado va archivo por archivo. |
| Primitivas de layout | `src/components/layout/` — `PageContainer`, `PageHeader`, `PageSection`. |
| Shell | `src/views/layout/`. **transportista ya usa esta carpeta; dador todavía renderiza el shell dentro de `smartruck-app.tsx`.** El restyling del dador debe converger a `src/views/layout/`. |
| Helpers | `src/lib/` en ambos repos. **No** se usa `src/utils/`. |
| Iconos | Wrapper propio antes de cualquier migración de librería. |
| Escala tipográfica | **Un solo valor**: `html { font-size: 142.9% }` en `@layer base` de `src/styles.css`. Como Tailwind v4 es rem-based, escala texto, espaciados, alturas de control y contenedores de forma proporcional. Con eso `text-sm` pasa de 14px a ~20px. Recalibrar = cambiar ese único número. |
| Fuentes | Autoalojadas con Fontsource, **nunca** `<link>` a Google. Interfaz: **Figtree** (`--font-sans`). Wordmark: **Archivo** (`--font-wordmark`). |
| Tokens semánticos | `--success`, `--warning`, `--danger` con sus `-foreground`, en `:root` y `.dark`, registrados en `@theme inline` como `--color-*`. |
| Animaciones base | `@import "tw-animate-css"` en `src/styles.css`. Sin eso, todas las clases `animate-in` / `fade-in-0` / `zoom-in-95` / `slide-in-from-*` de los primitivos shadcn quedan inertes. |
| Cifras | `font-variant-numeric: tabular-nums`, para que precios, pesos, distancias y fechas no desalineen columnas. |

## Divergencia conocida (relevada durante el relevamiento)

Detectada al planificar el restyling. Debe converger durante el pase del transportista.

| Punto | smartruck-dador | smartruck-transportista |
|-------|-----------------|-------------------------|
| `button.tsx` | `rounded-xl`, `font-medium`, `ring-1 ring-ring` | `rounded-lg`, `font-semibold`, `ring-2 ring-ring/50` |
| Tokens de estado | **Resuelto** en el pase de theme | Presentes |
| Escala de texto | **Resuelto** con el knob global (`142.9%`), no con tokens `--text-*` | `--text-xs` … `--text-3xl` explícitos |
| Tokens de superficie (claro) | Ahora **beige cálido** (h≈85) | Tinte azulado (h=210) — a converger en su pase |
| Modo oscuro | Azul petróleo h=235 + oliva h=115, con elevación por capas de superficie | Idem |
| Tipografía | Figtree (interfaz) + Archivo (wordmark) | Sin fuentes cargadas |
| Mapas | Leaflet | MapLibre |

## Restricciones vinculantes

- **Verde y beige/blanco siguen siendo los dos colores principales.** Se pueden proponer colores adicionales.
- **Una sola fuente de Google para toda la interfaz**, salvo el wordmark "Smartruck", que mantiene una familia propia.
- **La funcionalidad y los flujos de negocio no cambian de comportamiento.** Es presentación.
- **La mayoría de los textos se mantiene.** Solo se pueden reformular placeholders de secciones puntuales.
- El pase de transportista es **análogo**, no idéntico: mismo sistema, mismo contrato de portado.

## Decisiones tomadas

- **Wordmark como texto, no como imagen.** El header del dador dejó de usar `smartruck-logo.jpg` y renderiza el wordmark con el componente compartido `src/components/layout/wordmark.tsx`, usado tanto por el header autenticado como por el bloque de marca de las vistas públicas. Razón: un JPG escalado en proyector se ve borroso, el texto queda nítido a cualquier tamaño, y el brief pide una fuente propia para el título "Smartruck", cosa que solo aplica a texto. El JPG se mantiene como favicon y `og:image`.
- **Un solo punto de presentación de marca.** Si el wordmark cambia, cambia en `wordmark.tsx` y los dos portales lo heredan.
- **Sin iconos decorativos en headers.** Regla aplicada: se retira un icono si al quitarlo no se pierde información; se conserva si codifica dirección o estado. El inventario de lo retirado está abajo.
- **La escala es un único número.** `html { font-size: 142.9% }`. Se eligió escalar la raíz en lugar de redefinir tamaños por componente porque es proporcional y no recorta nada: contenedores, paddings y alturas de control crecen junto con el texto, así que ningún componente necesita ajuste manual. Costo aceptado: menos densidad por pantalla, a cambio de legibilidad en proyector.
- **El modo claro pasa a beige cálido** (h≈85) con el verde como primario; el oscuro mantiene el azul petróleo + oliva del logo y resuelve la elevación por capas de superficie en vez de sombras.
- **Se activan las animaciones base de shadcn** importando `tw-animate-css`, que estaba instalado pero nunca importado.
- **El `theme-color` sigue al modo activo**: el hook de tema actualiza el meta al togglear, en vez de quedar fijo en `#ffffff`.

## Decisiones abiertas

- Acento por portal: el usuario se inclina por paletas idénticas con el contenido como única diferencia. Hay una propuesta de acento pendiente de aprobación.
- **Mecanismo de escala a unificar en el portado.** El dador escala la raíz (`142.9%`); el transportista ya define tokens `--text-*` explícitos. Son mecanismos distintos y no conviven sin pisarse: hay que elegir uno antes de portar.
- **El chrome de Leaflet quedó en px a propósito.** La geometría de los pins y el ancho del hover card dependen del zoom del mapa, no de la escala de la UI; escalarlos a ciegas cambia su significado. Requiere un pase propio, consciente del zoom.

## Checklist de portado al transportista

- [ ] **Decidir el mecanismo de escala** (knob de raíz vs tokens `--text-*` explícitos) y aplicar `html { font-size: 142.9% }` o su equivalente.
- [ ] Cargar Figtree (interfaz) y Archivo (wordmark) con Fontsource. **No** usar `<link>` a Google.
- [ ] Importar `tw-animate-css` en el CSS global.
- [ ] Aplicar `--success` / `--warning` / `--danger` con sus `-foreground` y verificar contraste AA en los dos modos.
- [ ] Convertir a rem o a la escala todo `text-[Npx]` y todo `font-size` en px.
- [ ] Aplicar `src/styles.css` completo y verificar que los nombres de token coincidan 1:1.
- [ ] Converger los cuatro tokens de superficie del modo claro al beige.
- [ ] Alinear `button.tsx` y el resto de los componentes UI a la versión del contrato.
- [ ] Portar `src/components/layout/` y migrar las vistas a las primitivas.
- [ ] Portar `src/components/ui/loader.tsx` y montar `defaultPendingComponent` en el router.
- [ ] Portar el shell a `src/views/layout/` y la estructura de outlet.
- [ ] Quitar los iconos decorativos de headers.
- [ ] Reemplazar `Loader2` inline por el loader compartido.
- [ ] Verificar el header/appbar y el bloque de marca de las vistas públicas.
- [ ] Lint, typecheck, tests (Vitest) y build en verde. **No** ejecutar ni agregar Playwright.

## Iconos retirados de headers

Inventario de la primera pasada (D.X.1.3 en smartruck-dador). Sirve para decidir **dónde** vuelven a ir los iconos, no para restaurarlos en los headers. El transportista debe retirar los suyos con la misma regla: se retira si al quitarlo no se pierde información; se conserva si codifica dirección o estado.

| Archivo | Header / contexto | Icono retirado |
|---------|-------------------|----------------|
| `src/views/smartruck-app.tsx` | header autenticado, bloque de marca | `smartruck-logo.jpg` (asset, no icono) |
| `src/views/smartruck-app.tsx` | nav: Panel / Mis cargas / Publicar Carga / Perfil | `LayoutDashboard`, `Package`, `PlusCircle`, `UserIcon` |
| `src/views/auth/auth-brand.tsx` | marca de vistas públicas | `Store` |
| `src/views/dashboard/dashboard-view.tsx` | "Panel de control" | `BarChart3` |
| `src/views/create-load-view/create-load-view.tsx` | "Publicar Nueva Carga" | `Plus` |
| `src/views/profile/profile-view.tsx` | "Mis Centros y Depósitos Frecuentes" | `Building2` |
| `src/views/profile/profile-view.tsx` | "Opiniones y Calificaciones Recibidas" | `Star` |
| `src/views/my-loads/my-load-detail.tsx` | "Transportista asignado" | `Truck` |
| `src/views/my-loads/my-load-detail.tsx` | "Hoja de ruta y direcciones" | `Navigation` |
| `src/views/my-loads/my-load-detail.tsx` | "Recorrido en mapa" | `MapPin` |
| `src/views/my-loads/delivery-stepper.tsx` | "Progreso y Seguimiento" | `Truck` |
| `src/views/my-loads/edit-load-modal.tsx` | "Editar Carga #{id}" | `PenLine` |
| `src/views/profile/depot-modal.tsx` | "Guardar Nuevo Centro / Depósito" | `BookmarkPlus` |
| `src/views/create-load-view/sections/cargo-info-section.tsx` | "Información de la carga" | `Package` |
| `src/views/create-load-view/sections/trip-conditions-section.tsx` | "Condiciones del viaje y pago" | `Calendar` |
| `src/views/create-load-view/sections/price-estimation-section.tsx` | "Precio sugerido" | `Sparkles` |
| `src/views/send-proposal-modal.tsx` | "Enviar propuesta", "Ruta", "Condiciones del viaje y pago", "Información adicional" | `Truck`, `MapPin`, `Calendar`, `Truck` |
| `src/views/send-proposal-view.tsx` | "Ruta", "Información de la carga", "Condiciones del viaje", "Información adicional" | `MapPin`, `Package`, `Calendar`, `Truck` |
| `src/views/notifications/notifications-bell.tsx` | fila de header del panel "Notificaciones" | `Bell` |

### Iconos conservados a propósito

Se mantienen porque codifican información o estado, no decoración:

- `src/views/load-drawer/load-drawer-header.tsx` — `ArrowRight` **entre** origen y destino: renderiza el sentido de la ruta. Quitarlo destruye significado.
- `src/views/my-loads/delivery-stepper.tsx` — los iconos de cada paso del stepper (`Lock`, `Package`, `Truck`, `Clock`, `MapPin`, `Star`, `BadgeCheck`, `Check`): codifican el estado del paso.
- Chips de estado y campos de `my-load-detail.tsx` (`BadgeCheck`, `ShieldCheck`, `Mail`, `Lock`, `MapPin`): llevan significado de estado o de campo.
- Iconos de inputs y de éxito/error en `send-proposal-*` (`Weight`, `DollarSign`, `CheckCircle2`, `AlertTriangle`): affordances y estado.
- `src/views/my-loads/my-loads-summary.tsx` (`PiggyBank`) y las KPI cards del panel: son callouts de estadística, no headers.
- Los badges numerados de `create-load-view` (1/2/3) no son iconos: codifican orden de pasos.
