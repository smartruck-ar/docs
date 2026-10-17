# Responsabilidades de los servicios: backend, geografía y recomendaciones

> Qué hace cada parte del sistema, qué no le corresponde y cómo se comunican entre sí.
> Fecha: 2026-10-10 · Complementa a [plan-busqueda.md](plan-busqueda.md) y [plan-centralizacion-routes.md](plan-centralizacion-routes.md).

---

## 1. Visión general

```mermaid
flowchart LR
    subgraph FRONTS["Frontends"]
        DADOR["smartruck-dador"]
        TRANSP["smartruck-transportista"]
    end
    BACK["Backend<br/>el negocio"]
    GEO["Servicio geográfico<br/>(microservice-routes)<br/>lugares, búsqueda y rutas"]
    REC["Servicio de recomendaciones<br/>matching con PostGIS"]
    PROV["Proveedor externo<br/>Mapbox / OSRM"]
    DADOR -->|"publicar, cotizar, gestionar"| BACK
    TRANSP -->|"desbloquear, reservar, flota"| BACK
    DADOR -->|"autocompletado, pin, mapas"| GEO
    TRANSP -->|"mapas y rutas"| GEO
    TRANSP -->|"buscar cargas"| REC
    BACK -->|"geocodificar, distancia"| GEO
    REC -->|"ruta troncal, tramos en lote"| GEO
    REC -->|"cargas candidatas (lectura)"| BACK
    GEO -->|"solo lo que no conoce"| PROV
```

### Regla para decidir dónde va algo

| Si el dato o la lógica… | Es de… |
|---|---|
| Describe el mundo y es igual para todos (dónde está una ciudad, cómo se llega de una a otra) | **Servicio geográfico** |
| Pertenece a una carga, a un usuario o a una regla del negocio (precio, estado, quién pagó) | **Backend** |
| Decide qué cargas le convienen a un transportista | **Servicio de recomendaciones** |

---

## 2. Backend: el negocio

### Debe hacer

| Responsabilidad | Detalle |
|---|---|
| **Cargas** | Publicar, editar, eliminar y cambiar de estado; es el **único escritor** y la fuente de verdad |
| **Datos de la carga** | Guarda la **foto de sus localidades** (id y nombre del servicio geográfico), el **pin exacto** de retiro y entrega, el peso en toneladas, el tipo de remolque, las fechas, el precio y la distancia cotizada |
| **Reglas del negocio** | Desbloqueo, reserva, pagos, calificaciones y notificaciones |
| **Acceso a la dirección exacta** | Solo la muestra después del desbloqueo; el cálculo de la dirección se lo pide al servicio geográfico |
| **Precios y tarifas** | Precio sugerido, tarifa de desbloqueo y costos, usando la distancia del servicio geográfico |
| **Flota y usuarios** | Transportistas, oferentes, camiones, remolques (con capacidad y disponibilidad) y centros de carga |
| **Validación final** | Al desbloquear o reservar, valida el estado real de la carga, aunque una búsqueda la haya mostrado unos segundos antes |

### No debe hacer

- Guardar o mantener un catálogo de localidades ni geocodificar por su cuenta.
- Calcular distancias ni estimaciones (`haversine × 1,25`).
- Resolver rutas (deja de tener la copia del motor de rutas).
- Decidir qué cargas recomendar.

---

## 3. Servicio geográfico (`microservice-routes`): los lugares y las rutas

### Debe hacer

