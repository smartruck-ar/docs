# Smartruck — documentación (mdBook)

Documentación del proyecto **Smartruck** — Trabajo Profesional (Grupo 179) — FIUBA.

El contenido publicado vive en [`src/`](src/) y se genera con [mdBook](https://rust-lang.github.io/mdBook/).

## Quick path

```bash
# instalar mdbook (una vez)
cargo install mdbook --version 0.4.37

# vista local
mdbook serve --open

# build estático → ./book
mdbook build
```

En `main`, el workflow [Deploy mdBook](.github/workflows/deploy.yml) publica en GitHub Pages.

## Estructura de `src/`

| Sección | Contenido |
|---------|-----------|
| Páginas raíz | Inicio, proyecto, arquitectura, requerimientos, desarrollo, manual |
| [wiki/](src/wiki/README.md) | Jerarquía, DoR/DoD, tickets, roles, glosario |
| [repositories/](src/repositories/README.md) | Docs por servicio (backend, dador, transportista, templates) |

## Prefijos de trabajo

| Prefijo | Producto |
|---------|----------|
| `D` | Dador |
| `T` | Transportista |

## Next step

Editá páginas en `src/`, actualizá [`src/SUMMARY.md`](src/SUMMARY.md) si agregás capítulos, y verificá con `mdbook serve`.
