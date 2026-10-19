# Handoff — Restyling del dador (D.X.2 / D.X.3) y cambios pendientes del backend

Este documento es **autocontenido a propósito**: se puede pegar entero en otro chat, en otro proveedor de IA, o leerse sin ninguna herramienta del entorno (sin Engram, sin MCP, sin skills). Existe porque el trabajo de restyling del portal **dador** se hizo en dos sesiones largas y sus pendientes cruzan a **otro repositorio** (`smartruck-backend`).

Complementa —no reemplaza— a [`restyling.md`](./restyling.md), que es el **contrato visual** de la épica. Si algo de acá contradice a `restyling.md`, manda `restyling.md`.

---

## 1. Contexto mínimo

- **Smartruck** es una plataforma logística (Trabajo Profesional, FIUBA): publicación, cotización, gestión y desbloqueo de ofertas de carga, con pagos integrados.
- Dos portales de UI y un backend compartido:

| Prefijo | Producto | Repo |
|---------|----------|------|
| `D` | Dador (shipper) | `smartruck-dador` |
| `T` | Transportista (carrier) | `smartruck-transportista` |
| — | API compartida | `smartruck-backend` (Python 3.12, FastAPI, hexagonal) |

- **Jerarquía de gestión:** épica → historia → task. Las tasks son el trabajo operativo (código, tests, commits, PR). Épicas e historias no se estiman.
- El portal dador usa **TanStack Start + Vite + React 19 + Tailwind CSS v4 + shadcn/ui**. El transportista usa el mismo stack y el mismo vocabulario de tokens, pero **no comparte código** (sin monorepo ni paquete): el restyling se replica como **espejo**, no por extracción.

## 2. Metodología y dinámica que seguimos (esto es lo que hay que respetar)

1. **Commits atómicos, sin push.** Formato conventional commits `<type>(<id-task>): <descripción>`, con `type` limitado a `feat` / `fix` / `refactor`. Un commit = un cambio revisable y autoexplicativo. Nada se pushea sin pedido explícito.
2. **Gate de verificación por task, obligatorio.** `scripts/run_lint` + `scripts/run_all_tests` + `npm run build`, todo en verde. En Windows los scripts son bash y WSL no trae node: hay que correrlos con **Git Bash** (`& "C:\Program Files\Git\bin\bash.exe" -lc "./scripts/run_all_tests"`). `CI=true` los vuelve check-only (no mutan).
3. **Normalizar ANTES de commitear.** El gate corre `prettier --write` / `eslint --fix`: si commiteás primero y normalizás después, el árbol queda sucio y hay que rehacer commits.
4. **Los tests de presentación son puntos de decisión, no bloqueantes.** Un restyle *puede* cambiar lo que un test fija, pero entonces el test se actualiza **en el mismo commit** y a propósito. Lo prohibido es romperlo en silencio. Hay aserciones que fijan implementación y no valor para el usuario y conviene reescribirlas (ejemplo real: un `findAllByText("Transportista asignado")).toHaveLength(2)` que congelaba una duplicación card/overlay; se cambió a `findByText(...)` en el commit que deduplicó).
5. **Presentación ≠ comportamiento.** El restyling no cambia flujos, validaciones, navegación ni contratos de red. Cuando un pedido sí toca comportamiento (ej. caché), se documenta y se decide aparte.
6. **`git status` antes de delegar o commitear.** Una vez el árbol tenía ediciones sin commitear de una persona y se commiteó sin querer. Si hay cambios que no son tuyos: **parar y reportar**.
7. **Tokens antes que componentes.** Nada de familias crudas de Tailwind (`emerald-*`, `sky-*`, …); todo por tokens semánticos en `src/styles.css` (`:root` / `.dark`, mapeados en `@theme inline`). Nada de px fijos (`text-[Npx]`, `w-[Npx]`, …): la escala se maneja con `html { font-size: 142.9% }` y todo es rem-based.
8. **Tres roles de radio y nada más:** Pill (`rounded-full`) para lo accionable, Panel (`rounded-2xl`) para lo que contiene, Inset (`rounded-xl`) para lo que va dentro de un panel. **Un hijo nunca puede quedar más redondo que su contenedor.**
9. **Regla de superficies:** fondo de página beige (`--background`), toda superficie que contiene campos en `--card`, y ningún campo interactivo resolviendo al fondo de página.
10. **Sin iconos decorativos en headers.** Se retira un icono si al quitarlo no se pierde información; se conserva sólo si codifica dirección o estado.
11. **Movimiento: sutil, corto y con guarda.** Toda animación ≤200ms para feedback de UI, y **tiene que degradar** bajo la guarda global de `prefers-reduced-motion` (que ya está en `styles.css`). Nada de animación que tape un loading o retrase contenido.

