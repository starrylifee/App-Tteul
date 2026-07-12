"use client";

import React, { useState } from "react";
import { AppData } from "./AppCard";
import { VibeItem } from "./VibeShindap";
import {
  DEFAULT_THUMBNAILS,
  normalizeUrl,
  resizeImage,
} from "@/lib/adminShared";

const CATEGORIES = ["교과", "학급운영", "창체"] as const;

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-primary-100 bg-warm-50/20 text-sm text-foreground focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors";

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-primary-700">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-primary-50 text-warm-300 text-lg"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EditAppModal({
  app,
  password,
  onClose,
  onSaved,
}: {
  app: AppData;
  password: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(app.title);
  const [url, setUrl] = useState(app.url);
  const [description, setDescription] = useState(app.description);
  const [category, setCategory] = useState<string>(app.category);
  const [tags, setTags] = useState((app.tags ?? []).join(", "));
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [defaultThumb, setDefaultThumb] = useState("");
  const [removeThumb, setRemoveThumb] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file: File | null) => {
    setThumbFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : "");
    if (file) {
      setDefaultThumb("");
      setRemoveThumb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData();
    form.append("password", password);
    form.append("id", String(app.id));
    form.append("title", title);
    form.append("url", normalizeUrl(url));
    form.append("description", description);
    form.append("category", category);
    form.append("tags", tags);
    if (thumbFile) {
      const { blob, name } = await resizeImage(thumbFile);
      form.append("thumbnail", blob, name);
    } else if (defaultThumb) {
      form.append("defaultThumbnail", defaultThumb);
    } else if (removeThumb) {
      form.append("removeThumbnail", "1");
    }

    try {
      const res = await fetch("/api/apps", { method: "PUT", body: form });
      const data = await res.json();
      if (!res.ok) {
        setSaving(false);
        setError(data.error || "수정에 실패했습니다.");
        return;
      }
      onSaved();
    } catch {
      setSaving(false);
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  const currentThumb = preview || defaultThumb || (!removeThumb && app.thumbnail) || "";

  return (
    <ModalShell title="✏️ 앱 수정" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-primary-700 mb-1.5">
            앱 이름
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-700 mb-1.5">
            사이트 URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-700 mb-1.5">
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} min-h-[70px] resize-y`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-700 mb-1.5">
            카테고리
          </label>
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
          <label className="block text-sm font-semibold text-primary-700 mb-1.5">
            태그 (쉼표로 구분)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-700 mb-1.5">
            썸네일
          </label>
          {currentThumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentThumb}
              alt="썸네일"
              className="h-28 rounded-xl object-cover border border-primary-100 mb-2"
            />
          ) : (
            <p className="text-xs text-warm-300 mb-2">썸네일 없음</p>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-warm-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-primary-200"
          />
          <p className="text-xs text-warm-300 mt-3 mb-1.5">
            또는 기본 썸네일 선택
          </p>
          <div className="grid grid-cols-6 gap-1.5">
            {DEFAULT_THUMBNAILS.map((t) => (
              <button
                key={t.path}
                type="button"
                onClick={() => {
                  setDefaultThumb((prev) => (prev === t.path ? "" : t.path));
                  handleFile(null);
                  setRemoveThumb(false);
                }}
                className={`rounded-lg overflow-hidden border-2 transition-all ${
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
          {app.thumbnail && (
            <label className="flex items-center gap-2 mt-2 text-xs text-warm-300 cursor-pointer">
              <input
                type="checkbox"
                checked={removeThumb}
                onChange={(e) => {
                  setRemoveThumb(e.target.checked);
                  if (e.target.checked) {
                    handleFile(null);
                    setDefaultThumb("");
                  }
                }}
              />
              썸네일 제거 (카테고리 이모지로 표시)
            </label>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 font-medium">
            ⚠️ {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-primary-100 text-warm-300 font-semibold hover:bg-primary-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function EditVibeModal({
  item,
  password,
  onClose,
  onSaved,
}: {
  item: VibeItem;
  password: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [url, setUrl] = useState(item.url);
  const [description, setDescription] = useState(item.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/vibe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          id: item.id,
          title,
          url: normalizeUrl(url),
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaving(false);
        setError(data.error || "수정에 실패했습니다.");
        return;
      }
      onSaved();
    } catch {
      setSaving(false);
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <ModalShell title="✏️ 수정" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-primary-700 mb-1.5">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-700 mb-1.5">
            링크 URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-700 mb-1.5">
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} min-h-[70px] resize-y`}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 font-medium">
            ⚠️ {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-primary-100 text-warm-300 font-semibold hover:bg-primary-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
