# Convención de Gherkin (BDD)

Formato de los archivos `.feature` en SmartTruck, alineado a lo usado en [smartruck-backend](../../repositories/smartruck-backend/README.md) (`test/acceptance/features/`).

Siempre en **español**: `# language: es` al inicio.

## Estructura de un archivo

```gherkin
# language: es
Característica: <nombre del valor de negocio>
  Como <actor>
  Quiero <capacidad>
  Para <beneficio>

  Antecedentes:
    Dado …
    Y …

  Regla: <agrupa escenarios del mismo criterio>
    Escenario: <ID>: <descripción>
      Dado …
      Cuando …
      Entonces …
      Y …
```

| Bloque | Para qué |
|--------|----------|
| **Característica** | Capacidad de negocio + Como / Quiero / Para |
| **Antecedentes** | Premisas comunes a **todos** los escenarios del archivo (o del alcance donde aplica) |
| **Regla** | “Empaqueta” escenarios que prueban el **mismo criterio** (éxito, validación, error, etc.) |
| **Escenario** | Un flujo concreto; ID corto tipo `COF 01`, `ISD 02`, `DDC 01` |

## Antecedentes

Sirve para no repetir el mismo setup en cada escenario.

Ejemplo (desbloquear carga):

```gherkin
Antecedentes:
  Dado que hoy es "2026-08-20T10:00:00"
  Y que existe un transportista autenticado con CUIT "30711222333"
  Y que existe una oferta de carga disponible para desbloquear con:
    | field       | value                  |
    | description | Carga de soja a granel |
    | from        | Rosario, Santa Fe      |
    | to          | Buenos Aires, CABA     |
```

Los pasos de Antecedentes son del tipo **Dado** / **Y** (preparación), no **Cuando**.

## Regla

Usa **Regla** para agrupar escenarios relacionados (mismo tema de aceptación).

Ejemplo (registro de oferente):

```gherkin
Regla: Registro exitoso
  Escenario: COF 01: …

Regla: Validación de email
  Escenario: COF 02: …
  Escenario: COF 03: …

Regla: Contraseña segura
  Escenario: COF 06: …
```

Así el feature no es una lista plana: cada regla empaqueta un criterio.

## Dado / Cuando / Entonces / Y

| Keyword | Significado | ¿Debe pegarle a la aplicación? |
|---------|-------------|-------------------------------|
| **Dado** | Precondición / estado inicial | **No** obligatorio (puede armar datos en DB, stubs, contexto) |
| **Cuando** | La **acción** bajo prueba | **Sí, obligatorio**: debe ir **contra la aplicación** (HTTP/API, caso de uso expuesto, etc.) |
| **Entonces** | Resultado esperado | **No** obligatorio pegarle de nuevo a la app (puede assert sobre la última respuesta, DB, mensajes) |
| **Y** / **Pero** | Continúa el mismo tipo de paso anterior | Misma regla que el paso al que sigue |

### Cuando (regla dura)

El **Cuando** es el único paso que **debe** ejercitar la aplicación (el sistema bajo prueba).  
Ejemplos del backend:

```gherkin
Cuando creo el transportista
Cuando inicio sesión
Cuando el transportista desbloquea la oferta de carga
```

Varios **Cuando** / **Y** en cadena solo si cada uno es una acción real sobre la app (ej. crear pago → webhook → desbloquear).

### Dado y Entonces

Pueden preparar o verificar **sin** llamar a la API, si el step lo implementa así:

```gherkin
Dado un oferente con:
  | field | value |
  | email | contacto@acopio.com |
# (arma el payload / fixture)

Entonces el oferente se crea correctamente
Y veo el mensaje de error "El email no es válido"
# (leen status/body de la respuesta del Cuando, o estado persistido)
```

## Tablas con `Y` y `field` / `value`

Formato habitual en el backend para datos estructurados:

```gherkin
Dado un transportista con:
  | field        | value                    |
  | cuit         | 30711222333              |
  | company_name | Transportes del Plata SA |
  | email        | contacto@tdp.com         |
  | phone        | 1144556677               |
Cuando creo el transportista
Entonces el transportista se crea correctamente
Y el transportista tiene condición fiscal "RESPONSABLE_INSCRIPTO"
```

Otro patrón con **Y** encadenando aserciones:

```gherkin
Entonces la respuesta es exitosa
Y la oferta de carga queda desbloqueada
Y la oferta tiene estado "BLOQUEADA"
```

O **Y** sumando más precondiciones:

```gherkin
Dado que existe un oferente registrado con:
  | field | value |
  | email | contacto@acopio.com |
  | password | ClaveSegura! |
Y credenciales de acceso con:
  | field    | value               |
  | email    | contacto@acopio.com |
  | password | ClaveIncorrecta!    |
Cuando inicio sesión
Entonces el inicio de sesión falla
Y veo el mensaje de error "Email o contraseña incorrectos"
```

## Checklist al escribir un `.feature`

- [ ] `# language: es` y keywords en español
- [ ] Característica con Como / Quiero / Para
- [ ] **Regla** cuando hay varios escenarios del mismo criterio
- [ ] **Antecedentes** si el setup se repite
- [ ] Cada escenario tiene **Cuando** contra la aplicación
- [ ] Dado / Entonces claros; tablas `field` / `value` cuando hay datos
- [ ] Link/path del feature en el ticket (DoR) si aplica BDD

## Ubicación de referencia

Features del backend: `smartruck-backend/test/acceptance/features/`.

## Next step

[Plantilla de ticket](../tickets/plantilla-ticket.md) · [DoR](definition-of-ready.md) · [Logging](logging.md)
