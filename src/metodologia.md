# Metodología de trabajo aplicada

Para el desarrollo del proyecto se adoptó un marco de trabajo ágil e híbrido
que combinó elementos de Scrum para la gestión, planificación y seguimiento del
proceso, con prácticas de Extreme Programming (XP) orientadas a asegurar la
calidad técnica del software. En la práctica, el proceso evolucionó hacia un
sistema mixto y pragmático, adaptado al contexto académico y a la estructura
horizontal del equipo de estudiantes, sin constituir una implementación
ortodoxa de ninguna de las metodologías mencionadas.

Scrum se utilizó como referencia para organizar el trabajo mediante un backlog
priorizado, historias de usuario, estimaciones y entregas incrementales. De XP
se incorporaron prácticas vinculadas con el desarrollo guiado por pruebas de
aceptación, la integración frecuente, los commits atómicos y la
refactorización. La aplicación de estas prácticas se adaptó a las
características del equipo, con responsabilidades distribuidas y sin la
asignación de roles rígidos.

El objetivo de esta metodología fue mantener una evolución continua del
producto, facilitar la validación temprana de los requerimientos, mejorar la
trazabilidad entre las necesidades y su implementación y establecer condiciones
verificables para asegurar la calidad de cada incremento de software.

## Marcos de gestión y organización del trabajo

### Product backlog e historias de usuario

