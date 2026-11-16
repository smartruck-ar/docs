# `smartruck-backend`

API REST central de **Smartruck** (`v1.3.0`), desarrollada en **Python >= 3.12** con **FastAPI**, **SQLModel**, **GeoAlchemy2 / PostGIS** y **Alembic**, bajo **Arquitectura Hexagonal (Ports & Adapters)**.

---

## Responsabilidades principales

- **Gestión de ofertas de carga y estados (`LoadStatus`):** Publicación, cotización previa con tarifas de referencia (`BASE` / `EXTERNAL_SOURCE` / FADEEAC / vehículo), descuento sugerido de retorno (20%), piso mínimo (90%, mínimo `50.000 ARS`) y transiciones de ciclo de vida (`activa`, `bloqueada`, `reservada`, `en_camino`, `demorada`, `entregada`, `entrega_confirmada`, `cancelada`).
- **Matching geográfico inteligente (`RecommendLoadsUseCase`):** Pre-filtrado SQL/PostGIS + **Tier 1** (cercanía `max(0,20 * D_nominal, 15 km)`), **Tier 2** sobre corredor vial (`PassThroughZone`) cuando Tier 1 aporta < 3 resultados puntuables, y ranking por `LoadScorer` (>= 25% aprovechamiento y tarifa/km).
- **Direcciones urbanas:** Autocompletado y geocodificación inversa en `/localizaciones/direcciones` y `/localizaciones/reversa` integrando **Geoapify** (primario) y **Georef** (fallback), con validación de pin dentro de `20 km`.
- **Bloqueos, pagos, reembolsos y cancelaciones:** Lock exclusivo de 10 minutos (`lock_atomically`), integración con **MercadoPago**, webhook idempotente, reembolsos automáticos por colisión tardía o cancelación de dador, y cancelación bilateral con penalidad de calificación.
- **Flota, depósitos, documentos y métricas:** Gestión de camiones, remolques, depósitos habituales, URLs firmadas hacia Supabase Storage (`600 s` de lectura), notificaciones in-app + emails asíncronos vía **Resend**, auditoría administrativa (`admin_users`, `admin_documents`, `admin_rates` con importación PDF vía `pdfplumber`) y métricas económicas/ambientales reales.

---

## Stack tecnológico

| Área | Herramientas |
| :--- | :--- |
| **Lenguaje y gestor** | Python >= 3.12, **`uv`** |
| **Framework API y auth** | FastAPI, Uvicorn, Pydantic / SQLModel, **PyJWT** (JWKS ES256) |
| **Datos y geoespacial** | PostgreSQL + **PostGIS** (`geoalchemy2`, índices GiST), **Alembic** (49 migraciones hasta `0049`) |
| **Integraciones** | `geo-service` (`urllib.request`, lotes max 200), Geoapify, Georef, MercadoPago SDK, Supabase Storage, Resend, `pdfplumber` |
| **Calidad y pruebas** | `pytest`, `pytest-bdd` (Gherkin), `pytest-cov` (`--cov-fail-under=85`), `ruff`, `httpx2` (dev), **Gitleaks** |
| **Despliegue** | Docker -> Artifact Registry -> **GCP Cloud Run** (`us-central1`) detrás de **API Gateway**, autenticado por **WIF (OIDC)** |

---

## Scripts y ejecución local

```bash
./scripts/start_dev_containers   # Levanta PostgreSQL + PostGIS local
./scripts/start_app              # Inicia la API en modo desarrollo (APP_MODE=development)
./scripts/run_lint               # Verifica estilo y reglas con Ruff
./scripts/run_unit_tests         # Pruebas unitarias rápidas
./scripts/run_all_tests          # Suite completa (unit + integración + BDD, cobertura >= 85%)
./scripts/install_git_hooks      # Instala hooks locales de verificación
```

Promoción de versiones: `./scripts/bump_version`, `./scripts/release_to_test`, `./scripts/release_to_prod`.

---

## Más información

- [Arquitectura de `smartruck-backend`](./arquitectura.md)
- [Reserva, concurrencia y desbloqueo consistente](./reserva-concurrencia-y-desbloqueo.md)
- [Links de referencia](./links.md)
