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
    id: 201,
    title: "등고선 탐험 교실",
    description: "등고선과 지형 개념을 활동형 화면으로 익히는 탐구 수업 도구입니다.",
    thumbnail: "",
    url: "https://contour-line.vercel.app/",
    category: "교과",
    tags: ["사회", "지형", "지도", "탐구"],
  },
  {
    id: 202,
    title: "조 단위 숫자 읽기 퀴즈",
    description: "만·억·조 단위 숫자를 한글과 숫자로 오가며 연습하는 수학 퀴즈입니다.",
    thumbnail: "",
    url: "https://bignumber.vercel.app/",
    category: "교과",
    tags: ["수학", "큰수", "수읽기", "퀴즈"],
  },
  {
    id: 203,
    title: "수학 양감 어림 게임",
    description: "양감과 어림 전략을 게임처럼 익히는 수학 활동 앱입니다.",
    thumbnail: "",
    url: "https://20251110-guessgame.vercel.app/",
    category: "교과",
    tags: ["수학", "양감", "어림", "게임"],
  },
  {
    id: 204,
    title: "메타인지 유니콘",
    description: "오늘 배운 내용을 설명하면 AI가 이해도를 점검해 주는 메타인지 도구입니다.",
    thumbnail: "",
    url: "https://metacog-unicorn.vercel.app/",
    category: "학급운영",
    tags: ["메타인지", "설명하기", "AI 피드백", "회고"],
  },
  {
    id: 205,
    title: "GROWND English",
    description: "영어 단어를 학습하고 퀴즈로 확인하는 GROWND 연동 학습 도구입니다.",
    thumbnail: "",
    url: "https://growndcard-english.vercel.app/",
    category: "교과",
    tags: ["영어", "단어", "퀴즈", "GROWND"],
  },
  {
    id: 206,
    title: "비명 지르는 닭",
    description: "소리를 활용해 닭을 점프시키는 참여형 활동 게임입니다.",
    thumbnail: "",
    url: "https://voicejump.vercel.app/",
    category: "창체",
    tags: ["음성", "게임", "참여활동", "점프"],
  },
  {
    id: 207,
    title: "온도 챌린지 - EZMaker",
    description: "온도 개념을 챌린지 형식으로 익히는 메이커형 학습 활동입니다.",
    thumbnail: "",
    url: "https://ezmaker-temp.vercel.app/",
    category: "교과",
    tags: ["과학", "온도", "메이커", "실험"],
  },
  {
    id: 208,
    title: "디지털 발자국 히어로즈",
    description: "디지털 발자국 주제를 쉽고 흥미롭게 다루는 시민성 교육 활동입니다.",
    thumbnail: "",
    url: "https://digitalfootprint-ruby.vercel.app/",
    category: "창체",
    tags: ["디지털 시민성", "정보", "발자국", "활동"],
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
