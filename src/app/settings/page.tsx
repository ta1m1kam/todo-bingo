'use client'

import Link from 'next/link'
import { ThemeSelector } from '@/components/settings'
import { SizeSelector } from '@/components/bingo'
import { HamburgerMenu } from '@/components/ui'
import { useSupabaseBingoCard } from '@/hooks'

export default function SettingsPage() {
  const {
    size,
    hasFreeCenter,
    isLoaded,
    changeSize,
    toggleFreeCenter,
  } = useSupabaseBingoCard()

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--theme-background), color-mix(in srgb, var(--theme-secondary) 15%, var(--theme-background)))' }}>
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <HamburgerMenu />
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
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Bingo Card Size Settings */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <span>📐</span> ビンゴカードサイズ
          </h3>
          {isLoaded ? (
            <div className="space-y-4">
              <SizeSelector
                size={size}
                onSizeChange={changeSize}
              />
              <p className="text-xs text-orange-500">
                ⚠️ サイズを変更すると現在の目標はリセットされます
              </p>

              <div className="border-t pt-4 mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFreeCenter}
                    onChange={(e) => toggleFreeCenter(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-700">中央をFREEマスにする</span>
                    <p className="text-sm text-gray-500">奇数サイズの場合のみ有効</p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        <ThemeSelector />

        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <span>ℹ️</span> アプリについて
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>とぅーどぅーびんご - 目標達成ゲーム</p>
            <p>ビンゴ形式で楽しく目標を管理・達成しよう！</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/"
            className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
            style={{ background: 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary))' }}
          >
            ホームに戻る
          </Link>
        </div>
      </main>
    </div>
  )
}
