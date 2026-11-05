// 검수용 렌더 시트 R1~R9를 out/_review/ 에 만든다 (기획서 8-1).
//   node review.mjs                       → flowers/ 의 꽃 전부
//   node review.mjs class-bookshelf ...   → 지정한 slug만 (나란히 비교)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { Resvg } from "@resvg/resvg-js";
import { build, compose } from "./build.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
// REVIEW_OUT 환경변수로 시트 폴더를 바꿀 수 있다(여러 작업이 동시에 돌 때 덮어쓰지 않게)
const OUT = process.env.REVIEW_OUT ? join(ROOT, process.env.REVIEW_OUT) : join(ROOT, "out", "_review");
mkdirSync(OUT, { recursive: true });

const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(join(ROOT, "flowers")).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4));

// 앱뜰 카드 배지 색 (AppCard.tsx getCategoryStyle 과 같은 값)
const BADGE = {
  교과: ["#DCEDC8", "#558B2F"], 학급운영: ["#FFF9C4", "#FFB300"], 창체: ["#C8E6C9", "#4CAF50"], 연수: ["#FEF3C7", "#B45309"],
};

const items = slugs.map((slug) => {
  const dir = build(slug);
  const { app } = compose(slug);
  const uri = (f) => `data:image/png;base64,${readFileSync(join(dir, f)).toString("base64")}`;
  return { slug, app, uri };
});

