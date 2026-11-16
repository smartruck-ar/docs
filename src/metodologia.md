# Metodología de trabajo aplicada

El equipo adopta un marco híbrido basado en **Scrum**, prácticas de **Extreme Programming (XP)** y **Behavior-Driven Development (BDD)**, adaptado al ciclo iterativo de un Trabajo Profesional y apoyado en automatizaciones en GitHub Projects (`smartruck-ar/roadmap`).

---

## Marco ágil e iteraciones semanales

- **Sprints de 1 semana:** Cada iteración culmina con una **demo funcional** integrada y la revisión del incremento frente a los objetivos comprometidos.
- **Retrospectivas en tablero Miro:** Al cierre de cada ciclo el equipo analiza qué funcionó, qué bloqueó la entrega y define acciones concretas de mejora para la semana siguiente.
- **Refinamiento y diseño previo:** Las historias de usuario nacen de conversaciones de descubrimiento y validaciones técnicas antes de pasar al estado listo para implementar.

---

## Gestión del tablero (`roadmap`)

El seguimiento centralizado opera sobre GitHub Projects en [`smartruck-ar/roadmap`](https://github.com/smartruck-ar/roadmap), organizando el trabajo bajo los prefijos `D` (Dador), `T` (Transportista), `B` (Backoffice), `R` (Ruteo/Geografía) y `S` (Soporte/Plataforma).

### Estados y métricas de seguimiento

- **Flujo de columnas:** `Backlog` -> `Ready` -> `In progress` -> `In review` -> `Done`.
- **Estimación dual:** Cada historia registra **US Points** (escala relativa de complejidad) junto a **Estimate (hs)** y **Spent (hs)** reales para calibrar la capacidad semanal del equipo.
- **Trazabilidad ticket <-> PR:** Las historias y sub-tareas se vinculan mediante automatizaciones entre el repositorio `roadmap` y los repositorios de producto. Ver detalles en [Plantilla de ticket](./wiki/tickets/plantilla-ticket.md), [Estimación](./wiki/tickets/estimacion.md) y [Automatización de historias](./wiki/tickets/automatizacion-historias.md).

---

## Prácticas de ingeniería (XP + BDD + ADRs)

### Desarrollo guiado por comportamiento (BDD) y pruebas continuas

- Las reglas de negocio críticas se redactan en escenarios **Gherkin en español** (`# language: es`, `Dado` / `Cuando` / `Entonces`), sirviendo como contrato compartido entre producto y código ([Convenciones Gherkin](./wiki/proceso/gherkin.md)).
- En `smartruck-backend`, el pipeline exige cobertura mínima del **85%** (`pytest --cov-fail-under=85`) además de pruebas unitarias, integración y aceptación BDD (`pytest-bdd`). En frontend y `geo-service` ejecutan suites `Vitest`, verificación de tipos (`tsc`) y linters (`ESLint` / `Ruff`).

### Decisiones de arquitectura (ADR) y especificaciones

- Cuando una disyuntiva afecta contratos entre servicios, responsabilidades de datos o tolerancia a fallos (como la propiedad geográfica de `geo-service` frente a direcciones en backend), se documenta formalmente mediante **Architecture Decision Records (ADRs)** versionados en `docs/adr/` (`0001` a `0004`).
- Funcionalidades transversales complejas (matching de paso, puntaje, tarifas por categoría, pagos y plazos, métricas reales, cancelaciones y notificaciones) cuentan con especificaciones técnicas previas versionadas en `docs/specs/`.

### Trunk-based development y flujo de entrega

- Integración continua directamente sobre **`main`** mediante commits atómicos siguiendo [Conventional Commits](./wiki/proceso/conventional-commits.md) (`feat|fix|refactor(historia): ...`, sin atribución automática).
- Despliegue continuo a **`test`** y promoción controlada a **`prod`** mediante etiquetas y scripts estandarizados (`release_to_test` / `release_to_prod`) documentados en [Workflow de entrega](./wiki/proceso/workflow-entrega.md).
- Validación de seguridad automática en todos los repositorios mediante escaneo de secretos con **Gitleaks** en GitHub Actions y autenticación **WIF (OIDC)** sin claves estáticas de larga duración hacia GCP.

### Desarrollo asistido por agentes

- El equipo estandarizó instrucciones, reglas de arquitectura hexagonal y habilidades reutilizables en el repositorio [`smartruck-ai`](./wiki/proceso/desarrollo-con-agentes.md), manteniendo al desarrollador como responsable de las decisiones de diseño, revisión y verificación.

---

## Validación empírica en campo

Las hipótesis de usabilidad, cotización y operación real fueron contrastadas mediante entrevistas y pruebas con actores reales del sector logístico argentino:

- **Productos Venier S.A.** (perspectiva de dador de cargas): validación de carga de depósitos, categorías/embalajes, publicación de oferta y criterios de tarifa mínima.
- **Transporte Uliana** (perspectiva de transportista): validación del flujo de calculadora de costo hundido en retorno vacío, búsqueda sobre corredor vial, comprensión de la comisión de desbloqueo y usabilidad móvil del portal.

Los hallazgos de campo retroalimentaron directamente ajustes en la taxonomía de cargas, el esquema de pisos tarifarios y las métricas económicas visibles en ambos tableros.

---

## Criterios de calidad

- **Preparación de historias:** Verificado contra [Definition of Ready (DoR)](./wiki/proceso/definition-of-ready.md).
- **Aprobación de incrementos:** Verificado contra [Definition of Done (DoD)](./wiki/proceso/definition-of-done.md).
