# Glosario

Términos del proceso y del dominio.

## Proceso

| Término | Significado |
|---------|-------------|
| Épica | Objetivo amplio; ID `D-1` / `T-1`; no se estima; Done = todas sus historias en productivo |
| Historia | Valor de usuario en Como/Quiero/Para; ID `D-1.2`; sin repo; Done = todas sus tasks en productivo |
| Task | Trabajo técnico; ID `D-1.2.1`; CA + US points + repo; Done = en productivo |
| US points | Estimación relativa de **tasks** (DoR) |
| Gherkin | Escenarios BDD; si aplican, deben estar en `main` para DoR de la task |
| DoR | Definition of Ready |
| DoD | Definition of Done (jerárquico; productivo) |
| Prefijo `D` | Producto Dador |
| Prefijo `T` | Producto Transportista |

## Dominio / producto

| Término | Significado |
|---------|-------------|
| Dador (shipper) | Publica / gestiona demanda de carga |
| Transportista | Opera / cotiza / gestiona el transporte |
| Oferta de carga | *(completar con el lenguaje de dominio del equipo)* |
| | |

## Repositorios

| Nombre | Rol breve |
|--------|-----------|
| smartruck-backend | API FastAPI hexagonal |
| smartruck-dador | Frontend Dador (TanStack Start) |
| smartruck-transportista | Frontend Transportista |
| cloud-template | Plataforma Nomad + Terraform OCI |
| infra-template | Template de microservicio Docker/Nomad/GHCR |

## Next step

[Repositories](../../repositories/README.md)
