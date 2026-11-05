# 앱뜰 브랜드 작업 진행 상황 (2026-11-05 19:00 기준)

다음 세션은 이 파일 → `BRAND.md` 순서로 읽고 이어 간다. 스킬: `apptteul-brand`(Claude·Codex 공용).

## ★ 2026-11-05 밤 — 최신 방향: "큰 꽃 + 꽃 안 그림" (사용자 제안, 시안 검토 중)
- 아래 Phosphor 시제품 6개(줄기 위에 사물을 꽂는 방식)는 사용자가 "엄청 이상하다"고 함 → 보류.
- 사용자 제안: **모든 앱이 같은 큰 꽃(꽃잎 8장)을 쓰고, 가운데 동그란 크림색 판 안에 앱 그림을 넣는다.** 꽃잎 색만 앱마다 다르다.
- 시안 3개(책장·별 찾기·끝말잇기): `out/_mock-bigflower/mock-1.png`, 만든 코드 `out/_mock-bigflower/mock-flower.mjs`
  (brand 폴더에서 `node out/_mock-bigflower/mock-flower.mjs . out/_mock-bigflower/mock-1.png`). 프로젝트 코드(build·lint·parts)는 아직 안 바꿈.
- 시안에서 본 것: 62개가 한 가족처럼 보이고 줄기 어색함이 사라짐. 고칠 점 — ① 끝말잇기 `link-simple` fill 아이콘은 네모 버튼처럼 보임(다른 아이콘으로) ② 32px 이하에서는 가운데 그림이 안 보임(S판은 따로 정해야) ③ 좌우 소품은 시안에서 뺐음(원경 화분) — 넣을지 사용자에게 물을 것.
- **OG 배치 제안(사용자): 꽃을 왼쪽으로, 오른쪽에 앱 이름.** 시안 `out/_mock-bigflower/mock-og.png`(코드 `mock-og.mjs`). 해·원경 화분은 뺌, 글꼴 나눔스퀘어 네오 ExtraBold(사용자 글꼴 폴더 — 운영 빌드엔 brand/에 글꼴 파일을 넣어야 함), 가운뎃점(·)에서 줄바꿈, 2줄(96→64) 안 되면 3줄(64→52). 짧은 이름은 카드 크기에서도 잘 읽힘. 21자 같은 긴 이름은 3줄로 작아짐 → 썸네일용 짧은 이름 칸(apps.json) 둘지 사용자에게 물을 것. BRAND.md 금지 3(그림 속 글자)과 부딪치므로 "OG 오른쪽 이름 한 곳만 허용"으로 규칙 고쳐야 함. 정방형 아이콘에는 이름 넣지 않음.
- 사용자: 나눔스퀘어 네오가 어색함 → 글꼴 비교 시트 `out/_mock-bigflower/mock-font.png`(나눔스퀘어 네오·프리텐다드 Bold/SemiBold·본고딕·KoPub 돋움·서울남산체, 자간 -2%). **사용자 선택: A. 프리텐다드 Bold, 자간 -2%**(C 본고딕을 골랐다가 A로 바꿈). OFL — 실제 빌드 땐 brand/fonts/에 Pretendard-Bold.ttf를 넣어 쓴다(사용자 글꼴 폴더 `%LOCALAPPDATA%\Microsoft\Windows\Fonts`에 있음).
- 사용자 규칙: **이름은 최대 두 줄, 세 줄 금지.** 시안 기준 14자(띄어쓰기·가운뎃점 제외) 이하이고 64px 이상으로 두 줄에 들어가야 함. 못 들어가는 4개(`mock-font-long-titles.txt`): artlens(가운뎃점 2개라 3줄), ai-region-drawing, science-star, nextyear → **썸네일용 짧은 이름 확정: artlens「미술 감상 프로젝트」, science-star「우주 탐험대」, nextyear「학사일정」(사용자), ai-region-drawing「AI 영역 그리기」(사용자가 Claude에게 맡김).** apps.json에 짧은 이름 칸을 만들어 넣을 것(칸 이름은 구현 때 제안). 시안 `out/_mock-bigflower/mock-v3-short.png`. 줄 나눔: 가운뎃점 없고 72px 이상으로 한 줄에 들어가면 한 줄, 아니면 두 줄(96→64). 시안의 끝말잇기 `chats-circle`은 말풍선이라 BRAND 금지 7 — 실제 작업 땐 다른 그림.
- **2026-11-05 21시 이름 규칙 변경(사용자, 위 "최대 두 줄"을 대신함):** 글씨 96px 고정, 넘치면 띄어쓰기에서 줄바꿈, 최대 3줄, 3줄로도 안 되면 글씨를 4px씩 줄임. 14자 제한 없앰. `build.mjs` fitTitle·`lint.mjs` 반영(커밋 전). 62개 결과: 3줄 7개, 글씨가 줄어드는 앱 2개(서울교육룰렛·별길 88px, 검사기 경고). 짧은 이름 4개는 그대로(우주 탐험대·학사일정은 원래 이름이면 88·60px로 줄어듦).
- **2026-11-06 08:10 갤러리 나머지 33장도 큰 꽃 썸네일로 교체(운영 적용, 사용자 요청) → 갤러리 53장 전부 새 방식.** 백업 `brand/out/backup-apps-2026-11-05T23-10-41-764Z.json`, 되돌리기 `node publish.mjs --restore out/backup-apps-2026-11-05T23-10-41-764Z.json --apply`. 시안 시트: 샘메이드 폴더 `시안/13-갤러리-나머지33.png`. 서울교육룰렛 그림(chart-pie-slice)은 통계 그래프처럼 보여 바꿀지 사용자에게 묻는 중. STEAM 클럽은 조이스틱 → 게임패드(game-controller, F-CORAL)로 brand에 추가(apps.json·flowers.json 63개).
- **2026-11-06 각 앱 사이트 파비콘·OG 교체 21개 완료**(샘메이드 20개 + STEAM 클럽): 정적은 루트/assets, Vite는 public/, PWA(별볼일·끝말잇기)는 manifest 아이콘·maskable까지, KNN은 game.html 전용 아이콘(game-*.png/svg/ico), 그라운드 인형뽑기는 arcade/art 원본 + web/public 배포본 둘 다. 옛 OG는 *-old.png. 실제 사이트에서 파일 해시 대조 완료.
- **2026-11-05 22:04 갤러리 STEAM 정리(운영 적용, 사용자 결정):** 「4학년 STEAM 클럽」(steam-club-2026.vercel.app) 카드 [66] 추가, 클럽에 들어 있는 개별 카드 10장(id 21·24·27·28·30·32·40·52·57·64) 내림 → 62개에서 53개. 「해산물과 소고기의 게임 공방」은 그대로 둠. 백업 `brand/out/backup-steam-cards-2026-11-05T13-04-42-364Z.json`(10장 모든 칸, 썸네일 파일은 안 지움), 되살리기 `node brand/steam-consolidate.mjs . --restore <백업> --apply`(id는 새로 붙음). brand/apps.json·flowers.json은 아직 62개 그대로(내린 10개 남아 있고 클럽 없음) — 정리 필요. 클럽 랜딩 아이콘이 grownd-minigame과 같은 joystick이라 lint 중복 규칙과 부딪침 → 둘 중 하나 그림 바꿀 것.
- **2026-11-05 21:44 앱뜰 갤러리 썸네일 교체(운영 적용):** 샘메이드 등록용으로 고른 20개만(`--only`). 나머지 42개는 out/에 옛 초안이 남아 있을 수 있으니 publish.mjs를 `--only` 없이 돌리지 말 것. 백업 `brand/out/backup-apps-2026-11-05T12-44-43-097Z.json`, 되돌리기 `node publish.mjs --restore out/backup-apps-2026-11-05T12-44-43-097Z.json --apply`. 운영 화면에서 20개 모두 로드 확인. 20개: class-bookshelf nextyear read-the-story urisky grownd-claw drawing-worlds science-star milk-check moving-drawings todaystar hangul-typing knn-lab kkeutmalitgi shindap-rullet grownd-minigame book-timer guess-game contour-line musicandmath class-division. 각 앱 사이트의 파비콘·OG는 아직 옛것.
- **2026-11-05 21시 작은 아이콘(S판) 변경(사용자, 위 ② 해결):** 16·32·48·favicon.svg는 꽃 없이 꽃잎 색 둥근 타일에 크림색 그림만 크게. 비교 시안(A 꽃 전체·B 그림만·C 큰 판)에서 B 선택. 180 이상·OG는 꽃 그대로. build.mjs·BRAND.md·스킬 반영.
- 2026-11-05 21시 lint.mjs 메모리 폭주 수정: coverage()가 반복문 안에서 resvg `.pixels`(꺼낼 때마다 새 버퍼)를 불러 node가 50GB까지 커져 세션이 연달아 꺼졌음. 한 번만 꺼내게 고침.
- 다음: 사용자 시안 확인 → 꽃잎 모양·색, 가운데 그림(Phosphor fill 판), 소품 유무 결정 → BRAND.md·build.mjs·lint.mjs를 새 방식으로 고치기(먼저 제안하고 진행).
- 커밋 안 된 것: `icons.mjs`·`icon-specs/`·lint 변경·`flowers/`·`props/` 62개(Codex 초안 + Phosphor 시제품). 확정 아님 — 새 방식이 정해지면 정리.

