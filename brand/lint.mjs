// 꽃 조각 검사기 — BRAND.md 4·5장 규칙 중 기계로 잴 수 있는 것을 전부 검사한다.
// 누가 그렸든(Claude·Codex·Gemini) 이 검사를 통과해야 브랜드에 들어온다.
//   node lint.mjs                 → flowers/ 전부
//   node lint.mjs starfinder ...  → 지정한 slug만
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const ROOT = dirname(fileURLToPath(import.meta.url));

export const SLOTS = {
  "F-NAVY": "#1F3A66", "F-INK": "#2E3640", "F-BROWN": "#8C4527", "F-ROSE": "#C94F6D",
  "F-SKY": "#3F7FC4", "F-CORAL": "#D9542F", "F-YELLOW": "#FFC629", "F-CREAM": "#FFF6E0",
};
const ANCHORS = ["F-NAVY", "F-INK", "F-BROWN", "F-ROSE", "F-SKY", "F-CORAL"].map((k) => SLOTS[k]);
const SHAPES = ["path", "circle", "ellipse", "rect", "polygon", "line"];
const ALLOWED = new Set(["svg", "g", ...SHAPES]);
const SILHOUETTES = ["round", "tall", "wide", "pointed"];

const apps = JSON.parse(readFileSync(join(ROOT, "apps.json"), "utf8"));

