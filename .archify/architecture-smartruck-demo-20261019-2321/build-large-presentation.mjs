import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = ".archify/architecture-smartruck-demo-20261019-2321";
const sourceDir = join(root, "large-source");
const outputDir = "src/arquitectura/diagrams/presentacion";
const renderer = "C:/Users/MARTNR~1/AppData/Local/Temp/opencode/smartruck-diagrams/render.mjs";

const colors = {
  ink: "#0B1220",
  body: "#34445B",
  muted: "#65748B",
  border: "#DDE5EF",
  white: "#FFFFFF",
  canvas: "#F8FAFC",
  violet: "#655CF6",
  cyan: "#079FE0",
  green: "#09A879",
  amber: "#E99A13",
  rose: "#E8428F",
  slate: "#526177",
  violetTint: "#F0EFFF",
  cyanTint: "#E8F7FD",
  greenTint: "#E8F8F1",
  amberTint: "#FFF5E5",
  roseTint: "#FDEBF3",
};

const escapeXml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
})[char]);

function openSvg(title, subtitle, number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(title)}</title>
<desc id="desc">${escapeXml(subtitle)}</desc>
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="${colors.slate}"/></marker>
  <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="#0B1220" flood-opacity="0.08"/></filter>
</defs>
<rect width="1600" height="900" fill="${colors.white}"/>
<text x="72" y="58" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="${colors.violet}">ARQUITECTURA · SMARTRUCK</text>
<text x="72" y="132" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="54" font-weight="750" fill="${colors.ink}">${escapeXml(title)}</text>
<text x="72" y="176" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="25" font-weight="400" fill="${colors.muted}">${escapeXml(subtitle)}</text>
<rect x="1450" y="42" width="86" height="42" rx="21" fill="#F1F5F9"/>
<text x="1493" y="69" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="17" font-weight="650" fill="${colors.body}">${String(number).padStart(2, "0")}</text>
`;
}

function card({ x, y, w, h, accent, title, subtitle, tag, fill = colors.white, titleSize = 36, subtitleSize = 21 }) {
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="${fill}" stroke="${accent}" stroke-width="4" filter="url(#shadow)"/>`;
  out += `<rect x="${x}" y="${y + 20}" width="10" height="${h - 40}" rx="5" fill="${accent}"/>`;
  const titleY = subtitle ? y + h / 2 - 10 : y + h / 2 + titleSize * 0.34;
  out += `<text x="${x + w / 2}" y="${titleY}" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="${titleSize}" font-weight="750" fill="${colors.ink}">${escapeXml(title)}</text>`;
  if (subtitle) {
    out += `<text x="${x + w / 2}" y="${titleY + 40}" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="${subtitleSize}" font-weight="450" fill="${colors.muted}">${escapeXml(subtitle)}</text>`;
  }
  if (tag) {
    const tw = Math.max(86, tag.length * 10 + 28);
    out += `<rect x="${x + w - tw - 16}" y="${y + 14}" width="${tw}" height="32" rx="16" fill="${accent}" fill-opacity="0.12"/>`;
    out += `<text x="${x + w - tw / 2 - 16}" y="${y + 36}" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="15" font-weight="700" fill="${accent}">${escapeXml(tag)}</text>`;
  }
  return out;
}

function moduleCard({ x, y, w, h, accent, title, subtitle }) {
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${colors.canvas}" stroke="${colors.border}" stroke-width="2"/>`;
  out += `<rect x="${x}" y="${y + 16}" width="7" height="${h - 32}" rx="3.5" fill="${accent}"/>`;
  out += `<text x="${x + w / 2}" y="${y + h / 2 - 6}" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="27" font-weight="700" fill="${colors.ink}">${escapeXml(title)}</text>`;
  out += `<text x="${x + w / 2}" y="${y + h / 2 + 28}" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" fill="${colors.muted}">${escapeXml(subtitle)}</text>`;
  return out;
}

function arrow(x1, y1, x2, y2, label, { color = colors.slate, dashed = false, labelX, labelY } = {}) {
  const dash = dashed ? ' stroke-dasharray="10 8"' : "";
  let out = `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" marker-end="url(#arrow)"${dash}/>`;
  if (label) {
    const width = Math.max(70, label.length * 11 + 30);
    const cx = labelX ?? (x1 + x2) / 2;
    const cy = labelY ?? (y1 + y2) / 2 - 22;
    out += `<rect x="${cx - width / 2}" y="${cy - 18}" width="${width}" height="36" rx="18" fill="${colors.white}" stroke="${colors.border}" stroke-width="1.5"/>`;
    out += `<text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="19" font-weight="650" fill="${colors.body}">${escapeXml(label)}</text>`;
  }
  return out;
}

