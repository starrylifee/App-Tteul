import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "앱뜰 (App-Tteul)",
  description: "초등교사 개발자가 가꾼 우리 교실 교육용 웹앱 정원",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "앱뜰 (App-Tteul)",
    description: "초등교사 개발자가 가꾼 우리 교실 교육용 웹앱 정원 🌱",
    images: [
      {
        url: "/og_image.png",
        width: 1200,
        height: 630,
        alt: "앱뜰 - 교육용 웹앱 정원",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "앱뜰 (App-Tteul)",
    description: "초등교사 개발자가 가꾼 우리 교실 교육용 웹앱 정원 🌱",
    images: ["/og_image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
