'use client'

import Link from 'next/link'
import { ThemeSelector } from '@/components/settings'
import { HamburgerMenu } from '@/components/ui'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="戻る"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">⚙️ 設定</h1>
                <p className="text-gray-500 text-sm">アプリの設定を変更</p>
              </div>
            </div>
            <HamburgerMenu />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <ThemeSelector />

        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <span>ℹ️</span> アプリについて
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Todo Bingo 2025 - 目標達成ゲーム</p>
            <p>ビンゴ形式で楽しく目標を管理・達成しよう！</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </main>
    </div>
  )
}
