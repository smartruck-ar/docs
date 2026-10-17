# Borrador de user stories: pendientes para el Sprint 7

> Borrador para revisión **antes** de crear las historias en GitHub. Origen: lista de pendientes "SPRINT 5: SECUNDARIAS" y "OTROS FIXES/MEJORAS TO DO".
> Formato: [plantilla de ticket](src/wiki/tickets/plantilla-ticket.md) y [automatización de historias](src/wiki/tickets/automatizacion-historias.md). Verificado contra `origin/main` de cada repo y contra las issues existentes de `roadmap`.
> Fecha: 2026-10-10

---

## 0. Procedimiento de creación

1. Crear cada historia **sin milestone y sin tags**.
2. Asignar el **milestone** (dispara la numeración, el label `user story` y el alta en el Board).
3. Recién cuando esa ejecución termina, agregar el tag `front+back` si corresponde (crea la contraparte `UI-`). Hacerlo en el mismo segundo que el milestone provoca una renumeración incorrecta de la original.
4. La automatización asigna el **sprint actual (Sprint 6)**: cambiar el campo Sprint a **Sprint 7** en el Board, en la historia y en su contraparte.
5. Leer cada historia para confirmar número, label, milestone y sprint.

> Los milestones de Restyling (`D.X`, `T.X`) no tienen número en el nombre y la automatización no puede numerar historias ahí; por eso las mejoras generales van en D.2 / T.2.

**Prioridad y tamaño:** el campo Priority del Board no tiene opciones configuradas, así que la prioridad y el tamaño indicados en la lista se dejan como última línea de la descripción (`Prioridad: HIGH · Tamaño: LG`). Los ítems sin prioridad en la lista quedan "a definir en planning".

---

## 1. Qué pasa con cada bullet

