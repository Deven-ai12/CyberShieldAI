import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const userHome = process.env.USERPROFILE || process.env.HOME || "C:\\Users\\hp";
process.env.HOME = userHome;
const skillScripts = path.join(
  userHome,
  ".codex",
  "plugins",
  "cache",
  "openai-primary-runtime",
  "presentations",
  "26.513.11550",
  "skills",
  "presentations",
  "scripts",
);

const artifactUtilsPath = path.join(skillScripts, "artifact_tool_utils.mjs");
const { ensureArtifactToolWorkspace, importArtifactTool, createSlideContext, saveBlobToFile } = await import(
  pathToFileURL(artifactUtilsPath).href
);

const slideSize = { width: 1280, height: 720 };
const workspace = path.join(projectRoot, "outputs", "securetrace-hackathon-pitch");
const previewDir = path.join(workspace, "preview");
const layoutDir = path.join(workspace, "layout");
const outputPptx = path.join(projectRoot, "SecureTrace_Hackathon_Winning_Pitch.pptx");

const C = {
  bg: "#020617",
  bg2: "#07111F",
  panel: "#0B1628",
  panel2: "#101D33",
  cyan: "#22D3EE",
  blue: "#2563EB",
  red: "#FB3856",
  amber: "#F59E0B",
  green: "#22C55E",
  purple: "#8B5CF6",
  muted: "#8EA3B8",
  soft: "#D7E7F5",
  white: "#F8FBFF",
  line: "#16324A",
};

function addShape(ctx, slide, x, y, w, h, fill = C.panel, line = ctx.line(C.line, 1), geometry = "rect") {
  return ctx.addShape(slide, { x, y, width: w, height: h, fill, line, geometry });
}

