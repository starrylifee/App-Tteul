"use client";

import React, { useRef, useState } from 'react';

export interface AppData {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    url: string;
    category: '교과' | '학급운영' | '창체' | '연수';
    tags?: string[];
    target?: string;
    notice?: string;
}

interface AppCardProps {
    app: AppData;
    onEdit?: (app: AppData) => void;
    onDelete?: (app: AppData) => void;
}

export default function AppCard({ app, onEdit, onDelete }: AppCardProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirmDelete) {
            if (confirmTimer.current) clearTimeout(confirmTimer.current);
            setConfirmDelete(false);
            onDelete?.(app);
        } else {
            setConfirmDelete(true);
            confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
        }
    };

    const getCategoryStyle = (category: string) => {
        switch (category) {
            case '교과':
                return 'bg-primary-100 text-primary-700';
            case '학급운영':
                return 'bg-accent-100 text-accent-600';
            case '창체':
                return 'bg-secondary-100 text-secondary-500';
            case '연수':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const getCategoryEmoji = (category: string) => {
        switch (category) {
            case '교과':
                return '📚';
            case '학급운영':
                return '🏫';
            case '창체':
                return '🎨';
            case '연수':
                return '🎓';
            default:
                return '📱';
        }
    };

    return (
        <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover block bg-white rounded-2xl overflow-hidden shadow-md border border-primary-50 group"
        >
            {/* Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-primary-50 to-accent-50 overflow-hidden">
                {app.thumbnail ? (
                    <img
                        src={app.thumbnail}
                        alt={app.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-50">{getCategoryEmoji(app.category)}</span>
                    </div>
                )}

                {/* Category badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryStyle(app.category)}`}>
                    #{app.category}
                </div>

                {/* Admin controls (관리 모드일 때만) */}
                {(onEdit || onDelete) && (
                    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEdit(app);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-sm shadow-md transition-colors"
                                title="수정"
                            >
                                ✏️
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={handleDeleteClick}
                                className={`px-2.5 py-1.5 rounded-lg text-sm shadow-md transition-colors ${
                                    confirmDelete
                                        ? 'bg-red-500 hover:bg-red-600 text-white font-bold'
                                        : 'bg-white/90 hover:bg-white'
                                }`}
                                title="삭제"
                            >
                                {confirmDelete ? '정말 삭제?' : '🗑️'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-primary-700 group-hover:text-primary-500 transition-colors">
                        {app.title}
                    </h3>
                    {app.target && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-warm-50 text-warm-300 font-medium">
                            {app.target}
                        </span>
                    )}
                </div>

                <p className="text-sm text-warm-300 leading-relaxed mb-4">
                    {app.description}
                </p>

                {/* Notice / Password Info */}
                {app.notice && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
                        <p className="text-xs text-amber-700 flex items-center gap-1.5 font-medium">
                            <span className="text-sm">🔑</span> {app.notice}
                        </p>
                    </div>
                )}

                {/* Tags */}
                {app.tags && app.tags.length > 0 && (
                    <div className="flex flex-wrap gap-x-2 gap-y-1 mb-5">
                        {app.tags.map(tag => (
                            <span key={tag} className="text-[11px] text-primary-400/80 font-medium">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action button */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center text-sm font-bold text-primary-600 group-hover:text-primary-500 transition-colors">
                        <span>정원 입장하기</span>
                        <svg className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </a>
    );
}
