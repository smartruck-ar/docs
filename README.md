# Documentación técnica de Smartruck

Documentación técnica orientativa en español del proyecto **Smartruck** (Trabajo Profesional Grupo 179 — FIUBA), publicada automáticamente mediante **mdBook**.

---

## Convención de prefijos en el proyecto

| Prefijo | Área |
| :--- | :--- |
| **`D`** | Dador de cargas |
| **`T`** | Transportista |
| **`B`** | Backoffice |
| **`R`** | Ruteo y geografía (`geo-service`) |
| **`S`** | Soporte, arquitectura, plataforma e infraestructura |

---

## Estructura del repositorio

- `src/`: fuentes Markdown del mdBook (`Inicio.md`, `proyecto.md`, `arquitectura.md`, `riesgos.md`, `requerimientos.md`, `metodologia.md`, `desarrollo.md`, `manual_usuario.md`, `wiki/` y `repositories/`).
- `adr/`: Architecture Decision Records (`0001` a `0004`).
- `specs/`: especificaciones técnicas funcionales y arquitectónicas.
- `.github/workflows/deploy.yml`: compilación con `mdbook` v0.4.37 y publicación a GitHub Pages desde `main`.

---

## Previsualización local

Requiere **mdBook (>= 0.4)**:

```bash
mdbook serve --open
```

Para generar únicamente los archivos estáticos en `./book`:

```bash
mdbook build
```
