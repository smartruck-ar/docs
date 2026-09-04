# cloud-template

Template de **plataforma cloud**: laboratorio Nomad mínimo con Infrastructure as Code (Terraform) sobre **Oracle Cloud Infrastructure (OCI)**.

## Quick path

Ver README del repo: preparar `terraform.tfvars`, elegir backend, `terraform init/plan/apply`.

Repo: [Mriat30/cloud-template](https://github.com/Mriat30/cloud-template)  
Estructura: `docs/estructura.md` en el repo.

## Stack

| Área | Tecnología |
|------|------------|
| IaC | Terraform ≥ 1.5 |
| Cloud | OCI |
| Runtime de jobs | Nomad |
| Catálogo | `catalog/services.yaml` (schema JSON) |

## Docs de este repo

- [Arquitectura](./arquitectura.md)
- [Links](./links.md)
