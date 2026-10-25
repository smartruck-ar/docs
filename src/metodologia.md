# Metodología de trabajo aplicada

El proyecto se desarrolló mediante un enfoque ágil e híbrido. Se conservaron de
Scrum la gestión incremental del producto, la priorización de historias, la
estimación del trabajo y la revisión de los incrementos. De Extreme Programming
(XP) se incorporaron prácticas orientadas a la calidad técnica, como el
desarrollo guiado por pruebas de aceptación, la integración frecuente, los
commits atómicos y la refactorización. Sin embargo, el proceso aplicado no
constituyó una implementación ortodoxa de Scrum ni de XP: se adaptó a un equipo
académico horizontal, con responsabilidades distribuidas y sin un Scrum Master
dedicado.

La unidad principal de planificación fue la **historia de usuario**. Las
historias se registraron en el repositorio `roadmap`, se agruparon en épicas
(milestones) y se asociaron al repositorio de producto correspondiente. El
trabajo se organizó en sprints y en entregas incrementales, aunque la
documentación vigente no establece una duración única para todos los sprints.
La prioridad y el alcance se revisaron durante el desarrollo a partir de las
dependencias, los resultados de las validaciones y la retroalimentación del
equipo y de los tutores.

## Gestión del trabajo

El flujo de gestión aplicado fue el siguiente:

1. Las necesidades se expresaron como historias con formato
   **Como / Quiero / Para** y se agruparon bajo una épica.
2. Durante el refinamiento se definieron los criterios de aceptación, las
   dependencias, la prioridad y los puntos relativos de la historia.
3. Una historia solo podía comenzar cuando cumplía la
   [Definition of Ready](./wiki/proceso/definition-of-ready.md) y pasaba a
   `In progress`.
4. El desarrollo se realizó directamente sobre `main`, con commits pequeños y
   atómicos, siguiendo la convención de
   [Conventional Commits](./wiki/proceso/conventional-commits.md). A diferencia
   de lo previsto inicialmente, el flujo vigente no utiliza ramas de feature ni
   pull requests.
5. Una vez implementada y verificada la funcionalidad, se generó una versión y
   se liberó al ambiente `test`. La historia pasó a `In review` y se registraron
   las horas reales insumidas.
6. Al cierre del ciclo de trabajo, el equipo validó el incremento en `test` y
   promovió la versión a `prod`. Solo en ese momento la historia pasó a `Done`,
   conforme a la [Definition of Done](./wiki/proceso/definition-of-done.md).

Este flujo reemplazó la idea de una entrega final única por incrementos
verificables. La separación entre `main`, `test` y `prod` permitió detectar
problemas antes de la liberación definitiva y conservar evidencia del estado de
cada historia.

## Artefactos y técnicas de planificación

El backlog se organizó en épicas, historias de backend, historias de interfaz y
spikes. La numeración de las historias se asignó automáticamente al vincularlas
con una épica, y las historias de interfaz mantuvieron la referencia a su
contraparte de backend. Esta estructura permitió relacionar el requerimiento,
el código, los escenarios de aceptación y los commits.

La estimación distinguió dos conceptos que en la propuesta inicial aparecían
relacionados:

- **US Points:** estimación relativa de complejidad, incertidumbre y esfuerzo de
  la historia, realizada durante el refinamiento con una escala de Fibonacci
  acotada.
- **Estimate (hs) y Spent (hs):** horas previstas al comenzar la historia y
  horas efectivamente insumidas al liberarla a `test`, respectivamente.

De este modo, los puntos se utilizaron para comparar el tamaño relativo de las
historias y las horas para contrastar la previsión con el esfuerzo real. Las
historias demasiado grandes se analizaron para dividirlas en sub-historias.

## Prácticas de ingeniería y aseguramiento de calidad

Los criterios de aceptación de las historias de backend se expresaron como
escenarios Gherkin en español. Antes de que una historia quedara lista para
desarrollo, los archivos `.feature` debían estar versionados en `main` y
enlazados desde el ticket. El escenario debía ejercitar la aplicación en el
paso `Cuando` y verificar el resultado esperado mediante `Entonces`. Esta
práctica funcionó como una forma de desarrollo guiado por comportamiento (BDD)
y como lenguaje común entre requerimientos, implementación y validación.

La calidad se controló en distintos niveles:

- pruebas unitarias, de integración y de aceptación cuando correspondía;
- ejecución de la suite acordada antes de liberar a `test`;
- validación de los criterios de aceptación sobre el ambiente `test`;
- revisión de la documentación técnica y del README cuando el cambio los
  afectaba;
- control de que no se incorporaran secretos ni configuraciones locales;
- uso de una arquitectura hexagonal y principios de código limpio en los
  servicios que los documentan.

La documentación de infraestructura también evidencia el uso de
Infrastructure as Code mediante Terraform y pipelines automatizados con
GitHub Actions en los templates de plataforma. No obstante, esas prácticas
deben atribuirse al repositorio o servicio donde están implementadas y no
generalizarse automáticamente a todos los componentes del proyecto.

## Definition of Ready aplicada

La Definition of Ready aplicada no se limitó a que la historia tuviera una
descripción. Exigió que contara con:

- título y contexto en formato de historia de usuario;
- épica, identificador y prioridad asignados;
- criterios de aceptación Gherkin versionados y enlazados para historias de
  backend, o indicación explícita de que no aplican en un spike;
- referencia a la historia de backend para las historias de interfaz;
- puntos de historia cargados;
- dependencias declaradas y desbloqueadas;
- estimación inicial en horas al pasar a `In progress`.

El detalle operativo se encuentra en la
[Definition of Ready](./wiki/proceso/definition-of-ready.md) y en la
[plantilla de ticket](./wiki/tickets/plantilla-ticket.md). En contraste con la
propuesta original, el repositorio no exige como condición general un mockup
adjunto ni la documentación previa de todos los microservicios y tablas
afectadas. Esos elementos pueden incorporarse cuando la historia los necesita,
pero no forman parte del checklist vigente común a todas las historias.

## Definition of Done aplicada

Una historia se consideró terminada únicamente cuando:

- todos sus criterios de aceptación se cumplieron y los escenarios aplicables
  quedaron en verde;
- el código y las pruebas fueron integrados en `main`;
- la suite de pruebas acordada finalizó correctamente;
- la funcionalidad fue liberada y validada en `test`;
- se registraron las horas reales (`Spent (hs)`);
- se actualizó la documentación afectada;
- el equipo promovió la versión a `prod` mediante el release del sprint.

Por lo tanto, en el proceso aplicado **Done no equivale a “implementado” ni
solamente a “disponible en test”: equivale a estar validado y desplegado en
producción**. Esta es la diferencia más relevante respecto de una Definition
of Done centrada únicamente en la ejecución de pruebas o en la disponibilidad
del incremento en un ambiente intermedio.

## Contraste con la propuesta inicial

| Elemento de la propuesta | Aplicación observada en el repositorio |
|---|---|
| Scrum e XP como marcos combinados | Se mantuvo un enfoque híbrido y pragmático, sin roles rígidos ni aplicación purista. |
| Backlog único y priorizado | Se concretó en historias agrupadas por épicas y gestionadas en `roadmap`, con Board y estados. |
| Sprints e incrementos | Se conservaron sprints y entregas incrementales; la documentación vigente no fija una duración única. |
| Planning, review y retrospectiva | La planificación, revisión y validación están reflejadas en el flujo; las ceremonias no están documentadas como eventos rígidos con duración obligatoria. |
| Pair/Mob Programming | Puede utilizarse como técnica colaborativa, pero no hay evidencia en esta documentación de que sea una práctica obligatoria o sistemática. |
| CI/CD ante cada push o pull request | Hay automatización de build y publicación para la documentación y pipelines en templates; el flujo de producto documentado trabaja con pushes a `main` y releases a `test`/`prod`, no con pull requests. |
| Despliegue y smoke test | La promoción por ambientes está formalizada; la existencia y alcance de smoke tests depende del repositorio de servicio y no se afirma aquí como requisito uniforme. |
| IaC | Está documentado en los templates de infraestructura; se aplica por repositorio o componente. |
| DoR con mockups y análisis técnico completo | El DoR vigente exige historia, Gherkin, prioridad, estimación y dependencias; mockups y análisis técnico se solicitan cuando la historia los requiere. |
| DoD con validación en test | La DoD vigente agrega la condición más fuerte de despliegue en producción, además de pruebas, documentación y registro de horas. |

Esta formulación describe el proceso efectivamente utilizado y permite
conservar la propuesta original como antecedente: algunas prácticas fueron
confirmadas, otras se adaptaron al contexto y otras quedaron como criterios
recomendados para los repositorios que las implementen explícitamente.