| Responsabilidad | Detalle |
|---|---|
| **Catálogo geográfico** | Es dueño de provincias y localidades con sus coordenadas (inicializable con Georef) |
| **Búsqueda** | Autocompletado de localidades y búsqueda de direcciones **dentro de la localidad elegida** |
| **Geocodificación** | Dirección → coordenadas, y punto del mapa → localidad o dirección (inversa) |
| **Rutas** | Distancia, duración y trazado entre dos localidades, identificadas por el **par de localidades**, orientadas en el sentido pedido |
| **Rutas desconocidas** | Las busca en el proveedor externo (Mapbox u OSRM) y **las guarda**; las siguientes consultas salen de su base o de su caché |
| **Estimación** | Si el proveedor falla, estima (factor vial y velocidad configurables), la devuelve marcada como estimación y **no la guarda** |
| **Consultas en lote** | Muchas rutas en una sola llamada, con geometría opcional |
| **Sus datos** | Schema y rol propios; es el **único escritor** de sus tablas |
| **Seguridad** | Usuarios con el JWT de Supabase (ES256 vía JWKS) y servicios internos con credencial propia |

### No debe hacer

- Guardar el pin exacto de cada carga ni saber quién puede verlo.
- Conocer cargas, precios o reglas del negocio.
- Decidir qué cargas recomendar.

### Datos

| Tabla | Contenido |
|---|---|
| `provinces` | Provincias |
| `localities` | Localidades con provincia, nombre normalizado y coordenadas |
| `routes` | Ruta por par de localidades: distancia, duración, trazado y origen (precargada o proveedor) |

PostGIS es opcional en este servicio (por ejemplo, para "localidad más cercana a un punto").

---

## 4. Servicio de recomendaciones: el matching

> Corre como un módulo del backend, no como un Worker aparte (2026-10-12). Las responsabilidades de esta sección no cambian por eso; sí cambia que no necesita Service Binding ni credencial propia para llamar al servicio geográfico — usa la misma credencial interna que el resto del backend (ver `plan-geo-service/design.md` D7).

### Debe hacer

| Responsabilidad | Detalle |
|---|---|
| **Ruta troncal y presupuesto** | Pide al servicio geográfico la ruta A → B y calcula el desvío máximo y el presupuesto del viaje |
| **Construir las cajas** | Calcula las cajas de Tier 1 (entorno de origen y destino) y, si no alcanza, el gran rectángulo de Tier 2 |
| **Filtro espacial con PostGIS** | Busca las cargas cuyo origen y destino caen en esas cajas, con índices espaciales |
| **Filtros del matching** | Tipo de remolque, capacidad (peso en toneladas), carrocería si se incorpora, y fechas |
| **Tramos vacíos** | Deduplica los pares de localidades y pide sus distancias al servicio geográfico en **una sola llamada** |
| **Descarte y scoring** | Descarta las cargas que superan el presupuesto, puntúa y devuelve el top 20 con km cargados, km vacíos y desvío |
| **Seguridad** | JWT de Supabase y rol de transportista |

### No debe hacer

- Escribir cargas ni cambiar su estado.
- Calcular distancias viales por su cuenta (se las pide al servicio geográfico).
- Validar el desbloqueo o la reserva (lo hace el backend).

### Decisión pendiente: sobre qué tabla corre la consulta espacial