function routedArrow(d, label, { color = colors.slate, dashed = false, labelX, labelY } = {}) {
  const dash = dashed ? ' stroke-dasharray="10 8"' : "";
  let out = `<path d="${d}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrow)"${dash}/>`;
  if (label) {
    const width = Math.max(70, label.length * 11 + 30);
    out += `<rect x="${labelX - width / 2}" y="${labelY - 18}" width="${width}" height="36" rx="18" fill="${colors.white}" stroke="${colors.border}" stroke-width="1.5"/>`;
    out += `<text x="${labelX}" y="${labelY + 7}" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="19" font-weight="650" fill="${colors.body}">${escapeXml(label)}</text>`;
  }
  return out;
}

function note(x, y, w, title, body, accent = colors.violet) {
  let out = `<rect x="${x}" y="${y}" width="${w}" height="82" rx="18" fill="#F8FAFC" stroke="${colors.border}" stroke-width="2"/>`;
  out += `<rect x="${x}" y="${y + 17}" width="7" height="48" rx="3.5" fill="${accent}"/>`;
  out += `<text x="${x + 24}" y="${y + 31}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="18" font-weight="750" fill="${colors.ink}">${escapeXml(title)}</text>`;
  out += `<text x="${x + 24}" y="${y + 59}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="17" font-weight="450" fill="${colors.muted}">${escapeXml(body)}</text>`;
  return out;
}

const slides = [];

{
  let s = openSvg("¿Dónde vive cada servicio?", "Despliegue por plataforma: del portal a las integraciones.", 1);
  s += arrow(300, 405, 365, 405, "usa", { labelY: 285 });
  s += arrow(700, 405, 785, 405, "HTTPS · JWT", { color: colors.rose, dashed: true, labelY: 285 });
  s += arrow(1085, 405, 1165, 405, "run.invoker", { color: colors.green, labelY: 285 });
  s += arrow(1360, 510, 455, 625, "cotización", { labelX: 830, labelY: 560, color: colors.amber });
  s += arrow(1360, 510, 860, 625, "datos · archivos", { labelX: 1120, labelY: 560, color: colors.violet });
  s += arrow(1360, 510, 1270, 625, "pagos", { labelX: 1325, labelY: 560, color: colors.rose });
  s += card({ x: 50, y: 320, w: 250, h: 170, accent: colors.slate, title: "Usuarios", subtitle: "Dadores · transportistas", titleSize: 38, subtitleSize: 20 });
  s += card({ x: 365, y: 320, w: 335, h: 170, accent: colors.violet, title: "Portales web", subtitle: "Dador · Transportista · Backoffice · Landing", tag: "Render", titleSize: 38, subtitleSize: 18 });
  s += card({ x: 785, y: 320, w: 300, h: 170, accent: colors.cyan, title: "API Gateway", subtitle: "entrada HTTPS pública", tag: "GCP", titleSize: 38, subtitleSize: 21 });
  s += card({ x: 1165, y: 320, w: 380, h: 190, accent: colors.green, title: "smartruck-backend", subtitle: "reglas de negocio · transacciones", tag: "Cloud Run", titleSize: 35, subtitleSize: 20 });
  s += card({ x: 285, y: 625, w: 340, h: 170, accent: colors.amber, title: "microservice-routes", subtitle: "rutas · localidades", tag: "Cloudflare", titleSize: 32, subtitleSize: 22 });
  s += card({ x: 690, y: 625, w: 340, h: 170, accent: colors.violet, title: "Supabase", subtitle: "Auth · PostgreSQL · Storage", titleSize: 40, subtitleSize: 22 });
  s += card({ x: 1100, y: 625, w: 340, h: 170, accent: colors.rose, title: "MercadoPago", subtitle: "Checkout Pro · webhooks", titleSize: 36, subtitleSize: 22 });
  slides.push(["01-despliegue-general", s]);
}

