# Spec: Asignación de carga: camión y remolque

## Problema

El transportista puede asignar a una carga cualquier camión o remolque aunque no sirva para ese viaje, y puede reservarla sin tener los dos cargados. El camión se registra con muy pocos datos (no tiene modelo ni los datos que un dador esperaría ver). Además el portal muestra nombres de choferes escritos a mano que no vienen de ningún dato real.

## Solución

Al asignar una carga, el transportista ve solo los camiones y remolques que sirven para ella, y no puede avanzar si le falta uno de los dos. El camión se registra con su modelo y más datos. El chofer no es parte del producto: se retiran del portal los nombres hardcodeados.

## Comportamientos

**Camiones y remolques válidos**

1. Como transportista, quiero ver solo los camiones válidos para la carga que voy a llevar, para no asignar uno que no sirve.
2. Como transportista, quiero ver solo los remolques válidos para la carga, para no asignar uno de otro tipo o con menos capacidad.
3. Como transportista, quiero que un remolque sea válido solo si es del tipo que pide la carga, para cumplir con el requerimiento del dador.
4. Como transportista, quiero que un remolque sea válido solo si su capacidad en toneladas alcanza para el peso de la carga, para no sobrecargarlo.
5. Como transportista, quiero ver por qué un camión o remolque no está disponible para esta carga, para saber qué cambiar.
6. Como transportista, quiero que no se pueda asignar un camión o remolque que ya tiene otra carga en esas fechas, para no solapar viajes.
7. Como transportista, quiero recibir un error claro si falta el camión o el remolque al asignar, que me diga cuál falta, para completarlo antes de continuar.
8. Como transportista, quiero que no se pueda reservar una carga sin tener camión y remolque asignados, para no avanzar con un viaje que no puedo hacer.

**Datos del camión**

9. Como transportista, quiero registrar el modelo de mi camión además de sus datos actuales, para describir mejor mi flota.
10. Como transportista, quiero registrar más datos del camión (por ejemplo marca, año y patente), para que el dador sepa qué unidad va a retirar su carga.
11. Como transportista, quiero editar los datos de un camión ya cargado, para corregirlos o actualizarlos.
12. Como dador, quiero ver el modelo y los datos del camión asignado a mi carga una vez reservada, para saber qué unidad va a retirarla.

**Sin choferes**

13. Como equipo, queremos que el portal no muestre nombres de choferes escritos a mano, para que todo lo que se vea venga de datos reales.
14. Como equipo, queremos que el alta de un transporte no pida datos de chofer, para no registrar una figura que el producto no maneja.

## Decisiones de implementación

- **Repos:** `smartruck-backend` (reglas y datos del camión), `smartruck-transportista` (flota, asignación y limpieza de choferes) y `smartruck-dador` (ver el camión).
- **Lo que ya existe.** El backend ya modela camiones, remolques, tipos de remolque y capacidad en toneladas, y las historias #153, #159, #161 y #199 cubren capacidad, desasignar, disponibilidad y filtro por tipo. Este spec reutiliza esas reglas para el listado de unidades válidas y no las reescribe.
- **Regla de validez en el dominio.** Un solo lugar del dominio decide si una unidad sirve para una carga, y lo usan el listado, la asignación y la reserva, para que la pantalla y el backend no puedan diferir.
- **Disponibilidad.** Usa la misma noción de ocupación por fechas que ya mira la disponibilidad de camiones y remolques.
- **Datos nuevos del camión.** Modelo y los datos que se decidan, como campos del camión existente. Los camiones ya cargados quedan con esos campos vacíos y siguen funcionando.
- **Sin entidad chofer.** El producto no modela choferes: ni tabla, ni endpoint, ni campos en el alta de transporte. Hoy el backend no los tiene, así que el trabajo es solo del portal: retirar los nombres escritos a mano y los campos de chofer.

## Decisiones de testing

- **Seam:** el caso de uso que lista las unidades válidas para una carga y el de asignar, con repositorios en memoria.
- Un buen test arma cargas y unidades con tipo y capacidad conocidos y verifica qué entra y qué no, incluidos los bordes de capacidad (igual al peso y un poco menos).
- Los escenarios Gherkin no se copian acá: viven en los `.feature` y en cada historia.

## Fuera de alcance

- La figura del chofer, su alta, su asignación a un viaje y una aplicación para él (la PWA del chofer del informe es una mejora futura).
- Validación de documentos del camión.
- Seguimiento en vivo de la unidad.

## Notas

**Decisiones abiertas** (esta parte no pasó por la entrevista; vienen de tu lista: «mostrar camiones que solamente sean válidos para esa carga», «chequear tipo de vehículo y remolque, si falta alguno», «meter modelo de camión y más datos» y «quitar choferes»):

1. **Qué datos del camión se agregan además del modelo.** Propuse marca, año y patente. Hay que confirmar la lista, y cuáles son obligatorios.
2. **Alcance de «camiones válidos».** Hoy lo que se valida es el tipo y la capacidad del remolque. Falta confirmar si el camión se valida por algo más (por ejemplo, por su carrocería).
3. **Qué hacer con las reservas que ya existen sin camión o remolque.** Por defecto no se tocan.
4. **Dónde aparecen los choferes escritos a mano.** Hay que listarlos antes de la historia: encontré rastros en el alta de transporte, el detalle de carga, el checkout, el dashboard y el mapa del portal del transportista, y en datos de flota del portal del dador.

## Historias derivadas

_Lo completa `/to-tickets`. No lo escribas a mano._

| Historia | Cubre (de este spec) |
| --- | --- |
| #272 | Unidades válidas para la carga (1 a 6) |
| #273 | Camión y remolque obligatorios (7, 8) |
| #274 | Modelo y datos del camión (9 a 11) |
| #275 | El dador ve el camión asignado (12) |
| #276 | Retirar choferes hardcodeados (13, 14) |