| Opción | Cómo | Implica |
|---|---|---|
| **A. Plan literal** (`plan-busqueda.md`) | Geometrías en `loads` del backend; recomendaciones las consulta con un rol de **solo lectura** sobre una vista | Sin datos duplicados; geometrías en la tabla del backend; los tickets T.2.12 (#139), T.2.13 (#148) y T.2.14 (#149) ya están así |
| **B. Tabla propia** | Recomendaciones mantiene `load_index` con geometrías, actualizado por avisos del backend y una reconciliación periódica | Más independencia; datos duplicados de forma intencional; hay que reescribir esos tres tickets |

Se decide en S.3 (#137).

---

## 5. Cómo se comunican

### Resumen

| Origen → destino | Medio | Para qué | Frecuencia | Credencial |
|---|---|---|---|---|
| Frontends → Backend | API | Operar el negocio | Alta | JWT del usuario |
| Frontends → Servicio geográfico | API | Autocompletado, pin, mapas y rutas | Media | JWT del usuario |
| Transportista → Recomendaciones | API | Buscar cargas | Alta | JWT del usuario |
| Backend → Servicio geográfico | API | Geocodificar al publicar, distancia al cotizar | Baja | Credencial interna |
| Recomendaciones → Servicio geográfico | API (Service Binding) | Ruta troncal y tramos vacíos en lote | Por cada búsqueda | Credencial interna |
| Recomendaciones → Backend | Lectura de la base (opción A) o avisos del backend (opción B) | Cargas candidatas | Por cada búsqueda (A) o por cada cambio de carga (B) | Rol de solo lectura (A) o credencial interna (B) |
| Servicio geográfico → Proveedor externo | API | Rutas y geocodificación que no conoce | Baja | Token del proveedor |
| Servicio geográfico → otros servicios | — | Nunca: solo responde | — | — |

### Publicar una carga

```mermaid
sequenceDiagram
    autonumber
    actor D as Dador
    participant F as smartruck-dador
    participant G as Servicio geográfico
    participant B as Backend
    D->>F: escribe la localidad y la dirección
    F->>G: autocompletado y búsqueda de dirección
    G-->>F: localidad (id, nombre) y coordenadas del pin
    F->>B: cotizar (localidades)
    B->>G: distancia entre las localidades
    G-->>B: distancia y trazado
    B-->>F: precio sugerido
    F->>B: publicar (localidades, pin, peso, fechas, precio)
    B->>B: guarda la carga con la foto de sus localidades y el pin
    B-->>F: carga publicada
```

### Buscar cargas (transportista)

```mermaid
sequenceDiagram
    autonumber
    actor T as Transportista
    participant R as Recomendaciones
    participant G as Servicio geográfico
    participant DB as Cargas (PostGIS)
    T->>R: buscar de A a B con mi remolque y tolerancia
    R->>G: ruta troncal A → B
    G-->>R: distancia y coordenadas de A y B
    R->>R: calcula las cajas y el presupuesto
    R->>DB: cargas en las cajas (PostGIS) + filtros de remolque, capacidad y fechas
    DB-->>R: cargas candidatas
    R->>G: tramos vacíos en lote (pares únicos)
    G-->>R: distancias reales
    R->>R: descarte por presupuesto y scoring
    R-->>T: top 20 con km cargados, vacíos y desvío
```

### Desbloquear una carga y ver la dirección exacta

```mermaid
sequenceDiagram
    autonumber
    actor T as Transportista
    participant B as Backend
    participant G as Servicio geográfico
    T->>B: desbloquear la carga
    B->>B: valida el estado real, cobra y reserva
    B-->>T: carga desbloqueada
    T->>B: ver la dirección exacta
    B->>B: verifica que la desbloqueó este transportista
    B->>G: dirección del pin (geocodificación inversa)
    G-->>B: dirección
    B-->>T: dirección exacta
```

### Ver una ruta en el mapa

```mermaid
sequenceDiagram
    autonumber
    participant F as Frontend
    participant G as Servicio geográfico
    F->>G: ruta entre las localidades de la carga
    G-->>F: distancia, duración y trazado (o estimación marcada)
    F->>F: dibuja el mapa
```

---

## 6. Correspondencia con los tickets

| Parte | Tickets |
|---|---|
| Servicio geográfico | S.3 (#137), R.1.1 (#140) a R.1.6 (#145 / #152); historias nuevas R-LOC y D-FOTO en `borrador-cambios-sprint-6.md` |
| Recomendaciones | T.2.12 (#139), T.2.13 (#148), T.2.14 (#149), T.2.15 (#150 / #155), T.2.16 (#151) |
| Datos del matching en el backend | T.3.12 (#146 / #153) capacidad del remolque, D.2.9 (#147 / #154) peso en toneladas, S.4 (#138) atributos del remolque |
| Flota | T.3.13 (#159 / #160) liberación manual, T.3.14 (#161 / #162) disponibilidad por fechas |

> El borrador `borrador-cambios-sprint-6.md` también proponía filtrar por localidad sin PostGIS. Esa parte queda descartada para seguir el plan original; siguen valiendo las historias del servicio geográfico (R-LOC, D-FOTO y la reescritura de #144).