const groupOf = (svg, id) => {
  const start = svg.search(new RegExp(`<g[^>]*\\bid="${id}"`));
  if (start < 0) return null;
  const open = svg.indexOf(">", start) + 1;
  const tag = /<g\b[^>]*?(\/?)>|<\/g>/g;
  tag.lastIndex = open;
  let depth = 1;
  for (let m; (m = tag.exec(svg)); ) {
    if (m[0] === "</g>") depth -= 1;
    else if (!m[1]) depth += 1;
    if (depth === 0) return svg.slice(open, m.index);
  }
  return null;
};

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** 그룹 하나를 240×240으로 렌더해 픽셀을 잰다 */
const measure = (body, scale = 1) => {
  const size = 240 * scale;
  const img = new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="${size}" height="${size}">${body}</svg>`,
    { fitTo: { mode: "width", value: size } }).render();
  const { pixels: px, width: W, height: H } = img;
  const at = (x, y) => px[(y * W + x) * 4 + 3];
  const anchorRgb = ANCHORS.map(hexToRgb);
  // resvg 픽셀은 premultiplied RGBA라 가장자리 반투명 픽셀은 알파로 나눠 원래 색을 되살린 뒤 비교한다
  const isAnchor = (i) => {
    const a = px[i + 3] / 255;
    const [pr, pg, pb] = [px[i] / a, px[i + 1] / a, px[i + 2] / a];
    return anchorRgb.some(([r, g, b]) => Math.abs(pr - r) + Math.abs(pg - g) + Math.abs(pb - b) < 60);
  };
  let n = 0, sx = 0, sy = 0, minX = W, minY = H, maxX = -1, maxY = -1, anchor = 0, edge = 0, edgeAnchor = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (px[i + 3] < 128) continue;
    n++; sx += x; sy += y;
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    const a = isAnchor(i);
    if (a) anchor++;
    const border = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      return nx < 0 || ny < 0 || nx >= W || ny >= H || at(nx, ny) < 128;
    });
    if (border) { edge++; if (a) edgeAnchor++; }
  }
  const s = 1 / scale;
  return {
    area: n, cx: (sx / n) * s, cy: (sy / n) * s,
    box: { x0: minX * s, y0: minY * s, x1: (maxX + 1) * s, y1: (maxY + 1) * s },
    anchorArea: anchor / n, anchorEdge: edge ? edgeAnchor / edge : 0,
    opaque: (x, y) => at(Math.round(x * scale), Math.round(y * scale)) >= 128,
    /** (x,y)의 원래 색(알파로 나눔). 비어 있으면 null */
    rgb: (x, y) => {
      const i = (Math.round(y * scale) * W + Math.round(x * scale)) * 4;
      if (px[i + 3] < 128) return null;
      const a = px[i + 3] / 255;
      return [px[i] / a, px[i + 1] / a, px[i + 2] / a];
    },
  };
};

export const lint = (slug) => {
  const errors = [], warns = [];
  const err = (m) => errors.push(m), warn = (m) => warns.push(m);
  const src = readFileSync(join(ROOT, "flowers", `${slug}.svg`), "utf8");

  // 1. 루트 속성
  const root = src.match(/<svg\b[^>]*>/)?.[0] ?? "";
  if (!/viewBox="0 0 240 240"/.test(root)) err('루트 viewBox는 "0 0 240 240"이어야 합니다');
  const attr = (k) => root.match(new RegExp(`${k}="([^"]*)"`))?.[1];
  if (attr("data-slug") !== slug) err(`data-slug="${attr("data-slug")}" ≠ 파일 이름 ${slug}`);
  if (!SILHOUETTES.includes(attr("data-silhouette"))) err(`data-silhouette는 ${SILHOUETTES.join("/")} 중 하나`);
  if (!(attr("data-main") in SLOTS)) err("data-main은 꽃 색 슬롯 이름(F-…)이어야 합니다");
  if (!["on", "off", undefined].includes(attr("data-leaves"))) err('data-leaves는 "on" 또는 "off"');
  if (!attr("data-name")) err("data-name(꽃 상징 이름, 한국어)이 없습니다 — 소품 정체성 검사에 쓴다");
  if (!apps.some((a) => a.slug === slug)) err(`apps.json에 ${slug}가 없습니다`);

  // 2. 태그·속성
  for (const [, close, name, rest] of src.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*)>/g)) {
    if (close) continue;
    if (!ALLOWED.has(name)) err(`<${name}> 금지 (쓸 수 있는 것: ${[...ALLOWED].join(", ")})`);
    if (/\b(opacity|fill-opacity|stroke-opacity|style|class|filter|mask|clip-path|href|xlink:href)=/.test(rest)) err(`<${name}>에 금지 속성: ${rest.trim().slice(0, 60)}`);
    const id = rest.match(/\bid="([^"]*)"/)?.[1];
    if (id && !["full", "small"].includes(id)) err(`id="${id}" 금지 (full·small만)`);
    for (const [, k, v] of rest.matchAll(/\b(fill|stroke)="([^"]*)"/g)) {
      if (v === "none") continue;
      if (!Object.values(SLOTS).includes(v.toUpperCase())) err(`${k}="${v}"는 꽃 색 슬롯이 아닙니다`);
    }
    if (/\bstroke="(?!none)/.test(rest)) {
      const w = Number(rest.match(/stroke-width="([\d.]+)"/)?.[1] ?? 1);
      if (w < 12) err(`선 두께 ${w} < 12 (선이 곧 형태인 요소만, 12 이상)`);
      if (!/stroke-linecap="round"/.test(rest)) warn(`<${name}> stroke-linecap="round" 권장`);
    }
  }

  // 3. 그룹별 도형 수·색 수·크기
  const full = groupOf(src, "full"), small = groupOf(src, "small");
  if (!full) { err("#full 그룹이 없습니다"); return { slug, errors, warns }; }
  const count = (g) => (g.match(new RegExp(`<(${SHAPES.join("|")})\\b`, "g")) || []).length;
  const colors = (g) => new Set([...g.matchAll(/\b(?:fill|stroke)="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase()));
  if (count(full) > 12) err(`#full 도형 ${count(full)}개 > 12`);
  if (colors(full).size > 3) err(`#full 색 ${colors(full).size}개 > 3`);
  if (small) {
    if (count(small) > 4) err(`#small 도형 ${count(small)}개 > 4`);
    if (colors(small).size > 3) err(`#small 색 ${colors(small).size}개 > 3`);
  }
  const fills = [...colors(full)];
  if (!fills.some((c) => ANCHORS.includes(c))) err("#full에 앵커색(진한 색)이 없습니다");

  const m = measure(full, 2);
  const w = m.box.x1 - m.box.x0, h = m.box.y1 - m.box.y0;
  const r = (v) => Math.round(v);
  if (m.box.x0 < 8 || m.box.x1 > 232 || m.box.y0 < 8) err(`여백 위반: 외곽 x ${r(m.box.x0)}~${r(m.box.x1)}, y ${r(m.box.y0)}~ (x 8~232, y 8~)`);
  if (Math.max(w, h) < 184 || Math.max(w, h) > 224) err(`긴 변 ${r(Math.max(w, h))} (184~224)`);
  if (Math.min(w, h) < 112) err(`짧은 변 ${r(Math.min(w, h))} < 112`);
  if (Math.abs(m.cx - 120) > 10 || Math.abs(m.cy - 116) > 10) err(`무게중심 (${r(m.cx)},${r(m.cy)}) — (120,116) ±10`);
  if (m.anchorArea < 0.5) err(`앵커색 면적 ${r(m.anchorArea * 100)}% < 50% (꽃끼리 시각 무게를 맞춘다)`);
  if (m.box.y0 < 20 || m.box.y0 > 36) err(`꽃 머리 윗끝 y ${r(m.box.y0)} — 20~36 (갤러리에서 키를 맞춘다)`);
  const bright = ["F-YELLOW", "F-CREAM"].map((k) => hexToRgb(SLOTS[k]));
  let brightHit = 0;
  for (let y = 192; y < 240; y += 2) for (let x = 90; x <= 150; x += 2) {
    const c = m.rgb(x, y);
    if (c && bright.some(([R, G, B]) => Math.abs(c[0] - R) + Math.abs(c[1] - G) + Math.abs(c[2] - B) < 60)) brightHit++;
  }
  if (brightHit) err("꽃받침 접합부(x 90~150, y 192 아래)에 밝은색(F-YELLOW·F-CREAM)이 있음 — 받침이 벽을 먹어 얇은 띠가 생긴다");
  if (m.anchorEdge < 0.6) err(`외곽의 앵커색 비율 ${r(m.anchorEdge * 100)}% < 60% (밝은색이 바깥에 드러남)`);
  const gaps = [104, 112, 120, 128, 136].filter((x) => !m.opaque(x, 208));
  if (gaps.length) err(`꽃받침 연결: y 208에서 x ${gaps.join(",")} 비어 있음 (x 104~136은 y 210까지 채움)`);
  let leafHit = 0;
  for (let y = 216; y < 240; y += 2) for (let x = 0; x < 240; x += 2) if ((x < 96 || x > 144) && m.opaque(x, y)) leafHit++;
  if (leafHit) err(`잎 자리 침범: y 216 아래, x 96~144 밖에 그림이 있음 (공통 잎끝이 y 222부터 들어온다)`);
  if (small) {
    const s = measure(small, 2);
    if (s.box.x0 < 8 || s.box.x1 > 232 || s.box.y0 < 8) err(`#small 여백 위반: x ${r(s.box.x0)}~${r(s.box.x1)}, y ${r(s.box.y0)}~`);
    if (Math.abs(s.cx - 120) > 12 || Math.abs(s.cy - 116) > 12) warn(`#small 무게중심 (${r(s.cx)},${r(s.cy)})`);
  } else if (count(full) > 4) {
    warn("#full 도형이 4개를 넘는데 #small이 없습니다 (32px에서 뭉개질 수 있음)");
  }
  return { slug, errors, warns, stats: { box: m.box, center: [r(m.cx), r(m.cy)], anchorArea: r(m.anchorArea * 100), anchorEdge: r(m.anchorEdge * 100), shapes: count(full), colors: fills } };
};

// ── 소품 (BRAND.md 9장) ─────────────────────────────────────────────

export const PROP_SLOTS = {
  "P-WALNUT": "#9A6448", "P-CLAY": "#B07A55", "P-CORAL": "#D08A6C", "P-ROSE": "#C7838F", "P-OCHRE": "#C9A066",
  "P-GRAPHITE": "#6A7380", "P-SLATE": "#7F8D9C", "P-MIST": "#8FAFCF", "P-PAPER": "#FBF4E6",
};
const SHADOW = "#DDD3BA";
const GROUND = "#EEE7D4";
const PROP_ANCHORS = ["P-WALNUT", "P-CLAY", "P-GRAPHITE", "P-SLATE"];
const WARM = ["P-WALNUT", "P-CLAY", "P-CORAL", "P-ROSE", "P-OCHRE"];
const COLD_FLOWER = ["F-NAVY", "F-INK", "F-SKY"];
const ROLES = ["tool", "stage", "result"];
// 소품 생김새 갈래. 앱 결과물은 대개 판·화면이라 board가 넘치기 쉽다 → 한 장면에 하나, 카테고리 안에서 30% 이하
export const FORMS = ["board", "vessel", "instrument", "furniture", "object"];
// 아무 앱에나 들어가는 사물 — 앱의 핵심 그 자체일 때만 data-why를 적고 쓴다 (9-3)
const GENERIC = ["연필", "공책", "책", "컴퓨터", "노트북", "태블릿", "크롬북", "휴대폰", "칠판", "전자칠판", "전구", "트로피", "메달", "별", "하트", "화살표", "시계", "돋보기", "지구본", "선물 상자", "로켓", "화분", "나무", "풀"];

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = (hex) => { const [r, g, b] = hexToRgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const chroma = (hex) => {
  const [r, g, b] = hexToRgb(hex).map(lin);
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const A = 500 * (f(X) - f(Y)), B = 200 * (f(Y) - f(Z));
  return Math.hypot(A, B);
};

const labL = (hex) => { const Y = luminance(hex); return 116 * (Y > 0.008856 ? Math.cbrt(Y) : 7.787 * Y + 16 / 116) - 16; };

/** 소품 그룹 하나를 480×240으로 렌더해 잰다 (그림자 제외) */
const measureProp = (body) => {
  const scale = 2, W0 = 480, H0 = 240;
  const img = new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W0} ${H0}" width="${W0 * scale}" height="${H0 * scale}">${body}</svg>`,
    { fitTo: { mode: "width", value: W0 * scale } }).render();
  const { pixels: px, width: W, height: H } = img;
  const slots = Object.entries(PROP_SLOTS).map(([k, h]) => [k, hexToRgb(h)]);
  const slotAt = (i) => {
    const a = px[i + 3] / 255; const c = [px[i] / a, px[i + 1] / a, px[i + 2] / a];
    let best = null, d = 1e9;
    for (const [k, [R, G, B]] of slots) { const e = Math.abs(c[0] - R) + Math.abs(c[1] - G) + Math.abs(c[2] - B); if (e < d) { d = e; best = k; } }
    return d < 60 ? best : null;
  };
  const alpha = (x, y) => px[(y * W + x) * 4 + 3];
  let n = 0, edge = 0, edgeAnchor = 0, minX = W, minY = H, maxX = -1, maxY = -1;
  const bySlot = {};
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (px[i + 3] < 128) continue;
    n++;
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    const k = slotAt(i);
    if (k) bySlot[k] = (bySlot[k] || 0) + 1;
    const border = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      return nx < 0 || ny < 0 || nx >= W || ny >= H || alpha(nx, ny) < 128;
    });
    if (border) { edge++; if (PROP_ANCHORS.includes(k)) edgeAnchor++; }
  }
  return { area: n, box: { x0: minX / scale, y0: minY / scale, x1: (maxX + 1) / scale, y1: (maxY + 1) / scale }, edgeAnchor: edge ? edgeAnchor / edge : 0, bySlot };
};