function addText(ctx, slide, text, x, y, w, h, opts = {}) {
  return ctx.addText(slide, {
    text,
    x,
    y,
    width: w,
    height: h,
    fontSize: opts.size ?? 28,
    color: opts.color ?? C.soft,
    bold: opts.bold ?? false,
    typeface: opts.face ?? (opts.title ? ctx.fonts.title : ctx.fonts.body),
    align: opts.align ?? "left",
    valign: opts.valign ?? "top",
    fill: opts.fill ?? "#00000000",
    line: opts.line ?? ctx.line("#00000000", 0),
    insets: opts.insets ?? { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

function addRule(ctx, slide, x, y, w, h = 2, color = C.cyan) {
  return addShape(ctx, slide, x, y, w, h, color, ctx.line(color, 0));
}

function addPanel(ctx, slide, x, y, w, h, accent = C.cyan, fill = C.panel) {
  addShape(ctx, slide, x - 2, y - 2, w + 4, h + 4, "#06101D", ctx.line(accent, 1));
  addShape(ctx, slide, x, y, w, h, fill, ctx.line("#244763", 1));
  addRule(ctx, slide, x, y, w, 2, accent);
}

function addChip(ctx, slide, text, x, y, w, color = C.cyan) {
  addShape(ctx, slide, x, y, w, 32, "#071827", ctx.line(color, 1));
  addText(ctx, slide, text, x + 12, y + 7, w - 24, 20, { size: 14, color, bold: true, align: "center" });
}

function addMetric(ctx, slide, label, value, x, y, w, accent = C.cyan, note = "") {
  addPanel(ctx, slide, x, y, w, 116, accent, "#071527");
  addText(ctx, slide, value, x + 18, y + 18, w - 36, 42, { size: 36, color: C.white, bold: true, title: true });
  addText(ctx, slide, label, x + 18, y + 66, w - 36, 24, { size: 15, color: C.muted, bold: true });
  if (note) addText(ctx, slide, note, x + 18, y + 90, w - 36, 18, { size: 12, color: accent });
}

function addFooter(ctx, slide, n, section = "SECURETRACE") {
  addText(ctx, slide, section, 48, 674, 420, 24, { size: 12, color: C.muted, bold: true });
  addText(ctx, slide, String(n).padStart(2, "0"), 1182, 674, 50, 24, { size: 12, color: C.muted, bold: true, align: "right" });
}

function addBackground(ctx, slide, n, section) {
  addShape(ctx, slide, 0, 0, slideSize.width, slideSize.height, C.bg, ctx.line(C.bg, 0));
  addShape(ctx, slide, 0, 0, slideSize.width, slideSize.height, "#041021", ctx.line("#041021", 0));
  for (let x = 0; x <= slideSize.width; x += 80) {
    addShape(ctx, slide, x, 0, 1, slideSize.height, x % 240 === 0 ? "#102B44" : "#081D31", ctx.line("#00000000", 0));
  }
  for (let y = 0; y <= slideSize.height; y += 80) {
    addShape(ctx, slide, 0, y, slideSize.width, 1, y % 240 === 0 ? "#102B44" : "#081D31", ctx.line("#00000000", 0));
  }
  addShape(ctx, slide, 930, -100, 470, 470, "#081A30", ctx.line(C.blue, 2), "ellipse");
  addShape(ctx, slide, 990, -42, 350, 350, "#061222", ctx.line(C.cyan, 1), "ellipse");
  addRule(ctx, slide, 48, 54, 62, 3, C.cyan);
  addFooter(ctx, slide, n, section);
}

function addTitle(ctx, slide, eyebrow, title, subtitle, n, section = "PITCH") {
  addBackground(ctx, slide, n, section);
  addText(ctx, slide, eyebrow.toUpperCase(), 48, 78, 560, 26, { size: 14, color: C.cyan, bold: true });
  addText(ctx, slide, title, 48, 116, 760, 114, { size: 42, color: C.white, bold: true, title: true });
  addText(ctx, slide, subtitle, 50, 250, 720, 62, { size: 21, color: C.muted });
}

function addBullets(ctx, slide, items, x, y, w, options = {}) {
  items.forEach((item, index) => {
    const top = y + index * (options.gap ?? 54);
    addShape(ctx, slide, x, top + 7, 10, 10, options.dot ?? C.cyan, ctx.line(options.dot ?? C.cyan, 0), "ellipse");
    addText(ctx, slide, item, x + 24, top, w - 24, options.lineHeight ?? 40, {
      size: options.size ?? 20,
      color: options.color ?? C.soft,
      bold: options.bold ?? false,
    });
  });
}

function addMiniChart(ctx, slide, x, y, w, h, values, color = C.cyan, dangerAt = 0) {
  addShape(ctx, slide, x, y, w, h, "#071527", ctx.line("#1B3B55", 1));
  const max = Math.max(...values, 1);
  const step = w / values.length;
  values.forEach((value, i) => {
    const barH = Math.max(6, (value / max) * (h - 28));
    const barColor = dangerAt && i >= dangerAt ? C.red : color;
    addShape(ctx, slide, x + 12 + i * step, y + h - barH - 12, Math.max(8, step - 12), barH, barColor, ctx.line(barColor, 0));
  });
}

function addRiskGauge(ctx, slide, x, y, score, label, accent = C.red) {
  addShape(ctx, slide, x, y, 168, 168, "#071527", ctx.line("#1B3B55", 1), "ellipse");
  addShape(ctx, slide, x + 18, y + 18, 132, 132, "#020617", ctx.line(accent, 8), "ellipse");
  addShape(ctx, slide, x + 45, y + 45, 78, 78, "#071827", ctx.line("#1B3B55", 1), "ellipse");
  addText(ctx, slide, String(score), x + 45, y + 58, 78, 46, { size: 36, color: C.white, bold: true, align: "center", title: true });
  addText(ctx, slide, label, x + 24, y + 112, 120, 24, { size: 14, color: accent, bold: true, align: "center" });
}

function addArchitectureBox(ctx, slide, title, body, x, y, w, h, color, icon = "") {
  addPanel(ctx, slide, x, y, w, h, color, "#071527");
  if (icon) addText(ctx, slide, icon, x + 14, y + 16, 32, 28, { size: 22, color, bold: true, align: "center" });
  addText(ctx, slide, title, x + 54, y + 16, w - 72, 26, { size: 19, color: C.white, bold: true });
  addText(ctx, slide, body, x + 20, y + 54, w - 40, h - 66, { size: 14, color: C.muted });
}

function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  addBackground(ctx, slide, 1, "HACKATHON FINAL");
  addChip(ctx, slide, "AI + CYBERSECURITY + FINTECH", 48, 72, 238, C.cyan);
  addText(ctx, slide, "SecureTrace", 48, 128, 650, 70, { size: 58, color: C.white, bold: true, title: true });
  addText(ctx, slide, "Real-Time Fraud Detection and Session Hijacking Prevention", 52, 206, 690, 78, {
    size: 28,
    color: C.soft,
    bold: true,
  });
  addText(ctx, slide, "A production-grade full-stack platform that continuously verifies user behavior, device trust, transaction context, and session integrity for banks and fintech apps.", 54, 302, 710, 88, { size: 20, color: C.muted });
  addMetric(ctx, slide, "Signal refresh", "2 sec", 54, 424, 188, C.cyan, "behavior telemetry");
  addMetric(ctx, slide, "Risk engine", "0-100", 266, 424, 188, C.red, "LOW to CRITICAL");
  addMetric(ctx, slide, "Defense modes", "4", 478, 424, 188, C.green, "detect, alert, step-up, block");
  addPanel(ctx, slide, 830, 124, 330, 330, C.cyan, "#051120");
  addShape(ctx, slide, 904, 184, 182, 182, "#061A2E", ctx.line(C.cyan, 3), "ellipse");
  addShape(ctx, slide, 952, 232, 86, 86, "#020617", ctx.line(C.red, 5), "ellipse");
  addRule(ctx, slide, 992, 152, 2, 246, C.cyan);
  addRule(ctx, slide, 870, 274, 246, 2, C.red);
  addText(ctx, slide, "LIVE TRUST\nENGINE", 910, 385, 170, 48, { size: 18, color: C.white, bold: true, align: "center" });
  return slide;
}

function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "The problem", "Banks secure login. Attackers exploit the session after login.", "Most fraud controls ask: was the password correct? SecureTrace asks the harder question every few seconds: does this session still behave like the real customer?", 2, "PROBLEM");
  addPanel(ctx, slide, 54, 360, 340, 200, C.red, "#0B1425");
  addText(ctx, slide, "Classic fraud blind spots", 78, 386, 260, 28, { size: 22, color: C.white, bold: true });
  addBullets(ctx, slide, ["Session cookie theft", "Remote access takeover", "Credential stuffing", "Copy-paste money mule fraud"], 80, 432, 270, { gap: 31, size: 16, dot: C.red, lineHeight: 24 });
  addPanel(ctx, slide, 470, 360, 340, 200, C.amber, "#0B1425");
  addText(ctx, slide, "Why it is hard", 494, 386, 260, 28, { size: 22, color: C.white, bold: true });
  addBullets(ctx, slide, ["The attacker may know the password", "The device may look legitimate", "Fraud often happens in seconds", "Manual review arrives too late"], 496, 432, 270, { gap: 31, size: 16, dot: C.amber, lineHeight: 24 });
  addPanel(ctx, slide, 886, 360, 290, 200, C.cyan, "#0B1425");
  addText(ctx, slide, "Hackathon wedge", 910, 386, 230, 28, { size: 22, color: C.white, bold: true });
  addText(ctx, slide, "Turn invisible behavior into a live security signal that can stop fraud before the transfer is completed.", 910, 432, 222, 90, { size: 18, color: C.soft });
  return slide;
}

function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "Core insight", "Identity is not a one-time login. It is a live behavioral pattern.", "SecureTrace builds a continuously updated trust profile from micro-signals that are hard to perfectly fake together.", 3, "INSIGHT");
  const cols = [
    ["Keystroke rhythm", "typing speed, pauses, key intervals", C.cyan],
    ["Pointer behavior", "mouse path, speed, drift, hesitation", C.green],
    ["Interaction intent", "click frequency, rage clicks, tab switches", C.amber],
    ["Transaction context", "amount, beneficiary, device, time, history", C.red],
  ];
  cols.forEach(([title, body, color], i) => {
    const x = 60 + i * 300;
    addPanel(ctx, slide, x, 358, 250, 168, color, "#071527");
    addText(ctx, slide, title, x + 20, 386, 200, 28, { size: 21, color: C.white, bold: true });
    addText(ctx, slide, body, x + 20, 432, 198, 56, { size: 16, color: C.muted });
    addRule(ctx, slide, x + 20, 502, 86, 5, color);
  });
  addText(ctx, slide, "Each signal alone is weak. Together they form a live confidence score.", 222, 574, 820, 38, { size: 24, color: C.white, bold: true, align: "center" });
  return slide;
}

