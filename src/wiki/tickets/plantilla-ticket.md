# Plantillas de ticket

Copiá el bloque que corresponda y completá los campos.

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
- [ ] D-1.2.1 — … (repo: …, US points: …)
- [ ] D-1.2.2 — … (repo: …, US points: …)

### Notas / dependencias
-
```

## Task

```markdown
## D-1.2.1 — <Título corto>

### Historia
D-1.2

### Repositorio
smartruck-backend | smartruck-dador | smartruck-transportista | …

### US points
<N>

### Descripción
<Qué hay que hacer, de forma concreta>

### Criterios de aceptación
- [ ] …
- [ ] …

### Gherkins
- Aplica: sí / no
- Si aplica: path(s) en `main` (ej. `features/...`)

### Notas técnicas
-
```

## Checklist

- [ ] ID y prefijo correctos
- [ ] Historia en Como / Quiero / Para
- [ ] Task con CA en la descripción, US points, repo
- [ ] Si aplica BDD: Gherkins en `main` (DoR)

## Next step

[Tipos de ticket](tipos-de-ticket.md) · [DoR](../proceso/definition-of-ready.md)
