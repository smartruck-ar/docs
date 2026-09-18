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
| Escala tipográfica | Un único valor de escala en `src/styles.css`, ajustable en un solo lugar. |

## Divergencia conocida (relevada durante el relevamiento)

Detectada al momento de planificar el restyling. Debe converger durante el pase, no antes.

| Punto | smartruck-dador | smartruck-transportista |
|-------|-----------------|-------------------------|
| `button.tsx` | `rounded-xl`, `font-medium`, `ring-1 ring-ring` | `rounded-lg`, `font-semibold`, `ring-2 ring-ring/50` |
| Tokens de estado | Sin `--success` / `--warning` / `--danger` | Presentes |
| Escala de texto | Sin tokens `--text-*` explícitos | `--text-xs` … `--text-3xl` explícitos |
| Tokens de superficie (claro) | `--background`, `--card`, `--muted`, `--accent` con tinte verdoso (h=120) | Los mismos cuatro con tinte azulado (h=210) |
| Modo oscuro | Prácticamente idéntico (azul petróleo h=235 + oliva h=115) | Idem |
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

## Decisiones abiertas

- Acento por portal: el usuario se inclina por paletas idénticas con el contenido como única diferencia. Hay una propuesta de acento pendiente de aprobación.
- Fuente definitiva de la interfaz: pendiente de propuesta, con requisito de numerales tabulares. El wordmark ya tiene su hook (`--font-wordmark`) esperando el valor.

## Checklist de portado al transportista

- [ ] Aplicar `src/styles.css` completo y verificar que los nombres de token coincidan 1:1.
- [ ] Converger los cuatro tokens de superficie del modo claro.
- [ ] Alinear `button.tsx` y el resto de los componentes UI a la versión del contrato.
- [ ] Portar `src/components/layout/` y migrar las vistas a las primitivas.
- [ ] Portar `src/components/ui/loader.tsx` y montar `defaultPendingComponent` en el router.
- [ ] Portar el shell a `src/views/layout/` y la estructura de outlet.
- [ ] Quitar los iconos decorativos de headers.
- [ ] Reemplazar `Loader2` inline por el loader compartido.
- [ ] Activar `tw-animate-css` en el CSS global.
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
