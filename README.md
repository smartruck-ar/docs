# Smartruck — documentación (mdBook)

Documentación del proyecto **Smartruck** — Trabajo Profesional (Grupo 179) — FIUBA.

El contenido publicado vive en [`src/`](src/) y se genera con [mdBook](https://rust-lang.github.io/mdBook/).

## Quick path

```bash
# Requiere mdBook >= 0.4 (el del snap v0.0.28 NO soporta subsecciones anidadas)
# Binario alineado al CI:
#   curl -fsSL https://github.com/rust-lang/mdBook/releases/download/v0.4.37/mdbook-v0.4.37-x86_64-unknown-linux-gnu.tar.gz \
#     | tar -xz -C ~/.local/bin mdbook

export PATH="$HOME/.local/bin:$PATH"
mdbook --version   # debe mostrar v0.4.x

mdbook serve --open
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
