import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = ".archify/architecture-smartruck-demo-20261019-2321";
const repository = {
  url: "https://github.com/smartruck-ar/docs.git",
  provider: "github",
  link_mode: "web",
  revision: "4e4dc7bf4afa7eecd4bb4244e1d3785eb0841776",
};

const source = (line, end_line, label) => ({
  path: "src/arquitectura.md",
  line,
  end_line,
  label,
});

const component = (id, type, label, sublabel, pos, size, sources, options = {}) => ({
  id,
  type,
  label,
  sublabel,
  pos: [pos[0], Math.round(pos[1] * 0.75)],
  size,
  sources,
  ...(options.tag ? { tag: options.tag } : {}),
  ...(options.brand ? { brand: options.brand } : {}),
  ...(options.icon ? { icon: options.icon } : {}),
});

const edge = (id, from, to, label, variant = "default", sides = {}) => ({
  id,
  from,
  to,
  label,
  variant,
  ...sides,
});

const diagram = (slug, title, components, connections, cards = [], boundaries = []) => ({
  schema_version: 1,
  diagram_type: "architecture",
  meta: {
    title,
    locale: "es",
    output: `${root}/preview/${slug}.html`,
    quality_profile: "showcase",
    repository,
  },
  components,
  ...(boundaries.length ? { boundaries } : {}),
  connections,
  ...(cards.length ? { cards } : {}),
});

