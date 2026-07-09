"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AppGallery from "@/components/AppGallery";
import Footer from "@/components/Footer";
import PolicyModal from "@/components/PolicyModal";
import VibeShindap, { VibeItem } from "@/components/VibeShindap";
import { AppData } from "@/components/AppCard";

type TabType = "official" | "vibe";

const apps: AppData[] = [
  {
    id: 1,
    title: "AI 옷 바꾸기",
    description:
      "AI를 활용해 옷 스타일을 바꿔 보고 피팅 시뮬레이션처럼 활용할 수 있는 앱입니다.",
    thumbnail: "/ai_style_changer_thumbnail.png",
    url: "https://germany-change-clothes.vercel.app/",
    category: "교과",
    tags: ["AI", "의상", "피팅", "디지털시민성"],
  },
  {
    id: 101,
    title: "미술 감상 · 관찰 · 프롬프트",
    description:
      "작품을 자세히 관찰하고 감상한 뒤 프롬프트 활동까지 이어지는 미술 수업 도구입니다.",
    thumbnail: "/art_observation_prompt_thumbnail.png",
    url: "https://artlens-two.vercel.app/",
    category: "교과",
    tags: ["미술", "감상", "관찰", "프롬프트"],
  },
  {
    id: 102,
    title: "AI Region Drawing App",
    description:
      "영역을 지정해 원하는 부분별로 이미지를 생성하는 AI 그림 앱입니다.",
    thumbnail: "/ai_region_drawing_thumbnail.png",
    url: "https://ai-region-based-image-generator.vercel.app/",
    category: "교과",
    tags: ["미술", "AI 이미지", "영역 지정", "창작"],
  },
  {
    id: 103,
    title: "3D AI 민주시민 시뮬레이션",
    description:
      "사회 문제를 3D 환경에서 탐색하고 생각을 확장해 보는 민주시민 활동 앱입니다.",
    thumbnail: "/democracy_simulation_thumbnail.png",
    url: "https://3-d-ai-democracy.vercel.app/",
    category: "교과",
    tags: ["사회", "민주시민", "3D", "토론"],
  },
  {
    id: 104,
    title: "키다리샘 점검표",
    description:
      "기초학력 키다리샘 지도일지를 점검하고 정리하는 운영 도구입니다.",
    thumbnail: "/kidari_checker_thumbnail.png",
    url: "https://kidari-checker.vercel.app/",
    category: "학급운영",
    tags: ["기초학력", "점검", "지도일지", "운영"],
  },
  {
    id: 105,
    title: "분반 작업 도우미",
    description:
      "학생 데이터를 바탕으로 분반 작업을 효율적으로 정리하는 학급 운영 도구입니다.",
    thumbnail: "/class_division_helper_thumbnail.png",
    url: "https://next-class-one.vercel.app/",
    category: "학급운영",
    tags: ["분반", "학급편성", "드래그앤드롭", "운영"],
  },
  {
    id: 106,
    title: "퀴즈맵 생성기",
    description:
      "그라운드 카드용 퀴즈 레이스 맵을 자동 생성하는 제작 도구입니다.",
    thumbnail: "/quiz_map_thumbnail.png",
    url: "https://grownd-meta-qmaker.vercel.app/",
    category: "창체",
    tags: ["그라운드카드", "퀴즈", "맵 생성", "메타버스"],
  },
  {
    id: 107,
    title: "봄·봄·봄",
    description:
      "AI 융합 미술 감상 프로그램으로 살펴봄, 생각해봄, 피워봄 활동을 지원합니다.",
    thumbnail: "/spring_art_thumbnail.png",
    url: "https://stb-eta.vercel.app/",
    category: "교과",
    tags: ["미술", "감상", "AI 융합", "프로그램"],
  },
  {
    id: 108,
    title: "리듬 분수 놀이",
    description:
      "분수 개념을 음악 리듬과 함께 재미있게 익히는 수학 앱입니다.",
    thumbnail: "/rhythm_fraction_thumbnail.png",
    url: "https://musicandmath.vercel.app/",
    category: "교과",
    tags: ["수학", "분수", "음악", "리듬"],
  },
  {
    id: 201,
    title: "등고선 탐험 교실",
    description:
      "등고선과 지형 개념을 활동형 화면으로 익히는 탐구 수업 도구입니다.",
    thumbnail: "/contour_line_thumbnail.png",
    url: "https://contour-line.vercel.app/",
    category: "교과",
    tags: ["사회", "지형", "지도", "탐구"],
  },
  {
    id: 202,
    title: "조 단위 숫자 읽기 퀴즈",
    description:
      "만·억·조 단위 숫자를 한글과 숫자로 오가며 연습하는 수학 퀴즈입니다.",
    thumbnail: "/big_number_thumbnail.png",
    url: "https://bignumber.vercel.app/",
    category: "교과",
    tags: ["수학", "큰수", "수읽기", "퀴즈"],
  },
  {
    id: 203,
    title: "수학 양감 어림 게임",
    description: "양감과 어림 전략을 게임처럼 익히는 수학 활동 앱입니다.",
    thumbnail: "/estimation_game_thumbnail.png",
    url: "https://20251110-guessgame.vercel.app/",
    category: "교과",
    tags: ["수학", "양감", "어림", "게임"],
  },
  {
    id: 204,
    title: "메타인지 유니콘",
    description:
      "오늘 배운 내용을 설명하면 AI가 이해도를 점검해 주는 메타인지 도구입니다.",
    thumbnail: "/metacog_unicorn_thumbnail.png",
    url: "https://metacog-unicorn.vercel.app/",
    category: "학급운영",
    tags: ["메타인지", "설명하기", "AI 피드백", "회고"],
  },
  {
    id: 205,
    title: "GROWND English",
    description:
      "영어 단어를 학습하고 퀴즈로 확인하는 GROWND 연동 학습 도구입니다.",
    thumbnail: "/grownd_english_thumbnail.png",
    url: "https://growndcard-english.vercel.app/",
    category: "교과",
    tags: ["영어", "단어", "퀴즈", "GROWND"],
  },
  {
    id: 206,
    title: "비명 지르는 닭",
    description: "소리를 활용해 닭을 점프시키는 참여형 활동 게임입니다.",
    thumbnail: "/voice_jump_thumbnail.png",
    url: "https://voicejump.vercel.app/",
    category: "창체",
    tags: ["음성", "게임", "참여활동", "점프"],
  },
  {
    id: 207,
    title: "온도 챌린지 - EZMaker",
    description:
      "온도 개념을 챌린지 형식으로 익히는 메이커형 학습 활동입니다.",
    thumbnail: "/ezmaker_temp_thumbnail.png",
    url: "https://ezmaker-temp.vercel.app/",
    category: "교과",
    tags: ["과학", "온도", "메이커", "실험"],
  },
  {
    id: 208,
    title: "디지털 발자국 히어로즈",
    description:
      "디지털 발자국 주제를 쉽고 흥미롭게 다루는 시민성 교육 활동입니다.",
    thumbnail: "/digital_footprint_thumbnail.png",
    url: "https://digitalfootprint-ruby.vercel.app/",
    category: "창체",
    tags: ["디지털 시민성", "정보", "발자국", "활동"],
  },
  {
    id: 209,
    title: "북타이머",
    description:
      "아침 독서 시간을 학생 번호 터치로 기록하고, 공지·시간표·성공 현황까지 한 화면에서 운영할 수 있는 독서 루틴 보드입니다.",
    thumbnail: "/book_timer_thumbnail.png",
    url: "https://book-timer-wine.vercel.app/",
    category: "학급운영",
    tags: ["독서", "아침활동", "타이머", "미션보드"],
  },
  {
    id: 210,
    title: "거북이 학교 보물찾기",
    description:
      "학교 곳곳에 숨겨진 보물을 거북이와 함께 찾아가는 창의적 체험 활동 앱입니다.",
    thumbnail: "/tuttle.png",
    url: "https://tuttle-run.vercel.app/",
    category: "창체",
    tags: ["보물찾기", "거북이", "학교활동", "체험"],
  },
  {
    id: 211,
    title: "STEAM 각도 놀이터",
    description:
      "4학년 각도 단원을 여러 가지 미니 게임으로 재미있게 복습하고 원리를 익히는 수학 놀이터입니다.",
    thumbnail: "/angle.png",
    url: "https://steam-angle.vercel.app/",
    category: "교과",
    tags: ["수학", "각도", "STEAM", "게임"],
  },
  {
    id: 212,
    title: "그라운드 미니게임",
    description:
      "학생들이 미니게임을 완료하면 그라운드카드 포인트가 자동 지급되는 교육용 게임 플랫폼입니다.",
    thumbnail: "/grownd_minigame_thumbnail.png",
    url: "https://grownd-minigame.vercel.app/",
    category: "창체",
    tags: ["그라운드카드", "미니게임", "포인트", "플랫폼"],
  },
  {
    id: 213,
    title: "바이브신답",
    description:
      "서울신답초등학교 교원학습공동체 바이브특공대의 결과물입니다.",
    thumbnail: "/vibe_shindap_thumbnail.png",
    url: "https://padlet.com/shindapcho/padlet-zssgcqkrclm4kd3m",
    category: "창체",
    tags: ["바이브특공대", "교원학습공동체", "결과물", "패들렛"],
  },
  {
    id: 214,
    title: "센서 바이브 - EZMaker",
    description:
      "다양한 센서를 활용한 게임을 만들고 체험하는 EZMaker 기반 메이커 교육 플랫폼입니다.",
    thumbnail: "/sensor_vibe_thumbnail.png",
    url: "https://sensor-vibe.vercel.app/",
    category: "창체",
    tags: ["센서", "메이커", "EZMaker", "게임"],
  },
  {
    id: 215,
    title: "메타인지 유니콘 이미지 생성",
    description:
      "메타인지 유니콘에서 만든 감상 프롬프트로 AI 이미지를 재창작하는 개성적 표현 활동 앱입니다.",
    thumbnail: "/metacog_imagegen_thumbnail.png",
    url: "https://metacog-unicorn-imagegen.vercel.app/",
    category: "교과",
    tags: ["미술", "AI 이미지", "메타인지", "재창작"],
  },
  {
    id: 216,
    title: "오늘 배움봇",
    description:
      "국어·수학·사회 오늘 배운 내용을 AI 챗봇과 함께 점검하는 메타인지 학습 도구입니다.",
    thumbnail: "/today_learning_bot_thumbnail.png",
    url: "https://20260424-metacog-2-shindayun.vercel.app/",
    category: "학급운영",
    tags: ["챗봇", "메타인지", "오늘배움", "점검"],
  },
  {
    id: 217,
    title: "STEAM 도형 밀기 나라",
    description:
      "초등 4학년 학생들이 직접 기획한 6가지 도형 밀기(평행이동) 수학 게임을 플레이하며 개념을 익히는 STEAM 놀이터입니다.",
    thumbnail: "/steam_push_thumbnail.png",
    url: "https://steam-push.vercel.app/",
    category: "교과",
    tags: ["수학", "도형", "평행이동", "STEAM", "게임"],
  },
  {
    id: 218,
    title: "막대그래프 STEAM 게임",
    description:
      "학생들이 직접 설계한 5가지 막대그래프 게임을 플레이하며 그래프 그리기와 자료 해석을 익히는 STEAM 놀이터입니다.",
    thumbnail: "/steam_graph.png",
    url: "https://steam-graph.vercel.app/",
    category: "교과",
    tags: ["수학", "막대그래프", "자료해석", "STEAM", "게임"],
  },
  {
    id: 219,
    title: "신답 키즈 맵",
    description:
      "로봇 과학실·운동장·숲속 캠핑장 등 학교 곳곳을 탐험 코스로 둘러보는 어린이 지도 앱입니다.",
    thumbnail: "/shindapkidsmap.png",
    url: "https://shindapkidsmap.vercel.app/",
    category: "창체",
    tags: ["지도", "탐험", "학교", "어린이"],
  },
  {
    id: 220,
    title: "수학 도형 밀기 게임",
    description:
      "4학년 1반 학생들이 직접 만든 도형 밀기(평행이동) 수학 게임을 플레이하며 개념을 익히는 STEAM 놀이터입니다.",
    thumbnail: "/4-1push.png",
    url: "https://steam-4-1-push.vercel.app/",
    category: "교과",
    tags: ["수학", "도형", "평행이동", "STEAM", "게임"],
  },
  {
    id: 221,
    title: "운동 미션 · NFC 체육 게임",
    description:
      "NFC 태그를 활용해 운동 미션을 수행하는 체육 활동 게임입니다.",
    thumbnail: "",
    url: "https://nfc-exercise-games.vercel.app/",
    category: "교과",
    tags: ["체육", "NFC", "운동", "미션"],
  },
  {
    id: 222,
    title: "수학 규칙 아케이드",
    description:
      "수학 규칙 찾기를 아케이드 게임 형식으로 즐기는 STEAM 학습 도구입니다.",
    thumbnail: "",
    url: "https://steam-rules.vercel.app/",
    category: "교과",
    tags: ["수학", "규칙", "STEAM", "아케이드"],
  },
  {
    id: 223,
    title: "신답룰렛",
    description:
      "구슬 레이스로 추첨하는 뽑기판으로, 당첨 뽑기부터 모둠·자리 배치까지 한 번에 가능합니다.",
    thumbnail: "",
    url: "https://shindap-rullet.vercel.app/",
    category: "학급운영",
    tags: ["룰렛", "뽑기", "모둠", "자리배치"],
  },
  {
    id: 224,
    title: "서울교육룰렛",
    description:
      "서울시교육청 버전 구슬 레이스 뽑기판으로, 추첨·모둠·자리 배치를 지원합니다.",
    thumbnail: "",
    url: "https://seoul-edu-rullet.vercel.app/",
    category: "학급운영",
    tags: ["룰렛", "뽑기", "서울교육청", "자리배치"],
  },
  {
    id: 225,
    title: "에듀앱 빌더",
    description:
      "학생 기획서로 AI가 웹앱을 만들어주는 교육 플랫폼입니다.",
    thumbnail: "",
    url: "https://mycl-contest.vercel.app/",
    category: "창체",
    tags: ["AI", "웹앱", "기획서", "메이커"],
  },
];

