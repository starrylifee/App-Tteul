"use client";

import React, { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AppGallery from "@/components/AppGallery";
import Footer from "@/components/Footer";
import PolicyModal from "@/components/PolicyModal";
import VibeShindap, { VibeItem } from "@/components/VibeShindap";
import { AppData } from "@/components/AppCard";
import { EditAppModal, EditVibeModal } from "@/components/EditModals";
import { apps as baseApps, vibeItems as baseVibeItems } from "@/data/appsData";
import { ADMIN_SESSION_KEYS } from "@/lib/adminShared";

type TabType = "official" | "vibe";

export default function Home() {
  const [modalType, setModalType] = useState<"privacy" | "terms" | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("official");
  const [apps, setApps] = useState<AppData[]>(baseApps);
  const [vibeItems, setVibeItems] = useState<VibeItem[]>(baseVibeItems);

  // 관리 모드: /admin에서 "관리 모드 켜기"를 누르면 sessionStorage에 저장됨
  const [officialPw, setOfficialPw] = useState("");
  const [vibePw, setVibePw] = useState("");
  const [adminMsg, setAdminMsg] = useState("");
  const [editingApp, setEditingApp] = useState<AppData | null>(null);
  const [editingVibe, setEditingVibe] = useState<VibeItem | null>(null);

  // DB에 데이터가 있으면 그것만 사용, 없거나 연결 실패면 코드에 내장된 목록으로 폴백
  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/apps");
      const data = await res.json();
      setApps(
        Array.isArray(data.items) && data.items.length > 0
          ? data.items
          : baseApps
      );
    } catch {
      setApps(baseApps);
    }
    try {
      const res = await fetch("/api/vibe");
      const data = await res.json();
      setVibeItems(
        Array.isArray(data.items) && data.items.length > 0
          ? data.items
          : baseVibeItems
      );
    } catch {
      setVibeItems(baseVibeItems);
    }
  }, []);

  useEffect(() => {
    void reload();
    setOfficialPw(sessionStorage.getItem(ADMIN_SESSION_KEYS.official) ?? "");
    setVibePw(sessionStorage.getItem(ADMIN_SESSION_KEYS.vibe) ?? "");
  }, [reload]);

  const exitAdmin = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEYS.official);
    sessionStorage.removeItem(ADMIN_SESSION_KEYS.vibe);
    setOfficialPw("");
    setVibePw("");
    setAdminMsg("");
    setEditingApp(null);
    setEditingVibe(null);
  };

  const handleMutationError = async (res: Response) => {
    const data = await res.json().catch(() => ({}) as { error?: string });
    if (res.status === 401) {
      exitAdmin();
      setAdminMsg("비밀번호가 올바르지 않아 관리 모드를 종료했습니다.");
    } else {
      setAdminMsg(data.error || "요청에 실패했습니다.");
    }
  };

  const deleteApp = async (app: AppData) => {
    setAdminMsg("");
    try {
      const res = await fetch("/api/apps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: officialPw, id: app.id }),
      });
      if (res.ok) void reload();
      else await handleMutationError(res);
    } catch {
      setAdminMsg("네트워크 오류가 발생했습니다.");
    }
  };

  const deleteVibe = async (item: VibeItem) => {
    setAdminMsg("");
    try {
      const res = await fetch("/api/vibe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: vibePw, id: item.id }),
      });
      if (res.ok) void reload();
      else await handleMutationError(res);
    } catch {
      setAdminMsg("네트워크 오류가 발생했습니다.");
    }
  };

  const handleOpenPrivacy = () => setModalType("privacy");
  const handleOpenTerms = () => setModalType("terms");
  const handleCloseModal = () => setModalType(null);

  const isAdmin = Boolean(officialPw || vibePw);

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

      {/* Admin mode banner */}
      {(isAdmin || adminMsg) && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {isAdmin && (
              <>
                <span className="font-semibold text-amber-700">
                  🔧 관리 모드
                  {officialPw && " · 공식 앱"}
                  {vibePw && " · 바이브 신답"}
                </span>
                <span className="text-amber-600">
                  카드의 ✏️(수정) · 🗑️(삭제) 버튼을 사용하세요
                </span>
                <button
                  onClick={exitAdmin}
                  className="ml-auto px-3 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-800 font-semibold text-xs transition-colors"
                >
                  관리 모드 끄기
                </button>
              </>
            )}
            {adminMsg && (
              <span className="text-red-600 font-medium">⚠️ {adminMsg}</span>
            )}
          </div>
        </div>
      )}

      <main className="flex-grow">
        {activeTab === "official" ? (
          <>
            <Hero />
            <AppGallery
              apps={apps}
              onEdit={officialPw ? setEditingApp : undefined}
              onDelete={officialPw ? deleteApp : undefined}
            />
          </>
        ) : (
          <VibeShindap
            items={vibeItems}
            onEdit={vibePw ? setEditingVibe : undefined}
            onDelete={vibePw ? deleteVibe : undefined}
          />
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

      {editingApp && (
        <EditAppModal
          app={editingApp}
          password={officialPw}
          onClose={() => setEditingApp(null)}
          onSaved={() => {
            setEditingApp(null);
            void reload();
          }}
        />
      )}
      {editingVibe && (
        <EditVibeModal
          item={editingVibe}
          password={vibePw}
          onClose={() => setEditingVibe(null)}
          onSaved={() => {
            setEditingVibe(null);
            void reload();
          }}
        />
      )}
    </div>
  );
}
