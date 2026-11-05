// 앱뜰 갤러리 썸네일을 브랜드 그림(out/<slug>/og-1200x630.png)으로 바꾼다.
// 운영 데이터(Supabase apps 표)를 건드리므로 기본은 미리보기만 한다.
//   node publish.mjs                     → 무엇이 바뀔지 보여 주기만 (dry-run)
//   node publish.mjs --apply             → 백업 후 실제로 올리고 바꾼다
//   node publish.mjs --apply --only a,b  → 지정한 slug만
//   node publish.mjs --restore out/backup-apps-….json  → 백업의 썸네일 주소로 되돌린다
// 옛 썸네일 파일은 지우지 않는다(되돌리기용). 새 파일은 thumbnails/brand/<slug>-<날짜>.png
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const BUCKET = "thumbnails";

const env = Object.fromEntries(
  readFileSync(join(ROOT, "..", ".env.local"), "utf8").split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
);
const URL_ = env.SUPABASE_URL, KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) throw new Error(".env.local에 SUPABASE_URL·SUPABASE_SERVICE_ROLE_KEY가 없습니다");
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
const restoreFile = args.includes("--restore") ? args[args.indexOf("--restore") + 1] : null;

const api = async (path, init = {}) => {
  const res = await fetch(`${URL_}${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
};
const publicUrl = (path) => `${URL_}/storage/v1/object/public/${BUCKET}/${path}`;
const setThumbnail = (id, thumbnail) => api(`/rest/v1/apps?id=eq.${id}`, {
  method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ thumbnail }),
});

const rows = await api("/rest/v1/apps?select=id,title,thumbnail&order=id");

if (restoreFile) {
  const backup = JSON.parse(readFileSync(join(ROOT, restoreFile), "utf8"));
  for (const b of backup) {
    const now = rows.find((r) => r.id === b.id);
    if (!now || now.thumbnail === b.thumbnail) continue;
    console.log(`${apply ? "되돌림" : "(미리보기) 되돌릴 것"}: [${b.id}] ${b.title}`);
    if (apply) await setThumbnail(b.id, b.thumbnail);
  }
  process.exit(0);
}

const apps = JSON.parse(readFileSync(join(ROOT, "apps.json"), "utf8"));
const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const plan = apps
  .filter((a) => !only || only.includes(a.slug))
  .map((a) => ({ ...a, file: join(ROOT, "out", a.slug, "og-1200x630.png"), row: rows.find((r) => r.id === a.id) }));

let missing = 0;
for (const p of plan) {
  if (!p.row) { console.log(`표에 없음: [${p.id}] ${p.title}`); missing++; continue; }
  if (!existsSync(p.file)) { console.log(`그림 없음(건너뜀): ${p.slug}`); missing++; continue; }
  console.log(`${apply ? "교체" : "(미리보기)"}: [${p.id}] ${p.title}  ←  brand/${p.slug}-${stamp}.png`);
}
if (!apply) {
  console.log(`\n미리보기입니다. 실제로 바꾸려면 --apply 를 붙이세요. (대상 ${plan.length - missing}개, 건너뜀 ${missing}개)`);
  process.exit(0);
}

// 백업 먼저
const backupPath = join("out", `backup-apps-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
writeFileSync(join(ROOT, backupPath), JSON.stringify(rows, null, 1));
console.log(`백업: brand/${backupPath}`);

for (const p of plan) {
  if (!p.row || !existsSync(p.file)) continue;
  const path = `brand/${p.slug}-${stamp}.png`;
  await api(`/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST", headers: { "Content-Type": "image/png", "x-upsert": "true", "Cache-Control": "max-age=31536000" }, body: readFileSync(p.file),
  });
  await setThumbnail(p.id, publicUrl(path));
  console.log(`완료: ${p.slug}`);
}
console.log(`되돌리려면: node publish.mjs --restore ${backupPath} --apply`);
