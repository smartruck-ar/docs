# Spec: Métricas reales

## Problema

Las métricas que muestran los portales (incluida la del perfil) están escritas a mano en el código: no salen de ninguna operación real. El usuario ve números que no son suyos, y las que el informe promete (kilómetros muertos evitados, ahorro, emisiones) no existen como pantalla.

## Solución

Una pantalla de métricas, nueva, que calcula todo a partir de las cargas y los viajes reales del usuario, sin números escritos a mano. El perfil deja de mostrar datos inventados.

## Comportamientos

1. Como transportista, quiero ver una pantalla de métricas con los datos de mis propios viajes, para entender cuánto me rinde la plataforma.
2. Como transportista, quiero ver los kilómetros muertos que evité gracias a las cargas que tomé, para saber cuánto dejé de manejar vacío.
3. Como transportista, quiero ver cuánto combustible y plata me ahorré por no volver vacío, para valorar la plataforma.
4. Como transportista, quiero ver mi rentabilidad por kilómetro, para compararla con los pisos del mercado.
5. Como transportista, quiero ver las emisiones de CO₂ evitadas, para medir el impacto ambiental de mis viajes.
6. Como dador, quiero ver una pantalla de métricas con los datos de mis propias cargas, para saber cómo me va publicando.
7. Como dador, quiero ver cuántas de mis cargas se entregaron, se cancelaron o vencieron, para evaluar mi uso de la plataforma.
8. Como usuario, quiero que la pantalla me avise cuando todavía no tengo viajes o cargas, y que no muestre ceros que parezcan datos, para no confundirme.
9. Como usuario, quiero que el perfil muestre solo datos reales (mis calificaciones, mis viajes), para ver mi reputación verdadera.
10. Como equipo, queremos que ninguna métrica salga de un valor escrito en el código, para que lo que se vea sea cierto.

## Decisiones de implementación

- **Repos:** `smartruck-backend` (cálculo y endpoint) y los dos portales (`smartruck-transportista` y `smartruck-dador`, una pantalla cada uno y el perfil).
- **Las métricas se calculan en el backend** a partir de las cargas y los viajes que ya guarda, y el portal solo las muestra. Los portales no calculan ni inventan.
- **Qué métricas existen sale del informe** (sección de la pantalla de métricas analíticas): kilómetros muertos evitados, costo hundido rescatado, rentabilidad por kilómetro, plazo de liquidación y emisiones de CO₂ evitadas.
- **Datos que ya están.** Cada carga guarda la distancia de su ruta real y el backend ya mide los kilómetros vacíos de inicio, cargados, vacíos de fin y el desvío neto en las recomendaciones (historias T.2.17 y #190). Eso es la base de los kilómetros muertos evitados.
- **Perfil.** Reemplaza cada valor escrito a mano por el dato real o por un estado vacío.

## Decisiones de testing

- **Seam:** el caso de uso que calcula las métricas de un usuario, con repositorios en memoria con viajes de datos conocidos.
- Un buen test verifica que las métricas cambian cuando cambian los viajes, y que un usuario sin viajes recibe el estado vacío y no ceros.
- Los escenarios Gherkin no se copian acá: viven en los `.feature` y en cada historia.

## Fuera de alcance

- Gráficos históricos y comparaciones entre usuarios.
- Exportar métricas.
- Métricas de la plataforma para el administrador (van en el backoffice).

## Notas

**Decisiones abiertas** (esta parte no pasó por la entrevista; el único dato tuyo fue «las métricas están hardcodeadas hoy y hay que hacer una pantalla nueva y tomarlas de algún lugar sin hardcodeo»):

1. **Qué métricas entran en esta primera versión.** Propuse las del informe, pero puede ser un subconjunto.
2. **Cómo se calculan las que dependen de supuestos** (combustible ahorrado, CO₂, rentabilidad): hace falta fijar los factores (consumo en vacío, emisión por litro, costo del combustible) y dónde viven. El informe usa 28 L/100 km en vacío y 2,68 kg de CO₂ por litro.
3. **Qué métricas tiene sentido mostrar al dador** además de contar sus cargas.
4. **Dónde están hoy los números escritos a mano** (revisé el código del front):
   - En el panel de control del transportista, el KPI «Facturación total» tiene fijo el texto «+18 % vs mes anterior». Los demás KPIs (facturación, ganado por retornos, ahorrado, km vacíos evitados, tasa de ocupación) se calculan en el portal con datos locales de flota y viajes, no con el backend.
   - En el panel de control del dador, la facturación se muestra como el total menos 5.000.000, con el texto fijo «-18 % vs mes anterior», y los km evitados como el valor más 4.000.
   - En el perfil del transportista, «Viajes completados» está fijo en 0 y la tasa de cumplimiento arranca en 100 % cuando no hay calificaciones.
   - Lo que ya viene del backend en el perfil es la reputación (puntaje y calificaciones).
   Las «quick actions» que mencionó el equipo son estos mismos paneles.

## Historias derivadas

_Lo completa `/to-tickets`. No lo escribas a mano._

| Historia | Cubre (de este spec) |
| --- | --- |
| #277 | Métricas reales del transportista (1 a 5, 8, 10) |
| #278 | Métricas reales del dador (6, 7, 8, 10) |
| #279 | Panel y perfil del transportista sin datos escritos (9, 10) |
| #280 | Panel y perfil del dador sin datos escritos (9, 10) |
