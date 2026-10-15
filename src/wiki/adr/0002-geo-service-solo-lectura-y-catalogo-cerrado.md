# 0002 · El geo-service es de solo lectura y el catálogo es cerrado

- **Estado:** aceptado (2026-10-15)
- **Reemplaza:** el "write-through" de `plan-centralizacion-routes.md` (R4) y la idea de rutas con persistencia en runtime de la historia R.1.2

## Contexto

Los términos de Mapbox no permiten guardar resultados de geocoding temporal, y la regla de Directions no está verificada. La base de rutas son 10.879 rutas precargadas (150 ciudades, generadas con OSRM sobre datos de OpenStreetMap). Con el plan gratuito de la base (500 MB) no entra una matriz de miles de localidades.

## Decisión

1. **Nadie escribe en el geo-service en runtime.** Es un servicio de consulta. Si más adelante hace falta alta de datos, será desde un backoffice con endpoints propios.
2. **El catálogo son las 150 ciudades** de las rutas precargadas. A cada una se le guarda su provincia, tomada una sola vez del dump de Georef (CC BY 4.0). Una localidad que no está en el catálogo es "no soportada".
3. **Se guarda todo lo que la licencia permita** (dumps abiertos, rutas de OpenStreetMap). Lo que no se puede guardar por términos, no se guarda.
4. **Pares sin ruta:** los ~296 pares faltantes se calculan con un script offline (OSRM propio) y se cargan; Mapbox Directions queda como respaldo sin guardar, y la estimación (`is_estimation`) como último recurso.
5. **Geocodificación inversa:** un punto se asocia a la localidad más cercana del catálogo dentro de un radio máximo configurable; fuera del radio, "fuera de cobertura".
6. **Crecimiento futuro:** el catálogo crece por frecuencia de uso (no por cantidad de habitantes), con un script idempotente que recibe la lista de localidades y calcula solo los pares que faltan.

## Consecuencias

- Casi no hay dependencia de proveedores externos en runtime.
- No se puede elegir una localidad fuera de las 150 hasta ampliar el catálogo.
- El pin de un mapa se aproxima a la ciudad más cercana; es una aproximación aceptada.
- Riesgo abierto: la dirección en texto que viene de un proveedor y se guarda en la carga debe pasar un chequeo de términos (spike de cumplimiento).
