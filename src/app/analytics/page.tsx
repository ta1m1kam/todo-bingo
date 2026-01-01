'use client'

import Link from 'next/link'
import { Dashboard } from '@/components/analytics'
import { StreakCalendar, BadgeGrid } from '@/components/gamification'
import { useBingoCard, useGameState } from '@/hooks'
import { BADGE_DEFINITIONS } from '@/types'

export default function AnalyticsPage() {
  const { cells, isLoaded: cardLoaded } = useBingoCard()
  const { gameState, isLoaded: gameLoaded } = useGameState()

  const isLoaded = cardLoaded && gameLoaded

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
              <h1 className="text-2xl font-bold text-gray-800">📊 統計・分析</h1>
              <p className="text-gray-500 text-sm">達成状況を確認</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-medium text-gray-800 mb-3">📈 クイック統計</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{gameState.totalCellsCompleted}</div>
              <div className="text-xs text-gray-500">総達成マス</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{gameState.totalBingos}</div>
              <div className="text-xs text-gray-500">総ビンゴ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{gameState.earnedBadgeIds.length}</div>
              <div className="text-xs text-gray-500">獲得バッジ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{gameState.maxStreak}</div>
              <div className="text-xs text-gray-500">最長ストリーク</div>
            </div>
          </div>
        </div>

        <Dashboard
          totalPoints={gameState.totalPoints}
          level={gameState.level}
          totalCellsCompleted={gameState.totalCellsCompleted}
          totalBingos={gameState.totalBingos}
          earnedBadgeIds={gameState.earnedBadgeIds}
          maxStreak={gameState.maxStreak}
          activityDates={gameState.activityDates}
          cells={cells}
        />

        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <span>📅</span> アクティビティカレンダー
          </h3>
          <StreakCalendar activityDates={gameState.activityDates} />
        </div>

        <BadgeGrid
          badges={BADGE_DEFINITIONS}
          earnedBadgeIds={gameState.earnedBadgeIds}
        />

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
