// 앱뜰 브랜드 그림 생성기 (2026-11 큰 꽃 방식).
// 공통 부품(parts/) + 공통 큰 꽃(꽃잎 8장 + 가운데 크림색 판) + 앱별 명세(flowers.json: 가운데 그림·꽃잎 색·짧은 이름)
// + 카테고리 색(categories.json)을 합쳐 out/<slug>/ 에 아이콘(16·32·48·180·192·512, favicon.ico, favicon.svg)과
// 와이드(og-1200x630.png: 꽃 왼쪽, 앱 이름 오른쪽)를 만든다.
//   node build.mjs              → flowers.json 의 앱 전부
//   node build.mjs starfinder   → 지정한 slug만
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const categories = JSON.parse(read("categories.json"));
const apps = JSON.parse(read("apps.json"));
export const specs = JSON.parse(read("flowers.json"));

/** 꽃잎 색 6가지(F-슬롯)와 그 꽃잎에 얹는 가운데 그림 색 */
export const SLOTS = {
  "F-NAVY": "#1F3A66", "F-INK": "#2E3640", "F-BROWN": "#8C4527", "F-ROSE": "#C94F6D",
  "F-SKY": "#3F7FC4", "F-CORAL": "#D9542F", "F-YELLOW": "#FFC629", "F-CREAM": "#FFF6E0",
};
export const PETALS = ["F-NAVY", "F-INK", "F-BROWN", "F-ROSE", "F-SKY", "F-CORAL"];
const INK_ON = { "F-NAVY": "F-NAVY", "F-INK": "F-INK", "F-BROWN": "F-BROWN", "F-ROSE": "F-BROWN", "F-SKY": "F-NAVY", "F-CORAL": "F-BROWN" };
const TEXT = "#2E3640";

export const ICONS = join(ROOT, "node_modules", "@phosphor-icons", "core", "assets", "fill");
// 맞는 Phosphor 그림이 없을 때 직접 그린 그림(256 격자, 색은 {INK}·{CREAM} 두 가지만). 같은 이름이면 이쪽이 먼저다.
export const CUSTOM = join(ROOT, "icons");
export const FONT = join(ROOT, "fonts", "Pretendard-Bold.ttf");
const FONT_FAMILY = "Pretendard";

/** 루트 <svg> 안쪽 내용만 꺼낸다 */
const inner = (svg) => svg.slice(svg.indexOf(">", svg.indexOf("<svg")) + 1, svg.lastIndexOf("</svg>")).trim();
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => {
  if (!(k in vars)) throw new Error(`자리표시자 {${k}} 값이 없습니다`);
  return vars[k];
});

const part = (name) => inner(read(`parts/${name}.svg`));
const P = {
  tile: part("tile"), stemL: part("stem-L"), leavesL: part("leaves-L"), soil: part("soil"),
  potL: part("pot-L"), calyx: part("calyx"),
  // 와이드 배경: 오른쪽에 이름이 들어가므로 해와 원경 화분은 뺀다
  garden: inner(read("parts/garden-wide.svg")).replace(/<g id="bg-pots">[\s\S]*?<\/g><\/g>/, "").replace(/<circle cx="196" cy="150" r="60"[^>]*\/>/, ""),
};

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;

// 배치 계약 (BRAND.md 3장). 화분 밑동은 틀 밖으로 잘린다.
const CLOSEUP_L = "translate(-76.8 -32) scale(1.3)"; // L판: 꽃 위끝 y 20, 화분 테두리 y 405~457, 몸통은 아래 가장자리에서 잘림
// S판(16·32·48·favicon.svg): 작으면 꽃 가운데 그림이 뭉개져서 꽃 대신 꽃잎 색 둥근 타일에 크림색 그림만 크게 넣는다(사용자 결정 2026-11-05)
const SMALL_RX = 96, SMALL_PIC = 400; // 타일 모서리 96, 그림 400칸(여백 56)
const WIDE_HERO = "translate(-84 49.75) scale(1.5)"; // 와이드: 꽃을 왼쪽으로(머리 중심 x 약 300)
const WIDE_HEAD = 1.25; // 와이드에서는 꽃 머리만 꽃받침 밑(꽃 좌표 120,226)을 기준으로 더 키운다
const TEXT_X = 590, TEXT_MAXW = 540, TEXT_MID = 300; // 이름 칸: x 590~1130, 세로 가운데 y 300

export const customFile = (name) => join(CUSTOM, `${name}.svg`);
export const isCustom = (name) => existsSync(customFile(name));

