# Jerarquía de trabajo

Cómo se organizan épicas, historias de usuario y tasks en SmartTruck.

## Modelo

```text
Épica          D-1 / T-1
  └── Historia D-1.2 / T-1.2     (Como / Quiero / Para; sin repo)
        └── Task D-1.2.1         (descripción + CA + US points + repo; Done = productivo)
```

## IDs

El prefijo identifica el producto y se hereda en toda la cadena.

| Prefijo | Producto |
|---------|----------|
| `D` | Dador |
| `T` | Transportista |

| Nivel | Formato ID | Ejemplo |
|-------|------------|---------|
| Épica | `{Prefijo}-{N}` | `D-1` |
| Historia | `{Prefijo}-{N}.{M}` | `D-1.2` |
| Task | `{Prefijo}-{N}.{M}.{K}` | `D-1.2.1` |

- `N` = número de épica  
- `M` = número de historia dentro de esa épica  
- `K` = número de task dentro de esa historia  

## Qué lleva cada nivel

### Épica

- Objetivo de negocio amplio.
- Agrupa historias.
- **No** se estima en story points.
- **No** tiene repositorio asociado.

### Historia de usuario

- Formato obligatorio:

  > **Como** …  
  > **Quiero** …  
  > **Para** …

- **No** tiene repositorio asociado (el trabajo técnico vive en las tasks).
- Pertenece a una épica.

### Task

- Compone una historia: describe **qué hay que hacer**.
- Incluye **criterios de aceptación** en la descripción.
- Se estima en **US points** (requerido para [DoR](definition-of-ready.md)).
- Si aplica BDD: Gherkins en `main` antes de Ready.
- **Sí** se asocia a un repositorio (`smartruck-backend`, `smartruck-dador`, etc.).
- No usa el formato Como/Quiero/Para.

## Completitud (bottom-up, productivo)

Done implica **ambiente productivo**. Detalle en [DoD](definition-of-done.md).

| Nivel | Se completa cuando… |
|-------|---------------------|
| Task | Está en **productivo** (y cumple DoD de task) |
| Historia | Todas sus tasks están en **productivo** |
| Épica | Todas sus historias están Done (todas las tasks de esas historias en **productivo**) |

## Ejemplo

```text
D-1 — Alta de viajes (épica)
  D-1.1 — Como dador quiero crear un viaje para publicar demanda
    D-1.1.1 — API crear viaje (repo: smartruck-backend)
    D-1.1.2 — Pantalla alta de viaje (repo: smartruck-dador)
  D-1.2 — Como dador quiero listar mis viajes para hacer seguimiento
    D-1.2.1 — Endpoint listado (repo: smartruck-backend)
    D-1.2.2 — Listado en UI (repo: smartruck-dador)
```

## Checklist

- [ ] El ID respeta prefijo + numeración (`D-1.2.1`)
- [ ] La historia está en Como / Quiero / Para
- [ ] Cada task tiene descripción, CA, US points y repo
- [ ] No se estiman épicas ni se asigna repo a historias

## Next step

- [Definition of Ready](definition-of-ready.md)
- [Plantilla de ticket](../tickets/plantilla-ticket.md)