## 끝난 것
- 앱뜰 카드 비율 1200×630 고정(배포 완료).
- 브랜드 도구 `brand/`: parts·build·lint·review·publish, 규칙 문서 BRAND.md(커밋·푸시).
- 확정 시안 3개(사용자 확인): class-bookshelf, steam-decimal, starfinder — 꽃·소품 모두.
- 스킬: `~/.claude/skills/apptteul-brand`(새로), `apptteul-register`(업그레이드). Codex는 둘 다 junction 연결.
- Codex 균일성 시험(북타이머): 그림체는 BRAND.md만으로 균일. 상징·소품 고르기가 약함 → "고르기와 그리기 분리" 규칙 추가.
- Codex 실행 허용 규칙 `Bash(codex exec -s workspace-write *)` 사용자 설정에 추가됨.
- 사이트 조사: 61개 로컬 폴더 찾음(정적 43, Vite 16, Next 3). vibe-shindap(padlet)은 OG 변경 불가, startrail·starfinder는 chatgpt.site라 재업로드 필요, 커밋 안 된 변경이 있는 폴더 17개(OG 파일만 골라 커밋할 것). 표: `brand/out/site-inventory.md`(커밋 안 됨, 로컬 폴더 경로 포함).
- `publish.mjs`: 앱뜰 썸네일 교체(기본 미리보기, `--apply` 때 백업 후 교체, `--restore`로 되돌리기). 아직 운영 반영 안 함.

