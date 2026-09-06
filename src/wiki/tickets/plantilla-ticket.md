# Plantillas de ticket

Copiá el bloque que corresponda y completá los campos.

## Cuerpo obligatorio de una **task**

En la descripción del ticket (tracker) deben figurar, como mínimo, estos títulos:

| Sección | Contenido |
|---------|-----------|
| **Descripción** | Qué hay que hacer y por qué (contexto breve) |
| **Alcance** | Qué incluye y qué **no** incluye esta task |
| **Criterios de aceptación** | Checklist verificable (testeable) |
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

## Task

```markdown
## T-7.1.2 — <Título corto>

### Historia
T-7.1

### Repositorio
smartruck-backend | smartruck-dador | smartruck-transportista | smartruck-audit | …

### Tag
<dador | transportista | backend | audit | …>

### Prioridad
low | medium | high | urgent

### US points
<N>

### Horas estimadas
<N> h  *(completar al comenzar la task)*

### Horas hombre insumidas
<N> h  *(completar al finalizar / Done)*

### Descripción
<Qué hay que hacer, de forma concreta, y contexto breve>

### Alcance
- Incluye:
- No incluye:

### Criterios de aceptación
- [ ] …
- [ ] …

### Gherkins
- Aplica: sí / no
- Si aplica: link o path en el repo (en `main`), ej.
  - `https://github.com/smartruck-ar/<repo>/blob/main/test/acceptance/features/....feature`
  - o path: `test/acceptance/features/....feature`
- Formato del feature: ver [Convención de Gherkin](../proceso/gherkin.md)

### Notas técnicas
-
```

## Ejemplo mínimo (task técnica)

```markdown
## T-7.1.2 — Implementar un log manager que loguee a stdout

### Historia
T-7.1

### Repositorio
smartruck-backend

### Descripción
Implementar un LogManager que escriba logs estructurados a stdout,
como base para auditar acciones del transportista.

### Alcance
- Incluye: puerto/adapter, niveles info/error, formato JSON, tests unitarios
- No incluye: cablear todos los controllers/repos ni dashboards en Grafana

### Criterios de aceptación
- [ ] LogManager usable desde infrastructure
- [ ] info y error escriben a stdout en JSON (level, message, service, env)
- [ ] Tests unitarios verifican la emisión del log

### Gherkins
- Aplica: no
```

## Checklist

- [ ] ID y prefijo correctos
- [ ] Historia en Como / Quiero / Para
- [ ] Task con **Descripción**, **Alcance**, **Criterios de aceptación**
- [ ] Gherkins: link en el repo o “no aplica”
- [ ] US points, tag, prioridad y repo
- [ ] Al comenzar: horas estimadas; al Done: horas insumidas

## Next step

[Tipos de ticket](tipos-de-ticket.md) · [DoR](../proceso/definition-of-ready.md)
