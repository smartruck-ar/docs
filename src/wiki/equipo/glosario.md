# Glosario

Términos del proceso y del dominio.

## Proceso

| Término | Significado |
|---------|-------------|
| Épica | Milestone de `roadmap` que agrupa historias (`D.2 - Gestión de carga`); no se estima; Done = todas sus historias en productivo |
| Historia (user story) | Issue de `roadmap` con label `user story`, título Como/Quiero/Para y número `<épica>.<n>` (`D.2.8`); Done = en productivo |
| Historia de UI | Contraparte de pantalla de una historia de backend; mismo número con prefijo `UI-` (`UI-D.2.8`) |
| Sub-historia | Sub-issue de una historia; hereda su número (`T.1.1.1`) |
| Spike | Historia de investigación o decisión; milestone `SPIKES`, número `S.<n>`; sin Gherkins |
| Board | Proyecto de GitHub de la organización con las historias del sprint y sus campos |
| Status | Estado en el Board: `Backlog`, `Ready`, `In progress`, `In review` (en `test`), `Done` (en `prod`) |
| US Points | Estimación relativa de una historia; requerida en DoR |
| Priority | Prioridad de la historia en el Board |
| Estimate (hs) | Horas hombre previstas; se cargan al pasar a `In progress` |
| Spent (hs) | Horas hombre reales; se cargan al liberar a `test` (`In review`) |
| Release a test | `./scripts/release_to_test patch\|minor\|major` al terminar una feature |
| Release a prod | `./scripts/release_to_prod`, a mano, con el equipo, al final del sprint |
| Logging | En controladores (entrada + errores) y repositorios (salida); ver [logging](../proceso/logging.md) |
| Gherkin | BDD en español; **Cuando** contra la app; en `main` + link en el ticket si aplica; [gherkin](../proceso/gherkin.md) |
| DoR | Definition of Ready |
| DoD | Definition of Done (jerárquico; productivo) |
| Prefijo `D` / `T` / `R` / `B` / `S` | Dador / Transportista / Servicio de rutas / Backoffice / Spikes |

## Dominio / producto

| Término | Significado |
|---------|-------------|
| Dador (shipper) | Publica / gestiona demanda de carga |
| Transportista | Opera / cotiza / gestiona el transporte |
| Provincia | División administrativa de Argentina a la que pertenece una localidad |
| Localidad (`Locality`) | La ciudad: un lugar con coordenadas que pertenece a una provincia. Es el origen y el destino de una ruta. "Ciudad" es su nombre coloquial |
| Catálogo de localidades | Las localidades que Geoservice conoce hoy (las 150 ciudades de las rutas precargadas). Una localidad fuera del catálogo es "no soportada" |
| Geoservice | Componente Cloudflare Worker dueño de provincias, localidades, direcciones, geocodificación y rutas. |
| Ruta | Camino vial entre dos localidades (distancia, duración y geometría); se identifica por el par de ids de localidad, sin importar el sentido |
| Estimación | Distancia en línea recta por un factor vial configurable; Geoservice la marca `is_estimation` y nunca la guarda |
| Oferta de carga | *(completar con el lenguaje de dominio del equipo)* |
| Viaje solicitado | El viaje que el transportista pide recomendar: una localidad de origen y una de destino (Buenos Aires → Córdoba) |
| Tramo vacío de inicio | Lo que el camión recorre sin carga desde el origen del viaje solicitado hasta el origen de la carga |
| Tramo cargado | Lo que el camión recorre con la carga, desde su origen hasta su destino |
| Tramo vacío de fin | Lo que el camión recorre sin carga desde el destino de la carga hasta el destino del viaje solicitado |
| Desvío neto | Los km de más por tomar la carga: tramo vacío de inicio + tramo cargado + tramo vacío de fin − viaje solicitado; nunca es negativo |
| Km realizados | Todo lo que el camión recorre al tomar la carga: tramo vacío de inicio + tramo cargado + tramo vacío de fin |
| Aprovechamiento | Qué parte de los km realizados el camión va con carga: km del tramo cargado / km realizados. Vale 1 cuando va cargado todo el recorrido; baja con los km vacíos |
| Plata por km | Lo que paga la carga por cada km realizado: precio máximo / km realizados, tramos vacíos incluidos |
| Puntaje | Qué tan conveniente es una carga para el viaje solicitado, de 0 a 100: 50 × aprovechamiento + 50 × plata por km comparada con la mejor de las recomendadas, redondeado a entero. 100 es una carga que va cargada todo el recorrido y paga por km lo mejor de las recomendadas |
| Ventana de retiro | El rango de días en que el transportista puede retirar una carga: desde `pickup_from` hasta `pickup_to`, ambos incluidos. Sin `pickup_from` empieza ahora; nunca incluye cargas con retiro pasado |
| Fecha máxima de entrega | El último día (incluido) en que el transportista puede entregar. Se compara con la fecha límite de entrega de la carga; una carga sin fecha límite no se recomienda |
| | |

## Repositorios

| Nombre | Rol breve |
|--------|-----------|
| smartruck-backend | API FastAPI hexagonal |
| smartruck-dador | Frontend Dador (TanStack Start) |
| smartruck-transportista | Frontend Transportista |
| smartruck-audit | Logs / auditoría (Promtail → Loki → Grafana) |
| cloud-template | Plataforma Nomad + Terraform OCI |
| infra-template | Template de microservicio Docker/Nomad/GHCR |

## Next step

[Repositories](../../repositories/README.md)