{
  let s = openSvg("Portales y acceso a la API", "Autenticación en Supabase; API de negocio detrás del Gateway.", 2);
  s += arrow(290, 435, 360, 435, "usa", { labelY: 290 });
  s += arrow(710, 435, 800, 435, "HTTPS · JWT", { color: colors.rose, dashed: true, labelY: 290 });
  s += arrow(1100, 435, 1180, 435, "invoca", { color: colors.green, labelY: 290 });
  s += routedArrow("M 535 520 L 535 600", "inicio de sesión", { color: colors.rose, dashed: true, labelX: 650, labelY: 560 });
  s += card({ x: 40, y: 350, w: 250, h: 170, accent: colors.slate, title: "Usuarios", subtitle: "Dador · Transportista", titleSize: 38, subtitleSize: 21 });
  s += card({ x: 360, y: 350, w: 350, h: 170, accent: colors.violet, title: "Portales web", subtitle: "3 apps autenticadas + landing", tag: "Render", titleSize: 40, subtitleSize: 21 });
  s += card({ x: 360, y: 600, w: 350, h: 170, accent: colors.rose, title: "Supabase Auth", subtitle: "sesión · JWT ES256", titleSize: 38, subtitleSize: 23 });
  s += card({ x: 800, y: 350, w: 300, h: 170, accent: colors.cyan, title: "API Gateway", subtitle: "HTTPS público", tag: "GCP", titleSize: 38, subtitleSize: 22 });
  s += card({ x: 1180, y: 350, w: 360, h: 170, accent: colors.green, title: "Backend", subtitle: "Cloud Run privado", titleSize: 42, subtitleSize: 23 });
  s += note(780, 650, 760, "Límite de confianza", "Backoffice requiere además el rol ADMIN.", colors.rose);
  slides.push(["02-portales-y-gateway", s]);
}

{
  let s = openSvg("El camino geográfico", "La cotización llega al Worker a través del backend.", 3);
  s += arrow(350, 390, 410, 390, "HTTPS · JWT", { color: colors.rose, dashed: true, labelY: 260 });
  s += arrow(700, 390, 760, 390, "API", { color: colors.green, labelY: 260 });
  s += arrow(1080, 390, 1150, 390, "cotización", { color: colors.amber, labelY: 260 });
  s += routedArrow("M 1325 490 L 1325 555 L 955 555 L 955 620", "schema geo", { labelX: 1110, labelY: 550, color: colors.violet });
  s += routedArrow("M 1325 490 L 1325 620", "Directions · fallback", { labelX: 1325, labelY: 575, color: colors.slate });
  s += card({ x: 50, y: 310, w: 300, h: 180, accent: colors.violet, title: "Portales", subtitle: "Dador · Transportista", tag: "Render", titleSize: 40, subtitleSize: 22 });
  s += card({ x: 410, y: 310, w: 290, h: 180, accent: colors.cyan, title: "API Gateway", subtitle: "puerta de entrada", tag: "GCP", titleSize: 38, subtitleSize: 22 });
  s += card({ x: 760, y: 310, w: 320, h: 180, accent: colors.green, title: "smartruck-backend", subtitle: "calcula la cotización", titleSize: 34, subtitleSize: 22 });
  s += card({ x: 1150, y: 310, w: 350, h: 180, accent: colors.amber, title: "microservice-routes", subtitle: "rutas · localidades", tag: "Cloudflare", titleSize: 32, subtitleSize: 22 });
  s += card({ x: 760, y: 620, w: 390, h: 170, accent: colors.violet, title: "Supabase · geo", subtitle: "catálogo de rutas", titleSize: 38, subtitleSize: 22 });
  s += card({ x: 1190, y: 620, w: 350, h: 170, accent: colors.slate, title: "Mapbox Directions", subtitle: "proveedor de fallback", titleSize: 32, subtitleSize: 21 });
  s += note(90, 690, 560, "Estado actual", "Publicación y GET /routes conservan el motor local.", colors.amber);
  slides.push(["03-ruteo-geografico", s]);
}

