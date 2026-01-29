"use client";

import React from 'react';

export default function Hero() {
    return (
        <section className="gradient-hero py-16 sm:py-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
                {/* Decorative elements */}
                <div className="flex justify-center mb-8">
                    <img
                        src="/hero-illustration.png"
                        alt="앱뜰 일러스트"
                        className="w-full max-w-[400px] h-auto drop-shadow-xl animate-float"
                    />
                </div>

                {/* Main heading */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-700 mb-4">
                    앱뜰에 오신 것을 환영합니다!
                </h2>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-warm-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                    초등교사 개발자가 정성껏 가꾼 <br className="sm:hidden" />
                    <span className="text-primary-600 font-semibold">교육용 웹앱</span>들이 자라나는 곳이에요.
                </p>

                {/* Description */}
                <p className="text-base sm:text-lg text-warm-200 max-w-xl mx-auto">
                    아래 앱들을 클릭하면 새 창에서 바로 사용할 수 있어요! 🚀
                </p>

                {/* Decorative divider */}
                <div className="mt-10 flex items-center justify-center gap-2">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary-300"></div>
                    <span className="text-2xl">🌱</span>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary-300"></div>
                </div>
            </div>
        </section>
    );
}