function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "The solution", "Continuous Trust Engine for fintech sessions", "React captures real-time behavior. Spring Boot computes risk, learns trusted patterns, and pushes alerts instantly to the SOC dashboard.", 4, "SOLUTION");
  addArchitectureBox(ctx, slide, "React sensors", "typing, mouse, clicks, copy-paste, autofill, tab switches, inactivity", 58, 350, 250, 150, C.cyan, "01");
  addArchitectureBox(ctx, slide, "Behavior API", "POST /api/behavior/track every 2 seconds with JWT and device fingerprint", 356, 350, 250, 150, C.blue, "02");
  addArchitectureBox(ctx, slide, "Risk engine", "scores LOW, MEDIUM, HIGH, CRITICAL using behavior and transaction context", 654, 350, 250, 150, C.red, "03");
  addArchitectureBox(ctx, slide, "Action layer", "WebSocket alerts, email alerts, step-up challenge, blocked transfer", 952, 350, 250, 150, C.green, "04");
  [318, 616, 914].forEach((x) => {
    addRule(ctx, slide, x, 420, 30, 3, C.cyan);
    addShape(ctx, slide, x + 30, 414, 14, 14, C.cyan, ctx.line(C.cyan, 0));
  });
  addText(ctx, slide, "Compatible with your generated React frontend and Spring Boot backend", 226, 562, 820, 34, { size: 22, color: C.soft, bold: true, align: "center" });
  return slide;
}