{
  let s = openSvg("El backend y sus integraciones", "Un solo servicio: cuatro áreas de negocio y proveedores externos.", 4);
  s += arrow(315, 475, 380, 475, null, { color: colors.green });
  s += routedArrow("M 1080 425 L 1160 300", null, { labelX: 1120, labelY: 350, color: colors.violet });
  s += arrow(1080, 475, 1160, 475, null, { color: colors.amber });
  s += routedArrow("M 1080 525 L 1160 650", null, { labelX: 1120, labelY: 610, color: colors.rose });
  s += card({ x: 50, y: 390, w: 265, h: 170, accent: colors.cyan, title: "API Gateway", subtitle: "entrada pública", tag: "GCP", titleSize: 36, subtitleSize: 21 });
  s += `<rect x="380" y="230" width="700" height="490" rx="30" fill="${colors.white}" stroke="${colors.green}" stroke-width="5" filter="url(#shadow)"/>`;
  s += `<text x="730" y="290" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="40" font-weight="750" fill="${colors.ink}">smartruck-backend</text>`;
  s += `<text x="730" y="328" text-anchor="middle" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="22" fill="${colors.muted}">un único servicio · Cloud Run privado</text>`;
  s += moduleCard({ x: 420, y: 370, w: 300, h: 130, accent: colors.violet, title: "Identidad y perfiles", subtitle: "usuarios · roles · sesiones" });
  s += moduleCard({ x: 750, y: 370, w: 300, h: 130, accent: colors.cyan, title: "Cargas y cotizaciones", subtitle: "publicar · cotizar · buscar" });
  s += moduleCard({ x: 420, y: 530, w: 300, h: 130, accent: colors.rose, title: "Pagos y desbloqueo", subtitle: "Checkout · reserva" });
  s += moduleCard({ x: 750, y: 530, w: 300, h: 130, accent: colors.green, title: "Documentos y confianza", subtitle: "archivos · verificación" });
  s += card({ x: 1160, y: 230, w: 370, h: 140, accent: colors.violet, title: "Supabase", subtitle: "PostgreSQL · Storage", titleSize: 36, subtitleSize: 22 });
  s += card({ x: 1160, y: 405, w: 370, h: 140, accent: colors.amber, title: "microservice-routes", subtitle: "solo cotización usa el Worker", titleSize: 31, subtitleSize: 19 });
  s += card({ x: 1160, y: 580, w: 370, h: 140, accent: colors.rose, title: "MercadoPago", subtitle: "Checkout Pro · webhook", titleSize: 36, subtitleSize: 22 });
  slides.push(["04-backend-integraciones", s]);
}

{
  let s = openSvg("Pago con MercadoPago", "El backend crea el Checkout y valida la notificación del proveedor.", 5);
  s += arrow(295, 420, 350, 420, "usa", { labelY: 285 });
  s += arrow(610, 420, 660, 420, "HTTPS · JWT", { color: colors.rose, dashed: true, labelY: 285 });
  s += arrow(920, 420, 970, 420, "API", { color: colors.green, labelY: 285 });
  s += arrow(1230, 420, 1280, 420, "Checkout", { color: colors.rose, labelY: 285 });
  s += routedArrow("M 1405 520 L 1405 670 L 1095 670 L 1095 520", "webhook firmado", { labelX: 1250, labelY: 650, color: colors.rose, dashed: true });
  s += card({ x: 35, y: 330, w: 260, h: 180, accent: colors.slate, title: "Transportista", subtitle: "reserva una carga", titleSize: 35, subtitleSize: 22 });
  s += card({ x: 350, y: 330, w: 260, h: 180, accent: colors.violet, title: "Portal", subtitle: "inicia Checkout", tag: "Render", titleSize: 40, subtitleSize: 22 });
  s += card({ x: 660, y: 330, w: 260, h: 180, accent: colors.cyan, title: "API Gateway", subtitle: "HTTPS público", tag: "GCP", titleSize: 35, subtitleSize: 22 });
  s += card({ x: 970, y: 330, w: 260, h: 190, accent: colors.green, title: "smartruck-backend", subtitle: "crea · reconcilia · valida", titleSize: 31, subtitleSize: 20 });
  s += card({ x: 1280, y: 330, w: 260, h: 180, accent: colors.rose, title: "MercadoPago", subtitle: "Checkout Pro", titleSize: 34, subtitleSize: 22 });
  s += note(310, 740, 980, "Antes de reservar", "El backend revalida firma, referencia externa, importe y moneda.", colors.rose);
  slides.push(["05-pagos-mercadopago", s]);
}