const page = (title, body, extraCss = "") => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
body{margin:0;padding:24px;background:#FFFFFF;font-family:"Pretendard","Malgun Gothic",sans-serif;color:#333}
h1{font-size:16px;margin:0 0 16px}
.row{display:flex;gap:24px;align-items:flex-start;flex-wrap:nowrap;margin-bottom:24px}
.cap{font-size:12px;color:#666;margin-top:6px;text-align:center}
.px{image-rendering:pixelated}
${extraCss}</style></head><body><h1>${title}</h1>${body}
<svg width="0" height="0" style="position:absolute"><filter id="deut"><feColorMatrix type="matrix" values="0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0"/></filter></svg>
</body></html>`;

const cell = (img, cap) => `<div>${img}<div class="cap">${cap}</div></div>`;

const tab = (it, size, dark) => {
  const [strip, tabBg, text] = dark ? ["#202124", "#35363A", "#E8EAED"] : ["#F1F3F4", "#FFFFFF", "#202124"];
  return `<div style="background:${strip};padding:8px 8px 0;width:260px">
    <div style="background:${tabBg};border-radius:8px 8px 0 0;height:34px;display:flex;align-items:center;gap:8px;padding:0 10px">
      <img src="${it.uri(`icon-${size}.png`)}" width="16" height="16" class="px" style="width:16px;height:16px">
      <span style="font-size:12px;color:${text};white-space:nowrap;overflow:hidden">${it.app.title}</span>
    </div></div>`;
};

const card = (it) => {
  const [bg, fg] = BADGE[it.app.category] || ["#eee", "#555"];
  return `<div style="width:300px;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1);border:1px solid #F1F8E9;background:#fff">
    <div style="position:relative;aspect-ratio:1200/630"><img src="${it.uri("og-1200x630.png")}" style="width:100%;height:100%;object-fit:cover;display:block">
      <span style="position:absolute;top:12px;right:12px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;background:${bg};color:${fg}">#${it.app.category}</span></div>
    <div style="padding:16px 20px;font-weight:700;color:#558B2F;font-size:17px">${it.app.title}</div></div>`;
};

const sheets = {
  R1: page("R1 아이콘 L판 512 (흰 바탕)", `<div class="row">${items.map((it) => cell(`<img src="${it.uri("icon-512.png")}" width="512">`, it.slug)).join("")}</div>`),
  R2: page("R2 아이콘 L판 180 (apple-touch, 모서리 0)", `<div class="row">${items.map((it) => cell(`<img src="${it.uri("icon-180.png")}" width="180">`, it.slug)).join("")}</div>`),
  R3: page("R3 아이콘 S판 32 — 실제 크기 탭 + 8배 확대", [false, true].map((dark) =>
    `<div class="row">${items.map((it) => cell(`${tab(it, 32, dark)}<div style="background:${dark ? "#35363A" : "#FFFFFF"};padding:8px;margin-top:8px;display:inline-block"><img src="${it.uri("icon-32.png")}" width="256" class="px"></div>`, `${it.slug} ${dark ? "어두운 탭" : "밝은 탭"}`)).join("")}</div>`).join("")),
  R4: page("R4 아이콘 S판 16 — 실제 크기 탭 + 8배 확대", [false, true].map((dark) =>
    `<div class="row">${items.map((it) => cell(`${tab(it, 16, dark)}<div style="background:${dark ? "#35363A" : "#FFFFFF"};padding:8px;margin-top:8px;display:inline-block"><img src="${it.uri("icon-16.png")}" width="128" class="px"></div>`, `${it.slug} ${dark ? "어두운 탭" : "밝은 탭"}`)).join("")}</div>`).join("")),
  R5: page("R5 앱뜰 카드 300×158", `<div class="row" style="background:#FAFAF5;padding:24px">${items.map(card).join("")}</div>`),
  R6: page("R6 카카오톡 링크 미리보기 260×136", `<div class="row" style="background:#BACEE0;padding:24px">${items.map((it) =>
    `<div style="width:260px;background:#fff;border-radius:12px;overflow:hidden"><img src="${it.uri("og-1200x630.png")}" style="width:260px;height:136px;object-fit:cover;display:block">
      <div style="padding:10px 12px"><div style="font-size:14px;font-weight:700">${it.app.title}</div><div style="font-size:12px;color:#888;margin-top:4px">${new URL(it.app.url.startsWith("http") ? it.app.url : "https://" + it.app.url).host}</div></div></div>`).join("")}</div>`),
  R7: page("R7 와이드 원본 + 가운데 630×630", items.map((it) =>
    `<div class="row">${cell(`<img src="${it.uri("og-1200x630.png")}" width="1200">`, `${it.slug} 1200×630`)}${cell(`<div style="width:630px;height:630px;overflow:hidden"><img src="${it.uri("og-1200x630.png")}" width="1200" style="margin-left:-285px"></div>`, "가운데 630")}</div>`).join("")),
};
const r8body = `<div class="row">${items.map((it) => cell(`<img src="${it.uri("icon-512.png")}" width="64">`, it.slug)).join("")}</div><div class="row">${items.map(card).join("")}</div>`;
sheets.R8 = page("R8 나란히 비교: 원본 / 흑백 / 녹색약",
  `<div>${r8body}</div><div style="filter:grayscale(1)">${r8body}</div><div style="filter:url(#deut)">${r8body}</div>`);

// W1~W6 와이드 장면 (9-7)
const wideUri = (svgText) => `data:image/png;base64,${Buffer.from(new Resvg(svgText, { fitTo: { mode: "width", value: 1200 } }).render().asPng()).toString("base64")}`;
const cardAt = (it, uri, k) => {
  const [bg, fg] = BADGE[it.app.category] || ["#eee", "#555"];
  return `<div style="flex-shrink:0;width:${300 * k}px;border-radius:${16 * k}px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1);background:#fff">
    <div style="position:relative;aspect-ratio:1200/630"><img src="${uri}" style="width:100%;height:100%;display:block">
      <span style="position:absolute;top:${12 * k}px;right:${12 * k}px;padding:${4 * k}px ${12 * k}px;border-radius:999px;font-size:${12 * k}px;font-weight:600;background:${bg};color:${fg}">#${it.app.category}</span></div>
    <div style="padding:${14 * k}px ${18 * k}px;font-weight:700;color:#558B2F;font-size:${16 * k}px">${it.app.title}</div></div>`;
};
const w1 = items.map((it) => cell(`<img src="${it.uri("og-1200x630.png")}" width="1200">`, it.slug)).join("");
sheets.W1 = page("W1 와이드 원본 3장", `<div style="display:flex;flex-direction:column;gap:16px">${w1}</div>`);
sheets.W2 = page("W2 앱뜰 카드 1배 / 2배", `<div class="row" style="background:#FAFAF5;padding:24px">${items.map((it) => cardAt(it, it.uri("og-1200x630.png"), 1)).join("")}</div>
  <div class="row" style="background:#FAFAF5;padding:24px;flex-wrap:wrap">${items.map((it) => cardAt(it, it.uri("og-1200x630.png"), 2)).join("")}</div>`);
sheets.W3 = sheets.R6.replace("R6 카카오톡 링크 미리보기 260×136", "W3 카카오톡 링크 미리보기 260×136");
sheets.W4 = page("W4 와이드 흑백", `<div style="display:flex;flex-direction:column;gap:16px;filter:grayscale(1)">${w1}</div>`);
sheets.W5 = page("W5 가운데 630×630 (소품 없이도 성립하는가)", `<div class="row">${items.map((it) => cell(`<div style="width:315px;height:315px;overflow:hidden"><img src="${it.uri("og-1200x630.png")}" width="600" style="margin-left:-142.5px"></div>`, it.slug)).join("")}</div>`);
sheets.W6 = page("W6 바꿔 끼운 판 — 어색해 보여야 정체성 합격", `<div class="row" style="flex-wrap:wrap">${items.map((it, i) => {
  const other = items[(i - 1 + items.length) % items.length];
  return cell(`<img src="${wideUri(compose(it.slug, other.slug).wide)}" width="600">`, `${it.slug} 꽃 + ${other.slug} 소품`);
}).join("")}</div>`);

// W7 소품 블러: 카드 1배 크기(소품 칸 240 → 48px)로 줄였다가 4배 확대 + 흐린 판. 글자·과녁·그래프로 읽히면 실패
const propPng = (slug, side) => {
  const src = readFileSync(join(ROOT, "props", `${slug}.svg`), "utf8");
  const vb = side === "left" ? "0 0 240 240" : "240 0 240 240";
  const body = src.slice(src.indexOf(">", src.indexOf("<svg")) + 1, src.lastIndexOf("</svg>"));
  const svgText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="240" height="240"><rect x="-1000" y="-1000" width="3000" height="3000" fill="#EEE7D4"/>${body}</svg>`;
  return `data:image/png;base64,${Buffer.from(new Resvg(svgText, { fitTo: { mode: "width", value: 48 } }).render().asPng()).toString("base64")}`;
};
const withProps = items.filter((it) => existsSync(join(ROOT, "props", `${it.slug}.svg`)));
sheets.W7 = page("W7 소품 블러 (카드 1배 → 4배 확대 / 흐림) — 글자·과녁·그래프로 읽히면 실패", `<div class="row" style="flex-wrap:wrap">${withProps.flatMap((it) => ["left", "right"].map((side) => {
  const u = propPng(it.slug, side);
  return cell(`<div style="display:flex;gap:8px;align-items:flex-start"><img src="${u}" width="48"><img src="${u}" width="192" class="px"><img src="${u}" width="192" class="px" style="filter:blur(5px)"></div>`, `${it.slug} ${side}`);
})).join("")}</div>`);

// R9 블러 시험: 실눈으로 본 것처럼 흐리게 해서 얼굴·나비 같은 엉뚱한 형태로 읽히는지 본다
sheets.R9 = page("R9 블러 시험 (32·16px 확대 후 흐림) — 얼굴·가면·나비로 읽히면 실패", [[32, 256, 6], [16, 128, 4]].map(([size, w, blur]) =>
  `<div class="row">${items.map((it) => cell(`<img src="${it.uri(`icon-${size}.png`)}" width="${w}" class="px" style="filter:blur(${blur}px)">`, `${it.slug} ${size}px`)).join("")}</div>`).join(""));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 800 }, deviceScaleFactor: 1 });
for (const [name, html] of Object.entries(sheets)) {
  const p = await ctx.newPage();
  await p.setContent(html, { waitUntil: "load" });
  await p.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
  await p.close();
  console.log(join(OUT, `${name}.png`));
}
await browser.close();