// ========== 바이브 신답 습작 목록 ==========
// 새 습작을 추가하려면 아래 배열에 항목을 추가하세요.
// ※ 패들릿 업로드 HTML 파일 4개(자음자 모음자 찾아 글자 만들기 파일, 받침이 있는 글자 알기,
//    손가락으로 수만큼 나타내기, 사물과 숫자 대응하기)는 임시 만료 토큰 URL이라 생략됨.
const vibeItems: VibeItem[] = [
  {
    id: 1,
    title: "(샘플) 손병호 게임",
    url: "https://gemini.google.com/share/5fab4acf1078",
    description: "",
  },
  {
    id: 2,
    title: "우리반 독서기록",
    url: "https://gemini.google.com/share/a1ba032d47a5",
    description: "댓글 링크: https://20260601-reading.vercel.app/",
  },
  {
    id: 3,
    title: "북타이머",
    url: "https://book-timer-wine.vercel.app/",
    description: "아침 독서 미션 보드",
  },
  {
    id: 4,
    title: "(샘플) 삼행시 AI - text gen",
    url: "https://gemini.google.com/share/95bda7d57ab2",
    description: "",
  },
  {
    id: 5,
    title: "(샘플) 패션쇼 AI - image gen",
    url: "https://gemini.google.com/share/7c9f84699de3",
    description: "",
  },
  {
    id: 6,
    title: "(샘플) 그림맞추기 - vision",
    url: "https://gemini.google.com/share/f5b70ecb992b",
    description: "",
  },
  {
    id: 7,
    title: "2학년 '자연' - 자연은 디자이너: 자연에서 찾은 무늬로 옷 만들기",
    url: "https://gemini.google.com/share/c8109a9ea5b0",
    description: "댓글 링크: https://padlet.com/shindapt/padlet-kjabx1lfeo1croob",
  },
  {
    id: 8,
    title: "우리나라 상징 캐릭터 만들기",
    url: "https://gemini.google.com/share/5f26f8442214",
    description: "",
  },
  {
    id: 9,
    title: "한복 디자인하기",
    url: "https://gemini.google.com/share/e35809eca294",
    description: "댓글 링크: https://gemini.google.com/share/6d18af85589a",
  },
  {
    id: 10,
    title: "AI 나 전달법 마음 번역기",
    url: "https://gemini.google.com/share/1a693d653091",
    description: "",
  },
  {
    id: 11,
    title: "4학년 과학-자석을 이용한 장치 설계하기",
    url: "https://gemini.google.com/share/3c1b99583c08",
    description: "",
  },
  {
    id: 12,
    title: "AI 문해력 학습",
    url: "https://gemini.google.com/share/b41d183c7262",
    description: "",
  },
  {
    id: 13,
    title: "4학년 미술 - 찰흙으로 상상의 성 만들기",
    url: "https://gemini.google.com/share/c425639fe049",
    description: "",
  },
  {
    id: 14,
    title: "4학년 미술 - 색점토로 괴물 만들기",
    url: "https://gemini.google.com/share/d9f3b52f4b15",
    description: "",
  },
  {
    id: 15,
    title: "(샘플) Ai 이모티콘 메이커",
    url: "https://gemini.google.com/share/c3a28bca5877",
    description: "",
  },
  {
    id: 16,
    title: "업엔다운게임",
    url: "https://gemini.google.com/share/71a2e24e62fe",
    description: "",
  },
  {
    id: 17,
    title: "봄날의 업앤다운 게임",
    url: "https://gemini.google.com/share/bbf5c64a8567",
    description: "",
  },
  {
    id: 18,
    title: "고양이 미로탈출 게임",
    url: "https://gemini.google.com/share/e76e748d2e88",
    description: "",
  },
  {
    id: 19,
    title: "3학년 나눗셈 도입 연습",
    url: "https://gemini.google.com/share/8061094db9ee",
    description: "",
  },
  {
    id: 20,
    title: "업앤다운 게임",
    url: "https://gemini.google.com/share/4d825f351161",
    description: "",
  },
  {
    id: 21,
    title: "벽돌 깨기 게임",
    url: "https://gemini.google.com/share/cc68be064b60",
    description: "",
  },
  {
    id: 22,
    title: "날씨에 따라 마우스 포인터가 변하는 웹사이트",
    url: "https://gemini.google.com/share/fa89792574a2",
    description: "",
  },
  {
    id: 23,
    title: "기본 글자 쓰기 게임",
    url: "https://gemini.google.com/share/0be96a57698e",
    description: "",
  },
  {
    id: 24,
    title: "알록달록 그림판",
    url: "https://gemini.google.com/share/67de161d620e",
    description: "",
  },
  {
    id: 25,
    title: "스도쿠 게임",
    url: "https://gemini.google.com/share/d82f290a822b",
    description: "",
  },
  {
    id: 26,
    title: "2학년을 위한 구구단 게임",
    url: "https://gemini.google.com/share/bbf5c64a8567",
    description: "",
  },
  {
    id: 27,
    title: "전개도 알아보기",
    url: "https://gemini.google.com/share/c2f8f2480284",
    description: "",
  },
  {
    id: 28,
    title: "칠교놀이 챌린지",
    url: "https://gemini.google.com/share/31e758305306",
    description: "",
  },
  {
    id: 29,
    title: "2학년 세 자리 수 버블게임",
    url: "https://gemini.google.com/share/78ce9ac09f27",
    description: "",
  },
  {
    id: 30,
    title: "종합 숫자게임",
    url: "https://gemini.google.com/share/08199da1bcaf",
    description: "",
  },
  {
    id: 31,
    title: "1부터 100까지 숫자기차",
    url: "https://gemini.google.com/share/78fba3539195",
    description: "",
  },
  {
    id: 32,
    title: "장구 비트 마스터",
    url: "https://gemini.google.com/share/3798c3e3cf00",
    description: "",
  },
  {
    id: 33,
    title: "반응속도 테스트",
    url: "https://gemini.google.com/share/f8b4d3782636",
    description: "전자칠판에서 하면 마우스보다 평균 반응속도가 0.1초 정도 느림",
  },
  {
    id: 34,
    title: "5초 동안 많이 클릭하기",
    url: "https://gemini.google.com/share/a7c1f3994eaa",
    description: "전자칠판에서 손가락으로만 눌러야 오류 날 확률이 적음",
  },
  {
    id: 35,
    title: "자리바꾸기",
    url: "https://gemini.google.com/share/4c4c34a5ac2b",
    description: "책상 배치에 따라 자리 수 선택, 수동/랜덤 배치 기능(랜덤은 아직 미사용)",
  },
  {
    id: 36,
    title: "반응속도 업그레이드",
    url: "https://gemini.google.com/share/bebda3220582",
    description: "루피 얼굴은 저작권이 있어서 루피 짤 뺌",
  },
  {
    id: 37,
    title: "마을 장소 텔레파시 놀이",
    url: "https://g.co/gemini/share/c550f8444945",
    description: "",
  },
  {
    id: 38,
    title: "이민선 바이브 코딩 Padlet",
    url: "https://padlet.com/msonedu/padlet-7qsikxoczu6pg195",
    description: "",
  },
  {
    id: 39,
    title: "나눗셈 릴레이 문제 풀기 게임",
    url: "https://gemini.google.com/share/6526fd3b2ed7",
    description: "",
  },
  {
    id: 40,
    title: "사회 4-1-1 지도로 만나는 우리 지역 단원 정리 초성 퀴즈",
    url: "https://gemini.google.com/share/c0064500e068",
    description: "",
  },
  {
    id: 41,
    title: "동시모음 사이트 (심혜림)",
    url: "https://sites.google.com/view/dongsi/홈",
    description: "3학년 1학기 국어 3단원 동시 감상 수업용",
  },
  {
    id: 42,
    title: "같은 모양 카드 기억하기(1-1-2 수학)",
    url: "https://gemini.google.com/share/e8db976c660a",
    description: "",
  },
  {
    id: 43,
    title: "1-1-통합 우리나라 한식 분류하기",
    url: "https://gemini.google.com/share/5349fe57a538",
    description: "",
  },
  {
    id: 44,
    title: "곱셈과 나눗셈의 관계 연습 (심혜림)",
    url: "https://sites.google.com/view/devision1/홈",
    description: "3학년 1학기 3단원 나눗셈 연습 사이트",
  },
  {
    id: 45,
    title: "방과후-돌봄교실 학생관리 프로그램",
    url: "https://gemini.google.com/share/b5ebe5364b0f",
    description: "",
  },
  {
    id: 46,
    title: "타이머 게임",
    url: "https://gemini.google.com/share/8d8576f2b39e",
    description: "날짜에 맞게 타이머를 멈추는 게임(예: 5월 1일→5.01초)",
  },
  {
    id: 47,
    title: "10이 되는 짝꿍 수 찾기 게임",
    url: "https://gemini.google.com/share/b9ae5c49eca6",
    description: "",
  },
  {
    id: 48,
    title: "님게임",
    url: "https://gemini.google.com/share/03c83bdef7c8",
    description: "",
  },
  {
    id: 49,
    title: "킹방울 10만들기 2인용-> 5인용(세로로 길게)",
    url: "https://gemini.google.com/share/7d8ac5c8a5cb",
    description: "킹수학 닷컴 2인용 놀이를 수정",
  },
  {
    id: 50,
    title: "일정관리앱",
    url: "https://izzy74.my.canva.site/memo1",
    description: "밝은 톤의 Tailwind 일정 관리 앱 디자인 사본",
  },
  {
    id: 51,
    title: "칠교놀이 배틀",
    url: "https://tangramteacher.netlify.app/",
    description: "학생용: https://tangramstu.netlify.app/",
  },
  {
    id: 52,
    title: "1-1-통합 우리나라",
    url: "https://gemini.google.com/share/480fb4a680f0",
    description: "우리나라 상징을 활용한 한복 디자인하기",
  },
  {
    id: 53,
    title: "우리반 독서시간 기록장",
    url: "https://gemini.google.com/share/d9ae5d12a74a",
    description: "",
  },
  {
    id: 54,
    title: "1-1 국어 받침이 다른 낱말을 연결해서 문장 만들기",
    url: "https://gemini.google.com/share/190defb50a9d",
    description: "",
  },
  {
    id: 55,
    title: "6학년 국어(속담사전만들기)",
    url: "https://gemini.google.com/share/0021ce866033",
    description: "속담을 적으면 속담 사전에 넣을 그림을 그려줌",
  },
  {
    id: 56,
    title: "자음자 모음자 찾아 글자 만들기",
    url: "https://gemini.google.com/share/56cdb044972d",
    description: "",
  },
  {
    id: 57,
    title: "독후활동-꾸미는 말 넣기",
    url: "https://gemini.google.com/share/416298fd8086",
    description: "",
  },
  {
    id: 58,
    title: "온책읽기 독서활동 체크리스트",
    url: "https://gemini.google.com/share/7df66811bbc3",
    description: "",
  },
  {
    id: 59,
    title: "2학년 '난 네가 궁금해' 조사 활동지",
    url: "https://gemini.google.com/share/c4fd29af7d66",
    description: "동식물 박사님께 질문하면 추가로 답변해줌",
  },
  {
    id: 60,
    title: "영어 5학년 단어 매칭 게임(레벨있음)",
    url: "https://gemini.google.com/share/223e39f06152",
    description: "",
  },
  {
    id: 61,
    title: "영어 5학년 문장 매칭게임",
    url: "https://gemini.google.com/share/335441b91a81",
    description: "",
  },
  {
    id: 62,
    title: "영어 5학년 영어 단어 매칭 게임(레벨 없는 버전)",
    url: "https://gemini.google.com/share/f88844c56fac",
    description: "",
  },
  {
    id: 63,
    title: "우리 반 독서 시계",
    url: "https://gemini.google.com/share/38204d696adb",
    description: "",
  },
  {
    id: 64,
    title: "3~4학년 곱셈 나눗셈 마스터",
    url: "https://gemini.google.com/share/6a5c8478a71c",
    description: "",
  },
];