{
  let s = openSvg("Identidad, datos y archivos", "Cada responsabilidad llega a la parte correcta de Supabase.", 6);
  s += routedArrow("M 210 530 L 210 600", "sesión", { labelX: 300, labelY: 565, color: colors.rose, dashed: true });
  s += arrow(350, 445, 400, 445, "API · HTTPS/JWT", { color: colors.rose, dashed: true, labelY: 315 });
  s += arrow(720, 445, 790, 445, "run.invoker", { color: colors.green, labelY: 315 });
  s += arrow(1110, 445, 1190, 445, "datos · archivos", { color: colors.violet, labelY: 315 });
  s += routedArrow("M 950 540 L 950 600", "cotización", { color: colors.amber, labelX: 950, labelY: 570 });
  s += routedArrow("M 1110 675 L 1150 675 L 1150 485 L 1190 485", null, { color: colors.slate });
  s += card({ x: 70, y: 360, w: 280, h: 170, accent: colors.violet, title: "Portales", subtitle: "Dador · Transportista · Backoffice", tag: "Render", titleSize: 38, subtitleSize: 18 });
  s += card({ x: 70, y: 600, w: 280, h: 150, accent: colors.rose, title: "Supabase Auth", subtitle: "sesiones · JWT ES256", titleSize: 34, subtitleSize: 21 });
  s += card({ x: 400, y: 360, w: 320, h: 170, accent: colors.cyan, title: "API Gateway", subtitle: "entrada pública", tag: "GCP", titleSize: 38, subtitleSize: 22 });
  s += card({ x: 790, y: 360, w: 320, h: 180, accent: colors.green, title: "smartruck-backend", subtitle: "consulta negocio · archivos", titleSize: 32, subtitleSize: 20 });
  s += card({ x: 790, y: 600, w: 320, h: 150, accent: colors.amber, title: "microservice-routes", subtitle: "consulta schema geo", tag: "Cloudflare", titleSize: 30, subtitleSize: 20 });
  s += card({ x: 1190, y: 360, w: 350, h: 190, accent: colors.violet, title: "Supabase", subtitle: "PostgreSQL · schema geo · Storage", titleSize: 38, subtitleSize: 19 });
  slides.push(["06-datos-y-archivos", s]);
}

{
  let s = openSvg("Observabilidad", "Logs de Render y Cloud Run convergen en Datadog.", 7);
  s += arrow(360, 330, 430, 330, "log stream", { color: colors.violet, dashed: true, labelY: 205 });
  s += routedArrow("M 750 330 L 1000 330 L 1000 485 L 1190 485", "workspace logs", { labelX: 1010, labelY: 430, color: colors.slate });
  s += arrow(360, 650, 430, 650, "stdout JSON", { color: colors.violet, dashed: true, labelY: 525 });
  s += arrow(750, 650, 810, 650, "export", { color: colors.slate, labelY: 525 });
  s += routedArrow("M 1100 650 L 1150 650 L 1150 510 L 1190 510", null, { labelX: 1150, labelY: 590, color: colors.slate });
  s += card({ x: 60, y: 250, w: 300, h: 160, accent: colors.violet, title: "Portales Render", subtitle: "logs de aplicaciones", tag: "Render", titleSize: 34, subtitleSize: 22 });
  s += card({ x: 430, y: 250, w: 320, h: 160, accent: colors.amber, title: "Render Log Stream", subtitle: "logs del workspace", titleSize: 32, subtitleSize: 22 });
  s += card({ x: 60, y: 570, w: 300, h: 160, accent: colors.green, title: "smartruck-backend", subtitle: "JSON · correlation ID", tag: "Cloud Run", titleSize: 31, subtitleSize: 21 });
  s += card({ x: 430, y: 570, w: 320, h: 160, accent: colors.cyan, title: "Cloud Logging", subtitle: "ingesta de stdout", tag: "GCP", titleSize: 35, subtitleSize: 22 });
  s += card({ x: 810, y: 570, w: 290, h: 160, accent: colors.rose, title: "Pub/Sub + Dataflow", subtitle: "pipeline de reenvío", titleSize: 29, subtitleSize: 21 });
  s += card({ x: 1190, y: 390, w: 350, h: 190, accent: colors.slate, title: "Datadog", subtitle: "Logs · us5", titleSize: 42, subtitleSize: 24 });
  slides.push(["07-observabilidad", s]);
}

await mkdir(sourceDir, { recursive: true });
await mkdir(outputDir, { recursive: true });

for (const [slug, body] of slides) {
  const svgPath = join(sourceDir, `${slug}.svg`);
  const outputPath = join(outputDir, `${slug}.png`);
  const svg = `${body}<text x="1528" y="858" text-anchor="end" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="16" font-weight="600" fill="${colors.muted}">Implementado · 2026</text></svg>\n`;
  await writeFile(svgPath, svg, "utf8");
  execFileSync("node", [renderer, svgPath, outputPath, "3200"], { stdio: "inherit" });
}