La planificación del producto se organizó a partir de un conjunto de historias
de usuario registradas en el repositorio
[`roadmap`](https://github.com/smartruck-ar/roadmap), dentro de la plataforma
GitHub. Estas historias se agruparon en épicas, representadas mediante
milestones, y se vincularon con los repositorios de producto correspondientes.

El backlog funcionó como un artefacto dinámico que permitió organizar los
requerimientos, priorizarlos y mantener la trazabilidad entre las necesidades
funcionales, los cambios de código y los resultados obtenidos. La prioridad y
el alcance de las historias se revisaron durante el desarrollo en función de
las dependencias técnicas, los resultados de las validaciones y la
retroalimentación recibida del equipo y de los tutores.

Las historias se utilizaron como unidad principal de planificación y
seguimiento. Para su identificación y organización se emplearon referencias
asociadas a las épicas como prefijo del nombre. Las historias asociadas al
desarrollo de interfaces mantuvieron la referencia a sus correspondientes
historias de backend cuando esa división resultó útil para conservar la
trazabilidad. Cuando la separación dejaba de aportar cohesión, el trabajo se
organizó como una única historia. Así, los requerimientos pudieron relacionarse
con sus criterios de aceptación, los cambios de código y los commits asociados.

### Sprints y entregas incrementales

El trabajo se organizó mediante sprints y entregas incrementales orientadas a
obtener funcionalidades verificables durante el ciclo de desarrollo. La
propuesta inicial contemplaba iteraciones de dos semanas, pero en la práctica
los ciclos tuvieron una duración aproximada de una semana, determinada
principalmente por las demostraciones que el equipo realizaba ante los tutores.

Los sprints funcionaron como referencia para organizar la planificación, el
desarrollo, la revisión y la validación de los incrementos. El alcance se
ajustó durante el ciclo cuando las necesidades del proyecto lo requirieron,
manteniendo como referencia el valor de negocio definido.

Este enfoque reemplazó la dependencia de una única entrega final por una
secuencia de incrementos que se verificaron progresivamente en los distintos
ambientes. De esta manera, los problemas pudieron detectarse con anticipación y
los ajustes se incorporaron durante el desarrollo.

### Planificación, estimación y seguimiento

Durante el refinamiento de las historias se definieron los criterios de
aceptación, las dependencias, la prioridad y la estimación relativa del
esfuerzo. La planificación organizó el trabajo de acuerdo con su valor, su
complejidad y las condiciones necesarias para comenzar la implementación.

La estimación distinguió dos dimensiones complementarias:

- **US Points:** representaron una estimación relativa de la complejidad, la
  incertidumbre y el esfuerzo asociado a una historia. Se utilizaron durante
  el refinamiento mediante una escala de Fibonacci acotada.
- **Estimate (hs) y Spent (hs):** representaron, respectivamente, las horas
  previstas al comenzar una historia y las horas efectivamente insumidas al
  liberar la funcionalidad al ambiente de test.

Esta distinción permitió complementar la estimación relativa con el registro
del esfuerzo real. Mientras que los US Points facilitaron la comparación entre
historias, las horas permitieron contrastar la previsión inicial con el tiempo
de ejecución y mejorar las estimaciones futuras.

Cuando una historia presentó un alcance o una complejidad excesivos, se evaluó
su división en sub-historias. En particular, la documentación de estimación
estableció que las historias de 8 puntos o más debían analizarse para decidir
si convenía dividirlas.

### Revisión y validación de los incrementos

La revisión del trabajo se integró al flujo de desarrollo mediante la
validación de las funcionalidades implementadas y la comprobación de sus
criterios de aceptación. Los incrementos se liberaron inicialmente al ambiente
de test, donde el equipo verificó el comportamiento del producto antes de
promover una versión a producción.

La retroalimentación del equipo y de los tutores permitió ajustar las
prioridades y revisar el alcance de los requerimientos en cada semana. Si bien
la propuesta inicial contemplaba ceremonias formalizadas de Sprint Review,
demostraciones y retrospectivas con una duración determinada, el proceso
aplicado se centró en las actividades efectivas de planificación, revisión y
validación, sin establecer una duración u horario obligatorio para todas estas
instancias. Esta decisión respondió a los solapamientos entre las
responsabilidades externas de los integrantes.

La mejora continua se abordó mediante el análisis de los resultados del
desarrollo, las dificultades detectadas y la información obtenida durante las
validaciones. En las retrospectivas realizadas se utilizó un tablero de Miro
con notas anónimas organizadas en tres categorías: qué se debía mantener, qué
se debía mejorar y qué se podía incorporar o innovar.

## Prácticas de ingeniería del software

### Desarrollo guiado por criterios de aceptación

Los criterios de aceptación de las historias de backend se expresaron mediante
escenarios Gherkin en español. Estos escenarios describieron el comportamiento
esperado de las funcionalidades utilizando un lenguaje compartido entre los
requerimientos, la implementación y la validación.

Antes de que una historia de backend quedara preparada para su desarrollo, los
archivos `.feature` debían estar versionados en `main` y vinculados desde el
ticket correspondiente. Los escenarios ejercitaban la aplicación en el paso
`Cuando` y comprobaban el resultado esperado mediante `Entonces`.

De esta manera, los criterios de aceptación se utilizaron como una referencia
verificable para determinar si la funcionalidad implementada cumplía con el
comportamiento esperado. Esta práctica incorporó principios de desarrollo
guiado por comportamiento (BDD) y redujo las ambigüedades entre las
necesidades expresadas y su implementación técnica.

### Integración, pruebas y despliegue

La integración frecuente se implementó mediante trabajo directo sobre `main`,
commits atómicos y una convención uniforme de mensajes. A diferencia de la
propuesta inicial, el flujo aplicado no utilizó ramas de feature ni pull
requests. Las versiones se liberaron progresivamente a los ambientes de test y
producción mediante los scripts de release definidos para los repositorios de
producto.

La propuesta original también contemplaba pipelines con etapas específicas de
compilación, análisis estático, pruebas automatizadas, detección de secretos y
smoke tests posteriores al despliegue. Estas técnicas se aplicaron según las
capacidades del repositorio o servicio correspondiente, sin considerarlas un
requisito uniforme para todo el proyecto. La validación común consistió en
ejecutar la suite de pruebas acordada, verificar los criterios de aceptación en
test y confirmar la promoción del incremento a producción.

### Infraestructura como código

La gestión de infraestructura incorporó el uso de Infrastructure as Code
(IaC), con el objetivo de describir y versionar programáticamente la
configuración de los entornos de plataforma.

La documentación de los templates de infraestructura evidencia el uso de
Terraform y su integración con procesos automatizados mediante GitHub Actions.
Estas herramientas permitieron reproducir configuraciones, mantener un
historial de cambios y reducir la dependencia de modificaciones manuales sobre
los recursos de infraestructura. La aplicación de estas prácticas se atribuye
a los repositorios y componentes donde están implementadas, sin extenderla
automáticamente a todos los servicios del sistema.

### Refactorización y código limpio

La mantenibilidad del software se promovió mediante commits atómicos,
integración frecuente y refactorización cuando fue necesario. Estas prácticas
mejoraron la estructura interna del código sin alterar el comportamiento
funcional esperado.

En los servicios que documentan explícitamente estos criterios se utilizó una
arquitectura hexagonal y principios de código limpio para favorecer la
separación de responsabilidades, la claridad de las dependencias y la
facilidad de mantenimiento. La revisión de la documentación técnica también
formó parte de las actividades de calidad cuando los cambios introducidos
afectaron su contenido.

## Definición de preparado (Definition of Ready)

La Definition of Ready (DoR) estableció las condiciones mínimas que debía
cumplir una historia antes de ingresar a la etapa de desarrollo. Su objetivo
fue evitar que se iniciaran trabajos con requerimientos ambiguos, dependencias
sin resolver o estimaciones pendientes.

Para que una historia pudiera comenzar, debía cumplir con los siguientes
requisitos:

1. **Identificación y descripción:** título, descripción contextualizada en
   formato de historia de usuario, épica, identificador y prioridad asignados.
2. **Criterios de aceptación:** escenarios Gherkin en español, versionados en
   `main` y enlazados desde el ticket para las historias de backend. En los
   spikes se indicó explícitamente cuando estos criterios no aplicaban.
3. **Vinculación entre historias relacionadas:** referencia explícita a la
   historia de backend correspondiente en las historias de interfaz cuando
   existía esa relación.
4. **Estimación del esfuerzo:** US Points cargados durante el refinamiento
   mediante la escala de Fibonacci utilizada por el equipo.
5. **Análisis de dependencias:** dependencias técnicas y funcionales
   identificadas y desbloqueadas antes de comenzar la implementación.
6. **Estimación inicial en horas:** campo `Estimate (hs)` registrado al pasar
   la historia al estado `In progress`.

Los requisitos específicos de cada historia se complementaron con información
de diseño, prototipos, contratos de API, estructuras de datos o análisis de
microservicios afectados cuando el requerimiento lo necesitó. Estos elementos
no constituyeron condiciones generales obligatorias para todas las historias.

## Definición de terminado (Definition of Done)

La Definition of Done (DoD) estableció las condiciones que debía cumplir una
historia para considerarse finalizada. El cierre no dependió exclusivamente de
terminar la implementación, sino también de verificar el comportamiento,
integrar el código y liberar efectivamente el incremento.

Una historia se consideró terminada cuando cumplía con las siguientes
condiciones:

1. **Criterios de aceptación satisfechos:** todos los escenarios aplicables
   finalizaban correctamente.
2. **Código y pruebas integrados:** los cambios se encontraban integrados en
   `main`, manteniendo la trazabilidad mediante el historial de commits.
3. **Pruebas ejecutadas satisfactoriamente:** la suite acordada finalizaba
   correctamente, de acuerdo con las características del servicio y del
   requerimiento.
4. **Liberación y validación en test:** la funcionalidad se encontraba
   liberada en `test` y había sido validada por el equipo.
5. **Esfuerzo real registrado:** las horas efectivamente insumidas estaban
   cargadas en el campo `Spent (hs)`.
6. **Documentación actualizada:** se habían actualizado el README, las
   especificaciones técnicas o los contratos de API cuando los cambios los
   afectaban.
7. **Promoción a producción:** el equipo había promovido la versión a `prod`
   mediante el release correspondiente al ciclo de trabajo.

Por lo tanto, en el proceso aplicado, el estado `Done` no equivalió únicamente
a haber terminado la implementación ni a disponer de una funcionalidad en
test. Una historia alcanzó este estado cuando el incremento fue validado, se
registró el esfuerzo real, se actualizó la documentación afectada y se
completó su promoción a producción.

Estas definiciones se aplicaron como criterios de referencia y no de manera
purista. Los trabajos de reestilizado, correcciones y otras tareas de
mantenimiento no siempre contaron con una épica asociada a una funcionalidad
nueva. En esos casos se mantuvieron los controles pertinentes de trazabilidad,
validación, registro del esfuerzo y documentación, adaptando el formato del
ticket a la naturaleza del trabajo.

## Organización de los estados y trazabilidad

El seguimiento de las historias se realizó mediante estados que reflejaron su
avance:

- una historia preparada pasó a `In progress` al comenzar su implementación;
- una vez desarrollada y verificada, se liberó a `test` y pasó a `In review`;
- durante esa etapa se registraron las horas reales y se validaron los
  criterios de aceptación;
- cuando el equipo confirmó el incremento y promovió la versión a producción,
  la historia pasó a `Done`.

Este flujo permitió distinguir la implementación de una funcionalidad, su
validación en un ambiente intermedio y su liberación definitiva. La relación
entre épicas, historias, repositorios, escenarios Gherkin y commits mantuvo la
trazabilidad entre los requerimientos y su implementación. A su vez, los
campos de estimación y esfuerzo real aportaron información para analizar la
ejecución del trabajo y mejorar las decisiones de planificación.

## Síntesis del enfoque metodológico

La metodología aplicada combinó una organización incremental del trabajo con
prácticas de ingeniería destinadas a mantener la calidad y la trazabilidad del
software. La gestión basada en historias de usuario, épicas, prioridades y
estimaciones permitió estructurar el backlog y ajustar el alcance durante el
desarrollo. Gherkin, la integración frecuente, los commits atómicos, las
pruebas y la refactorización establecieron mecanismos de verificación y
mantenimiento del producto.

La separación entre los ambientes `main`, `test` y `prod` organizó la
liberación progresiva de los incrementos, mientras que las definiciones de
preparado y terminado establecieron condiciones explícitas para comenzar y
cerrar las historias.

Si bien el proceso no siguió estrictamente una única metodología ágil,
conservó los principios de adaptabilidad, colaboración, entrega incremental y
mejora continua. La metodología resultante se definió por la combinación de
mecanismos de gestión y prácticas técnicas que permitieron organizar el
desarrollo, validar los resultados y considerar terminadas las funcionalidades
únicamente después de su validación y despliegue en producción.