/** 모든 꽃 상징 이름 (정체성 검사용) */
const flowerNames = () => Object.fromEntries(readdirSync(join(ROOT, "flowers")).filter((f) => f.endsWith(".svg")).map((f) => {
  const root = readFileSync(join(ROOT, "flowers", f), "utf8").match(/<svg\b[^>]*>/)?.[0] ?? "";
  return [f.slice(0, -4), root.match(/data-name="([^"]*)"/)?.[1]];
}));
const allPropNames = () => readdirSync(join(ROOT, "props")).filter((f) => f.endsWith(".svg")).flatMap((f) => {
  const src = readFileSync(join(ROOT, "props", f), "utf8");
  return [...src.matchAll(/<g\b[^>]*\bid="(?:left|right)"[^>]*data-name="([^"]*)"/g)].map((m) => [f.slice(0, -4), m[1]]);
});
const norm = (s) => (s || "").replace(/\s+/g, "");

export const lintProps = (slug) => {
  const errors = [], warns = [];
  const err = (m) => errors.push(m), warn = (m) => warns.push(m);
  const file = join(ROOT, "props", `${slug}.svg`);
  if (!existsSync(file)) return null;
  const src = readFileSync(file, "utf8");
  const r = (v) => Math.round(v);

  // 1. 구조
  const root = src.match(/<svg\b[^>]*>/)?.[0] ?? "";
  if (!/viewBox="0 0 480 240"/.test(root)) err('소품 루트 viewBox는 "0 0 480 240"');
  if (root.match(/data-slug="([^"]*)"/)?.[1] !== slug) err(`소품 data-slug ≠ ${slug}`);
  for (const [, close, name, rest] of src.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*)>/g)) {
    if (close) continue;
    if (!ALLOWED.has(name)) err(`<${name}> 금지`);
    if (/\b(opacity|fill-opacity|stroke-opacity|style|class|filter|mask|clip-path|href|xlink:href)=/.test(rest)) err(`<${name}>에 금지 속성`);
    const id = rest.match(/\bid="([^"]*)"/)?.[1];
    if (id && !["left", "right"].includes(id)) err(`id="${id}" 금지 (left·right만)`);
    for (const [, k, v] of rest.matchAll(/\b(fill|stroke)="([^"]*)"/g)) {
      if (v === "none") continue;
      if (v.toUpperCase() !== SHADOW && !Object.values(PROP_SLOTS).includes(v.toUpperCase())) err(`${k}="${v}"는 소품 색(P-슬롯)이 아닙니다`);
    }
    // 7. 최소 크기
    const num = (k) => Number(rest.match(new RegExp(`\\b${k}="([\\d.]+)"`))?.[1]);
    if (/\bstroke="(?!none)/.test(rest)) {
      if (!(num("stroke-width") >= 16)) err(`<${name}> stroke-width ${num("stroke-width") || 1} < 16`);
      if (!/stroke-linecap="round"/.test(rest)) warn(`<${name}> stroke-linecap="round" 권장`);
    }
    if (name === "rect" && (num("width") < 16 || num("height") < 16)) err(`rect ${num("width")}×${num("height")} — 폭·높이 16 이상`);
    if (name === "circle" && num("r") < 8 && !/\bstroke="(?!none)/.test(rest)) err(`circle r ${num("r")} < 8`);
  }

  const flowerSrc = readFileSync(join(ROOT, "flowers", `${slug}.svg`), "utf8");
  const flowerMain = flowerSrc.match(/<svg\b[^>]*data-main="([^"]*)"/)?.[1];
  const flowerFull = groupOf(flowerSrc, "full") || "";
  const flowerColors = [...new Set([...flowerFull.matchAll(/\b(?:fill|stroke)="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase()))];

  const sides = {};
  const fileColors = new Set();
  for (const [side, x0, x1] of [["left", 8, 232], ["right", 248, 472]]) {
    const body = groupOf(src, side);
    const open = src.match(new RegExp(`<g\\b[^>]*\\bid="${side}"[^>]*>`))?.[0] ?? "";
    if (body == null) { err(`#${side} 그룹이 없습니다`); continue; }
    const name = open.match(/data-name="([^"]*)"/)?.[1], role = open.match(/data-role="([^"]*)"/)?.[1], why = open.match(/data-why="([^"]*)"/)?.[1];
    // 12. 정체성 속성
    if (!name) err(`#${side} data-name(사물 이름)이 없습니다`);
    if (!ROLES.includes(role)) err(`#${side} data-role은 ${ROLES.join("/")} 중 하나`);
    if (!why) err(`#${side} data-why(이 앱에서만 쓰는 이유)가 없습니다`);
    const form = open.match(/data-form="([^"]*)"/)?.[1];
    if (!FORMS.includes(form)) err(`#${side} data-form은 ${FORMS.join("/")} 중 하나`);
    // 6. 접지 그림자: 첫 요소
    const first = body.match(/^\s*<(\w+)\b([^>]*)\/?>/);
    const shadowOk = first && first[1] === "ellipse" && new RegExp(`fill="${SHADOW}"`, "i").test(first[2]) && /cy="232"/.test(first[2]) && /ry="8"/.test(first[2]);
    if (!shadowOk) err(`#${side} 첫 요소는 접지 그림자 <ellipse cy="232" ry="8" fill="${SHADOW}"/>`);
    if ((body.match(new RegExp(`fill="${SHADOW}"`, "gi")) || []).length > 1) err(`#${side} 그림자는 1개만`);
    const shape = shadowOk ? body.slice(first[0].length) : body;
    // 2·3. 색 수, 하위 경로 수
    const colors = new Set([...shape.matchAll(/\b(?:fill|stroke)="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase()));
    colors.forEach((c) => fileColors.add(c));
    if (colors.size > 3) err(`#${side} 색 ${colors.size}개 > 3`);
    let sub = 0;
    for (const [, tag, rest] of shape.matchAll(/<(path|circle|ellipse|rect|polygon|line)\b([^>]*)>/g)) {
      sub += tag === "path" ? (rest.match(/d="([^"]*)"/)?.[1].match(/[Mm]/g) || []).length : 1;
    }
    if (sub > 12) err(`#${side} 하위 경로 ${sub}개 > 12`);
    // 4·5·8. 상자, 바닥선, 앵커 외곽
    const m = measureProp(shape);
    const w = m.box.x1 - m.box.x0, h = m.box.y1 - m.box.y0;
    if (m.box.x0 < x0 || m.box.x1 > x1 || m.box.y0 < 8) err(`#${side} 칸 밖: x ${r(m.box.x0)}~${r(m.box.x1)} (${x0}~${x1}), 윗끝 y ${r(m.box.y0)}`);
    if (Math.max(w, h) < 160 || Math.max(w, h) > 224) err(`#${side} 긴 변 ${r(Math.max(w, h))} (160~224)`);
    if (Math.min(w, h) < 72) err(`#${side} 짧은 변 ${r(Math.min(w, h))} < 72`);
    if (Math.abs(m.box.y1 - 232) > 2) err(`#${side} 바닥 y ${r(m.box.y1)} — 232±2 (땅에 서야 한다)`);
    if (m.box.y0 < 16 || m.box.y0 > 84) err(`#${side} 윗끝 y ${r(m.box.y0)} — 16~84 (소품 키를 비슷하게 맞춘다)`);
    if (m.box.y0 >= 44 && m.box.y0 <= 70) warn(`#${side} 윗끝 y ${r(m.box.y0)} — 와이드 y 317~353, 먼 언덕 윤곽선과 겹쳐 접선이 생긴다(소품 y 44~70 피하기)`);
    if (shadowOk) {
      const rx = Number(first[2].match(/rx="([\d.]+)"/)?.[1]);
      if (rx > w / 2 + 12) warn(`#${side} 그림자 rx ${rx} > 폭/2+12 (${r(w / 2 + 12)})`);
    }
    if (m.edgeAnchor < 0.5) err(`#${side} 외곽 앵커색 ${r(m.edgeAnchor * 100)}% < 50%`);
    const nonPaper = Object.entries(m.bySlot).filter(([k]) => k !== "P-PAPER").sort((a, b) => b[1] - a[1]);
    const main = nonPaper[0]?.[0];
    sides[side] = { name, role, form, area: m.area / 4, height: h, main, bySlot: m.bySlot, colors };
  }
  if (fileColors.size > 5) err(`소품 두 개 합쳐 색 ${fileColors.size}개 > 5`);
  const { left: L, right: R } = sides;
  if (L && R) {
    // 9. 균형
    const ratio = L.area / R.area;
    if (ratio < 0.7 || ratio > 1.43) err(`좌우 면적 비 ${ratio.toFixed(2)} (0.70~1.43)`);
    if (Math.abs(L.height - R.height) > 56) err(`좌우 높이 차 ${r(Math.abs(L.height - R.height))} > 56`);
    // 10. 온도
    if (COLD_FLOWER.includes(flowerMain) && !(WARM.includes(L.main) && WARM.includes(R.main))) err(`꽃 주색(${flowerMain})이 차가우니 두 소품 주색이 모두 따뜻해야 한다 (지금 ${L.main}, ${R.main})`);
    const sum = (o, keys) => Object.entries(o).filter(([k]) => keys(k)).reduce((s, [, v]) => s + v, 0);
    const warm = sum(L.bySlot, (k) => WARM.includes(k)) + sum(R.bySlot, (k) => WARM.includes(k));
    const painted = sum(L.bySlot, (k) => k !== "P-PAPER") + sum(R.bySlot, (k) => k !== "P-PAPER");
    if (painted && warm / painted < 0.5) err(`따뜻한 색 면적 ${r((warm / painted) * 100)}% < 50%`);
    const mainL = flowerMain && SLOTS[flowerMain] ? labL(SLOTS[flowerMain]) : null;
    if (mainL != null && mainL >= 50 && mainL <= 55) {
      const dark = sum(L.bySlot, (k) => PROP_ANCHORS.includes(k)) + sum(R.bySlot, (k) => PROP_ANCHORS.includes(k));
      if (painted && dark / painted > 0.5) err(`꽃 주색(${flowerMain}, L*${r(mainL)})이 중간 명도라 소품의 진한 색(앵커) 면적은 50% 이하 — 지금 ${r((dark / painted) * 100)}% (넓은 면은 P-CORAL·ROSE·OCHRE로)`);
    }
    if (L.form === "board" && R.form === "board") warn("두 소품이 모두 판(board) — 한 장면에 판은 하나만");
    if (L.role && L.role === R.role) warn(`두 소품 data-role이 같다 (${L.role}) — 왼쪽 도구·오른쪽 결과물 권장`);
  }
  // 11. 위계: 소품이 꽃보다 덜 튀게
  const propColors = [...fileColors];
  if (propColors.length && flowerColors.length) {
    const maxC = (cs) => Math.max(...cs.map(chroma)), maxK = (cs) => Math.max(...cs.map((c) => contrast(c, GROUND)));
    if (maxC(propColors) >= maxC(flowerColors)) err(`소품 최대 채도 ${r(maxC(propColors))} ≥ 꽃 ${r(maxC(flowerColors))}`);
    if (maxK(propColors) > 0.75 * maxK(flowerColors)) err(`소품 최대 대비 ${maxK(propColors).toFixed(2)} > 꽃의 0.75배 ${(0.75 * maxK(flowerColors)).toFixed(2)}`);
  }
  // 12. 정체성: 꽃 상징·다른 앱 소품과 겹침
  const fnames = flowerNames();
  const others = allPropNames().filter(([s]) => s !== slug);
  for (const s of [L, R].filter(Boolean)) {
    for (const [fs, fn] of Object.entries(fnames)) if (fn && norm(fn) === norm(s.name)) err(`소품 "${s.name}"이 ${fs === slug ? "이 앱" : fs}의 꽃 상징과 같다`);
    if (GENERIC.some((g) => norm(s.name) === norm(g))) warn(`"${s.name}"은 범용 사물 — 이 앱의 핵심일 때만 쓴다(data-why 확인)`);
    const dup = others.find(([, n]) => norm(n) === norm(s.name));
    if (dup) warn(`"${s.name}" 소품이 ${dup[0]}에도 있다 (같은 family가 아니면 바꾼다)`);
  }
  return { slug, errors, warns, forms: [L?.form, R?.form], stats: L && R ? { left: `${L.name}(${L.main})`, right: `${R.name}(${R.main})`, ratio: (L.area / R.area).toFixed(2) } : null };
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const slugs = process.argv.slice(2).length
    ? process.argv.slice(2)
    : readdirSync(join(ROOT, "flowers")).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4));
  let bad = 0;
  for (const slug of slugs) {
    const { errors, warns, stats } = lint(slug);
    console.log(`${errors.length ? "✗" : "✓"} ${slug}${stats ? `  중심 ${stats.center} · 앵커 면적 ${stats.anchorArea}% · 외곽 ${stats.anchorEdge}% · 도형 ${stats.shapes} · 색 ${stats.colors.length}` : ""}`);
    errors.forEach((e) => console.log(`   오류: ${e}`));
    warns.forEach((w) => console.log(`   참고: ${w}`));
    if (errors.length) bad++;
    const p = lintProps(slug);
    if (p) {
      console.log(`  ${p.errors.length ? "✗" : "✓"} 소품${p.stats ? `  왼쪽 ${p.stats.left} · 오른쪽 ${p.stats.right} · 면적 비 ${p.stats.ratio}` : ""}`);
      p.errors.forEach((e) => console.log(`     오류: ${e}`));
      p.warns.forEach((w) => console.log(`     참고: ${w}`));
      if (p.errors.length) bad++;
    } else {
      console.log("  · 소품 없음 (원경 화분으로 그림)");
    }
  }
  // 카테고리 안 판(board) 소품 비율
  const share = {};
  for (const f of readdirSync(join(ROOT, "props")).filter((n) => n.endsWith(".svg"))) {
    const slug = f.slice(0, -4), cat = apps.find((a) => a.slug === slug)?.category;
    const p = lintProps(slug);
    if (!cat || !p) continue;
    share[cat] ??= { board: 0, all: 0 };
    p.forms.forEach((x) => { share[cat].all++; if (x === "board") share[cat].board++; });
  }
  for (const [cat, { board, all }] of Object.entries(share)) {
    if (all >= 6 && board / all > 0.3) console.log(`참고: ${cat} 소품 중 판(board) ${board}/${all} — 30%를 넘으면 서로 헷갈린다`);
  }
  process.exitCode = bad ? 1 : 0;
}
