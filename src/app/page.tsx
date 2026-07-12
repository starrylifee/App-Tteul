"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AppGallery from "@/components/AppGallery";
import Footer from "@/components/Footer";
import PolicyModal from "@/components/PolicyModal";
import VibeShindap, { VibeItem } from "@/components/VibeShindap";
import { AppData } from "@/components/AppCard";
import { apps as baseApps, vibeItems as baseVibeItems } from "@/data/appsData";

type TabType = "official" | "vibe";

export default function Home() {
  const [modalType, setModalType] = useState<"privacy" | "terms" | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("official");
  const [apps, setApps] = useState<AppData[]>(baseApps);
  const [vibeItems, setVibeItems] = useState<VibeItem[]>(baseVibeItems);

  // 관리자 모드에서 등록한 항목을 불러와 기존 목록 뒤에 붙임
  useEffect(() => {
    fetch("/api/apps")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.items) && data.items.length > 0) {
          setApps([...baseApps, ...data.items]);
        }
      })
      .catch(() => {});

    fetch("/api/vibe")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.items) && data.items.length > 0) {
          setVibeItems([...baseVibeItems, ...data.items]);
        }
      })
      .catch(() => {});
  }, []);

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
