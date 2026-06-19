"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AppGallery from "@/components/AppGallery";
import Footer from "@/components/Footer";
import PolicyModal from "@/components/PolicyModal";
import { AppData } from "@/components/AppCard";

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
];

export default function Home() {
  const [modalType, setModalType] = useState<"privacy" | "terms" | null>(null);

  const handleOpenPrivacy = () => setModalType("privacy");
  const handleOpenTerms = () => setModalType("terms");
  const handleCloseModal = () => setModalType(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <Hero />
        <AppGallery apps={apps} />
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
