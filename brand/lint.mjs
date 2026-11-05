// 명세 검사기 (2026-11 큰 꽃 방식) — flowers.json이 BRAND.md 규칙을 지키는지 기계로 잰다.
// 누가 고르든(Claude·Codex·사람) 이 검사를 통과해야 브랜드에 들어온다.
//   node lint.mjs                 → 전부
//   node lint.mjs starfinder ...  → 지정한 slug만 (겹침 검사는 늘 전체 기준)
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { specs, PETALS, ICONS, iconBody, isCustom, customFile, fitTitle, TITLE_SIZE, MAX_LINES } from "./build.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const apps = JSON.parse(readFileSync(join(ROOT, "apps.json"), "utf8"));

// 쓰지 않는 그림(BRAND.md 2장 금지 목록): UI·로고처럼 읽히는 것, 흔한 사물, 얼굴·사람, 반짝이
const BANNED = [
  [/^(chat|chats)\b/, "말풍선"], [/^(speaker|speaker-)/, "스피커·음량"], [/^wifi/, "와이파이"], [/^rss/, "RSS"],
  [/^house/, "집(홈 버튼)"], [/^bell/, "알림 종"], [/^gear/, "톱니(설정)"], [/^play\b|^play-/, "재생"],
  [/^(monitor|desktop|television|laptop|device|browser|app-window|presentation)/, "화면"],
  [/^rainbow/, "무지개"], [/^rocket/, "로켓"], [/^door/, "문"], [/^megaphone/, "확성기"],
  [/^(file|folder)/, "파일·폴더"], [/^puzzle/, "퍼즐"], [/^dice/, "주사위"], [/^lightbulb/, "전구"], [/^trophy/, "트로피"],
  [/^(smiley|user|users|person|face|baby|student|chalkboard-teacher|robot|cat\b|dog\b|cow\b|alien|ghost|mask)/, "얼굴·사람"],
  [/^(sparkle|star-four|shooting-star-glow)/, "반짝이"], [/-logo$/, "로고"],
  [/^(cursor|hand-pointing|share|link|download|upload|power|sign-in|sign-out)/, "UI 기호"],
];

const only = process.argv.slice(2);
const errors = [], warns = [];
const err = (slug, msg) => errors.push(`${slug}: ${msg}`);
const warn = (slug, msg) => warns.push(`${slug}: ${msg}`);

// 1) 앱 목록과 명세가 1:1인가
const specSlugs = new Set(specs.map((s) => s.slug));
for (const a of apps) if (!specSlugs.has(a.slug)) err(a.slug, "flowers.json에 없음");
for (const s of specs) if (!apps.some((a) => a.slug === s.slug)) err(s.slug, "apps.json에 없는 slug");

// 2) 그림 겹침(전체 기준)
const byIcon = new Map();
for (const s of specs) byIcon.set(s.icon, [...(byIcon.get(s.icon) || []), s.slug]);
for (const [icon, slugs] of byIcon) if (slugs.length > 1) err(slugs.join(","), `같은 그림 ${icon}을 함께 씀 — 앱마다 달라야 한다`);

// 그림이 가운데 판(지름 128 중 92 칸)을 얼마나 채우는가 — 너무 가늘면 작은 크기에서 사라진다
const coverage = (icon) => {
  // pixels는 꺼낼 때마다 새 버퍼를 만든다 — 반복문 안에서 부르면 메모리가 수십 GB까지 불어 컴퓨터가 멈춘다. 한 번만 꺼낼 것
  const px = new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="128" height="128"><g fill="#000">${iconBody(icon)}</g></svg>`, { font: { loadSystemFonts: false } }).render().pixels;
  let n = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > 127) n++;
  return n / (128 * 128);
};

for (const s of specs) {
  if (only.length && !only.includes(s.slug)) continue;
  const app = apps.find((a) => a.slug === s.slug);
  if (!s.icon) { err(s.slug, "icon이 없음"); continue; }
  const custom = isCustom(s.icon);
  if (!custom && !existsSync(join(ICONS, `${s.icon}-fill.svg`))) { err(s.slug, `아이콘 ${s.icon}이 Phosphor fill에도 icons/에도 없음`); continue; }
  if (!PETALS.includes(s.petal)) err(s.slug, `꽃잎 색 ${s.petal}은 쓸 수 없음 — ${PETALS.join("·")} 중 하나`);
  if (!s.name) warn(s.slug, "name(그림 이름, 한국어)이 비어 있음");
  if (!custom) for (const [re, why] of BANNED) if (re.test(s.icon)) err(s.slug, `${s.icon} — 금지 그림(${why})`);
  if (custom) {
    // 직접 그린 그림: 색은 자리표시자 두 가지만, 글자는 윤곽(path)으로, 래스터·효과 금지 (BRAND.md 4-4)
    const src = readFileSync(customFile(s.icon), "utf8");
    if (/(fill|stroke)="#/i.test(src)) err(s.slug, `icons/${s.icon}.svg — 색을 직접 적음. {INK}·{CREAM}만 쓸 것`);
    if (/<text\b/.test(src)) err(s.slug, `icons/${s.icon}.svg — <text> 금지. 글자는 윤곽(path)으로 바꿀 것(favicon.svg에서 글꼴이 없다)`);
    if (/<(image|filter|linearGradient|radialGradient)\b|opacity=/.test(src)) err(s.slug, `icons/${s.icon}.svg — 래스터·필터·그라디언트·투명도 금지`);
    if (!/viewBox="0 0 256 256"/.test(src)) err(s.slug, `icons/${s.icon}.svg — viewBox는 0 0 256 256`);
  }
  if (s.allow) console.log(`예외  ${s.slug}: ${s.allow}`);
  const c = coverage(s.icon);
  if (c < 0.12) warn(s.slug, `${s.icon} 그림이 가늘다(채움 ${(c * 100).toFixed(0)}%) — 32px에서 사라질 수 있다`);
  // 이름: 96px 고정, 최대 3줄. 3줄로도 안 들어가 글씨를 줄였으면 알려 준다
  const title = s.ogTitle || app?.title || "";
  const fit = fitTitle(title);
  if (!fit) err(s.slug, `이름 「${title}」이 가운뎃점 때문에 ${MAX_LINES}줄을 넘음 — ogTitle(짧은 이름)을 적을 것`);
  else if (fit.size < TITLE_SIZE) warn(s.slug, `이름 「${title}」이 ${MAX_LINES}줄로도 안 들어가 ${fit.size}px로 줄어듦 — 짧은 이름(ogTitle)을 검토`);
}

for (const w of warns) console.log(`경고  ${w}`);
for (const e of errors) console.log(`오류  ${e}`);
console.log(`\n검사 ${only.length || specs.length}개 — 오류 ${errors.length}, 경고 ${warns.length}`);
if (errors.length) process.exitCode = 1;
