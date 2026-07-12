"use client";

import React, { useState } from "react";
import Link from "next/link";

type AdminTab = "official" | "vibe";

const CATEGORIES = ["교과", "학급운영", "창체"] as const;

// 큰 이미지는 업로드 전에 브라우저에서 자동으로 줄임 (최대 1200px, webp 변환)
const MAX_THUMB_DIM = 1200;

async function resizeImage(
  file: File
): Promise<{ blob: Blob; name: string }> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    return { blob: file, name: file.name };
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_THUMB_DIM / Math.max(bitmap.width, bitmap.height)
    );
    if (scale === 1 && file.size <= 500 * 1024) {
      return { blob: file, name: file.name };
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return { blob: file, name: file.name };
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85)
    );
    if (!blob) return { blob: file, name: file.name };
    return { blob, name: file.name.replace(/\.[^.]+$/, "") + ".webp" };
  } catch {
    return { blob: file, name: file.name };
  }
}

const DEFAULT_THUMBNAILS = [
  { path: "/defaults/sprout.svg", label: "새싹" },
  { path: "/defaults/book.svg", label: "책" },
  { path: "/defaults/art.svg", label: "미술" },
  { path: "/defaults/game.svg", label: "게임" },
  { path: "/defaults/math.svg", label: "수학" },
  { path: "/defaults/school.svg", label: "학교" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("official");

  return (
    <div className="min-h-screen bg-warm-50/30 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-primary-700">
            🔐 앱뜰 관리자 모드
          </h1>
          <Link href="/" className="text-sm text-primary-500 hover:underline">
            ← 앱뜰로 돌아가기
          </Link>
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("official")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "official"
                ? "bg-primary-500 text-white"
                : "bg-white text-warm-300 border border-primary-100 hover:bg-primary-50"
            }`}
          >
            🌻 앱뜰 공식 앱 등록
          </button>
          <button
            onClick={() => setTab("vibe")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "vibe"
                ? "bg-primary-500 text-white"
                : "bg-white text-warm-300 border border-primary-100 hover:bg-primary-50"
            }`}
          >
            🎨 바이브 신답 등록
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-primary-50 p-6">
          {tab === "official" ? <OfficialForm /> : <VibeForm />}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-primary-700 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-primary-100 bg-warm-50/20 text-sm text-foreground focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors";

function StatusMessage({
  status,
  error,
}: {
  status: "idle" | "loading" | "success" | "error";
  error: string;
}) {
  if (status === "success") {
    return (
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-sm text-primary-700 font-medium">
        ✅ 등록되었습니다! 메인 화면에 바로 반영됩니다.
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 font-medium">
        ⚠️ {error}
      </div>
    );
  }
  return null;
}

function OfficialForm() {
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("교과");
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [defaultThumb, setDefaultThumb] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  const handleFile = (file: File | null) => {
    setThumbnail(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : "");
    if (file) setDefaultThumb("");
  };

  const handleDefaultThumb = (path: string) => {
    setDefaultThumb((prev) => (prev === path ? "" : path));
    handleFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = new FormData();
    form.append("password", password);
    form.append("title", title);
    form.append("url", url);
    form.append("description", description);
    form.append("category", category);
    form.append("tags", tags);
    if (thumbnail) {
      const { blob, name } = await resizeImage(thumbnail);
      if (blob.size > 4 * 1024 * 1024) {
        setStatus("error");
        setError("썸네일 용량이 너무 큽니다. 다른 이미지로 시도해 주세요.");
        return;
      }
      form.append("thumbnail", blob, name);
    } else if (defaultThumb) {
      form.append("defaultThumbnail", defaultThumb);
    }

    try {
      const res = await fetch("/api/apps", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "등록에 실패했습니다.");
        return;
      }
      setStatus("success");
      setTitle("");
      setUrl("");
      setDescription("");
      setTags("");
      handleFile(null);
      setDefaultThumb("");
    } catch {
      setStatus("error");
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <FieldLabel required>관리자 비밀번호 (앱뜰 공식)</FieldLabel>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <hr className="border-primary-50" />

      <div>
        <FieldLabel required>앱 이름</FieldLabel>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="예: 수학 도형 밀기 게임"
          required
        />
      </div>

      <div>
        <FieldLabel required>사이트 URL</FieldLabel>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClass}
          placeholder="https://..."
          required
        />
      </div>

      <div>
        <FieldLabel>설명</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} min-h-[80px] resize-y`}
          placeholder="앱에 대한 한두 문장 설명"
        />
      </div>

      <div>
        <FieldLabel required>카테고리</FieldLabel>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                category === c
                  ? "bg-primary-500 text-white"
                  : "bg-warm-50/50 text-warm-300 border border-primary-100 hover:bg-primary-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>태그 (쉼표로 구분)</FieldLabel>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className={inputClass}
          placeholder="예: 수학, 도형, STEAM, 게임"
        />
      </div>

      <div>
        <FieldLabel>썸네일 이미지 (선택 — 큰 이미지는 자동으로 줄여서 올라갑니다)</FieldLabel>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-warm-300 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-primary-100 file:text-primary-700 file:text-sm file:font-semibold file:cursor-pointer hover:file:bg-primary-200"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="썸네일 미리보기"
            className="mt-3 h-36 rounded-xl object-cover border border-primary-100"
          />
        )}

        <p className="text-xs text-warm-300 mt-4 mb-2 font-medium">
          또는 기본 썸네일 중에서 선택 (다시 누르면 해제)
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {DEFAULT_THUMBNAILS.map((t) => (
            <button
              key={t.path}
              type="button"
              onClick={() => handleDefaultThumb(t.path)}
              className={`rounded-xl overflow-hidden border-2 transition-all ${
                defaultThumb === t.path
                  ? "border-primary-500 ring-2 ring-primary-200"
                  : "border-primary-50 hover:border-primary-300"
              }`}
              title={t.label}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.path}
                alt={t.label}
                className="w-full aspect-[4/3] object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <StatusMessage status={status} error={error} />

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold transition-colors"
      >
        {status === "loading" ? "등록 중..." : "🌻 공식 앱 등록하기"}
      </button>
    </form>
  );
}

function VibeForm() {
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, title, url, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "등록에 실패했습니다.");
        return;
      }
      setStatus("success");
      setTitle("");
      setUrl("");
      setDescription("");
    } catch {
      setStatus("error");
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <FieldLabel required>관리자 비밀번호 (바이브 신답)</FieldLabel>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <hr className="border-primary-50" />

      <div>
        <FieldLabel required>습작 제목</FieldLabel>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="예: 곱셈 나눗셈 마스터"
          required
        />
      </div>

      <div>
        <FieldLabel required>링크 URL</FieldLabel>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClass}
          placeholder="https://gemini.google.com/share/..."
          required
        />
      </div>

      <div>
        <FieldLabel>설명 (선택)</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} min-h-[80px] resize-y`}
          placeholder="사용 팁이나 참고 사항"
        />
      </div>

      <StatusMessage status={status} error={error} />

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold transition-colors"
      >
        {status === "loading" ? "등록 중..." : "🎨 습작 등록하기"}
      </button>
    </form>
  );
}
