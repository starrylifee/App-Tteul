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
    id: 104,
    title: "키다리 체커",
    description: "키다리샘 지도일지와 일일근무상황, 출장 리스트를 비교해서 복무상 이상이 없는지 체크하는 기초학력 업무자 전용 웹앱입니다.",
    thumbnail: "/kidari_checker_thumbnail.png",
    url: "https://kidari-checker.vercel.app/",
    category: "학급운영",
    tags: ["기초학력", "복무관리", "업무효율", "키다리샘"],
    target: "교사 업무용",
  },
  {
    id: 105,
    title: "분반작업 도우미",
    description: "공정한 분반작업을 하기 위한 학기말 필수 웹앱입니다. 학급 배정을 효율적이고 균형있게 도와드립니다.",
    thumbnail: "/class_division_thumbnail.png",
    url: "https://next-class-one.vercel.app/",
    category: "학급운영",
    tags: ["분반", "학급편성", "학기말", "공정배정"],
    target: "교사 업무용",
  },
  {
    id: 106,
    title: "메타그라운드 디자이너",
    description: "그라운드 카드의 메타버스 공간 '메타그라운드'를 꾸밀 수 있는 서드파티 디자인 도구입니다.",
    thumbnail: "",
    url: "https://grownd-meta-qmaker.vercel.app/",
    category: "창체",
    tags: ["메타버스", "그라운드카드", "디자인", "창의활동"],
    target: "전학년",
  },
  {
    id: 107,
    title: "봄봄봄 프로젝트",
    description: "2025-2026 서울특별시교육감 연구교사제 연구 공유 플랫폼. 미술 감상을 AI와 함께 키워나가는 2년짜리 프로젝트입니다.",
    thumbnail: "",
    url: "https://stb-eta.vercel.app/",
    category: "교과",
    tags: ["연구교사제", "미술감상", "AI", "연구공유"],
    target: "전학년",
  },
  {
    id: 108,
    title: "음악과 수학 (분수 리듬 게임)",
    description: "수학의 분수 개념을 리듬 게임으로 쉽고 재미있게 배워보세요. 자유 작곡 모드와 퀴즈 도전 모드를 통해 박자와 분수의 관계를 익힐 수 있습니다.",
    thumbnail: "/music_math_thumbnail.png",
    url: "https://musicandmath.vercel.app/",
    category: "교과",
    tags: ["수학", "음악", "분수", "리듬게임", "에듀테크"],
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