function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "Uniqueness", "Not a CRUD app. A live cyber defense product with banking context.", "The demo is built around real-time telemetry, risk scoring, session intelligence, and a SOC experience that feels credible to fintech reviewers.", 5, "DIFFERENTIATION");
  const features = [
    ["Behavioral biometrics", "Tracks micro-behavior while the user interacts, not only at login.", C.cyan],
    ["Adaptive trust profile", "Learns normal transfer size, device trust, and trusted beneficiaries.", C.green],
    ["Attack simulation center", "Jury can trigger hijack, bot, autofill, credential stuffing, rapid transfer.", C.red],
    ["SOC-ready dashboard", "Threat feed, attack logs, severity cards, session table, live alerts.", C.purple],
    ["Backend reality", "JWT, RBAC, MySQL entities, JPA repositories, WebSocket, mail alerts.", C.blue],
    ["Actionable prevention", "Risk can trigger step-up or block the transaction before money moves.", C.amber],
  ];
  features.forEach(([title, body, color], i) => {
    const x = 58 + (i % 3) * 392;
    const y = 338 + Math.floor(i / 3) * 138;
    addPanel(ctx, slide, x, y, 340, 104, color, "#071527");
    addText(ctx, slide, title, x + 18, y + 18, 280, 24, { size: 19, color: C.white, bold: true });
    addText(ctx, slide, body, x + 18, y + 52, 290, 36, { size: 14, color: C.muted });
  });
  return slide;
}

