# Plantillas de ticket

Los campos del tracker (título, historia padre, repositorio, tag, prioridad, US points, horas) van **fuera** de la descripción. Acá solo se define el **cuerpo** que se pega en la descripción del ticket.

## Cuerpo obligatorio de una **task**

| Sección | Contenido |
|---------|-----------|
| Párrafo inicial | Contexto del problema o necesidad y qué se debe hacer |
| **Objetivo** | Qué se busca lograr con esta entrega |
| **Alcance** | Qué incluye y qué **no** incluye (usar *Fuera de alcance*) |
| **Criterios de aceptación** | Condiciones verificables numeradas (`CA1`, `CA2`, …) — no checklist |
| **Gherkins** (si aplica) | Link/path a los `.feature` en el **repositorio** (rama `main`) |

Si no aplica BDD: indicar explícitamente `Gherkins: no aplica`.

---

## Épica

```markdown
## D-1 — <Título de la épica>

### Objetivo
<Qué problema de negocio resuelve>

### Alcance
- Incluye:
- No incluye:

### Historias
- [ ] D-1.1 — …
- [ ] D-1.2 — …

### Notas
-
```

## Historia de usuario

```markdown
## D-1.2 — <Título corto>

**Como** <rol / actor>
**Quiero** <capacidad>
**Para** <beneficio>

### Épica
D-1

### Tasks
- [ ] D-1.2.1 — … (repo: …, tag: …, prioridad: …, US points: …)
- [ ] D-1.2.2 — … (repo: …, tag: …, prioridad: …, US points: …)

### Notas / dependencias
-
```

## Descripción de task (pegar en el tracker)

```markdown
<Párrafo inicial: contexto del problema o necesidad y qué se debe hacer.>

---

## Objetivo

<Qué se busca lograr con esta entrega, en una o dos oraciones.>

---

## Alcance

- <Ítem incluido>
- <Ítem incluido>

### Fuera de alcance

- <Qué no incluye esta task>

---

## Criterios de aceptación

**CA1 - <Título corto>:** <Condición verificable.>

**CA2 - <Título corto>:** <Condición verificable.>

**CA3 - <Título corto>:** <Condición verificable.>

---

## Gherkins

No aplica.
```

### Variante con CA más detallados

Si un criterio necesita detalle (pasos, contrato, notas), usar encabezado `###` y cuerpo debajo:

```markdown
## Criterios de aceptación

### CA1 — <Título corto>

<Detalle del criterio. Puede incluir listas, tablas o ejemplos.>

---

### CA2 — <Título corto>

<Detalle del criterio.>
```

## Ejemplo mínimo (task técnica)

```markdown
Implementar un LogManager que escriba logs estructurados a stdout, como base para auditar acciones del transportista. Esta task no audita aún todas las acciones: eso será en tasks posteriores que usen el manager en controllers/repos.

---

## Objetivo

Disponer de un mecanismo de logging reutilizable en el backend que emita a stdout en formato estructurado, verificable por tests unitarios y listo para consumo por el stack de auditoría.

---

## Alcance

- Puerto/adapter de LogManager usable desde infrastructure (controllers/repos).
- Niveles `info` y `error` (como mínimo).
- Formato JSON a stdout.
- Tests unitarios que verifiquen la emisión del log.

### Fuera de alcance

- Cablear todos los controllers/repos.
- Dashboards o configuración en Grafana/Loki.

---

## Criterios de aceptación

**CA1 - LogManager disponible:** Existe un LogManager (puerto/adapter) usable desde infrastructure (controllers/repos).

**CA2 - Emisión a stdout:** `info` y `error` (como mínimo) escriben a stdout.

**CA3 - Formato estructurado:** El log es JSON e incluye al menos: `level`, `message`, `service` (ej. `smartruck-backend`), `env`.

**CA4 - Verificación por tests:** Tests unitarios verifican que al invocar el manager se emite el log esperado (nivel + mensaje / campos).

**CA5 - Sin secretos:** No loguea secretos (documentado / sin campos de password/token en la API del manager).

**CA6 - Alineación a convención:** Queda alineado a la convención de logging (controllers y repositorios); el cableado en esos bordes puede ser otra task.

---

## Gherkins

No aplica.
```

## Checklist

- [ ] ID y prefijo correctos (en el tracker)
- [ ] Historia en Como / Quiero / Para
- [ ] Descripción con Objetivo, Alcance y Criterios (`CA1`, `CA2`, …)
- [ ] Gherkins: link en el repo o “no aplica”
- [ ] US points, tag, prioridad y repo (en el tracker)
- [ ] Al comenzar: horas estimadas; al Done: horas insumidas

## Next step

[Tipos de ticket](tipos-de-ticket.md) · [DoR](../proceso/definition-of-ready.md)
