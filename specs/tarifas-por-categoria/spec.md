# Spec: Tarifas por categoría de carga

## Problema

El precio de flete que se le sugiere al dador es el mismo para todas las cargas (una tarifa por km fija en pesos y un mínimo), sin importar si lleva granos, hacienda o carga peligrosa. No coincide con lo que dice el informe, y para corregirlo hoy hay que tocar código y desplegar. Además las categorías y los tipos de carga están escritos en el código, así que tampoco se pueden cambiar sin desplegar.

## Solución

El dador recibe un precio sugerido calculado según la categoría de su carga, con la unidad de cobro que usa el mercado para esa categoría (por km, por tonelada según tramo o por tipo de vehículo), el descuento del 20 % que Smartruck aplica a todos los viajes (para la plataforma, todo viaje es de retorno) y un piso mínimo por debajo del cual no puede publicar. Las categorías, sus subcategorías (tipos de carga) y sus tarifas viven en la base de datos y las edita un administrador desde el backoffice, sin desplegar.

## Comportamientos

**Precio sugerido (backend)**

1. Como dador, quiero recibir un precio sugerido según la categoría de mi carga, para publicar con una referencia de mercado y no con un número igual para todos.
2. Como dador de carga general, refrigerada o peligrosa, quiero que el precio sugerido sea la tarifa por km de mi categoría por la distancia vial, para pagar lo que el mercado paga por ese tipo de flete.
3. Como dador de granos o agroindustria, quiero que el precio sugerido dependa de la distancia y de las toneladas de mi carga, para que se parezca a cómo se cotiza el agro.
4. Como dador de ganadería, quiero que el precio sugerido dependa de la distancia y del tipo de vehículo (jaula simple, jaula doble o chasis), para que se parezca a cómo se cotiza la hacienda.
5. Como dador, quiero que el precio sugerido ya tenga un 20 % de descuento sobre la tarifa de referencia de mi categoría, porque en Smartruck todo viaje es de retorno, para acceder a un transporte más barato que el del mercado.
6. Como dador, quiero poder fijar un precio distinto al sugerido, para negociar según mi situación.
7. Como transportista, quiero que no se pueda publicar una carga con un precio por debajo del piso mínimo relativo al sugerido, para que no haya ofertas abusivas.
8. Como dador, quiero recibir un error claro cuando mi precio perfora el piso, que me diga cuál es el mínimo, para ajustarlo.
9. Como dador, quiero recibir un error claro si no se puede calcular la distancia porque el servicio geográfico no responde, para no publicar con un precio aproximado sin saberlo.
10. Como dador, quiero recibir un error claro si mi categoría no tiene una tarifa vigente cargada, para saber que el problema no es de mi carga.
11. Como dador, quiero que el precio sugerido de una carga ya publicada no cambie cuando se edita una tarifa, para que no se modifique sin que lo decida.

**Categorías, subcategorías y tarifas (backoffice)**

12. Como administrador, quiero ver las categorías con sus subcategorías y la tarifa vigente de cada una, para saber con qué se está calculando hoy.
13. Como administrador, quiero crear, renombrar y desactivar categorías y subcategorías, para mantener el catálogo alineado con el negocio sin desplegar.
14. Como administrador, quiero cargar una nueva tarifa para una categoría con su unidad de cobro y sus valores, para actualizar el tarifario cuando cambian los costos.
15. Como administrador, quiero que la tarifa nueva tenga una fecha de vigencia y que la anterior quede en el historial, para saber qué tarifa se usó en cada momento.
16. Como administrador, quiero editar los parámetros generales (descuento de Smartruck y porcentaje del piso mínimo), para ajustarlos sin desplegar.
17. Como administrador, quiero recibir un error claro si cargo una tarifa incompleta o inconsistente (valor en cero o negativo, tramos que se pisan, tipo de vehículo faltante), para no dejar el cálculo roto.
18. Como administrador, quiero que cada cambio al catálogo y al tarifario quede registrado con quién y cuándo, para auditarlo.
19. Como administrador, quiero que solo un usuario con rol de administrador pueda cambiar categorías y tarifas, para que nadie más toque los precios.
20. Como dador y transportista, quiero ver las categorías y subcategorías activas al publicar y al filtrar, para elegir entre las que existen hoy.

