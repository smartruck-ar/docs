# Arquitectura — smartruck-dador

## Responsabilidades

- UI y flujos del actor **Dador** (`D-x.y.z` en tasks de este repo)
- Orquestación de pantallas y llamadas al backend

## Organización

Arquitectura hexagonal:

```text
src/
  domain/
  application/
  infrastructure/
  views/            # pantallas
```

## Límites

| Hace | No hace |
|------|---------|
| Experiencia Dador | Persistencia / reglas centrales del backend |

## Dependencias

| Depende de | Notas |
|------------|-------|
| smartruck-backend | `VITE_SMARTRUCK_BACKEND_API`; stub con `VITE_USE_STUB=true` |
