// 앱뜰 갤러리 STEAM 정리: 「4학년 STEAM 클럽」 카드 1장을 더하고, 클럽에 들어 있는 개별 카드 10장을 내린다.
// 기본은 미리보기. --apply 때만 바꾼다. 내리기 전에 10장의 모든 칸을 백업한다(썸네일 파일은 지우지 않는다).
//   node steam-consolidate.mjs <appTteulDir> [--apply]
//   node steam-consolidate.mjs <appTteulDir> --restore <backup.json> [--apply]   → 내린 카드를 다시 넣는다(id는 새로 붙는다)
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [ROOT, ...args] = process.argv.slice(2);
const apply = args.includes("--apply");
const restoreFile = args.includes("--restore") ? args[args.indexOf("--restore") + 1] : null;
const env = Object.fromEntries(readFileSync(join(ROOT, ".env.local"), "utf8").split(/\r?\n/)
  .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]));
const URL_ = env.SUPABASE_URL, KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) throw new Error(".env.local에 SUPABASE_URL·SUPABASE_SERVICE_ROLE_KEY가 없습니다");
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const api = async (path, init = {}) => {
  const res = await fetch(`${URL_}${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
};
const JSONH = { "Content-Type": "application/json", Prefer: "return=representation" };

if (restoreFile) {
  const rows = JSON.parse(readFileSync(restoreFile, "utf8"));
  for (const r of rows) {
    const { id, created_at, ...rest } = r;
    console.log(`${apply ? "되살림" : "(미리보기) 되살릴 것"}: [옛 id ${id}] ${r.title}`);
    if (apply) await api("/rest/v1/apps", { method: "POST", headers: JSONH, body: JSON.stringify(rest) });
  }
  process.exit(0);
}

// 클럽 사이트(index.html)에 링크된 게임 10개 — 갤러리 id와 주소가 둘 다 맞아야 내린다
const TAKE_DOWN = {
  21: "steam-angle.vercel.app", 24: "sensor-vibe.vercel.app", 27: "steam-push.vercel.app", 28: "steam-graph.vercel.app",
  30: "steam-4-1-push.vercel.app", 32: "steam-rules.vercel.app", 40: "steam-economic-game.vercel.app",
  52: "steam-fraction-game.vercel.app", 57: "steam-triangle-game.vercel.app", 64: "steam-decimal-20261026.vercel.app",
};
const CLUB = {
  title: "4학년 STEAM 클럽",
  description: "4학년이 기획하고 디버깅한 STEAM 게임 모음. 수학 7개 단원과 사회·센서 활동에서 만든 게임을 한곳에서 해 볼 수 있습니다.",
  url: "https://steam-club-2026.vercel.app/",
  category: "교과",
  tags: ["STEAM", "수학", "게임", "학생 기획", "4학년"],
};
const OG = args.find((a) => a.endsWith(".png"));

const rows = await api("/rest/v1/apps?select=*&order=id");
const targets = rows.filter((r) => r.id in TAKE_DOWN);
const bad = targets.filter((r) => !r.url.includes(TAKE_DOWN[r.id]));
if (targets.length !== 10 || bad.length) throw new Error(`대상 확인 실패: ${targets.length}개 찾음, 주소 불일치 ${bad.map((r) => r.id).join(",")}`);
for (const r of targets) console.log(`${apply ? "내림" : "(미리보기) 내릴 것"}: [${r.id}] ${r.title}  ${r.url}`);
const exists = rows.find((r) => r.url.includes("steam-club-2026"));
console.log(exists ? `클럽 카드 이미 있음: [${exists.id}] — 새로 넣지 않음` : `${apply ? "추가" : "(미리보기) 추가할 것"}: ${CLUB.title}  ${CLUB.url}`);
if (!apply) { console.log(`\n미리보기입니다. 갤러리 ${rows.length}개 → ${rows.length - 10 + (exists ? 0 : 1)}개`); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backup = join(ROOT, "brand", "out", `backup-steam-cards-${stamp}.json`);
writeFileSync(backup, JSON.stringify(targets, null, 1));
console.log(`백업: ${backup}`);

if (!exists) {
  const path = `brand/steam-club-2026-${stamp.slice(0, 10).replace(/-/g, "")}.png`;
  await api(`/storage/v1/object/thumbnails/${path}`, {
    method: "POST", headers: { "Content-Type": "image/png", "x-upsert": "true", "Cache-Control": "max-age=31536000" }, body: readFileSync(OG),
  });
  const [row] = await api("/rest/v1/apps", { method: "POST", headers: JSONH, body: JSON.stringify({ ...CLUB, thumbnail: `${URL_}/storage/v1/object/public/thumbnails/${path}` }) });
  console.log(`추가 완료: [${row.id}] ${row.title}`);
}
await api(`/rest/v1/apps?id=in.(${Object.keys(TAKE_DOWN).join(",")})`, { method: "DELETE", headers: JSONH });
const after = await api("/rest/v1/apps?select=id&order=id");
console.log(`내림 완료. 갤러리 ${rows.length}개 → ${after.length}개`);
console.log(`되살리려면: node steam-consolidate.mjs <appTteulDir> --restore "${backup}" --apply`);