## Decisiones de implementación

- **Repos:** `smartruck-backend` (esquema, reglas de cálculo y endpoints de administración) y `smartruck-backoffice` (pantallas de administración, en historias aparte). El dador y el transportista consumen las categorías por endpoint; las constantes de categoría y tipo de carga de los portales se reemplazan por esa consulta.
- **Catálogo en tablas.** Una tabla de categorías y una de subcategorías (los tipos de carga), con la subcategoría ligada a una categoría. Reemplazan los catálogos escritos en el código. Una categoría o subcategoría se desactiva, no se borra, para no dejar cargas viejas sin referencia. La migración carga las seis categorías del informe y mapea los tipos de carga actuales a su categoría.
- **Tarifas relacionadas con la categoría.** Cada tarifa pertenece a una categoría y tiene una unidad de cobro, una fecha de vigencia y un estado. Tres unidades: por km, por tonelada según tramo de distancia y por tipo de vehículo según tramo de distancia. Los valores concretos de cada tarifa (tarifa por km, escalones por tramo, porcentaje sobre un tarifario de referencia) cuelgan de la tarifa en una tabla de renglones. Una carga queda ligada a la tarifa con la que se calculó su precio sugerido.
- **Valores iniciales (tarifario propuesto por el equipo, en pesos).** Carga general 2.500 ARS/km, refrigerada 2.800 ARS/km y peligrosa 3.000 ARS/km (20 % más que la general). Las tres se cobran solo por km, sin toneladas, como se maneja el mercado informal. Granos y agricultura es el 78 % de la tarifa sugerida por FADEEAC para ese viaje, y ganadería el tarifario de FADEEAC por km y tipo de vehículo. Solo estas dos últimas tienen un tarifario oficial. El 78 % sale de lo que un transportista del relevamiento consideró aceptable respecto del tarifario de CATAC. Los tarifarios de FADEEAC se cargan como tramos desde el backoffice, no como constantes.
- **Descuento de Smartruck.** Sobre la tarifa de referencia de cada categoría se aplica siempre un 20 % de descuento (se multiplica por 0,8), porque para Smartruck todo viaje es de retorno. En granos y agroindustria el 78 % se aplica primero y el 0,8 después. No hay una marca de retorno en la carga. Con la tarifa general, el sugerido queda en 2.000 ARS/km, que es el valor que usa hoy el backend.
- **Parámetros generales.** El descuento de Smartruck (20 %) y el porcentaje del piso mínimo (80 % del sugerido) en una tabla de parámetros editable, no ligada a una categoría. Los porcentajes de las categorías (78 % de agro, 20 % de recargo de peligrosa) también deben poder editarse desde el backoffice.
- **Moneda.** Las tarifas se guardan en pesos, como las definió el equipo. El precio sugerido se redondea a miles como hoy. El unlock fee sigue en USD con su propio tipo de cambio y no se mezcla con esto.
- **Distancia.** Siempre vial y siempre del servicio de geografía. Si no responde, el cálculo falla con un error claro y no se usa una distancia aproximada.
- **Endpoints de administración.** Bajo `/admin`, con la misma autenticación de administrador que usan los endpoints de usuarios y documentos. Lectura del catálogo y de la tarifa vigente, alta y modificación de categorías y subcategorías, alta de una tarifa nueva con vigencia y modificación de parámetros. Una tarifa nueva se agrega, no se edita la anterior.
- **Capas.** Como en el resto del backend: reglas de cálculo y validación en el dominio, casos de uso que orquestan, un puerto de repositorio para el catálogo y las tarifas y su adaptador de base de datos. `Pricing` deja de tener constantes y pasa a recibir la tarifa vigente.
- **Cotización existente.** El endpoint de cotización de una carga (`QuoteLoad`) sigue devolviendo el precio recomendado, ahora calculado con la tarifa de la categoría.

## Decisiones de testing