function slide06(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "How abnormal behavior is detected", "The system compares live signals with learned normal patterns.", "Example: a customer usually types carefully, moves the mouse with pauses, and transfers to known beneficiaries. A fraud session suddenly looks different across multiple signals.", 6, "RISK EXAMPLE");
  addPanel(ctx, slide, 70, 346, 490, 220, C.green, "#071527");
  addText(ctx, slide, "Known customer pattern", 96, 374, 340, 26, { size: 23, color: C.white, bold: true });
  addMiniChart(ctx, slide, 96, 424, 410, 94, [26, 31, 29, 35, 32, 30, 34, 28, 33], C.green);
  addText(ctx, slide, "steady rhythm, familiar device, known beneficiary", 96, 528, 410, 24, { size: 15, color: C.muted });
  addPanel(ctx, slide, 720, 346, 490, 220, C.red, "#071527");
  addText(ctx, slide, "Suspicious live session", 746, 374, 340, 26, { size: 23, color: C.white, bold: true });
  addMiniChart(ctx, slide, 746, 424, 410, 94, [24, 30, 85, 92, 78, 96, 105, 88, 112], C.cyan, 2);
  addText(ctx, slide, "rapid clicks, copy-paste, new device, high-value transfer", 746, 528, 410, 24, { size: 15, color: C.muted });
  addText(ctx, slide, "Risk result: LOW -> MEDIUM -> HIGH -> CRITICAL as evidence accumulates", 206, 600, 870, 34, { size: 24, color: C.white, bold: true, align: "center" });
  return slide;
}

function slide07(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "The hard case", "What if the hacker acts normal?", "This is the right security question. SecureTrace does not rely on one behavior signal. It combines behavior with context, trust history, device intelligence, and transaction intent.", 7, "HARD CASE");
  addPanel(ctx, slide, 74, 346, 510, 232, C.red, "#071527");
  addText(ctx, slide, "Attacker tries to blend in", 104, 376, 320, 28, { size: 24, color: C.white, bold: true });
  addBullets(ctx, slide, ["Types slowly to look human", "Avoids rage clicks", "Uses copied session token", "Attempts one clean transfer"], 108, 428, 380, { gap: 34, size: 17, dot: C.red, lineHeight: 26 });
  addPanel(ctx, slide, 696, 346, 510, 232, C.cyan, "#071527");
  addText(ctx, slide, "Adaptive Trust defense", 726, 376, 330, 28, { size: 24, color: C.white, bold: true });
  addBullets(ctx, slide, ["Unknown device remains low trust", "New beneficiary requires caution", "Amount above learned baseline escalates", "Critical context triggers step-up or block"], 730, 428, 380, { gap: 34, size: 17, dot: C.cyan, lineHeight: 26 });
  addText(ctx, slide, "Even if behavior looks normal, context can still be abnormal.", 230, 612, 820, 32, { size: 25, color: C.white, bold: true, align: "center" });
  return slide;
}

function slide08(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "Risk engine", "Multi-signal score that explains why a session is risky", "Every event becomes explainable evidence. The backend returns score, level, recommended action, and alert context for the frontend.", 8, "ENGINE");
  addRiskGauge(ctx, slide, 78, 356, 18, "LOW", C.green);
  addRiskGauge(ctx, slide, 330, 356, 48, "MEDIUM", C.amber);
  addRiskGauge(ctx, slide, 582, 356, 76, "HIGH", C.red);
  addRiskGauge(ctx, slide, 834, 356, 94, "CRITICAL", C.red);
  addPanel(ctx, slide, 1016, 338, 180, 232, C.cyan, "#071527");
  addText(ctx, slide, "Example scoring", 1034, 364, 136, 24, { size: 17, color: C.white, bold: true });
  addText(ctx, slide, "+18 rapid clicks\n+15 copy-paste\n+20 new device\n+22 amount spike\n+25 token anomaly", 1034, 404, 128, 122, { size: 15, color: C.muted });
  addRule(ctx, slide, 1034, 536, 116, 3, C.red);
  return slide;
}

