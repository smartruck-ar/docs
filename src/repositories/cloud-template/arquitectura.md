# Arquitectura — cloud-template

## Responsabilidades

- Infraestructura OCI declarada con Terraform
- Nodo Ubuntu con Nomad e ingreso HTTP del laboratorio
- Scripts post-apply (token ACL Nomad, GitHub Environments)
- Catálogo validable de servicios

## Relación con el resto

| Relación | Detalle |
|----------|---------|
| Complementa | [infra-template](../infra-template/README.md) (microservicios que despliegan en Nomad) |
| No es | Un microservicio de negocio Smartruck |