## 3. Qué se hizo en el dador (estado al cierre de estas dos sesiones)

Todo está commiteado en `smartruck-dador` (rama `main`, **local, sin pushear** salvo lo que ya estaba). Resumen por bloque:

- **Fundación de layout:** primitivas compartidas `PageContainer` / `PageHeader` / `PageSection` (`src/components/layout/`), loader compartido (`src/components/ui/loader.tsx`) y `defaultPendingComponent` en el router. Cierran un hueco que el contrato de portado nombraba pero no existía en código.
- **D.X.2.1 (publicación):** rail lateral sticky con precio + acción de publicar (una sola instancia de cada botón), estados visibles del precio, badges A/B y marcas de obligatorio consistentes con el schema, aviso de precio manual tokenizado, preview de ruta con estado de carga y distancia unificada, paradas intermedias demotadas.
- **D.X.2.2 (item de lista):** estado y ruta como primera línea de lectura, un solo precio, campos en boxes con label, semántica de lista y `focus-visible`, skeleton de carga, y una familia nueva de tokens `--status-*` (un color por estado, claro+oscuro, todos ≥ AA).
- **D.X.2.3 (detalle):** precio jerarquizado, stepper legible a distancia (sin `opacity-50` ni `animate-pulse`, con línea de progreso), tokens en los estados, alerta informativa dentro de la hoja de ruta, descripción 3/4 + pago acordado 1/4.
- **Caché de datos:** se empezó a usar **TanStack Query** de verdad (antes estaba instanciado y sin usar: 0 `useQuery`). Defaults globales en `src/router.tsx` y queries cacheadas del detalle, el listado y la geometría de ruta, más invalidación al confirmar entrega y al publicar.
- **Fix de auth (verificación):** el fetch de perfil se "latcheaba" en el primer fallo y la UI quedaba en "no verificado" con el backend devolviendo `VERIFIED`. Ahora la guarda se setea sólo en éxito (con un reintento acotado), el predicate es null-safe y durante la carga se muestra un estado neutro.
- **D.X.3 (animaciones):** guarda global de movimiento reducido, `RoadLoader` (ruta + camión SVG inline viajando, con subtítulo por prop) montado en confirmación de cuenta y logout, spinner in-place en botones, transición de entrada al cambiar de tab, hover de elevación en cards, entrada de listados, borde girando en la acción pendiente, sonido de éxito al publicar y animación de apertura de popups.

## 4. Cambios pendientes del BACKEND

> Los números de línea y nombres de archivo de esta sección salen de **relevar el repo `smartruck-backend`** al investigar el bug de hora. Conviene verificarlos contra el código actual antes de implementar.

### 4.1 Contrato de fechas: normalizar `aware` → local Argentina naive (CRÍTICO)

**Qué pasa.** El backend declara las fechas de carga como **hora local argentina naive**: `pickup_date` y `delivery_deadline` se persisten en columnas `TIMESTAMP WITHOUT TIME ZONE`.

Evidencia relevada:
- `src/infrastructure/outbound/time/system_date_time_provider.py` — el "ahora" del dominio es `datetime.now(ARGENTINA).replace(tzinfo=None)`.
- `src/infrastructure/outbound/persistence/models/load.py` y `migrations/versions/0001_initial_schema.py` — columnas `sa.DateTime()` (naive).
- El test de aceptación exige **eco exacto**: `test/acceptance/.../crear_oferta_carga_steps.py` manda `"2026-08-20T08:00:00"` y espera el mismo string.

**Qué rompía.** El portal dador serializaba la hora del picker (wall clock naive) con offset `-03:00`. Al castear un `timestamptz` a una columna naive con la sesión en UTC, Postgres guardaba **+3h** (`12:00` → `15:00`). El dato quedaba mal **persistido** (por eso también lo veía mal el transportista, que sólo lee). El bug afectaba **toda** hora cargada, no sólo el default.