function slide09(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "Full-stack architecture", "Production-level implementation, not a static mockup", "The system is built as an integrated React + Spring Boot platform with secure APIs, persistence, real-time notifications, and dashboard-ready data.", 9, "ARCHITECTURE");
  const rows = [
    ["Frontend", "React + Vite, Tailwind, Framer Motion, Router, Axios, Recharts, Context API", C.cyan],
    ["API layer", "JWT interceptor, protected routes, loading and error states, Spring Security filters", C.blue],
    ["Backend", "Spring Boot REST APIs, JPA services, risk engine, adaptive trust, mail service", C.green],
    ["Realtime", "WebSocket alerts, live threat feed, behavior stream every 2 seconds", C.purple],
    ["Database", "MySQL tables: users, sessions, behaviors, threats, alerts, transactions, devices, risk logs", C.amber],
  ];
  rows.forEach(([title, body, color], i) => {
    const y = 326 + i * 58;
    addPanel(ctx, slide, 88, y, 1080, 42, color, "#071527");
    addText(ctx, slide, title, 114, y + 10, 156, 20, { size: 16, color: color, bold: true });
    addText(ctx, slide, body, 292, y + 10, 820, 20, { size: 15, color: C.soft });
  });
  return slide;
}

function slide10(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "Jury demo flow", "A demo that shows prevention, not just reporting", "The strongest hackathon moment: trigger an attack, watch the live monitor spike, see the SOC dashboard update, then block or step-up a risky transaction.", 10, "DEMO");
  const steps = [
    ["1", "Register user", "JWT token, profile, device", C.cyan],
    ["2", "Login banking UI", "device and last-login context", C.blue],
    ["3", "Live monitor", "behavior telemetry stream", C.green],
    ["4", "Simulate attack", "hijack, bot, autofill, rapid transfer", C.red],
    ["5", "SOC response", "alerts, logs, blocked transaction", C.amber],
  ];
  steps.forEach(([num, title, body, color], i) => {
    const x = 70 + i * 236;
    addPanel(ctx, slide, x, 356, 190, 154, color, "#071527");
    addShape(ctx, slide, x + 20, 380, 42, 42, "#020617", ctx.line(color, 2), "ellipse");
    addText(ctx, slide, num, x + 20, 388, 42, 24, { size: 20, color, bold: true, align: "center" });
    addText(ctx, slide, title, x + 20, 436, 150, 26, { size: 19, color: C.white, bold: true });
    addText(ctx, slide, body, x + 20, 468, 142, 38, { size: 13, color: C.muted });
  });
  [276, 512, 748, 984].forEach((x) => addRule(ctx, slide, x, 433, 28, 3, C.cyan));
  return slide;
}

function slide11(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "Product UI", "Modern SOC dashboard styling with live banking workflows", "The frontend presents bank-user screens and cyber-defense screens in one consistent product experience.", 11, "PRODUCT");
  addPanel(ctx, slide, 70, 332, 350, 240, C.cyan, "#071527");
  addText(ctx, slide, "Live Security Monitor", 96, 358, 230, 24, { size: 21, color: C.white, bold: true });
  addMiniChart(ctx, slide, 96, 404, 286, 78, [18, 22, 30, 45, 64, 78, 96], C.cyan, 4);
  addText(ctx, slide, "mouse path, typing rhythm, risk score, alerts", 96, 500, 260, 38, { size: 15, color: C.muted });
  addPanel(ctx, slide, 466, 332, 350, 240, C.red, "#071527");
  addText(ctx, slide, "Admin SOC Dashboard", 492, 358, 240, 24, { size: 21, color: C.white, bold: true });
  ["CRITICAL hijack attempt", "HIGH rapid transfer", "MEDIUM autofill abuse"].forEach((item, i) => {
    addShape(ctx, slide, 492, 406 + i * 38, 282, 26, "#101D33", ctx.line(i === 0 ? C.red : C.line, 1));
    addText(ctx, slide, item, 506, 412 + i * 38, 250, 16, { size: 13, color: i === 0 ? C.red : C.soft, bold: i === 0 });
  });
  addPanel(ctx, slide, 862, 332, 350, 240, C.green, "#071527");
  addText(ctx, slide, "Banking Transaction", 888, 358, 230, 24, { size: 21, color: C.white, bold: true });
  addText(ctx, slide, "Transfer: Rs. 95,000\nBeneficiary: new\nDevice trust: 42/100\nDecision: STEP-UP REQUIRED", 888, 406, 270, 98, { size: 16, color: C.soft });
  addRule(ctx, slide, 888, 526, 170, 5, C.green);
  return slide;
}

