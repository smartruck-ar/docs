# Roles y responsables

## Equipo de desarrollo — Grupo 179 (FIUBA)

Trabajo Profesional de Ingeniería Informática (`TA053`):

| Rol | Integrantes / Referentes |
| :--- | :--- |
| **Equipo de desarrollo** | Martín Reimundo (`106716`), Mateo Riat Sapulia (`106031`), Franco Agustín Rodriguez (`108799`), Marcos Navarro Cafferata (`106974`) |
| **Tutoría técnica** | Mg. Ing. Gabriel Piñeiro (Tutor), Ing. Agustín Perrotta (CoTutor) |
| **Jefatura de Cátedra** | Mg. Ing. Carlos Fontela, Ing. Leandro Ferrigno |

---

## Organización operativa y propiedad compartida

El equipo trabaja con **propiedad colectiva del código**, rotación de tareas por sprint en `smartruck-ar/roadmap` y revisión cruzada obligatoria de cambios sobre `main`. Los prefijos del tablero dividen el trabajo por dominio funcional:

| Prefijo | Área de foco | Alcance principal |
| :--- | :--- | :--- |
| **`D`** | Portal Dador y dominio oferente | Registro, depósitos, publicación, cotización, cancelación y métricas de ahorro. |
| **`T`** | Portal Transportista y matching | Flota, calculadora de retorno vacío, búsqueda PostGIS/corredor, bloqueo/pagos y viajes. |
| **`B`** | Backoffice administrativo | Validación documental de cuentas y administración de tarifarios / PDFs FADEEAC. |
| **`R`** | Servicio geográfico (`geo-service`) | Catálogo cerrado de localidades, cálculo de rutas interurbanas y caché en Cloudflare Workers. |
| **`S`** | Plataforma, arquitectura e infra | API core, Terraform (`smartruck-infra`), CI/CD, seguridad JWKS/Gitleaks, observabilidad y `smartruck-ai`. |

---

## Referentes de validación en campo

Para contrastar usabilidad, estructura tarifaria y flujo real de operación en Argentina, el equipo contó con instancias de validación con actores del sector:

- **Productos Venier S.A.:** Validación desde la perspectiva de dador de cargas.
- **Transporte Uliana:** Validación desde la perspectiva de empresa transportista.
