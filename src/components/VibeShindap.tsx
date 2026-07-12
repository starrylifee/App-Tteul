"use client";

import React, { useRef, useState } from "react";

export interface VibeItem {
  id: number;
  title: string;
  url: string;
  description: string;
}

interface VibeShindapProps {
  items: VibeItem[];
  onEdit?: (item: VibeItem) => void;
  onDelete?: (item: VibeItem) => void;
}

function VibeAdminButtons({
  item,
  onEdit,
  onDelete,
}: {
  item: VibeItem;
  onEdit?: (item: VibeItem) => void;
  onDelete?: (item: VibeItem) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDeleteClick = () => {
    if (confirmDelete) {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      setConfirmDelete(false);
      onDelete?.(item);
    } else {
      setConfirmDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="flex gap-1.5 flex-shrink-0">
      {onEdit && (
        <button
          onClick={() => onEdit(item)}
          className="px-2.5 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-sm transition-colors"
          title="수정"
        >
          ✏️
        </button>
      )}
      {onDelete && (
        <button
          onClick={handleDeleteClick}
          className={`px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
            confirmDelete
              ? "bg-red-500 hover:bg-red-600 text-white font-bold"
              : "bg-primary-50 hover:bg-primary-100"
          }`}
          title="삭제"
        >
          {confirmDelete ? "정말 삭제?" : "🗑️"}
        </button>
      )}
    </div>
  );
}

export default function VibeShindap({ items, onEdit, onDelete }: VibeShindapProps) {
  return (
    <section className="py-12 sm:py-16 px-4 bg-warm-50/30 min-h-[60vh]">
      <div className="max-w-4xl mx-auto">
        {/* Section title */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-700 mb-2">
            🎨 바이브 신답
          </h2>
          <p className="text-warm-300">
            서울신답초 바이브특공대의 습작 모음입니다
          </p>
        </div>

        {/* Items list */}
        {items.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🌱</span>
            <p className="text-warm-300 text-lg">
              아직 등록된 습작이 없어요.
              <br />
              곧 새로운 습작이 자라날 거예요!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="vibe-list-card"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="vibe-list-number">{idx + 1}</span>
                      <h3 className="text-lg font-semibold text-primary-700 truncate">
                        {item.title}
                      </h3>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="vibe-link"
                    >
                      🔗 {item.url}
                    </a>
                    {item.description && (
                      <p className="text-warm-300 text-sm mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {(onEdit || onDelete) && (
                    <VibeAdminButtons
                      item={item}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
