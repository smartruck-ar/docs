# Arquitectura — smartruck-transportista

## Responsabilidades

- UI y flujos del actor **Transportista** (historias `UI-T.x.y` de `roadmap`)

## Límites

| Hace | No hace |
|------|---------|
| Experiencia Transportista | Lógica de negocio central del backend |

## Dependencias

| Depende de | Notas |
|------------|-------|
| smartruck-backend | `VITE_SMARTRUCK_BACKEND_API` (inyectada en build vía Infisical en CI) |

## Logging

Convención del equipo: [Logging](../../wiki/proceso/logging.md) — bordes (entrada/salida); errores en el adapter de entrada.