## 진행 중이던 것
- **59개 선정표**(`selection.md` 사람 검토용, `selection.json` Codex 지시용): 기획 에이전트가 만들던 중. 파일이 없으면 다시 만든다. 입력은 `out/batches/batch-1~6.txt`(앱 설명), BRAND.md, 1묶음 채점 결과(아래).
- 1묶음(Codex) 초안 파일 `flowers/`·`props/`의 todaystar·science-star·urisky·startrail·alpha-centauri-zeta·book-timer·read-the-story·hangul-typing·kkeutmalitgi·growndcard-english, 2묶음 일부(중단): **확정 아님, 커밋하지 않음**. 선정표대로 다시 그린다.
  - 1묶음 채점: 아이콘 66, 장면 59(불합격). 꽃 통과 4개만 살림: todaystar 구름 사이 달, book-timer 모래시계, read-the-story 과자집(지붕 물결 키우기), kkeutmalitgi 음성 마이크. 소품 20개 전부 다시.


## 2026-11-05 저녁 — 그리는 방식 전환 (사용자 결정)
- 선정표 59개 확정(`selection.json`·`selection.md`, Codex 6묶음 선정 → 통합 → 사용자 방향 8개 반영).
- 선정표대로 Codex가 그린 1묶음도 채점 70/66(합격 1/10): 규칙은 지키지만 "알아보게 그리기"가 안 됨.
- **사용자 결정: 아이콘 세트 기반으로 전환.** Phosphor Icons(MIT, `@phosphor-icons/core`)의 bold 윤곽 + duotone 배경을 우리 팔레트·화분·뜰에 얹는다.
  - 변환기 `icons.mjs` + 명세 `icon-specs/*.json`(앱별 아이콘 이름·색). 시제품 6개(`icon-specs/proto.json`: 확정 3개 포함).
  - 손으로 그린 확정 3개 원본은 `out/_backup-custom/`에 보관.
  - lint는 아이콘 기반(`data-source="phosphor:…"`)이면 폭·무게중심·접합부·떠 있는 요소를 참고로만 본다.
- 다음: 시제품 6개 사용자 확인 → 59개 아이콘 매핑(선정표 사물 → Phosphor 이름) → 묶음 검수 → 운영 반영.

## 다음 순서
1. 선정표 → 사용자 검토(고칠 줄만 받기).
2. Codex로 묶음별 그리기(`out/batches/batch-N.txt` + selection.json 줄을 따르게 지시문 갱신) → 채점 에이전트 묶음 검수(REVIEW_OUT=out/_review-bN) → 수정.
3. 62개 확정 후: `node publish.mjs --apply --only <확정 slug>`로 앱뜰 썸네일 교체 + AppCard 배지 색을 화분 색에 맞춤(사용자 결정).
4. 각 사이트 OG·파비콘 교체(스킬 4단계 표), 사이트별 커밋·푸시·배포 확인, 카카오 캐시 비우기 안내.