function slide12(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "Backend proof", "APIs, services, entities, and real-time alerts are implemented", "The Spring Boot backend is designed to plug directly into the frontend and run with MySQL in IntelliJ IDEA Ultimate.", 12, "BACKEND");
  const left = ["POST /api/auth/register", "POST /api/auth/login", "GET /api/user/profile", "GET /api/risk-score", "POST /api/behavior/track", "POST /api/transactions/transfer", "GET /api/admin/logs"];
  addPanel(ctx, slide, 68, 334, 520, 260, C.cyan, "#071527");
  addText(ctx, slide, "Core API surface", 96, 360, 240, 28, { size: 23, color: C.white, bold: true });
  left.forEach((api, i) => addText(ctx, slide, api, 98, 406 + i * 25, 390, 18, { size: 14, color: i < 2 ? C.cyan : C.soft, face: ctx.fonts.mono }));
  addPanel(ctx, slide, 668, 334, 520, 260, C.green, "#071527");
  addText(ctx, slide, "Data model", 696, 360, 240, 28, { size: 23, color: C.white, bold: true });
  ["users", "sessions", "behaviors", "threats", "alerts", "transactions", "devices", "risk_logs", "trust_profiles"].forEach((table, i) => {
    const x = 696 + (i % 3) * 148;
    const y = 408 + Math.floor(i / 3) * 44;
    addShape(ctx, slide, x, y, 122, 28, "#101D33", ctx.line(C.green, 1));
    addText(ctx, slide, table, x + 8, y + 7, 106, 14, { size: 12, color: C.soft, face: ctx.fonts.mono, align: "center" });
  });
  return slide;
}

function slide13(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "Security controls", "Designed like a fintech cybersecurity platform", "SecureTrace uses layered controls: authenticated API traffic, role separation, telemetry integrity, session tracking, and response automation.", 13, "SECURITY");
  const controls = [
    ["JWT + refresh token", "Authenticated API access with interceptor-compatible frontend."],
    ["Role-based access", "Admin SOC screens separated from customer banking screens."],
    ["Device fingerprinting", "Device trust score affects transaction risk and session confidence."],
    ["WebSocket alerts", "High-risk events appear in dashboards without manual refresh."],
    ["Email notifications", "Fraud, suspicious login, and blocked transaction alerts."],
    ["Step-up and block", "Risk can force verification or prevent transfer execution."],
  ];
  controls.forEach(([title, body], i) => {
    const x = 78 + (i % 2) * 570;
    const y = 324 + Math.floor(i / 2) * 82;
    const color = [C.cyan, C.blue, C.green, C.purple, C.amber, C.red][i];
    addPanel(ctx, slide, x, y, 500, 62, color, "#071527");
    addText(ctx, slide, title, x + 18, y + 14, 190, 20, { size: 17, color, bold: true });
    addText(ctx, slide, body, x + 224, y + 14, 240, 28, { size: 13, color: C.soft });
  });
  return slide;
}

function slide14(presentation, ctx) {
  const slide = presentation.slides.add();
  addTitle(ctx, slide, "Impact", "SecureTrace reduces fraud loss while improving analyst response time", "The platform gives banks a prevention layer that sits between login security and payment execution.", 14, "IMPACT");
  addMetric(ctx, slide, "Fraud prevention moment", "Pre-transfer", 78, 350, 260, C.green, "not after settlement");
  addMetric(ctx, slide, "Analyst visibility", "Live SOC", 390, 350, 260, C.cyan, "threat feed + logs");
  addMetric(ctx, slide, "Customer friction", "Risk based", 702, 350, 260, C.amber, "step-up only when needed");
  addMetric(ctx, slide, "Platform fit", "API first", 1014, 350, 190, C.blue, "Spring Boot ready");
  addText(ctx, slide, "Winning angle: real-time behavior + adaptive trust + transaction prevention in one full-stack demo.", 170, 560, 940, 38, { size: 26, color: C.white, bold: true, align: "center" });
  return slide;
}

