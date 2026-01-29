"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AppGallery from '@/components/AppGallery';
import Footer from '@/components/Footer';
import PolicyModal from '@/components/PolicyModal';
import { AppData } from '@/components/AppCard';

// 더미 데이터 - 나중에 실제 데이터로 교체하세요
const dummyApps: AppData[] = [
  {
    id: 1,
    title: "AI 의상실",
    description: "인공지능으로 다양한 옷을 입어보세요. 실과 교과 연계 및 딥페이크 주의 교육에 활용할 수 있습니다.",
    thumbnail: "/ai_locker_room.png",
    url: "https://germany-change-clothes.vercel.app/",
    category: "교과",
    tags: ["패션쇼", "계절에맞는옷차림", "실과", "딥페이크주의"],
    target: "3~6학년 교사 시범용",
    notice: "비밀번호는 e-mail로 연락주세요.",
  },
  {
    id: 101,
    title: "미술 감상관찰 프롬프트",
    description: "AI와 함께 유명 미술작품을 입체적으로 감상하고, 나만의 프롬프트를 만들어 감상 실력을 키워보세요.",
    thumbnail: "/art_app_thumbnail.png",
    url: "https://artlens-two.vercel.app/",
    category: "교과",
    tags: ["미술", "프롬프팅", "에듀테크", "수업공개"],
    target: "3~6학년",
  },
  {
    id: 102,
    title: "지역기반 AI 이미지 생성기",
    description: "캔버스 어느곳에 무엇을 입력할지 직관적으로 지정하여 그림을 그릴 수 있는 혁신적인 도구입니다. 학급관리 기능으로 선생님의 수업 편의성을 높였습니다.",
    thumbnail: "/region_ai_thumbnail.png",
    url: "https://ai-region-based-image-generator.vercel.app/",
    category: "교과",
    tags: ["미술", "AI이미지", "학급관리", "직관적설계"],
    target: "전학년",
  },
  {
    id: 103,
    title: "3D 민주시민시뮬레이션",
    description: "지역사회 문제를 3D 아바타를 움직여 주민들과 대화하고, 해결책을 만들어 구의원에게 제출해보는 자치활동 프로그램입니다.",
    thumbnail: "/democracy_3d_thumbnail.png",
    url: "https://3-d-ai-democracy.vercel.app/",
    category: "교과",
    tags: ["사회", "민주시민", "자치활동", "지역사회", "3D"],
    target: "전학년",
    notice: "위험한 주변 환경으로 인해 학생들의 직접 설문조사가 어려운 상황에서 안전하게 활용할 수 있습니다.",
  },
  {
    id: 2,
    title: "우리반 칭찬 나무",
    description: "친구들에게 칭찬 잎사귀를 달아주세요. 함께 자라는 칭찬 나무를 만들어요!",
    thumbnail: "",
    url: "https://example.com/praise-tree",
    category: "학급운영",
    tags: ["긍정문화", "인성교육"],
    target: "전학년",
  },
  {
    id: 3,
    title: "창의력 쑥쑥 그림 퀴즈",
    description: "친구가 그린 그림을 맞춰보세요! 창의력과 상상력을 키우는 재미있는 게임이에요.",
    thumbnail: "",
    url: "https://example.com/drawing-quiz",
    category: "창체",
    tags: ["창의성", "소통"],
    target: "전학년",
  },
];

export default function Home() {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  const handleOpenPrivacy = () => setModalType('privacy');
  const handleOpenTerms = () => setModalType('terms');
  const handleCloseModal = () => setModalType(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <Hero />
        <AppGallery apps={dummyApps} />
      </main>

      <Footer
        onPrivacyClick={handleOpenPrivacy}
        onTermsClick={handleOpenTerms}
      />

      {/* Policy Modals */}
      <PolicyModal
        isOpen={modalType === 'privacy'}
        onClose={handleCloseModal}
        type="privacy"
      />
      <PolicyModal
        isOpen={modalType === 'terms'}
        onClose={handleCloseModal}
        type="terms"
      />
    </div>
  );
}
