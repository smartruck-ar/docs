# Borrador de cambios al Sprint 6: datos por servicio y búsqueda por localidad

> Borrador para revisión. **No se modificó nada en GitHub.**
> Recoge las decisiones de arquitectura discutidas después de crear las historias del Sprint 6 (#137–#155) y propone cómo reflejarlas en los tickets y en los documentos.
> Fecha: 2026-10-10

> **Estado (2026-10-10):** se volvió al plan original: **recomendaciones usa PostGIS** para filtrar las cargas. Quedan **descartados** el filtro por localidad sin PostGIS, la historia R-CAT y los cambios propuestos para #139, #148, #149 y #150 (siguen como están en GitHub; solo se reescribirían si el equipo elige la tabla propia de recomendaciones en S.3). **Ya aplicado en GitHub:** S.3 (#137), R.1.1 (#140), R.1.5 (#144) y T.3.13 (#159 / #160) actualizadas; R-LOC creada como **R.1.7 (#163 / #164)** y D-FOTO como **D.2.10 (#165)**. Ver `responsabilidades-servicios.md`.

---

## 0. Resumen de la decisión

| Tema | Antes (tickets actuales) | Ahora |
|---|---|---|
| Datos de cada servicio | Sin definir | **Un schema y un rol por servicio.** Nadie escribe tablas ajenas |
| Localidades y geocodificación | En el backend (`locations`, Mapbox, Nominatim) | **En el servicio de rutas**, que pasa a ser el servicio geográfico |
| Identidad de una ruta | Clave de texto con nombres normalizados | **Par de ids de localidad** |
| Filtro geográfico del matching | PostGIS sobre geometrías en `loads` del backend | **Por localidad:** recomendaciones filtra con una copia cacheada del catálogo de localidades de rutas |
| Acceso de recomendaciones a las cargas | Vista con geometrías | **Vista sin geometrías**, por ids de localidad, con un rol de solo lectura |
| PostGIS | Imprescindible en el backend | **No hace falta para el matching.** Opcional en rutas (trazados, localidad más cercana a un punto) |
| Punto exacto de retiro y entrega (pin) | En la carga | **Sigue en la carga** (dato del negocio, visible solo después del desbloqueo) |

### Cómo queda cada servicio

| Servicio | Datos propios | Expone | Consume |
|---|---|---|---|
| **Backend** (`public`) | Cargas (con la foto de sus localidades y el pin exacto), depósitos, flota, usuarios, pagos, calificaciones; vista `matching_loads` | API de negocio | Rutas (geocodificar al publicar, distancia al cotizar) |
| **Rutas** (`routes`) | Provincias, localidades, rutas | Catálogo de localidades, búsqueda y geocodificación, `GET /routes`, `POST /routes/batch` | Proveedor externo (Mapbox / OSRM) |
| **Recomendaciones** (`matching`) | Ninguno obligatorio (opcional: eventos de recomendación) | `POST /recommendations` | Rutas (catálogo y batch), vista `matching_loads` |

### Una búsqueda, paso a paso

1. Recomendaciones calcula la ruta troncal (rutas) y las cajas de Tier 1 / Tier 2 (lógica propia).
2. Filtra **en memoria** las localidades de su copia del catálogo que caen en cada caja.
3. Lee de `matching_loads` las cargas con origen y destino en esas localidades, compatibles con el remolque.
4. Pide a rutas, en un solo batch, las distancias de los tramos vacíos.
5. Calcula desvío y score, y devuelve el top 20.

---

## 1. S.3 (#137): descripción nueva

**Título:** sin cambios.

```markdown
Continuación de S.1 (#126). El análisis de S.1 (`docs/plan-centralizacion-routes.md` y `docs/filtrado-geografico-candidatos-postgis.md`) y las discusiones posteriores definieron cómo se reparten los datos entre el backend, el servicio de rutas y el de recomendaciones. Este spike valida esas decisiones con el equipo, cierra las que quedan abiertas y actualiza el `plan-busqueda.md`.

**Decisiones propuestas (a validar):**

- **Un schema y un rol de base de datos por servicio** (`public` para el backend, `routes` y `matching`). Ningún servicio escribe tablas de otro; se comunican por API.
- **El servicio de rutas es el servicio geográfico:** es dueño de provincias, localidades, geocodificación (búsqueda de localidades y direcciones) y rutas. El backend deja de tener `locations` y los adaptadores de geocodificación.
- **Las cargas y los depósitos guardan una foto de su localidad** (id y nombre de rutas) en lugar de una clave foránea. El punto exacto de retiro y entrega sigue en la carga: es un dato del negocio y solo se muestra después del desbloqueo.
- **Una ruta se identifica por el par de ids de localidad que une.** La normalización de nombres queda solo para buscar localidades.
- **Las estimaciones no se persisten:** si el proveedor externo falla, la estimación se calcula al momento y se devuelve marcada como tal.
- **El matching filtra por localidad:** recomendaciones calcula las cajas, filtra en memoria una copia cacheada del catálogo de localidades de rutas y lee las cargas de la vista `matching_loads` del backend por ids, con un rol de solo lectura.
- **PostGIS no es necesario para el matching.** Queda opcional en rutas (guardar trazados, localidad más cercana a un punto).

**Decisiones que siguen abiertas:**

- Proveedor externo de ruteo: Mapbox Directions u OSRM. Verificar si los términos de uso de Mapbox permiten guardar resultados de rutas y de geocodificación, y estimar el costo por volumen.
- Autenticación: validación vía JWKS (ES256, como el backend) y credencial para llamadas entre servicios.
- Orden de coordenadas en las respuestas.
- Caché: caché por datacenter o Cloudflare KV, para rutas y para la copia del catálogo en recomendaciones.
- Conexión de los workers a la base: cliente REST de Supabase o conexión directa con Hyperdrive.
- Repositorio del Recommendations Worker.

**Entregable:** decisiones documentadas en `docs/` y `plan-busqueda.md` actualizado (persistencia y consultas de Tier 1 y Tier 2).

Gherkins: no aplica.
```

---

## 2. Historias existentes que cambian

### 2.1 T.2.12 (#139): se cierra como reemplazada

Queda sin sentido: el backend ya no necesita geometrías. No conviene reescribirla porque su número (T.2.12) y su milestone (T.2) no corresponden al trabajo que la reemplaza (servicio de rutas).

**Comentario de cierre propuesto:**

```markdown
Se cierra como reemplazada. Con la decisión de S.3 (#137), el filtro geográfico del matching se hace por localidad, con una copia cacheada del catálogo de localidades del servicio de rutas, y el backend no necesita geometrías ni PostGIS. El trabajo equivalente pasa a la historia del catálogo de localidades expuesto por el servicio de rutas (#<R-CAT>).
```

### 2.2 R.1.1 (#140): base propia de rutas

**Título:** sin cambios.

````markdown
Hoy `microservice-routes` lee las tablas `routes` y `locations`, que son del backend (el backend define su esquema y las carga con su seed). El servicio de rutas pasa a tener su propia base (schema `routes` con su rol): es dueño de provincias, localidades y rutas, con las rutas precargadas migradas. PostGIS es opcional en este schema (trazados, localidad más cercana a un punto), según S.3.

Bloqueado por #137

**Gherkins** — sin escenarios nuevos (RUT 20 y 21 descartados el 2026-10-13: RUT 20 repetía RUT 01 y RUT 21 es una propiedad de despliegue). Los escenarios RUT 01, 02, 05, 10, 11 y 12 de `consultar_rutas.feature` pasan a correr contra la base propia del servicio.
````

### 2.3 R.1.5 (#144): identidad de una ruta

**Título nuevo:** `R.1.5 - Como desarrollador, Quiero identificar cada ruta por el par de localidades que une, Para que todas las consultas encuentren las rutas ya guardadas`

````markdown
Hoy una ruta se identifica con una clave de texto armada con los nombres normalizados de sus ciudades, y el backend, el microservicio y el `plan-busqueda.md` normalizan distinto: cualquier diferencia hace que las rutas guardadas no se encuentren. Con las localidades en el servicio de rutas, una ruta se identifica por el par de ids de las localidades que une (sin importar el sentido). La normalización de nombres queda solo para encontrar la localidad que el usuario escribió. Los escenarios RUT 10, 11 y 12 existentes ya cubren mayúsculas, tildes y sentido inverso.

Bloqueado por #137 y #140

**Gherkins** — pendientes de pushear a `microservice-routes/test/acceptance/features/consultar_rutas.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Regla: Identificación de la misma ruta

  Escenario: RUT 16: los espacios repetidos identifican la misma localidad
    Dado que existen las ciudades "San Nicolás" y "Rosario" en el sistema
    Cuando el usuario consulta la ruta desde "San   Nicolás" hacia "Rosario"
    Entonces la respuesta es exitosa
    Y la respuesta tiene origen "San Nicolás" y destino "Rosario"

  Escenario: RUT 17: la provincia en el nombre identifica la misma localidad
    Dado que existen las ciudades "Rosario" y "Córdoba" en el sistema
    Y que el usuario consulta la ruta desde "Rosario" hacia "Córdoba"
    Cuando el usuario consulta la ruta desde "Rosario, Santa Fe" hacia "Córdoba, Córdoba"
    Entonces la distancia y duración coinciden con el trayecto original

  Escenario: RUT 18: una ruta se consulta por los ids de sus localidades
    Dado que existe una ruta precargada entre "Rosario" y "Córdoba"
    Cuando el usuario consulta la ruta entre las localidades de "Córdoba" y "Rosario" por sus ids
    Entonces la respuesta es exitosa
    Y la respuesta indica que es un cálculo exacto de ruta
    Y no se consultó al proveedor de ruteo vial
```
````

### 2.4 T.2.13 (#148): asociar las cargas existentes a localidades

**Título nuevo:** `T.2.13 - Como desarrollador, Quiero asociar las cargas ya publicadas a las localidades del servicio de rutas y completar su distancia, Para que también aparezcan en las recomendaciones`

````markdown
Las cargas publicadas hoy referencian la tabla `locations` del backend y pueden no tener distancia. Con las localidades en el servicio de rutas, cada carga existente tiene que guardar el id y el nombre de su localidad en rutas para poder ser recomendada. Se completan con un proceso idempotente; las cargas cuya localidad no se encuentre en rutas y las cargas sin peso quedan listadas (no se inventan datos).

Bloqueado por #<R-LOC> y #<D-FOTO>

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/completar_datos_cargas_existentes.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Característica: Completar datos de cargas existentes
  Como desarrollador
  Quiero asociar las cargas ya publicadas a las localidades del servicio de rutas y completar su distancia
  Para que también aparezcan en las recomendaciones

  Escenario: CDE 01: una carga existente queda asociada a su localidad en el servicio de rutas
    Dado que existe una carga publicada con origen "Rosario, Santa Fe" sin localidad del servicio de rutas
    Cuando se completan los datos de las cargas existentes
    Entonces la carga queda asociada a la localidad "Rosario" del servicio de rutas

  Escenario: CDE 02: una carga existente sin distancia obtiene la distancia vial
    Dado que existe una carga publicada de "Rosario, Santa Fe" a "Córdoba, Córdoba" sin distancia
    Cuando se completan los datos de las cargas existentes
    Entonces la carga tiene la distancia vial que informa el servicio de rutas

  Escenario: CDE 03: una carga cuya localidad no existe en el servicio de rutas queda listada
    Dado que existe una carga publicada con origen en una localidad que no existe en el servicio de rutas
    Cuando se completan los datos de las cargas existentes
    Entonces la carga queda listada como pendiente de completar

  Escenario: CDE 04: una carga sin peso queda identificada y no se le inventa un peso
    Dado que existe una carga publicada sin peso
    Cuando se completan los datos de las cargas existentes
    Entonces la carga sigue sin peso
    Y la carga queda listada como pendiente de completar

  Escenario: CDE 05: completar los datos dos veces no modifica cargas ya completas
    Dado que se completaron los datos de las cargas existentes
    Cuando se completan los datos de las cargas existentes
    Entonces ninguna carga se modifica
```
````

### 2.5 T.2.14 (#149): vista de solo lectura por localidad

**Título:** sin cambios.

````markdown
El servicio de recomendaciones lee las cargas de la base del backend. Para que no dependa de valores internos (por ejemplo, el estado `activa` en minúsculas) ni de columnas que pueden cambiar, el backend expone la vista `matching_loads` como contrato, con un rol de base de datos de solo lectura para recomendaciones. La vista no tiene geometrías: identifica el origen y el destino por los ids de localidad del servicio de rutas.

Bloqueado por #148

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/consultar_cargas_para_recomendacion.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Característica: Consultar cargas para recomendación
  Como desarrollador
  Quiero exponer una vista de solo lectura con las cargas activas
  Para que el motor de recomendaciones no dependa de detalles internos del backend

  Escenario: CCR 01: solo se exponen cargas activas
    Dado que existen cargas en estado "activa", "reservada" y "entregada"
    Cuando el motor de recomendaciones consulta las cargas disponibles
    Entonces solo obtiene la carga en estado "activa"

  Escenario: CCR 02: la carga expuesta incluye los datos que necesita el matching
    Dado que existe una carga activa con peso, tipo de remolque, fechas y distancia
    Cuando el motor de recomendaciones consulta las cargas disponibles
    Entonces la carga incluye las localidades de origen y destino del servicio de rutas, peso, tipo de remolque, fechas, precio y distancia

  Escenario: CCR 03: se filtran cargas por localidades de origen y destino
    Dado que existen cargas activas de "Rosario" a "Córdoba" y de "Salta" a "Jujuy"
    Cuando el motor de recomendaciones consulta las cargas con origen en "Rosario" y destino en "Córdoba"
    Entonces solo obtiene la carga de "Rosario" a "Córdoba"

  Escenario: CCR 04: el motor de recomendaciones no puede modificar cargas
    Cuando el motor de recomendaciones intenta modificar una carga
    Entonces la operación es rechazada por falta de permisos
```
````

### 2.6 T.2.15 (#150): recomendaciones

**Título y Gherkins:** sin cambios (describen el comportamiento, que no cambia). Cambian el contexto y los bloqueos.

**Contexto nuevo** (reemplaza el párrafo inicial y la línea "Bloqueado por"):

```markdown
Motor de recomendación definido en `docs/plan-busqueda.md`: el transportista indica origen, destino, el remolque con el que viaja, fecha de salida y tolerancia de desvío, y recibe las cargas ordenadas por conveniencia con km cargados, km vacíos de inicio y fin y desvío neto. Solo se recomiendan cargas compatibles con el remolque (tipo y capacidad, y carrocería si S.4 la incorpora).

Lo resuelve el servicio de recomendaciones: calcula las cajas de Tier 1 y Tier 2, filtra en memoria una copia cacheada del catálogo de localidades del servicio de rutas, lee las cargas de la vista `matching_loads` por ids de localidad y pide a rutas, en un solo lote, las distancias de los tramos vacíos. Reemplaza a T.2.7 (#108).

Bloqueado por #137, #138, #142, #143, #144, #146, #147, #149 y #<R-CAT>
```

---

## 3. Historias nuevas

### 3.1 R-CAT · Catálogo de localidades del servicio de rutas

- **Milestone:** `R.1` · **Tipo:** backend (sin tag)
- **Título:** `Como desarrollador, Quiero que el servicio de rutas exponga su catálogo de localidades con coordenadas, Para que otros servicios lo usen sin duplicar la geografía`

````markdown
El servicio de recomendaciones filtra las localidades que caen dentro de las cajas de búsqueda. Para hacerlo sin consultar al servicio de rutas en cada búsqueda, mantiene una copia cacheada del catálogo de localidades. El servicio de rutas expone el catálogo completo con coordenadas e indica cuándo cambió, para que quien lo cachee sepa si tiene que refrescarlo. Reemplaza a T.2.12 (#139).

Bloqueado por #140

**Gherkins** — pendientes de pushear a `microservice-routes/test/acceptance/features/consultar_localidades.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
@acceptance
Característica: Consultar catálogo de localidades
  Como servicio de Smartruck
  Quiero obtener el catálogo de localidades con sus coordenadas
  Para usar la geografía de la plataforma sin mantener una copia propia del catálogo

  Antecedentes:
    Dado que existen las ciudades "Rosario", "Córdoba" y "Pergamino" en el sistema

  Escenario: LOC 01: el catálogo incluye cada localidad con sus coordenadas
    Cuando un servicio interno consulta el catálogo de localidades
    Entonces la respuesta es exitosa
    Y el catálogo incluye "Rosario", "Córdoba" y "Pergamino" con su provincia y sus coordenadas

  Escenario: LOC 02: si el catálogo no cambió no se vuelve a enviar
    Dado que un servicio interno consultó el catálogo de localidades
    Cuando el servicio interno consulta el catálogo indicando la versión que ya tiene
    Entonces la respuesta indica que el catálogo no cambió

  Escenario: LOC 03: si se agrega una localidad el catálogo cambia de versión
    Dado que un servicio interno consultó el catálogo de localidades
    Y que se agregó la ciudad "Venado Tuerto" al sistema
    Cuando el servicio interno consulta el catálogo indicando la versión que ya tiene
    Entonces la respuesta es exitosa
    Y el catálogo incluye "Venado Tuerto"
```
````

### 3.2 R-LOC · Localidades y geocodificación pasan a rutas

- **Milestone:** `R.1` · **Tipo:** `front+back`
- **Título:** `Como desarrollador, Quiero que el servicio de rutas sea el dueño de las localidades y de la geocodificación, Para que toda la geografía de la plataforma viva en un solo lugar`

````markdown
Hoy el backend es dueño de la tabla `locations`, de la búsqueda de provincias, localidades y direcciones (`/locations`, `/localizaciones/*`), de la geocodificación inversa del pin y de los adaptadores de Mapbox y Nominatim, mientras que el servicio de rutas necesita las mismas coordenadas. Todo eso pasa al servicio de rutas.

Backend: deja de exponer esos endpoints y de tener `locations` y los adaptadores de geocodificación; al publicar, le pide al servicio de rutas la localidad y las coordenadas.

UI (dador y transportista): el autocompletado de localidades, la búsqueda de direcciones y la geocodificación inversa del pin pasan a llamar al servicio de rutas.

Incluye la búsqueda de direcciones limitada a la localidad elegida (hoy busca en toda la provincia).

Bloqueado por #140

**Gherkins** — pendientes de pushear a `microservice-routes/test/acceptance/features/buscar_localidades_y_direcciones.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
@acceptance
Característica: Buscar localidades y direcciones
  Como usuario de Smartruck
  Quiero buscar localidades y direcciones
  Para indicar dónde se retira y se entrega una carga

  Regla: Localidades

    Escenario: BLD 01: se encuentran localidades por parte del nombre sin tildes
      Dado que existe la ciudad "Córdoba" en el sistema
      Cuando el usuario busca localidades con "cordo"
      Entonces la respuesta es exitosa
      Y entre los resultados está "Córdoba, Córdoba"

    Escenario: BLD 02: la búsqueda se puede limitar a una provincia
      Dado que existen las ciudades "San Martín, Buenos Aires" y "San Martín, Mendoza" en el sistema
      Cuando el usuario busca localidades con "San Martín" en la provincia "Mendoza"
      Entonces solo se encuentra "San Martín, Mendoza"

  Regla: Direcciones

    Escenario: BLD 03: solo se devuelven direcciones de la localidad elegida
      Dado que existen direcciones "San Martín 100" en "Rosario" y en "Villa Constitución", provincia de "Santa Fe"
      Cuando el usuario busca la dirección "San Martín 100" en la localidad "Rosario" de la provincia "Santa Fe"
      Entonces todas las direcciones encontradas son de "Rosario"

  Regla: Geocodificación inversa

    Escenario: BLD 04: un punto del mapa se asocia a su localidad
      Cuando el usuario consulta el punto "-32.9442", "-60.6505"
      Entonces la respuesta es exitosa
      Y el punto corresponde a la localidad "Rosario, Santa Fe"
```

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/infrastructure.feature`. Una vez en `main`, reemplazar este bloque por el link al archivo.

```gherkin
# language: es
Escenario: INF-LOC 01: el backend ya no busca localidades
  Cuando se buscan localidades con "Rosario" en el backend
  Entonces la respuesta tiene estado "404"
```

Reemplaza a N21 del borrador del Sprint 7 (búsqueda de direcciones dentro de la localidad).
````

### 3.3 D-FOTO · Foto de la localidad en cargas y depósitos

- **Milestone:** `D.2` · **Tipo:** backend (sin tag)
- **Título:** `Como desarrollador, Quiero que las cargas y los centros de carga guarden la localidad del servicio de rutas, Para que el backend no dependa de un catálogo de localidades propio`

````markdown
Hoy las cargas y los centros de carga tienen una clave foránea a `locations`. Entre servicios distintos no puede haber claves foráneas: la carga y el centro de carga pasan a guardar una foto de su localidad (id y nombre del servicio de rutas) al momento de crearse. El punto exacto de retiro y entrega (el pin) sigue guardándose en la carga.

Bloqueado por #<R-LOC>

**Gherkins** — pendientes de pushear a `smartruck-backend/test/acceptance/features/crear_oferta_carga.feature` y `crear_deposito.feature`. Una vez en `main`, reemplazar este bloque por el link a los archivos.

```gherkin
# language: es
Regla: Localidad del servicio de rutas

  Escenario: COC-LOC 01: la carga guarda la localidad del servicio de rutas
    Cuando el oferente crea una oferta de carga de "Rosario, Santa Fe" a "Buenos Aires, CABA"
    Entonces la respuesta es exitosa
    Y la oferta tiene la localidad de origen "Rosario" del servicio de rutas
    Y la oferta tiene la localidad de destino "Buenos Aires" del servicio de rutas

  Escenario: COC-LOC 02: no se publica una carga con una localidad que el servicio de rutas no conoce
    Cuando el oferente crea una oferta de carga con origen en "Ciudad Ficticia, Fantasía"
    Entonces la respuesta tiene estado "400"
    Y no se persiste ninguna carga

  Escenario: DEP 07: el centro de carga guarda la localidad del servicio de rutas
    Dado que existe un oferente registrado con CUIT "30711222333"
    Cuando el oferente crea un depósito en "Rosario, Santa Fe"
    Entonces la respuesta es exitosa
    Y el depósito tiene la localidad "Rosario" del servicio de rutas
```
````

---

## 4. Documentos a actualizar

| Documento | Cambio |
|---|---|
| `plan-busqueda.md` | Persistencia (secciones 3.2 y 3.3): sin `origin_geom` ni `destination_geom` en `loads`; la carga guarda los ids de localidad. Consultas de Tier 1 y Tier 2 (pasos 3 a 5): filtro por localidades del catálogo cacheado + lectura de `matching_loads` por ids. **Es el plan del equipo: validar en S.3 antes de cambiarlo** |
| `filtrado-geografico-candidatos-postgis.md` | Agregar al inicio una nota que indique que el filtro por geometrías en las cargas quedó reemplazado por el filtro por localidad (S.3), y remitir a la decisión |
| `plan-centralizacion-routes.md` | Localidades y geocodificación pasan a rutas (sección 4.1, "qué vive dónde") |
| `borrador-tickets-sprint-7.md` | N21 (búsqueda de direcciones dentro de la localidad) queda cubierta por R-LOC |

---

## 5. Orden de aplicación (cuando se apruebe)

1. Actualizar la descripción de **S.3 (#137)** y validar las decisiones con el equipo.
2. Crear las historias nuevas en orden de dependencias: **R-CAT** y **R-LOC** (bloqueadas por #140), después **D-FOTO** (bloqueada por R-LOC). Reemplazar los `#<R-CAT>`, `#<R-LOC>` y `#<D-FOTO>` por los números reales. R-LOC lleva `front+back`: asignar primero el milestone y agregar el tag recién cuando termine esa ejecución.
3. Editar **#140, #144, #148, #149 y #150** con las descripciones de la sección 2 (y los títulos nuevos de #144 y #148, manteniendo su prefijo numerado).
4. Cerrar **#139** con el comentario de la sección 2.1.
5. Actualizar los documentos de la sección 4.

Todas estas historias quedan en el **Sprint 6**, como las que reemplazan o complementan.
