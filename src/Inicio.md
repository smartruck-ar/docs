# Smartruck

**Smartruck** es el Trabajo Profesional del **Grupo 179** (FIUBA): una plataforma digital B2B diseñada para conectar **dadores de carga** con **transportistas de carga pesada** en la República Argentina, con foco en reducir los kilómetros recorridos en vacío, mejorar la rentabilidad de cada viaje y disminuir las emisiones de CO2 asociadas.

## Qué resuelve la plataforma

El ecosistema coordina la publicación, cotización, búsqueda geográfica, reserva exclusiva y seguimiento de cargas de larga distancia entre dos portales operativos dedicados y un panel de administración, respaldados por un backend hexagonal y un microservicio geográfico en el borde.

## Convención de prefijos en el tablero

Cada historia técnica o funcional en los repositorios y tableros sigue la convención de prefijo del área a la que pertenece:

| Prefijo | Área / Dominio |
| :--- | :--- |
| **`D`** | **Dador de carga** — Publicación, cotización, depósitos, verificación, seguimiento y métricas. |
| **`T`** | **Transportista** — Flota, búsqueda inteligente y de paso, calculadora de retorno vacío, reserva, pagos y viajes. |
| **`B`** | **Backoffice** — Revisión documental, habilitación de perfiles y administración de tarifarios de referencia. |
| **`R`** | **Ruteo y geografía** — Servicio geográfico (`geo-service` / `microservice-routes`), rutas interurbanas y localidades. |
| **`S`** | **Soporte, arquitectura e infraestructura** — Base transversal, CI/CD, seguridad, observabilidad y Terraform. |

## Estructura de esta documentación

- [Descripción del proyecto](./proyecto.md) — Problema, actores, modelo operativo y alcance general.
- [Arquitectura](./arquitectura.md) — Diseño de alto nivel, componentes, integraciones externas y despliegue vigente.
- [Riesgos](./riesgos.md) — Matriz histórica, riesgos mitigados durante la implementación y riesgos abiertos.
- [Requerimientos](./requerimientos.md) — Requerimientos funcionales por dominio y atributos no funcionales.
- [Metodología de trabajo aplicada](./metodologia.md) — Scrum, XP, BDD en Gherkin, ADRs, validación en campo y flujo en GitHub.
- [Guía de desarrollo](./desarrollo.md) — Repositorios, requisitos de entorno local, scripts compartidos y convenciones técnicas.
- [Manual de usuario](./manual_usuario.md) — Guías operativas para la landing y los portales de Dador, Transportista y Backoffice.
- [Wiki del equipo](./wiki/README.md) — Procesos, criterios DoR/DoD, convenciones de tickets, glosario y handoffs de diseño.
- [Repositories](./repositories/README.md) — Documentación técnica específica por repositorio, stack y enlaces.