**Qué ya se hizo (del lado dador, en `smartruck-dador`).** Se corrigió el serializador para emitir hora local naive sin offset ni `Z` (`toBackendLocalDateTime` en `src/lib/date.ts`, con test unitario). Los envíos nuevos llegan correctos.

**Qué falta del lado backend (red de seguridad).** El backend sigue aceptando strings con offset de cualquier cliente. La recomendación es un **validador de entrada** que normalice a hora local argentina naive antes de que el valor llegue al caso de uso. Punto de entrada relevado: `src/infrastructure/inbound/http/.../create_load_request.py` (`pickup_date: datetime`, `delivery_deadline: datetime`).

Comportamiento propuesto:
```
si el datetime viene aware  → astimezone(America/Argentina).replace(tzinfo=None)
si viene naive              → dejarlo igual (comportamiento actual, no romper clientes)
```

Criterios de aceptación sugeridos:
- **CA1:** un `pickup_date` con offset (`2026-09-20T12:00:00-03:00`) se persiste y se devuelve como `2026-09-20T12:00:00` (hora local argentina), no `15:00`.
- **CA2:** un `pickup_date` naive sigue comportándose exactamente como hoy (el contrato de eco exacto del test de aceptación no cambia).
- **CA3:** aplica a `pickup_date` y `delivery_deadline` por igual.
- **CA4:** existe un test de aceptación que manda un datetime **con offset** y verifica el eco; hoy la suite sólo manda naive, que es justamente por lo que el bug no se detectó.

### 4.2 Backfill de las cargas ya persistidas con +3h

El fix del dador **no repara** las filas ya guardadas con el offset aplicado. Hay que decidir y ejecutar una migración de datos (o un script acotado) que reste 3h a las fechas de las cargas afectadas, con criterio de alcance claro (ventana temporal / todos los registros) y su propio respaldo. Es una decisión de producto: conviene confirmarla antes de tocar datos.

### 4.3 Confirmar el mapeo del status `bloqueada`

Un commit reciente del portal dador (`fix(load): update status mapping for 'bloqueada'`) cambió el mapeo del lado frontend: `bloqueada` ahora mapea a **`Publicada`** y `cancelada` a `Cancelada`; además desapareció `Bloqueada` del mapeo inverso.

Dos consecuencias a chequear con quien lo hizo:
- **Producto:** hoy una carga `bloqueada` se muestra como **"Publicada"** en el dador. Si eso no es intencional, es un bug de presentación de estado (no de datos).
- **Código:** el estado UI `Bloqueada` y el token `--status-bloqueada` del dador quedaron **inalcanzables** (dead code) — hay que decidir si se limpian o si `bloqueada` debería seguir siendo un estado propio.

Conviene confirmar si el backend **emite** `bloqueada` alguna vez y con qué semántica.

## 5. Dónde quedó guardada la información

Tres capas, de más durable a menos:

| Capa | Qué contiene | Portabilidad |
|------|--------------|--------------|
| **Git (este repo)** | Los commits del dador: cada cambio con su mensaje, y los tests que lo respaldan. Los mensajes llevan el ID de task (`D.X.2.1`, `D.X.3.2`, …). | Alta — es el registro de verdad. |
| **Docs (este archivo + `restyling.md`)** | El contrato visual de la épica y este handoff. | Alta — pensado para pegarse en cualquier chat. |
| **Engram (memoria persistente del entorno)** | El detalle de cada sesión: baseline, plan, implementación, correcciones, el contrato de fechas y las animaciones. Topic keys bajo el proyecto `smartruck-dador`: `ui/restyling-baseline`, `ui/restyling-dx2-plan`, `ui/restyling-dx2-implementacion`, `ui/restyling-dx2-correcciones`, `bugfix/datetime-naive-argentina-contract`, `ui/restyling-dx3-animaciones`, `ui/restyling-dx3-sonido-popups`. | **Baja** — requiere el entorno con Engram habilitado; no sirve para un proveedor externo. |

**Conclusión:** para trabajar esto en otro chat o en un proveedor externo, usá **este documento**. Engram no viaja.
