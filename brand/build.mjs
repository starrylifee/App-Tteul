// 앱뜰 브랜드 그림 생성기.
// 공통 부품(parts/) + 앱별 꽃(flowers/<slug>.svg) + 카테고리 색(categories.json)을 합쳐
// out/<slug>/ 에 아이콘(16·32·48·180·192·512, favicon.ico, favicon.svg)과 와이드(og-1200x630.png)를 만든다.
//   node build.mjs              → flowers/ 에 있는 꽃 전부
//   node build.mjs starfinder   → 지정한 slug만
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const categories = JSON.parse(read("categories.json"));
const apps = JSON.parse(read("apps.json"));

/** 루트 <svg> 안쪽 내용만 꺼낸다 */
const inner = (svg) => svg.slice(svg.indexOf(">", svg.indexOf("<svg")) + 1, svg.lastIndexOf("</svg>")).trim();

/** <g id="..."> 의 안쪽 내용(중첩 g 포함). 없으면 null */
const group = (svg, id) => {
  const start = svg.search(new RegExp(`<g[^>]*\\bid="${id}"`));
  if (start < 0) return null;
  const open = svg.indexOf(">", start) + 1;
  const tag = /<g\b[^>]*?(\/?)>|<\/g>/g;
  tag.lastIndex = open;
  let depth = 1;
  for (let m; (m = tag.exec(svg)); ) {
    if (m[0] === "</g>") depth -= 1;
    else if (!m[1]) depth += 1;
    if (depth === 0) return svg.slice(open, m.index).trim();
  }
  throw new Error(`#${id} 그룹이 닫히지 않았습니다`);
};

const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => {
  if (!(k in vars)) throw new Error(`자리표시자 {${k}} 값이 없습니다`);
  return vars[k];
});

const part = (name) => inner(read(`parts/${name}.svg`));
const P = {
  tile: part("tile"), stemL: part("stem-L"), leavesL: part("leaves-L"), soil: part("soil"),
  potL: part("pot-L"), stemS: part("stem-S"), potS: part("pot-S"), calyx: part("calyx"),
  garden: inner(read("parts/garden-wide.svg")),
};

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;

// 배치 계약 (BRAND.md 4장). 화분 밑동은 틀 밖으로 잘린다.
const CLOSEUP_L = "translate(-76.8 -32) scale(1.3)"; // 꽃 위끝 y 20, 화분 테두리 y 405~457, 몸통은 아래 가장자리에서 잘림
const CLOSEUP_S = "translate(-64 -13.5) scale(1.25)"; // 48px 이하: 꽃을 더 크게
const WIDE_HERO = "translate(216 49.75) scale(1.5)"; // 머리 위끝 y 28, 머리 x 375~825(가운데 630 안), 화분은 테두리만 보이고 아래는 잘림
const WIDE_HEAD = 1.25; // 카드·카톡에서는 꽃 머리만 꽃받침 밑(꽃 좌표 120,226)을 기준으로 더 키운다
const PROP_LEFT = "translate(18.8 255.2) scale(1.4)"; // 소품 칸 0~240 → 그린 범위 x 30~344, y 278~580 (꽃 머리 x 375~와 겹치지 않음, 가운데 630에는 조금 들어감)
const PROP_RIGHT = "translate(509.2 255.2) scale(1.4)"; // 소품 칸 240~480 → 그린 범위 x 856~1170 (x 600 기준 좌우 대칭)

/** 화분+꽃 (타일 제외) — L판·와이드 공통 */
const plantL = (flower, leaves, head = 1) =>
  P.stemL + (leaves ? P.leavesL : "") + P.soil + P.potL +
  `<g transform="translate(136 32)"><g transform="translate(120 226) scale(${head}) translate(-120 -226)">${flower}${P.calyx}</g></g>`;

/** 소품 파일(props/<slug>.svg)의 #left·#right. 없으면 null */
const propsOf = (slug) => {
  const file = join(ROOT, "props", `${slug}.svg`);
  if (!existsSync(file)) return null;
  const src = readFileSync(file, "utf8");
  const left = group(src, "left"), right = group(src, "right");
  if (!left || !right) throw new Error(`props/${slug}.svg: #left·#right가 둘 다 있어야 합니다`);
  return { left, right };
};

/** 와이드 배경: 소품이 있으면 원경 화분을 빼고 좌우 소품을 놓는다 */
const gardenWith = (props) => props
  ? P.garden.replace(/<g id="bg-pots">[\s\S]*?<\/g><\/g>/, "") +
    `<g transform="${PROP_LEFT}">${props.left}</g><g transform="${PROP_RIGHT}">${props.right}</g>`
  : P.garden;

/** propsSlug를 주면 다른 앱의 소품으로 바꿔 끼운다(정체성 시험용) */
export const compose = (slug, propsSlug = slug) => {
  const app = apps.find((a) => a.slug === slug);
  if (!app) throw new Error(`apps.json에 ${slug}가 없습니다`);
  const cat = categories[app.category];
  if (!cat) throw new Error(`${slug}: 카테고리 ${app.category} 색이 없습니다`);
  const src = read(`flowers/${slug}.svg`);
  const full = group(src, "full");
  if (!full) throw new Error(`${slug}: #full 그룹이 없습니다`);
  const small = group(src, "small") ?? full;
  const leaves = !/data-leaves="off"/.test(src);

  // 클로즈업: 화분 아래쪽은 틀 밖으로 잘라 내고 꽃을 크게 보여 준다. 둥근 타일 모서리 밖으로 삐지지 않게 타일 모양으로 자른다.
  const tileClip = `<defs><clipPath id="tile-clip"><rect width="512" height="512" rx="{TILE_RX}"/></clipPath></defs>`;
  const inTile = (transform, body) => `${tileClip}${P.tile}<g clip-path="url(#tile-clip)"><g transform="${transform}">${body}</g></g>`;
  const iconL = (rx) => fill(svg(512, 512, inTile(CLOSEUP_L, plantL(full, leaves))), { ...cat, TILE_RX: rx });
  const iconS = fill(svg(512, 512, inTile(CLOSEUP_S,
    P.stemS + P.potS + `<g transform="translate(106 12) scale(1.25)">${small}${P.calyx}</g>`)), { ...cat, TILE_RX: 96 });
  const wide = fill(svg(1200, 630,
    gardenWith(propsOf(propsSlug)) + `<g transform="${WIDE_HERO}">${plantL(full, leaves, WIDE_HEAD)}</g>`), cat);
  return { app, iconL112: iconL(112), iconL0: iconL(0), iconS, wide };
};

const png = (svgText, width) => new Resvg(svgText, { fitTo: { mode: "width", value: width } }).render().asPng();

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
  writeFileSync(join(dir, "og.svg"), wide);
  return dir;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const slugs = process.argv.slice(2).length
    ? process.argv.slice(2)
    : readdirSync(join(ROOT, "flowers")).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4));
  for (const slug of slugs) {
    if (!existsSync(join(ROOT, "flowers", `${slug}.svg`))) { console.error(`없음: flowers/${slug}.svg`); process.exitCode = 1; continue; }
    console.log(`${slug} → ${build(slug)}`);
  }
}
