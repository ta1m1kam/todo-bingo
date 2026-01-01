import type { Metadata, Viewport } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BingoCardProvider } from "@/contexts/BingoCardContext";
import { AuthGuard } from "@/components/auth";
import "./globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-zen-maru",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://todo-bingo.vercel.app"
  ),
  title: "とぅーどぅーびんご | 目標達成をゲーム化する新習慣",
  description: "年間目標をビンゴカードに変換。達成するたびにポイント獲得、レベルアップ、バッジ解放。ゲーミフィケーションで継続率を劇的に向上させる目標管理アプリ。",
  keywords: ["目標管理", "ビンゴ", "習慣化", "ゲーミフィケーション", "タスク管理", "2025年", "新年の抱負"],
  authors: [{ name: "とぅーどぅーびんご Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "とぅーどぅーびんご",
  },
  openGraph: {
    title: "とぅーどぅーびんご | 目標達成をゲーム化する新習慣",
    description: "年間目標をビンゴカードに変換。達成するたびにポイント獲得、レベルアップ、バッジ解放。ゲーミフィケーションで継続率を劇的に向上。",
    type: "website",
    locale: "ja_JP",
    siteName: "とぅーどぅーびんご",
  },
  twitter: {
    card: "summary_large_image",
    title: "とぅーどぅーびんご | 目標達成をゲーム化 🎯",
    description: "年間目標をビンゴに。達成でポイント獲得・レベルアップ・バッジ解放。ゲーム感覚で継続率UP！",
    creator: "@todo_bingo",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${zenMaruGothic.variable} antialiased`}
        style={{ fontFamily: 'var(--font-zen-maru), sans-serif' }}
      >
        <AuthProvider>
          <ThemeProvider>
            <BingoCardProvider>
              <AuthGuard>
                {children}
              </AuthGuard>
            </BingoCardProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
