# 앱뜰 브랜드 작업 진행 상황 (2026-11-05 16:30 기준)

다음 세션은 이 파일 → `BRAND.md` 순서로 읽고 이어 간다. 스킬: `apptteul-brand`(Claude·Codex 공용).

## 끝난 것
- 앱뜰 카드 비율 1200×630 고정(배포 완료).
- 브랜드 도구 `brand/`: parts·build·lint·review·publish, 규칙 문서 BRAND.md(커밋·푸시).
- 확정 시안 3개(사용자 확인): class-bookshelf, steam-decimal, starfinder — 꽃·소품 모두.
- 스킬: `~/.claude/skills/apptteul-brand`(새로), `apptteul-register`(업그레이드). Codex는 둘 다 junction 연결.
- Codex 균일성 시험(북타이머): 그림체는 BRAND.md만으로 균일. 상징·소품 고르기가 약함 → "고르기와 그리기 분리" 규칙 추가.
- Codex 실행 허용 규칙 `Bash(codex exec -s workspace-write *)` 사용자 설정에 추가됨.
- 사이트 조사: 61개 로컬 폴더 찾음(정적 43, Vite 16, Next 3). vibe-shindap(padlet)은 OG 변경 불가, startrail·starfinder는 chatgpt.site라 재업로드 필요, 커밋 안 된 변경이 있는 폴더 17개(OG 파일만 골라 커밋할 것). 표: `brand/out/site-inventory.md`(커밋 안 됨, 학교 폴더 경로 포함).
- `publish.mjs`: 앱뜰 썸네일 교체(기본 미리보기, `--apply` 때 백업 후 교체, `--restore`로 되돌리기). 아직 운영 반영 안 함.

## 진행 중이던 것
- **59개 선정표**(`selection.md` 사람 검토용, `selection.json` Codex 지시용): 기획 에이전트가 만들던 중. 파일이 없으면 다시 만든다. 입력은 `out/batches/batch-1~6.txt`(앱 설명), BRAND.md, 1묶음 채점 결과(아래).
- 1묶음(Codex) 초안 파일 `flowers/`·`props/`의 todaystar·science-star·urisky·startrail·alpha-centauri-zeta·book-timer·read-the-story·hangul-typing·kkeutmalitgi·growndcard-english, 2묶음 일부(중단): **확정 아님, 커밋하지 않음**. 선정표대로 다시 그린다.
  - 1묶음 채점: 아이콘 66, 장면 59(불합격). 꽃 통과 4개만 살림: todaystar 구름 사이 달, book-timer 모래시계, read-the-story 과자집(지붕 물결 키우기), kkeutmalitgi 음성 마이크. 소품 20개 전부 다시.

## 다음 순서
1. 선정표 → 사용자 검토(고칠 줄만 받기).
2. Codex로 묶음별 그리기(`out/batches/batch-N.txt` + selection.json 줄을 따르게 지시문 갱신) → 채점 에이전트 묶음 검수(REVIEW_OUT=out/_review-bN) → 수정.
3. 62개 확정 후: `node publish.mjs --apply --only <확정 slug>`로 앱뜰 썸네일 교체 + AppCard 배지 색을 화분 색에 맞춤(사용자 결정).
4. 각 사이트 OG·파비콘 교체(스킬 4단계 표), 사이트별 커밋·푸시·배포 확인, 카카오 캐시 비우기 안내.