- **Seam:** el caso de uso de cotización y los endpoints de administración, con un repositorio en memoria para las tarifas y el servicio geográfico simulado.
- Un buen test fija el precio sugerido por categoría con tarifas conocidas, el descuento de retorno, el piso y los errores, sin mirar la forma en que se guarda ni se calcula por dentro.
- Los casos de unidad por tramos (granos y hacienda) se testean con tablas de tramos chicas, no con los tarifarios reales.
- Hay que cubrir el historial: cargar una tarifa nueva no cambia el precio de una carga ya publicada.
- Los escenarios Gherkin no se copian acá: viven en los `.feature` y en cada historia.

## Fuera de alcance

- El **unlock fee** (`5 + 0,04 × d` USD): va en el spec de pagos y plazos, con la distancia del servicio de geografía.
- El recargo por larga distancia al Norte o Sur y el precio sugerido dinámico (§15.5 y §15.6 del informe): el informe los deja como trabajo futuro.
- Actualización automática de las tarifas con el índice de costos de FADEEAC.
- Peajes, viáticos y estadías como conceptos del precio.
- El efecto del unlock fee sobre el ingreso del transportista (el equipo estima que gana aproximadamente un 5 % menos por el fee): es una cuenta de negocio, no un comportamiento del sistema.
- Las pantallas del backoffice, que van en historias `UI-` aparte.

## Notas

**Decisiones cerradas en la entrevista:**

1. **Piso mínimo: 80 % del precio sugerido.** Es un parámetro editable desde el backoffice.
2. **Las categorías son las seis del informe** (granos y agricultura, agroindustria, peligrosa / regulada, ganadería / hacienda, refrigerado y carga general). Quedan cargadas como datos iniciales de la migración.
3. **«Productos industrializados» va en carga general**, como en el informe. Granos y agricultura y agroindustria usan el mismo 78 % de la tarifa de FADEEAC.
4. **Los valores de los tarifarios de FADEEAC quedan afuera del spec.** El spec solo exige que el sistema sepa calcular con ellos y que se carguen desde el backoffice. Conseguirlos es una tarea de datos del equipo, no de este spec.

**Fórmulas confirmadas** (`X` son los km de la ruta vial; el 0,8 es el descuento de Smartruck):

| Categoría | Precio sugerido |
| --- | --- |
| Carga general | 2.500 × X × 0,8 |
| Refrigerado | 2.800 × X × 0,8 |
| Peligrosa / regulada | 3.000 × X × 0,8 |
| Ganadería / hacienda | tarifa de FADEEAC de hacienda (X, vehículo) × 0,8 |
| Granos y agricultura / agroindustria | tarifa de FADEEAC de agro (X, toneladas) × 0,78 × 0,8 |

Con carga general el sugerido queda en 2.000 ARS/km, que es el valor que usa hoy el backend.

**Para quien implemente:** hoy `Pricing` usa 2000 ARS por km y un mínimo de 50.000 ARS; ninguno de esos valores tiene fuente. El documento `docs/tarifario-formulario-y-estimacion.md` explica por qué se hicieron los relevamientos, y el Anexo 2 del informe tiene los valores finales. Si esos dos difieren, manda el informe.

## Historias derivadas

_Lo completa `/to-tickets`. No lo escribas a mano._

| Historia | Cubre (de este spec) |
| --- | --- |
| #252 | Catálogo de categorías y tipos en tablas (comportamientos 12, 13 y 20) |
| #253 | Precio sugerido por km según categoría, con 0,8 y errores (1, 2, 5, 9, 10) |
| #254 | Precio sugerido de granos y agroindustria (3) |
| #255 | Precio sugerido de ganadería (4) |
| #256 | Piso mínimo del 80 % (7, 8) |
| #257 | Tarifa ligada a la carga e historial (11) |
| #258 | Administrar categorías y tipos desde el backoffice (13, 18, 19) |
| #259 | Administrar tarifas, vigencia y parámetros (14 a 19) |
| #289 | Editar los parámetros del cálculo y auditar los cambios (15, 17) |
