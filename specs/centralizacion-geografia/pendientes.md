# Pendientes de la centralización de la geografía

Lista de lo que quedó por hacer, probar o decidir mientras se entregaban las historias de routes (R.1.x). Se actualiza a medida que se cierran cosas. Quién: **vos** (necesita credenciales, acceso o una decisión), **equipo** (otra persona), **pendiente de hacer** (código o tickets que se pueden retomar).

Última actualización: 2026-10-20.

## 1. Pruebas manuales pendientes

| Qué | Historia | Quién | Cómo |
| --- | --- | --- | --- |
| Mis cargas del dador hace **un único** `POST /geo/routes/batch` y cada tarjeta muestra sus km | #188 | vos | En `smartruck-dador-test.onrender.com`, DevTools → Network, filtro `geo`. Detalle en el comentario de #188 |
| Centros de carga con localidad, crear un centro nuevo eligiendo la ciudad de la lista, publicar con `MINERÍA Y CONSTRUCCIÓN` | #164 (dador) | vos | En `localhost:5174` con `dev_against_test`, o en test. Revisar en el payload `origin_locality_id` y `destination_locality_id` |
| Mapa del transportista sin cargas, `403` en `/trucks` y en `/notifications/transporter/<id>` | #152 | vos | Pasar el cuerpo de la respuesta de esos pedidos y la consola |
| Preflight de CORS del servicio de rutas desde los dos frontends desplegados | #152 | vos | Verificado por vos en test; repetirlo en prod con los orígenes de prod |

## 2. Configuración externa y credenciales

| Qué | Historia | Quién |
| --- | --- | --- |
| Monitores de UptimeRobot de test y prod: cambiar de `/routes/health` a `/geo/health` | #181 | **vos o quien tenga acceso a UptimeRobot** (no hay acceso desde acá) |
| Cargar en prod las 296 rutas nuevas (`load_geo --dry-run`, `load_geo`, `compute_missing_routes --check --db`) | #169, paso agregado en #179 | vos, con la `DATABASE_URL` de prod |
| Cuenta de servicio del backend en prod, secrets `ACCEPTANCE_*`, `MAPBOX_ACCESS_TOKEN` y `CORS_ALLOWED_ORIGINS` con los orígenes de prod | #179 | vos |
| Encender `AUTH_REQUIRED` en prod y retirar el interruptor | #180 | vos |
| Orden de releases a prod: servicio de rutas, carga de datos, backend, verificar CORS en `api.smartruck.tech`, frontends | #179 | vos y el equipo |
| `.env.example` de los repos no se pudo editar por una regla de permisos; hay ejemplos en archivos aparte (`.env.test.example` en rutas) | R.1.6 | vos |

## 3. Cloudflare y límite por IP del WAF

La regla de rate limiting (`20 req / 10 s` por IP) alcanza también al backend, que sale de una sola IP. Hoy no es un problema; lo sería con el recomendador y tráfico real.

| Qué | Quién |
| --- | --- |
| Marcos: listar las reglas personalizadas del WAF, mirar Security → Events (cuántos 429 y de qué IPs) y probar en el panel si una regla personalizada acepta cabeceras en el plan Free | equipo |
| Decidir la excepción para el backend: **host interno** apuntando al mismo Worker (recomendado), o regla personalizada con Skip si Free acepta cabeceras. La cabecera dentro de la regla de rate limiting **no** funciona en Free (probado) | vos y el equipo |
| Preparar el cambio de Terraform en `smartruck-infra` y aplicarlo con un tag | yo escribo, vos aplicás (el modo auto me bloquea los cambios de WAF) |

## 4. Desarrollo y tickets por retomar

| Qué | Historia | Estado |
| --- | --- | --- |
| Filtro de origen y destino del transportista por localidad del servicio geográfico | #164 (transportista) | Espera a que la búsqueda de cargas use ids (recomendador / #184) |
| Pedir las rutas por **id de localidad** en dador y transportista (hoy van por nombre); prerequisito para retirar la consulta por nombre | #183 | Dador se puede hacer ya; transportista depende de la búsqueda |
| Retirar la consulta por nombre del servicio de rutas | #183 | Bloqueada por lo anterior |
| Etapa 2 del backend: retirar la copia del motor de rutas y los endpoints de localidades | #145, #163, #170 (RUT 22), #184 | Retomar cuando los frontends dejen de usar `locations` y `/routes` |
| Retirar la tabla `locations` y leer las localidades del servicio geográfico | #184 | Pendiente; toca la búsqueda de cargas |
| Búsqueda de direcciones y dirección sugerida del pin en el servicio de rutas | #172, #175 | Depende de confirmar Georef (#166) |
| Autorización por llamante en el servicio de rutas (usuario o cuenta de servicio) | #187 | Refinar qué endpoints son solo para servicios |
| Resiliencia del servicio de rutas (copia en el borde ante falla de la base, JWKS con vigencia larga) | ADR 0003 | **Falta crear la historia**; #171 queda como entregada y #174 sin efecto |
| Cerrar o comentar #174 (sin efecto por el ADR 0003) y #186 (superada por #184 y el recomendador) | #174, #186 | Pendiente de decidir |
| El filtro de cargas por categoría en el transportista solo acepta los tipos viejos | R.1.x | Pendiente de revisar |
| `haversine` de `corridor-map-client.tsx` (transportista) y factor `× 1,25` de la duración en la vista previa del dador | R.1.6 | Pendiente de revisar |
| Error de React #418 (hidratación) en dador y transportista, y «WebGL context was lost» en los mapas | — | Sin investigar |

## 5. Repos con cambios sin subir

| Repo | Qué |
| --- | --- |
| `smartruck-transportista` | Dos commits locales: `dev_against_test` y el paso de `VITE_SUPABASE_*` al container |
| `smartruck-ai` | Regla de `nueva-feature` (todo en containers), sin commitear |

## 6. Horas (`Spent (hs)`) sin cargar

La regla es que las horas las dice el usuario. Faltan las de #164 (dador), #181 y las historias que se vayan cerrando.