const slides = [
  diagram(
    "01-despliegue-general",
    "Smartruck · vista de despliegue",
    [
      component("users", "external", "Usuarios", "dadores · transportistas · admins", [35, 300], [160, 96], [source(13, 17, "roles")], { icon: "person" }),
      component("portals", "frontend", "Portales web", "Dador · Transportista · Backoffice · Landing", [300, 300], [230, 100], [source(21, 28, "portales")], { tag: "Render", brand: "render" }),
      component("gateway", "cloud", "API Gateway", "entrada HTTPS pública", [640, 300], [220, 100], [source(38, 38, "entrada")], { brand: "google-cloud" }),
      component("backend", "backend", "smartruck-backend", "API · reglas de negocio", [980, 300], [240, 100], [source(42, 51, "núcleo")], { tag: "Cloud Run privado" }),
      component("geo", "cloud", "microservice-routes", "rutas · localidades", [640, 580], [230, 100], [source(33, 37, "servicio geográfico")], { tag: "Cloudflare Worker", brand: "cloudflare" }),
      component("data", "database", "Supabase", "Auth · PostgreSQL · Storage", [980, 580], [230, 100], [source(55, 57, "datos y archivos")], { brand: "supabase" }),
      component("payments", "external", "MercadoPago", "Checkout Pro · webhooks", [1320, 300], [220, 100], [source(58, 58, "proveedor"), source(110, 117, "pagos")]),
    ],
    [
      edge("users-portals", "users", "portals", "usa", "emphasis"),
      edge("portals-gateway", "portals", "gateway", "HTTPS · JWT", "security"),
      edge("gateway-backend", "gateway", "backend", "run.invoker", "emphasis"),
      edge("backend-geo", "backend", "geo", "cotización", "default", { fromSide: "bottom", toSide: "top" }),
      edge("backend-data", "backend", "data", "datos · archivos", "default", { fromSide: "bottom", toSide: "top" }),
      edge("geo-data", "geo", "data", "schema geo", "default"),
      edge("backend-payments", "backend", "payments", "pagos", "emphasis"),
    ],
    [
      { dot: "cyan", title: "Cuatro entornos de ejecución", items: ["Portales en Render", "API Gateway y backend privado en Google Cloud", "Worker geográfico en Cloudflare"] },
      { dot: "emerald", title: "Servicios conectados", items: ["Supabase para identidad, datos y archivos", "MercadoPago para Checkout Pro y notificaciones de pago"] },
    ],
  ),
  diagram(
    "02-portales-y-gateway",
    "Smartruck · portales y acceso a la API",
    [
      component("users", "external", "Usuarios", "dador · transportista · admin", [40, 320], [180, 100], [source(23, 26, "roles")], { icon: "person" }),
      component("portals", "frontend", "Portales web", "tres portales autenticados + landing", [320, 320], [240, 100], [source(21, 28, "portales")], { tag: "Render", brand: "render" }),
      component("auth", "security", "Supabase Auth", "sesión · JWT ES256", [320, 80], [230, 100], [source(55, 55, "identidad"), source(83, 88, "autorización")], { brand: "supabase" }),
      component("gateway", "cloud", "API Gateway", "entrada HTTPS pública", [680, 320], [220, 100], [source(38, 38, "entrada")], { brand: "google-cloud" }),
      component("backend", "backend", "smartruck-backend", "Cloud Run privado", [1040, 320], [240, 100], [source(42, 51, "núcleo")]),
    ],
    [
      edge("users-portals", "users", "portals", "usa", "emphasis"),
      edge("portal-auth", "portals", "auth", "inicia sesión", "security", { fromSide: "top", toSide: "bottom" }),
      edge("portal-gateway", "portals", "gateway", "HTTPS · JWT", "security"),
      edge("gateway-backend", "gateway", "backend", "invoca backend", "emphasis"),
    ],
    [
      { dot: "cyan", title: "Experiencias web", items: ["Dador publica cargas; Transportista busca y opera viajes.", "Backoffice administra usuarios y documentos; la landing es pública."] },
      { dot: "rose", title: "Límite de confianza", items: ["Los portales autenticados envían el JWT al backend.", "Backoffice requiere además el rol ADMIN."] },
    ],
  ),
  diagram(
    "03-ruteo-geografico",
    "Smartruck · el camino geográfico",
    [
      component("portals", "frontend", "Portales", "Dador · Transportista", [40, 320], [220, 100], [source(23, 24, "productos")], { tag: "Render", brand: "render" }),
      component("gateway", "cloud", "API Gateway", "puerta de entrada", [350, 320], [210, 100], [source(38, 38, "entrada")], { brand: "google-cloud" }),
      component("backend", "backend", "smartruck-backend", "cotiza la carga", [670, 320], [230, 100], [source(94, 98, "cotización y divergencia")]),
      component("geo", "cloud", "microservice-routes", "rutas · localidades · /geo/*", [670, 590], [250, 100], [source(33, 37, "servicio geográfico")], { tag: "Cloudflare Worker", brand: "cloudflare" }),
      component("geo-data", "database", "Supabase · geo", "rutas y localidades", [1030, 590], [230, 100], [source(56, 56, "schema geo")], { brand: "supabase" }),
      component("mapbox", "external", "Mapbox Directions", "fallback del Worker", [1030, 320], [230, 100], [source(35, 36, "fallback")]),
    ],
    [
      edge("portals-gateway", "portals", "gateway", "HTTPS · JWT", "security"),
      edge("gateway-backend", "gateway", "backend", "API", "emphasis"),
      edge("backend-geo", "backend", "geo", "cotizar · /geo/routes", "default", { fromSide: "bottom", toSide: "top" }),
      edge("geo-data", "geo", "geo-data", "PostgREST", "default"),
      edge("geo-mapbox", "geo", "mapbox", "Directions", "default", { fromSide: "right", toSide: "left" }),
    ],
    [
      { dot: "amber", title: "El Worker no recibe tráfico desde el portal en el código actual", items: ["El recorrido de cotización pasa por API Gateway y backend antes de llegar a microservice-routes.", "La publicación de cargas y GET /routes todavía conservan el cálculo local del backend."] },
      { dot: "emerald", title: "Fuentes del servicio geográfico", items: ["El Worker consulta el schema geo de Supabase.", "Mapbox Directions es fallback; las estimaciones se marcan y no se cachean."] },
    ],
  ),
  diagram(
    "04-backend-integraciones",
    "Smartruck · backend e integraciones",
    [
      component("gateway", "cloud", "API Gateway", "entrada pública", [40, 360], [210, 100], [source(38, 38, "entrada")], { brand: "google-cloud" }),
      component("backend", "backend", "smartruck-backend", "un servicio · cuatro áreas", [360, 360], [270, 110], [source(42, 51, "núcleo")], { tag: "Cloud Run privado" }),
      component("supabase", "database", "Supabase", "PostgreSQL · Storage", [800, 140], [240, 100], [source(56, 57, "datos y archivos")], { brand: "supabase" }),
      component("geo", "cloud", "microservice-routes", "cotizaciones · geografía", [800, 360], [250, 100], [source(33, 37, "servicio geográfico")], { tag: "Cloudflare Worker", brand: "cloudflare" }),
      component("mercadopago", "external", "MercadoPago", "Checkout Pro · pagos", [800, 610], [240, 100], [source(58, 58, "proveedor"), source(110, 117, "pagos")]),
    ],
    [
      edge("gateway-backend", "gateway", "backend", "HTTPS · run.invoker", "emphasis"),
      edge("backend-data", "backend", "supabase", "persistencia · archivos", "default", { fromSide: "top", toSide: "left" }),
      edge("backend-geo", "backend", "geo", "solo cotización", "default"),
      edge("backend-payments", "backend", "mercadopago", "Checkout · consulta", "emphasis", { fromSide: "bottom", toSide: "left" }),
    ],
    [
      { dot: "cyan", title: "Un despliegue, varias áreas", items: ["Identidad y perfiles · Cargas y cotizaciones", "Pagos y desbloqueo · Documentos y confianza"] },
      { dot: "amber", title: "La geografía sigue en transición", items: ["La cotización consume el Worker.", "La publicación y el endpoint legacy GET /routes mantienen el motor local."] },
    ],
  ),
  diagram(
    "05-pagos-mercadopago",
    "Smartruck · integración de pagos",
    [
      component("transporter", "external", "Transportista", "reserva una carga", [35, 340], [200, 100], [source(24, 24, "actor")], { icon: "person" }),
      component("portal", "frontend", "Portal transportista", "Checkout desde la app", [340, 340], [230, 100], [source(24, 24, "portal")], { tag: "Render", brand: "render" }),
      component("gateway", "cloud", "API Gateway", "HTTPS · JWT", [700, 340], [220, 100], [source(38, 38, "entrada")], { brand: "google-cloud" }),
      component("backend", "backend", "smartruck-backend", "crea · reconcilia · valida", [1050, 340], [250, 100], [source(110, 117, "flujo de pago")]),
      component("mercadopago", "external", "MercadoPago", "Checkout Pro · webhook", [1050, 80], [250, 100], [source(58, 58, "integración"), source(110, 117, "flujo de pago")]),
    ],
    [
      edge("transporter-portal", "transporter", "portal", "usa", "emphasis"),
      edge("portal-gateway", "portal", "gateway", "HTTPS · JWT", "security"),
      edge("gateway-backend", "gateway", "backend", "API", "emphasis"),
      edge("backend-provider", "backend", "mercadopago", "Checkout · consulta", "emphasis", { fromSide: "top", toSide: "bottom" }),
      edge("provider-webhook", "mercadopago", "backend", "notificación firmada", "security", { fromSide: "right", toSide: "right" }),
    ],
    [
      { dot: "rose", title: "El proveedor confirma el pago", items: ["MercadoPago notifica al backend por webhook.", "El backend vuelve a consultar y valida firma, referencia, importe y moneda antes de reservar la carga."] },
    ],
  ),
  diagram(
    "06-datos-y-archivos",
    "Smartruck · identidad, datos y archivos",
    [
      component("portals", "frontend", "Portales", "Dador · Transportista · Backoffice", [10, 330], [250, 100], [source(21, 28, "portales")], { tag: "Render", brand: "render" }),
      component("auth", "security", "Supabase Auth", "sesiones · JWT ES256", [360, 80], [230, 100], [source(55, 55, "identidad"), source(83, 88, "autorización")], { brand: "supabase" }),
      component("gateway", "cloud", "API Gateway", "entrada HTTPS pública", [360, 330], [230, 100], [source(38, 38, "entrada")], { brand: "google-cloud" }),
      component("backend", "backend", "smartruck-backend", "API · reglas de negocio", [700, 330], [240, 100], [source(42, 51, "núcleo")]),
      component("geo", "cloud", "microservice-routes", "lee el catálogo geográfico", [700, 600], [250, 100], [source(33, 37, "Worker y datos geo")], { tag: "Cloudflare Worker", brand: "cloudflare" }),
      component("supabase", "database", "Supabase", "PostgreSQL · schema geo · Storage", [1070, 450], [260, 110], [source(56, 57, "persistencia")], { brand: "supabase" }),
    ],
    [
      edge("portals-auth", "portals", "auth", "sesión", "security", { fromSide: "top", toSide: "bottom" }),
      edge("portals-gateway", "portals", "gateway", "API · HTTPS/JWT", "security", { fromSide: "right", toSide: "left" }),
      edge("gateway-backend", "gateway", "backend", "run.invoker", "emphasis"),
      edge("backend-supabase", "backend", "supabase", "PostgreSQL · URLs firmadas", "default"),
      edge("backend-geo", "backend", "geo", "cotización", "default", { fromSide: "bottom", toSide: "top" }),
      edge("geo-supabase", "geo", "supabase", "PostgREST · schema geo", "default", { fromSide: "right", toSide: "left" }),
    ],
    [
      { dot: "emerald", title: "Archivos privados", items: ["El backend firma las URLs de carga y lectura.", "El cliente sube el archivo directamente al bucket privado documents."] },
      { dot: "rose", title: "Auth y autorización", items: ["Los portales obtienen sesiones de Supabase Auth.", "El backend valida JWT; Backoffice exige rol ADMIN."] },
    ],
  ),
  diagram(
    "07-observabilidad",
    "Smartruck · observabilidad",
    [
      component("portals", "frontend", "Portales Render", "dador · transportista · backoffice", [40, 100], [250, 100], [source(13, 17, "portales")], { tag: "Render", brand: "render" }),
      component("render_logs", "cloud", "Render Log Stream", "logs de workspace", [410, 100], [250, 100], [source(65, 65, "logs de portales")]),
      component("backend", "backend", "smartruck-backend", "stdout JSON · correlation ID", [40, 500], [250, 100], [source(63, 64, "logs del backend")], { tag: "Cloud Run" }),
      component("cloud_logging", "cloud", "Cloud Logging", "recibe stdout de Cloud Run", [410, 500], [250, 100], [source(64, 64, "ingesta")], { brand: "google-cloud" }),
      component("pipeline", "messagebus", "Pub/Sub + Dataflow", "reenvío de logs", [800, 500], [270, 100], [source(64, 64, "pipeline")]),
      component("datadog", "external", "Datadog", "logs · us5", [1200, 300], [220, 100], [source(64, 65, "destino")]),
    ],
    [
      edge("portal-render-logs", "portals", "render_logs", "log stream", "dashed"),
      edge("render-datadog", "render_logs", "datadog", "workspace logs", "default"),
      edge("backend-cloud-logging", "backend", "cloud_logging", "stdout JSON", "dashed"),
      edge("logging-pipeline", "cloud_logging", "pipeline", "export", "default"),
      edge("pipeline-datadog", "pipeline", "datadog", "Dataflow · us5", "default"),
    ],
    [
      { dot: "cyan", title: "Dos fuentes operativas", items: ["Los portales envían logs desde Render.", "El backend emite JSON con correlation ID desde Cloud Run."] },
      { dot: "violet", title: "Pipeline del backend", items: ["Cloud Logging → Pub/Sub → Dataflow → Datadog us5.", "Datadog es observabilidad; no ejecuta lógica del producto."] },
    ],
  ),
];

for (const slide of slides) {
  const candidate = join(root, "slides", `${slide.meta.output.split("/").at(-1).replace(/\.html$/, "")}.json`);
  await mkdir(dirname(candidate), { recursive: true });
  await writeFile(candidate, `${JSON.stringify(slide, null, 2)}\n`, "utf8");
  console.log(candidate);
}