export default function Home() {
  const [modalType, setModalType] = useState<"privacy" | "terms" | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("official");

  const handleOpenPrivacy = () => setModalType("privacy");
  const handleOpenTerms = () => setModalType("terms");
  const handleCloseModal = () => setModalType(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Tab Navigation */}
      <nav className="tab-nav-bar">
        <div className="max-w-7xl mx-auto px-4 flex">
          <button
            onClick={() => setActiveTab("official")}
            className={`tab-nav-item ${
              activeTab === "official" ? "tab-nav-active" : ""
            }`}
          >
            <span className="text-lg">🌻</span>
            <span>앱뜰 공식 앱</span>
          </button>
          <button
            onClick={() => setActiveTab("vibe")}
            className={`tab-nav-item ${
              activeTab === "vibe" ? "tab-nav-active" : ""
            }`}
          >
            <span className="text-lg">🎨</span>
            <span>바이브 신답</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        {activeTab === "official" ? (
          <>
            <Hero />
            <AppGallery apps={apps} />
          </>
        ) : (
          <VibeShindap items={vibeItems} />
        )}
      </main>

      <Footer
        onPrivacyClick={handleOpenPrivacy}
        onTermsClick={handleOpenTerms}
      />

      <PolicyModal
        isOpen={modalType === "privacy"}
        onClose={handleCloseModal}
        type="privacy"
      />
      <PolicyModal
        isOpen={modalType === "terms"}
        onClose={handleCloseModal}
        type="terms"
      />
    </div>
  );
}