/** 앱 그림(256 격자)의 안쪽 도형. Phosphor는 색을 지우고 감싼 <g>의 fill을 따르게, 직접 그린 그림은 {INK}·{CREAM}을 채운다 */
export const iconBody = (name, ink = "#000", cream = "none") => {
  if (isCustom(name)) return inner(readFileSync(customFile(name), "utf8")).replaceAll("{INK}", ink).replaceAll("{CREAM}", cream);
  const file = join(ICONS, `${name}-fill.svg`);
  if (!existsSync(file)) throw new Error(`아이콘이 없습니다: ${name} (Phosphor fill 이름이나 icons/${name}.svg인지 확인)`);
  return inner(readFileSync(file, "utf8")).replace(/\sfill="[^"]*"/g, "");
};

/** 꽃 머리(240 격자): 중심 (120,112), 꽃잎 끝 반지름 96, 가운데 판 반지름 64, 그림 92 */
export const flowerHead = (spec) => {
  const cx = 120, cy = 112, petal = SLOTS[spec.petal], ink = SLOTS[INK_ON[spec.petal]];
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    return `<circle cx="${(cx + Math.sin(a) * 60).toFixed(1)}" cy="${(cy - Math.cos(a) * 60).toFixed(1)}" r="36" fill="${petal}"/>`;
  }).join("");
  const source = isCustom(spec.icon) ? "custom" : "phosphor";
  return `<g data-slug="${spec.slug}" data-icon="${source}:${spec.icon}">${petals}<circle cx="${cx}" cy="${cy}" r="64" fill="${SLOTS["F-CREAM"]}"/>` +
    `<g transform="translate(${cx - 46} ${cy - 46}) scale(${92 / 256})" fill="${ink}">${iconBody(spec.icon, ink, SLOTS["F-CREAM"])}</g></g>`;
};

/** 화분+꽃 (타일 제외) — L판·와이드 공통 */
const plantL = (head, scale = 1) =>
  P.stemL + P.leavesL + P.soil + P.potL +
  `<g transform="translate(136 32)"><g transform="translate(120 226) scale(${scale}) translate(-120 -226)">${head}${P.calyx}</g></g>`;

// 글자 폭 근사(넉넉하게): 한글 1em, 영문·숫자·기호 0.6em, 공백 0.3em
const textWidth = (t, size) => [...t].reduce((w, c) => w + size * (c === " " ? 0.3 : /[ㄱ-힝]/.test(c) ? 1 : 0.6), 0);
export const TITLE_SIZE = 96, MAX_LINES = 3;

/**
 * 이름 줄 나누기 (사용자 규칙 2026-11-05): 글씨는 96px 고정, 넘치면 띄어쓰기에서 줄을 바꾸고 최대 3줄.
 * 3줄로도 안 들어갈 때만 글씨를 4px씩 줄인다.
 * 「별길 · Starfinder」처럼 가운뎃점(앞뒤 띄어쓰기)이 있으면 거기서 반드시 줄을 바꾸고 점은 뺀다.
 * 96px로 들어가는 가장 적은 줄 수를 고르고, 그중 가장 긴 줄이 가장 짧은 나눔을 쓴다.
 * 같으면 윗줄이 짧은 쪽(「등고선 탐험 / 교실」 대신 「등고선 / 탐험 교실」).
 * 가운뎃점이 3개 이상이라 3줄을 넘으면 null → flowers.json에 ogTitle(짧은 이름)을 적는다.
 */
const layouts = (title) => {
  const chunks = title.split(/\s+[·-]\s+/).map((c) => c.split(/\s+/));
  if (chunks.length > MAX_LINES) return [];
  const words = chunks.flat(), forced = [];
  chunks.slice(0, -1).reduce((k, c) => (forced.push(k + c.length), k + c.length), 0);
  const out = [];
  for (let mask = 0; mask < 1 << (words.length - 1); mask++) {
    const cuts = words.slice(1).map((_, i) => i + 1).filter((p) => mask & (1 << (p - 1)));
    if (cuts.length >= MAX_LINES || !forced.every((p) => cuts.includes(p))) continue;
    const lines = [0, ...cuts].map((s, i) => words.slice(s, [...cuts, words.length][i]).join(" "));
    out.push({ lines, widest: Math.max(...lines.map((l) => textWidth(l, 1))), first: textWidth(lines[0], 1) });
  }
  return out.sort((a, b) => a.lines.length - b.lines.length || a.widest - b.widest || a.first - b.first);
};