| Bullet | Resultado |
|---|---|
| Centros guardados por defecto antes que el manual (LOW, MD) | **Nueva:** N1 |
| Unificar tipo de carga y remolque InMemory (LOW, LG) | **Nueva:** N2 (dador) y N3 (transportista) |
| Rutas: localidades que se ven en línea recta (HIGH, LG) | **Ya existe:** R.1.2 (#141), fallback del servicio de rutas a un proveedor externo |
| FOMO al liberar la carga (HIGH, SM) | **Nueva:** N4 |
| Acción fallback para aprobar el pago (MEDIUM, LG) | **Nueva:** N5 |
| ABM de tractores y remolques, liberar remolque manualmente, tipo refrigerado (LOW, LG) | **Nueva:** N6 (ABM). La liberación manual **ya existe** en T.3.13 (#159, Sprint 6) y la disponibilidad por fechas en T.3.14 (#161). "Refrigerado" es una carrocería: **ya existe** en S.4 (#138) |
| Matcheo de cargas cercanas (MEDIUM, XL) | **Ya existe:** T.2.15 (#150), recomendaciones con tolerancia de desvío |
| Optimizar requests para que se hagan una vez | **Nueva:** N7 (dador) y N8 (transportista) |
| Verificar mail y redireccionar sin estado inconsistente | **Nueva:** N9 (dador) y N10 (transportista) |
| Recuperación y cambio de contraseña | **Nueva:** N11 (dador) y N12 (transportista) |
| Login/registro con Google | **Nueva:** N13 (dador) y N14 (transportista) |
| ¿Puede cancelar una carga el transportista? (y abrir la calificación del dador) | **Decisión pendiente** (sección 2) |
| Anticipación mínima para tomar un viaje | **Nueva:** N15 |
| Landing | **Decisión pendiente** (sección 2) |
| Archivos/documentos asociados a cada perfil | **Decisión pendiente** (sección 2) |
| Paradas intermedias | **Nueva:** N16 |
| Estima cuando se borra la dirección | **Nueva:** N17 |
| Editar carga no hace nada | **Nueva:** N18 |
| Eliminación de centros de carga | **Nueva:** N19 |
| Avatar y nombre en la calificación recibida | **Nueva:** N20 |
| Filtrado por localidad (busca dentro de la provincia) | **Ya existe:** R.1.7 (#163), búsqueda de direcciones dentro de la localidad en el servicio geográfico. N21 queda descartada |
| Tipos de carga: tipo y subtipo | **Ya existe:** D.2.6 (#124) y UI-D.2.6 (#125) |
| Tarifario | **Ya existe:** S.2 (#127) |
| Quick actions (pasar de estado, publicar última carga) | **Nueva:** N22 |
| Ver md de casos de pago | **Nueva (spike):** SP-PAG, junto con QR de Mercado Pago y Stripe |
| ABM de camiones y enhance de vistas | Se integra en **N6** |
| Camiones con modelo y otros datos | **Nueva:** N23 |
| Sacar el pago en efectivo | **Nueva:** N24 |
| ¿QR de Mercado Pago? ¿Pagos internacionales con Stripe? | Se integra en el spike **SP-PAG** |

**Para las historias que ya existen:** no se crean duplicados. Si se quiere que entren al Sprint 7, se les cambia el sprint en el Board.

---

## 2. Decisiones pendientes (no se crean hasta definirlas)

| Pregunta | Qué hay que definir | Si la respuesta es sí |
|---|---|---|
| ¿Puede el transportista cancelar una carga reservada? | Hasta qué estado puede cancelar, si se devuelve la tarifa de desbloqueo y qué pasa con la carga (vuelve a estar disponible) | Historia T.2 de cancelación (`front+back`) que además habilita la calificación del dador |
| ¿Hace falta una landing? | Público (transportistas, dadores o ambos), dónde vive (repo nuevo o `smartruck-navigation`, que hoy es una maqueta estática) | Historia de landing (frontend) |
| ¿Archivos o documentos por perfil? | Qué documentos (CUIT, seguro, habilitaciones), quién los valida (backoffice B.5, #136) y dónde se guardan | Historia de carga de documentos (`front+back`) relacionada con la verificación de usuarios |

---

## 3. Spike

### SP-PAG · Casos de pago

- **Milestone:** `SPIKES` · **Tag:** ninguno
- **Título:** `Como desarrollador, Quiero revisar los casos de pago y los medios de pago a soportar, Para definir qué falta implementar en el flujo de pago`

```markdown
Hay un documento con los casos de pago del desbloqueo de cargas y preguntas abiertas sobre medios de pago. Antes de seguir agregando funcionalidad al flujo de pago hay que revisarlo y decidir.

A decidir:

- Qué casos del documento de casos de pago faltan implementar o están mal resueltos.
- Si se agrega el pago con QR de Mercado Pago.
- Si hacen falta pagos internacionales (por ejemplo, con Stripe) y para qué casos.

Entregable: decisión documentada y las historias derivadas.

Gherkins: no aplica.

Prioridad y tamaño: a definir en planning.
```

---

## 4. Historias del dador

### N1 · Centros guardados por defecto

- **Milestone:** `D.2` · **Tipo:** solo frontend (título con `UI-`)
- **Título:** `UI-Como oferente, Quiero que al publicar una carga se me ofrezcan primero mis centros de carga guardados, Para no cargar la dirección a mano cada vez`

```markdown
Relacionado con D.3.2 (#99), centros de carga del oferente.

Al publicar, si el oferente tiene centros de carga guardados, se muestran por defecto antes que la carga manual de la dirección.

Prioridad: LOW · Tamaño: MD
```

### N2 · Catálogos unificados en el modo InMemory (dador)

- **Milestone:** `D.2` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como desarrollador, Quiero que el modo InMemory del dador use los mismos tipos de carga y de remolque que el backend, Para que el modo de desarrollo se comporte como el real`

```markdown
El modo InMemory (stub) del dador tiene sus propias listas de tipos de carga y de remolque (`data/stub-loads.ts`), que pueden diferir del catálogo del backend. Se unifican con los valores del catálogo real.

Prioridad: LOW · Tamaño: LG (repartido con la historia equivalente del transportista)
```

### N7 · Requests que se hacen una sola vez (dador)

- **Milestone:** `D.2` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como oferente, Quiero que las pantallas carguen sus datos una sola vez, Para que la aplicación responda más rápido`

```markdown
Algunas pantallas repiten las mismas consultas al backend y al servicio de rutas (por ejemplo, al entrar a la publicación, a una ruta o al detalle de una carga). Se revisan y se evitan las consultas repetidas.

Prioridad: a definir en planning
```

### N9 · Verificación de mail sin estado inconsistente (dador)

- **Milestone:** `D.1` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como oferente, Quiero que al verificar mi mail se me redirija a un estado válido de la aplicación, Para no quedar en una pantalla inconsistente`

```markdown
Al verificar el mail desde el enlace de confirmación y redirigir a la aplicación, la sesión o la pantalla pueden quedar en un estado inconsistente. Se revisa el flujo de confirmación y la redirección.

Prioridad: a definir en planning
```

### N11 · Recuperación y cambio de contraseña (dador)

- **Milestone:** `D.1` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como oferente, Quiero recuperar y cambiar mi contraseña, Para no perder el acceso a mi cuenta`

```markdown
Flujo de "olvidé mi contraseña" (envío de mail y nueva contraseña) y cambio de contraseña desde el perfil, con la autenticación de Supabase.

Prioridad: a definir en planning
```

### N13 · Ingreso y registro con Google (dador)

- **Milestone:** `D.1` · **Tipo:** `front+back`
- **Título:** `Como oferente, Quiero registrarme e iniciar sesión con mi cuenta de Google, Para ingresar sin crear una contraseña`

````markdown
Ingreso y registro con Google a través de Supabase. Al registrarse por primera vez, el oferente completa los datos de su perfil (CUIT, razón social) que hoy pide el registro con mail.

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/registrar_oferente.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Regla: Registro con Google

  Escenario: COF-GGL 01: un oferente que ingresó con Google completa su perfil
    Dado que existe un usuario autenticado con Google sin perfil de oferente
    Cuando el usuario completa su perfil de oferente con:
      | field        | value               |
      | cuit         | 30711222333         |
      | company_name | Acopio del Sur SA   |
    Entonces la respuesta es exitosa
    Y el oferente queda registrado con el email de su cuenta de Google

  Escenario: COF-GGL 02: un usuario de Google sin perfil no puede publicar
    Dado que existe un usuario autenticado con Google sin perfil de oferente
    Cuando el usuario intenta publicar una carga
    Entonces la respuesta tiene estado "403"
```

Prioridad: a definir en planning
````

### N16 · Paradas intermedias

- **Milestone:** `D.2` · **Tipo:** `front+back`
- **Título:** `Como oferente, Quiero agregar paradas intermedias a mi carga, Para publicar viajes con más de un punto de carga o descarga`

````markdown
Hoy una carga tiene un solo origen y un solo destino. Las paradas intermedias impactan en la distancia (ruta con varios tramos), el precio sugerido y el matching (la carga deja de ser un único tramo). Requiere que el servicio de rutas resuelva rutas con varios puntos.

Relacionado con R.1.2 (#141) y T.2.15 (#150).

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/crear_oferta_carga.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Regla: Paradas intermedias

  Escenario: COC-PAR 01: la carga se publica con una parada intermedia
    Cuando el oferente crea una oferta de carga de "Rosario, Santa Fe" a "Buenos Aires, CABA" con la parada intermedia "San Nicolás, Buenos Aires"
    Entonces la respuesta es exitosa
    Y la oferta tiene las paradas "Rosario, Santa Fe", "San Nicolás, Buenos Aires" y "Buenos Aires, CABA" en ese orden

  Escenario: COC-PAR 02: la distancia de la carga incluye la parada intermedia
    Dado que el oferente cotizó una oferta de carga de "Rosario, Santa Fe" a "Buenos Aires, CABA" con la parada intermedia "San Nicolás, Buenos Aires"
    Entonces la distancia cotizada es la suma de los tramos "Rosario, Santa Fe" a "San Nicolás, Buenos Aires" y "San Nicolás, Buenos Aires" a "Buenos Aires, CABA"
```

Prioridad: a definir en planning · Tamaño estimado: XL
````

### N17 · Sin estimación al borrar la dirección

- **Milestone:** `D.2` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como oferente, Quiero que la publicación no muestre una distancia estimada cuando borro la dirección, Para no publicar con datos incompletos`

```markdown
Relacionado con R.1.6 (#145), que quita la estimación local de la vista previa de ruta.

Si el oferente borra una dirección (por ejemplo, quita una coordenada) y sigue publicando, la vista previa sigue mostrando una distancia estimada. Al borrar la dirección, la vista previa y la cotización deben reflejar que falta el dato.

Prioridad: a definir en planning
```

### N18 · Editar una carga

- **Milestone:** `D.2` · **Tipo:** `front+back`
- **Título:** `Como oferente, Quiero editar una carga publicada, Para corregir sus datos sin tener que eliminarla y volver a publicarla`

````markdown
Hoy la acción de editar una carga no hace nada. Se habilita la edición de una carga mientras nadie la reservó.

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/editar_oferta_carga.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Característica: Editar oferta de carga
  Como oferente
  Quiero editar una carga publicada
  Para corregir sus datos sin tener que eliminarla y volver a publicarla

  Antecedentes:
    Dado que existe un oferente autenticado con CUIT "20123456789"
    Y que el oferente tiene publicada una oferta de carga con descripción "Carga de soja a granel"

  Escenario: EOC 01: el oferente edita una carga publicada
    Cuando el oferente edita la oferta de carga con:
      | field       | value                 |
      | description | Carga de maíz a granel |
    Entonces la respuesta es exitosa
    Y la oferta tiene descripción "Carga de maíz a granel"

  Escenario: EOC 02: no se puede editar una carga reservada
    Dado que la oferta de carga fue reservada por un transportista
    Cuando el oferente edita la oferta de carga con:
      | field       | value                 |
      | description | Carga de maíz a granel |
    Entonces la respuesta tiene estado "409"

  Escenario: EOC 03: un oferente no puede editar la carga de otro
    Dado que existe otro oferente con CUIT "30711222333"
    Cuando el otro oferente edita la oferta de carga
    Entonces la respuesta tiene estado "403"
```

Prioridad: a definir en planning
````

### N19 · Eliminar centros de carga

- **Milestone:** `D.3` · **Tipo:** `front+back`
- **Título:** `Como oferente, Quiero eliminar un centro de carga, Para mantener solo los lugares que uso`

````markdown
Relacionado con D.3.2 (#99). Hoy los centros de carga se pueden crear y listar, pero no eliminar.

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/eliminar_deposito.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Característica: Eliminar depósito
  Como oferente
  Quiero eliminar un centro de carga
  Para mantener solo los lugares que uso

  Antecedentes:
    Dado que existe un oferente registrado con CUIT "30711222333"
    Y que el oferente tiene el depósito "Depósito Central"

  Escenario: DEP 05: el oferente elimina un depósito
    Cuando el oferente elimina el depósito "Depósito Central"
    Entonces la respuesta es exitosa
    Y el depósito "Depósito Central" ya no figura entre sus depósitos

  Escenario: DEP 06: un oferente no puede eliminar el depósito de otro
    Dado que existe otro oferente con CUIT "20123456789"
    Cuando el otro oferente elimina el depósito "Depósito Central"
    Entonces la respuesta tiene estado "403"
```

Prioridad: a definir en planning
````

### N20 · Avatar y nombre en la calificación recibida

- **Milestone:** `D.5` · **Tipo:** `front+back`
- **Título:** `Como oferente, Quiero ver el nombre y el avatar de quien me calificó, Para saber de quién es cada calificación`

````markdown
Las calificaciones recibidas no muestran quién las hizo. Se exponen el nombre y el avatar del transportista o dador que calificó.

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/consultar_calificaciones_carga.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Escenario: CCC-12: la calificación recibida informa quién la hizo
  Dado que el transportista "Transportes del Plata SA" calificó una carga del oferente
  Cuando el oferente consulta las calificaciones recibidas
  Entonces la calificación informa el nombre "Transportes del Plata SA"
  Y la calificación informa el avatar de quien calificó
```

Prioridad: a definir en planning
````

### N22 · Acciones rápidas

- **Milestone:** `D.2` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como oferente, Quiero acciones rápidas para cambiar el estado de una carga y volver a publicar una carga anterior, Para operar más rápido`

```markdown
Acciones rápidas desde el panel o el listado: pasar una carga al estado siguiente y publicar de nuevo una carga anterior (la última o una elegida de un listado), precargando sus datos en el formulario.

Prioridad: a definir en planning
```

---

## 5. Historias del transportista

### N3 · Catálogos unificados en el modo InMemory (transportista)

- **Milestone:** `T.2` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como desarrollador, Quiero que el modo InMemory del transportista use los mismos tipos de carga y de remolque que el backend, Para que el modo de desarrollo se comporte como el real`

```markdown
Equivalente a la historia del dador: el modo InMemory (stub) del transportista usa datos de ejemplo propios (`data/mock-data.ts`) que pueden diferir de los catálogos del backend.

Prioridad: LOW · Tamaño: LG (repartido con la historia equivalente del dador)
```

### N4 · FOMO al desbloquear

- **Milestone:** `T.2` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como transportista, Quiero ver cuánto interés tiene una carga antes de desbloquearla, Para decidir rápido si la tomo`

```markdown
Relacionado con T.2.1 (#24), desbloqueo de cargas.

Al momento de desbloquear una carga se muestra un mensaje que incentive la decisión (por ejemplo, cuántos transportistas la vieron o que puede ser tomada por otro). Si el mensaje necesita datos reales (vistas de la carga), se agrega la historia de backend correspondiente.

Prioridad: HIGH · Tamaño: SM
```

### N5 · Aprobar un pago cuando no llega la notificación

- **Milestone:** `T.2` · **Tipo:** `front+back`
- **Título:** `Como transportista, Quiero poder confirmar un pago aprobado aunque no haya llegado la notificación de Mercado Pago, Para no quedar bloqueado después de pagar`

````markdown
Hoy el pago queda aprobado cuando llega el webhook de Mercado Pago. Si la notificación no llega o se demora, el transportista pagó pero la carga no se desbloquea. Se agrega una acción para consultar el estado del pago en Mercado Pago y confirmarlo.

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/pagar_desbloqueo.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Regla: Confirmación sin notificación

  Escenario: PAG 03: se confirma un pago aprobado que no llegó por notificación
    Dado que el transportista inició el pago del desbloqueo de una carga
    Y que Mercado Pago aprobó el pago pero no envió la notificación
    Cuando el transportista confirma el pago
    Entonces la respuesta es exitosa
    Y el pago queda aprobado
    Y la oferta de carga queda desbloqueada

  Escenario: PAG 04: confirmar un pago que todavía no está aprobado no desbloquea la carga
    Dado que el transportista inició el pago del desbloqueo de una carga
    Y que el pago está pendiente en Mercado Pago
    Cuando el transportista confirma el pago
    Entonces el pago sigue pendiente
    Y la oferta de carga no queda desbloqueada
```

Prioridad: MEDIUM · Tamaño: LG
````

### N6 · ABM de camiones y remolques

- **Milestone:** `T.3` · **Tipo:** `front+back`
- **Título:** `Como transportista, Quiero editar y dar de baja mis camiones y remolques, Para mantener mi flota actualizada`

````markdown
Hoy los camiones y remolques se pueden registrar y consultar, pero no editar ni dar de baja. Incluye mejoras en las vistas de flota. Relacionado con T.3.9 (#103), T.3.10 (#102), T.3.11 (#128) y T.3.14 (#161, disponibilidad por fechas). La liberación manual está en T.3.13 (#159). El tipo "refrigerado" se define en S.4 (#138).

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/registrar_camion.feature` y `registrar_remolque.feature`. Una vez en `main`, reemplazar este bloque por el link a los archivos.

```gherkin
# language: es
Regla: Edición y baja de camiones

  Escenario: RC-10: el transportista da de baja un camión liberado
    Dado que el transportista autenticado tiene registrado el camión "AB123CD"
    Cuando doy de baja el camión "AB123CD"
    Entonces la respuesta es exitosa
    Y el camión "AB123CD" ya no figura en mi flota

  Escenario: RC-11: no se puede dar de baja un camión ocupado
    Dado que el transportista autenticado tiene el camión "AB123CD" asignado a una carga en curso
    Cuando doy de baja el camión "AB123CD"
    Entonces la respuesta tiene estado "409"
```

Prioridad: LOW · Tamaño: LG
````

### N15 · Anticipación mínima para tomar un viaje

- **Milestone:** `T.2` · **Tipo:** `front+back`
- **Título:** `Como transportista, Quiero que no se me permita reservar una carga con menos anticipación de la necesaria para llegar al retiro, Para no comprometerme con viajes que no puedo cumplir`

````markdown
Hoy un transportista puede desbloquear una carga aunque el retiro sea inminente. Se valida una anticipación mínima respecto de la fecha de retiro. El valor de la anticipación es configurable.

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/desbloquear_carga.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Regla: Anticipación mínima

  Escenario: DDC 09: no se desbloquea una carga cuyo retiro es inminente
    Dado que la anticipación mínima configurada es de "12" horas
    Y que existe una oferta de carga disponible con retiro dentro de "6" horas
    Cuando el transportista desbloquea la oferta de carga
    Entonces la respuesta tiene estado "409"
    Y el mensaje de error indica que no hay tiempo suficiente para llegar al retiro

  Escenario: DDC 10: se desbloquea una carga con anticipación suficiente
    Dado que la anticipación mínima configurada es de "12" horas
    Y que existe una oferta de carga disponible con retiro dentro de "24" horas
    Cuando el transportista desbloquea la oferta de carga
    Entonces la respuesta es exitosa
```

Prioridad: a definir en planning
````

### N8 · Requests que se hacen una sola vez (transportista)

- **Milestone:** `T.2` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como transportista, Quiero que las pantallas carguen sus datos una sola vez, Para que la aplicación responda más rápido`

```markdown
Equivalente a la historia del dador: se revisan las pantallas que repiten consultas al backend y al servicio de rutas y se evitan las consultas repetidas.

Prioridad: a definir en planning
```

### N10 · Verificación de mail sin estado inconsistente (transportista)

- **Milestone:** `T.1` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como transportista, Quiero que al verificar mi mail se me redirija a un estado válido de la aplicación, Para no quedar en una pantalla inconsistente`

```markdown
Equivalente a la historia del dador para la aplicación del transportista.

Prioridad: a definir en planning
```

### N12 · Recuperación y cambio de contraseña (transportista)

- **Milestone:** `T.1` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como transportista, Quiero recuperar y cambiar mi contraseña, Para no perder el acceso a mi cuenta`

```markdown
Equivalente a la historia del dador para la aplicación del transportista.

Prioridad: a definir en planning
```

### N14 · Ingreso y registro con Google (transportista)

- **Milestone:** `T.1` · **Tipo:** `front+back`
- **Título:** `Como transportista, Quiero registrarme e iniciar sesión con mi cuenta de Google, Para ingresar sin crear una contraseña`

````markdown
Ingreso y registro con Google a través de Supabase. Al registrarse por primera vez, el transportista completa los datos de su empresa (CUIT, razón social) que hoy pide el registro con mail.

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/crear_transportista.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Regla: Registro con Google

  Escenario: CTR-GGL 01: un transportista que ingresó con Google completa su perfil
    Dado que existe un usuario autenticado con Google sin perfil de transportista
    Cuando el usuario completa su perfil de transportista con:
      | field        | value                    |
      | cuit         | 30711222333              |
      | company_name | Transportes del Plata SA |
    Entonces la respuesta es exitosa
    Y el transportista queda registrado con el email de su cuenta de Google

  Escenario: CTR-GGL 02: un usuario de Google sin perfil no puede desbloquear cargas
    Dado que existe un usuario autenticado con Google sin perfil de transportista
    Cuando el usuario intenta desbloquear una oferta de carga
    Entonces la respuesta tiene estado "403"
```

Prioridad: a definir en planning
````

### N23 · Datos del camión

- **Milestone:** `T.3` · **Tipo:** `front+back`
- **Título:** `Como transportista, Quiero registrar la marca, el modelo y el año de mis camiones, Para identificar mejor cada unidad de mi flota`

````markdown
Hoy el camión se registra solo con su patente.

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/registrar_camion.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Escenario: RC-12: el transportista registra un camión con marca, modelo y año
  Cuando registro un camión con:
    | field | value      |
    | plate | AB123CD    |
    | brand | Scania     |
    | model | R 450      |
    | year  | 2019       |
  Entonces la respuesta es exitosa
  Y el camión "AB123CD" tiene marca "Scania", modelo "R 450" y año "2019"
```

Prioridad: a definir en planning
````

### N24 · Sin pago en efectivo

- **Milestone:** `T.2` · **Tipo:** solo frontend (`UI-`)
- **Título:** `UI-Como transportista, Quiero que el desbloqueo ofrezca solo medios de pago disponibles, Para no elegir una opción que no se puede usar`

```markdown
El checkout del desbloqueo muestra la opción "Efectivo — Pago en efectivo al retirar" (`views/checkout/fee-stage.tsx`), que el backend no soporta. Se quita la opción.

Prioridad: a definir en planning
```

---

## 6. Totales

| Grupo | Historias nuevas | Contrapartes `UI-` automáticas |
|---|---|---|
| Spike | 1 (SP-PAG) | — |
| Dador | 12 (N1, N2, N7, N9, N11, N13, N16–N20, N22) | 5 (N13, N16, N18, N19, N20) |
| Transportista | 11 (N3, N4, N5, N6, N8, N10, N12, N14, N15, N23, N24) | 5 (N5, N6, N14, N15, N23) |
| **Total** | **24** | **10** |

Además: **6 bullets ya tienen ticket** (#141, #150, #124/#125, #127, #138 y #163) y **3 quedan como decisiones pendientes** (cancelación por el transportista, landing y documentos por perfil).

---

## 7. Historias existentes relacionadas con los bullets

### 7.1 Qué pasa con cada una

| Historia | Sprint actual | Estado | Acción |
|---|---|---|---|
| S.4 (#138) · Atributos del remolque (incluye "refrigerado") | Sprint 6 | Backlog | **Se queda en Sprint 6** |
| R.1.2 (#141) · Fallback del servicio de rutas a un proveedor externo | Sprint 6 | Backlog | **Se queda en Sprint 6** |
| T.2.15 (#150) · Recomendaciones de cargas | Sprint 6 | Backlog | **Se queda en Sprint 6** |
| UI-T.2.15 (#155) · Recomendaciones de cargas (UI) | Sprint 6 | Backlog | **Se queda en Sprint 6** |
| D.2.6 (#124) · Tipo y subtipo de carga | Sprint 5 | Ready | **Pasa a Sprint 7** + completar la descripción (vacía) |
| UI-D.2.6 (#125) · Tipo y subtipo de carga (UI) | Sprint 5 | Ready | **Pasa a Sprint 7** (su descripción ya sigue el formato) |
| S.2 (#127) · Google Forms del tarifario | Sprint 5 | Ready | **Pasa a Sprint 7** + completar la descripción (vacía) |

Mover de sprint solo cambia el campo Sprint en el Board. El estado (Ready) no se toca.

### 7.2 Descripción propuesta para D.2.6 (#124)

````markdown
Hoy el catálogo de tipos de carga es una lista plana de 32 valores (`GET /cargo-types`, escenario CTC 01), con duplicados aparentes (por ejemplo, `PELIGROSA` y `CARGA PELIGROSA`, o `REFRIGERADO` y `CARGA REFRIGERADA`). El dominio ya tiene categorías (`CargoCategory`), pero no se exponen. El oferente pasa a elegir primero el tipo (categoría) y después el subtipo, y la carga guarda los dos.

Relacionado con S.2 (#127): las respuestas del formulario de tarifas validan las categorías y detectan faltantes y duplicados.

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/consultar_catalogo_tipos_carga.feature` y `crear_oferta_carga.feature`. Una vez en `main`, reemplazar este bloque por el link a los archivos.

```gherkin
# language: es
Regla: Catálogo agrupado por tipo

  Escenario: CTC 02: el catálogo agrupa los subtipos por tipo de carga
    Cuando consulto el catálogo de tipos de carga
    Entonces la respuesta es exitosa
    Y el tipo "GRANOS Y AGROINDUSTRIA" incluye los subtipos "GRANOS Y OLEAGINOSAS" e "INSUMOS AGRÍCOLAS"

  Escenario: CTC 03: cada subtipo pertenece a un único tipo
    Cuando consulto el catálogo de tipos de carga
    Entonces ningún subtipo figura en más de un tipo

Regla: Tipo y subtipo al publicar

  Escenario: COC-TST 01: la carga se publica con tipo y subtipo
    Cuando el oferente crea una oferta de carga con:
      | field          | value                  |
      | description    | Carga de soja a granel |
      | cargo_category | GRANOS Y AGROINDUSTRIA |
      | cargo_type     | GRANOS Y OLEAGINOSAS   |
    Entonces la respuesta es exitosa
    Y la oferta tiene tipo "GRANOS Y AGROINDUSTRIA" y subtipo "GRANOS Y OLEAGINOSAS"

  Escenario: COC-TST 02: no se publica una carga con un subtipo que no pertenece al tipo
    Cuando el oferente crea una oferta de carga con:
      | field          | value                  |
      | description    | Carga de soja a granel |
      | cargo_category | CARNES Y GANADERÍA     |
      | cargo_type     | GRANOS Y OLEAGINOSAS   |
    Entonces la respuesta tiene estado "400"
```

La agrupación concreta de subtipos por tipo y la limpieza de duplicados se confirman con S.2 (#127).
````

### 7.3 Descripción propuesta para S.2 (#127)

```markdown
Hoy el precio sugerido al dador se calcula con una sola tarifa para todas las categorías (`max(2.000 × km, 50.000)` en `Pricing`), con valores sin fuente y sin actualización (smartruck-backend#124). Para definir un tarifario por categoría se relevan transportistas y dadores de carga con dos Google Forms.

Alcance:

- Formulario para transportistas (cómo cobran) y formulario para dadores de carga (cómo pagan), con introducción académica (Trabajo Profesional FIUBA).
- Validación de las categorías y tipos de carga del sistema, y de los equipos (configuración y carrocería del remolque).
- Unidad de cobro por categoría, piso mínimo, factores que influyen en el precio y fuentes que usa el sector (tarifa referencial de granos, índice de costos de FADEEAC).
- Viajes y envíos reales para calibrar la fórmula.

Detalle de las preguntas, el script de Google Apps Script que crea los formularios y el plan de análisis: `docs/tarifario-formulario-y-estimacion.md`.

Entregable: formularios publicados y difundidos, respuestas analizadas y una propuesta de modelo de precio por categoría para smartruck-backend#124. Las respuestas también son insumo de S.4 (#138) y de D.2.6 (#124).

Gherkins: no aplica.
```