function slide15(presentation, ctx) {
  const slide = presentation.slides.add();
  addBackground(ctx, slide, 15, "CLOSING");
  addText(ctx, slide, "Why SecureTrace wins", 82, 118, 760, 60, { size: 48, color: C.white, bold: true, title: true });
  addText(ctx, slide, "It solves a real fintech security gap with a working full-stack product, a strong jury demo, and an explainable AI-style risk engine.", 86, 206, 760, 62, { size: 24, color: C.soft });
  addPanel(ctx, slide, 84, 338, 336, 168, C.cyan, "#071527");
  addText(ctx, slide, "Demo-ready", 112, 368, 190, 28, { size: 25, color: C.white, bold: true });
  addText(ctx, slide, "Attack simulation, live alerts, dashboards, and transaction blocking.", 112, 416, 250, 52, { size: 17, color: C.muted });
  addPanel(ctx, slide, 474, 338, 336, 168, C.green, "#071527");
  addText(ctx, slide, "Technically real", 502, 368, 220, 28, { size: 25, color: C.white, bold: true });
  addText(ctx, slide, "React frontend, Spring Boot APIs, MySQL, JWT, WebSocket, mail.", 502, 416, 250, 52, { size: 17, color: C.muted });
  addPanel(ctx, slide, 864, 338, 336, 168, C.red, "#071527");
  addText(ctx, slide, "Security insight", 892, 368, 220, 28, { size: 25, color: C.white, bold: true });
  addText(ctx, slide, "Even normal-looking attackers face context-aware adaptive trust checks.", 892, 416, 250, 52, { size: 17, color: C.muted });
  addText(ctx, slide, "From login authentication to continuous identity verification.", 206, 580, 870, 42, { size: 30, color: C.cyan, bold: true, align: "center", title: true });
  return slide;
}

const slideFns = [
  slide01,
  slide02,
  slide03,
  slide04,
  slide05,
  slide06,
  slide07,
  slide08,
  slide09,
  slide10,
  slide11,
  slide12,
  slide13,
  slide14,
  slide15,
];

async function main() {
  await fs.mkdir(workspace, { recursive: true });
  await fs.mkdir(previewDir, { recursive: true });
  await fs.mkdir(layoutDir, { recursive: true });
  await ensureArtifactToolWorkspace(workspace);
  const artifact = await importArtifactTool(workspace);
  const { Presentation, PresentationFile } = artifact;
  const presentation = Presentation.create({ slideSize });
  const ctx = createSlideContext(artifact, {
    slideSize,
    outputDir: projectRoot,
    assetDir: path.join(workspace, "assets"),
    workspaceDir: workspace,
    titleFont: "Aptos Display",
    bodyFont: "Aptos",
    monoFont: "Consolas",
  });

  await fs.writeFile(
    path.join(workspace, "profile-plan.txt"),
    [
      "Task mode: create",
      "Primary profile: engineering-platform",
      "Secondary profile: product-platform",
      "Proof objects: architecture map, live risk engine, behavioral analytics, demo flow, backend API/data model, adaptive-trust hard-case solution.",
      "Design system: dark SOC dashboard, glass panels, neon cyan/red risk emphasis, editable shapes and text.",
    ].join("\n"),
    "utf8",
  );

  slideFns.forEach((fn) => fn(presentation, ctx));

  const previewPaths = [];
  for (let i = 0; i < presentation.slides.count; i += 1) {
    const slide = presentation.slides.getItem(i);
    const png = await presentation.export({ slide, format: "png", scale: 1 });
    const previewPath = path.join(previewDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    await saveBlobToFile(png, previewPath);
    previewPaths.push(previewPath);
    try {
      const layoutBlob = await presentation.export({ slide, format: "layout" });
      await fs.writeFile(path.join(layoutDir, `slide-${String(i + 1).padStart(2, "0")}.layout.json`), await layoutBlob.text(), "utf8");
    } catch {
      // Layout export is best-effort; PNG preview and PPTX export are the gating artifacts.
    }
  }

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(outputPptx);
  const stat = await fs.stat(outputPptx);
  const manifest = {
    outputPptx,
    outputBytes: stat.size,
    slideCount: presentation.slides.count,
    previewDir,
    previewPaths,
  };
  await fs.writeFile(path.join(workspace, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