export const fitTitle = (title) => {
  const all = layouts(title);
  if (!all.length) return null;
  const fits = all.find((l) => l.widest * TITLE_SIZE <= TEXT_MAXW);
  if (fits) return { size: TITLE_SIZE, lines: fits.lines };
  const tightest = [...all].sort((a, b) => a.widest - b.widest || a.lines.length - b.lines.length || a.first - b.first)[0];
  return { size: Math.floor(TEXT_MAXW / tightest.widest / 4) * 4, lines: tightest.lines };
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const titleText = (title) => {
  const fit = fitTitle(title);
  if (!fit) throw new Error(`「${title}」은 가운뎃점이 많아 ${MAX_LINES}줄을 넘습니다 — flowers.json에 ogTitle(짧은 이름)을 적으세요`);
  const { size, lines } = fit;
  const lh = size * 1.2, top = TEXT_MID - (lines.length * lh) / 2 + size * 0.8;
  return lines.map((l, i) => `<text x="${TEXT_X}" y="${(top + i * lh).toFixed(1)}" font-family="${FONT_FAMILY}" font-weight="700" font-size="${size}" letter-spacing="${(-0.02 * size).toFixed(2)}" fill="${TEXT}">${esc(l)}</text>`).join("");
};

export const specOf = (slug) => {
  const spec = specs.find((s) => s.slug === slug);
  if (!spec) throw new Error(`flowers.json에 ${slug}가 없습니다`);
  return spec;
};

export const compose = (slug) => {
  const app = apps.find((a) => a.slug === slug);
  if (!app) throw new Error(`apps.json에 ${slug}가 없습니다`);
  const cat = categories[app.category];
  if (!cat) throw new Error(`${slug}: 카테고리 ${app.category} 색이 없습니다`);
  const spec = specOf(slug);
  const head = flowerHead(spec);
  const title = spec.ogTitle || app.title;

  // 클로즈업: 화분 아래쪽은 틀 밖으로 잘라 내고 꽃을 크게 보여 준다. 둥근 타일 모서리 밖으로 삐지지 않게 타일 모양으로 자른다.
  const tileClip = `<defs><clipPath id="tile-clip"><rect width="512" height="512" rx="{TILE_RX}"/></clipPath></defs>`;
  const inTile = (transform, body) => `${tileClip}${P.tile}<g clip-path="url(#tile-clip)"><g transform="${transform}">${body}</g></g>`;
  const iconL = (rx) => fill(svg(512, 512, inTile(CLOSEUP_L, plantL(head))), { ...cat, TILE_RX: rx });
  const petal = SLOTS[spec.petal], cream = SLOTS["F-CREAM"], m = (512 - SMALL_PIC) / 2;
  const iconS = svg(512, 512, `<rect width="512" height="512" rx="${SMALL_RX}" fill="${petal}"/>` +
    `<g data-slug="${spec.slug}" transform="translate(${m} ${m}) scale(${SMALL_PIC / 256})" fill="${cream}">${iconBody(spec.icon, cream, petal)}</g>`);
  const wide = fill(svg(1200, 630, P.garden + `<g transform="${WIDE_HERO}">${plantL(head, WIDE_HEAD)}</g>` + titleText(title)), cat);
  return { app, spec, title, iconL112: iconL(112), iconL0: iconL(0), iconS, wide };
};

export const png = (svgText, width) => new Resvg(svgText, {
  fitTo: { mode: "width", value: width },
  font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: FONT_FAMILY },
}).render().asPng();

/** PNG 여러 장을 담은 ICO (PNG 내장형) */
const ico = (images) => {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e); header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8); header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((im) => im.data)]);
};

export const build = (slug) => {
  const { iconL112, iconL0, iconS, wide } = compose(slug);
  const dir = join(ROOT, "out", slug);
  mkdirSync(dir, { recursive: true });
  const small = [16, 32, 48].map((size) => ({ size, data: png(iconS, size) }));
  small.forEach(({ size, data }) => writeFileSync(join(dir, `icon-${size}.png`), data));
  writeFileSync(join(dir, "favicon.ico"), ico(small));
  writeFileSync(join(dir, "favicon.svg"), iconS);
  writeFileSync(join(dir, "icon-180.png"), png(iconL0, 180)); // apple-touch-icon: 모서리는 iOS가 깎는다
  writeFileSync(join(dir, "icon-192.png"), png(iconL112, 192));
  writeFileSync(join(dir, "icon-512.png"), png(iconL112, 512));
  writeFileSync(join(dir, "og-1200x630.png"), png(wide, 1200));
  writeFileSync(join(dir, "icon.svg"), iconL112);
  writeFileSync(join(dir, "og.svg"), wide); // 글자가 <text>라 프리텐다드가 없는 곳에서는 글꼴이 달라 보인다 — 사이트에는 PNG를 쓴다
  return dir;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const slugs = process.argv.slice(2).length ? process.argv.slice(2) : specs.map((s) => s.slug);
  for (const slug of slugs) {
    try { console.log(`${slug} → ${build(slug)}`); } catch (e) { console.error(`${slug}: ${e.message}`); process.exitCode = 1; }
  }
}
