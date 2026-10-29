# Mediciones de la búsqueda de paso

Respaldan las decisiones del spec. Se hicieron con scripts descartables sobre los datos del geo-service (`microservice-routes/db/data`): las 11.175 rutas guardadas (todos los pares entre las 150 localidades, con km por ruta y polilínea) y las coordenadas de las 150 localidades.

## Método

- Las localidades hacen de cargas: una carga entre dos localidades usa sus coordenadas como pines.
- **De paso por ruta:** una localidad P está de paso en el viaje A → B si ruta(A→P) + ruta(P→B) − ruta(A→B) es como mucho la vara. Varas probadas: 20% del viaje; 20% con tope de 200 km; 20% con tope de 150 km.
- **Perdidas:** localidades de paso que la zona deja afuera. **Basura:** localidades dentro de la zona que no son de paso.
- **Trabajo que descarta la base:** localidades dentro del rectángulo que envuelve la zona (lo que trae el índice GiST) contra las que quedan dentro de la zona.
- Viajes cortos: menos de 300 km; medios: 300 a 800 km; largos: más de 800 km. Valores en mediana salvo que se indique.

## Forma de la zona (margen en curva, vara 20% con tope de 200 km)

| Viajes | Forma | Adentro | Perdidas | Basura |
| --- | --- | --- | --- | --- |
| Cortos | Casco | 9 | 0,3% | 4 |
| Cortos | Elipse | 6 | 1,0% | 2 |
| Cortos | Unión | 9 | 0,1% | 4 |
| Medios | Casco | 21 | 5,8% | 5 |
| Medios | Elipse | 19 | 6,1% | 3 |
| Medios | Unión | 23 | 2,3% | 6 |
| Largos | Casco | 44 | 11,4% | 5 |
| Largos | Elipse | 45 | 8,0% | 4 |
| Largos | Unión | 51 | 4,6% | 7 |

Trabajo que descarta la base con la curva: casco 18%, 27% y 30%; elipse 14%, 20% y 21% (cortos, medios y largos). El corredor alrededor de la polilínea descartó 27% en una ruta típica con margen fijo, contra 17% de la elipse.

Viajes largos, curva, por vara (perdidas / basura):

| Vara | Casco | Elipse |
| --- | --- | --- |
| 20% | 20,4% / 2 | 15,4% / 2 |
| 20%, tope 200 km | 11,4% / 5 | 8,0% / 4 |
| 20%, tope 150 km | 7,2% / 8 | 4,3% / 8 |

Casos: en Mendoza → Goya la elipse pierde 11 (Rosario, San Lorenzo, Venado Tuerto, Casilda, Cañada de Gómez y otras) y el casco 1; en Tucumán → Buenos Aires el casco pierde 8 (Córdoba, Villa María, Río Tercero, Carlos Paz y otras) y la elipse 2; en Mendoza → Gualeguaychú las dos pierden Buenos Aires y el conurbano.

## Margen de la elipse (vara 20% con tope de 200 km)

| Fórmula | Cortos: adentro / perdidas / basura | Medios | Largos | Largos, p90 adentro |
| --- | --- | --- | --- | --- |
| Fijo 20% | 5 / 3,8% / 0 | 19 / 4,3% / 3 | 59 / 1,5% / 12 | 105 |
| Curva 20% × √(500 × km) | 6 / 1,0% / 2 | 19 / 6,1% / 3 | 45 / 8,0% / 4 | 83 |
| Tope 100 km | 5 / 3,8% / 0 | 17 / 9,2% / 2 | 35 / 21,5% / 1 | 63 |

## Sentido

2.000 rutas al azar, en las dos direcciones; todos los pares de localidades dentro de cada elipse (6,6 millones). Verdad: la carga va bien si ruta(origen→B) > ruta(destino→B). El 50% de los pares va para atrás.

| Regla | Acierta | Deja pasar contrarias | Tira buenas |
| --- | --- | --- | --- |
| El destino queda más cerca de B que el origen | 95,9% | 2,1% | 2,1% |
| Proyección sobre la recta A → B | 94,1% | 3,0% | 3,0% |

Los errores de la primera son casi empates: acercan 27 km en la mediana y 102 km en el p90.

## Pares del lote (elipse, curva y sentido; peor caso, con cargas entre todas las localidades de la zona)

| Viajes | Localidades (mediana / p99) | Pares (mediana / p90 / p99 / máx) | Tandas de 200 (p99 / máx) |
| --- | --- | --- | --- |
| Cortos | 6 / 24 | 22 / 174 / 308 / 392 | 2 / 2 |
| Medios | 19 / 55 | 183 / 804 / 1.558 / 1.984 | 8 / 10 |
| Largos | 45 / 113 | 1.044 / 3.466 / 6.389 / 10.319 | 32 / 52 |

## Indicador para el presupuesto

Cargas simuladas entre todos los pares de localidades de la zona (325 candidatas en la mediana, 2.080 en el p90). Precios parejos: $1.500 a $2.500 por km cargado. Precios dispersos: 80% con precio por km lognormal alrededor de $2.000 y 20% con precio fijo entre $200.000 y $1.500.000. Se compara el top 20 del puntaje real (km por ruta) con el top N de cada indicador en línea recta.

| Indicador | Parejos, N = 200: viajes sin perder del top 20 | Dispersos, N = 100 | Dispersos, N = 200 (peor caso) |
| --- | --- | --- | --- |
| Puntaje estimado | 100% | 100% | 100% (0) |
| Aprovechamiento estimado | 100% | 42% | 66% (6 de 20) |
| Desvío estimado | 7% | 4% | 5% (20 de 20) |

## Línea recta contra ruta

La ruta mide 1,19 veces la recta en la mediana, entre 1,11 y 1,33 en el 80% central, y hasta 3,73 (Gualeguay → Ramallo, sin puente sobre el Paraná).

## Memoria

Objetos `Load` del dominio, armados a mano, medidos con `tracemalloc`:

| Cargas | Sin trazado | Trazado de 100 puntos | Trazado de 1.000 puntos |
| --- | --- | --- | --- |
| 1.000 | 0,5 MB | 12 MB | 113 MB |
| 10.000 | 5 MB | 118 MB | 1.130 MB |

No incluye lo que agrega SQLAlchemy por fila ni el tamaño real de los trazados en test.
