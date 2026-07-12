"use client";

import React from 'react';
import Link from 'next/link';

interface FooterProps {
    onPrivacyClick: () => void;
    onTermsClick: () => void;
}

export default function Footer({ onPrivacyClick, onTermsClick }: FooterProps) {
    return (
        <footer className="bg-primary-700 text-white">
            {/* Main footer content */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo and description */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="text-xl">🌱</span>
                            </div>
                            <span className="text-xl font-bold">앱뜰</span>
                        </div>
                        <p className="text-primary-200 text-sm leading-relaxed">
                            배움이 싹트는 우리들의 디지털 정원<br />
                            초등교사 개발자가 만든 교육용 웹앱 갤러리
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold mb-4 text-accent-300">정책 및 약관</h4>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={onPrivacyClick}
                                    className="text-primary-200 hover:text-white transition-colors text-sm"
                                >
                                    🔒 개인정보처리방침
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={onTermsClick}
                                    className="text-primary-200 hover:text-white transition-colors text-sm"
                                >
                                    📋 이용약관
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4 text-accent-300">문의</h4>
                        <ul className="space-y-2 text-sm text-primary-200">
                            <li className="flex items-center gap-2">
                                <span>📧</span>
                                <a
                                    href="mailto:forinnocen@sen.go.kr"
                                    className="hover:text-white transition-colors"
                                >
                                    forinnocen@sen.go.kr
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>🏫</span>
                                <span>서울특별시교육청 소속</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-primary-600">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-300">
                        <p>
                            © 2026 App-Tteul. All rights reserved.
                            <Link
                                href="/admin"
                                aria-label="관리자"
                                className="ml-1 text-primary-600 hover:text-primary-300 transition-colors"
                            >
                                ·
                            </Link>
                        </p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onPrivacyClick}
                                className="hover:text-white transition-colors"
                            >
                                개인정보처리방침
                            </button>
                            <span className="text-primary-500">|</span>
                            <button
                                onClick={onTermsClick}
                                className="hover:text-white transition-colors"
                            >
                                이용약관
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
