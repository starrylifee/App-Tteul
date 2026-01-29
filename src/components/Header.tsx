"use client";

import React from 'react';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <img src="/logo.png" alt="앱뜰 로고" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-700">
                앱뜰 <span className="text-primary-500 text-sm sm:text-base font-medium">(App-Tteul)</span>
              </h1>
            </div>
          </div>

          {/* Slogan */}
          <p className="hidden md:block text-sm text-warm-300 font-medium">
            🌿 배움이 싹트는 우리들의 디지털 정원
          </p>
        </div>
      </div>
    </header>
  );
}
