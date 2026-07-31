"use client";

import React, { useState } from 'react';
import AppCard, { AppData } from './AppCard';

interface AppGalleryProps {
    apps: AppData[];
    onEdit?: (app: AppData) => void;
    onDelete?: (app: AppData) => void;
}

const categories = ['전체', '교과', '학급운영', '창체', '연수'] as const;

export default function AppGallery({ apps, onEdit, onDelete }: AppGalleryProps) {
    const [activeCategory, setActiveCategory] = useState<string>('전체');

    const filteredApps = activeCategory === '전체'
        ? apps
        : apps.filter(app => app.category === activeCategory);

    return (
        <section className="py-12 sm:py-16 px-4 bg-warm-50/30">
            <div className="max-w-7xl mx-auto">
                {/* Section title */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-primary-700 mb-2">
                        🌻 앱 갤러리
                    </h2>
                    <p className="text-warm-300">우리 교실에서 바로 사용할 수 있는 앱들이에요</p>
                </div>

                {/* Category filter */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${activeCategory === category
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                                : 'bg-white text-warm-300 hover:bg-primary-50 hover:text-primary-600 border border-primary-100'
                                }`}
                        >
                            {category === '전체' && <span className="text-lg">📱</span>}
                            {category === '교과' && <img src="/category-curriculum.png" alt="" className="w-5 h-5 object-contain" />}
                            {category === '학급운영' && <img src="/category-classroom.png" alt="" className="w-5 h-5 object-contain" />}
                            {category === '창체' && <img src="/category_creative.png" alt="" className="w-5 h-5 object-contain" />}
                            {category === '연수' && <span className="text-lg">🎓</span>}
                            {category}
                        </button>
                    ))}
                </div>

                {/* App grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredApps.map((app) => (
                        <AppCard key={app.id} app={app} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>

                {/* Empty state */}
                {filteredApps.length === 0 && (
                    <div className="text-center py-16">
                        <span className="text-6xl mb-4 block">🌱</span>
                        <p className="text-warm-300 text-lg">
                            이 카테고리에는 아직 앱이 없어요.<br />
                            곧 새로운 앱이 자라날 거예요!
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
