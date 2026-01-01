'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { BingoCard, BingoStatus } from '@/components/bingo'
import {
  PointsDisplay,
  PointsGain,
  LevelBadge,
  LevelUpPopup,
  AchievementPopup,
  StreakCounter,
} from '@/components/gamification'
import { ShareButton, ShareModal, Ranking } from '@/components/social'
import { UserMenu } from '@/components/auth'
import { useBingoCard, useGameState } from '@/hooks'

export default function Home() {
  const [showRanking, setShowRanking] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const {
    size,
    cells,
    title,
    stats,
    isLoaded: cardLoaded,
    updateCell,
    resetProgress,
  } = useBingoCard()

  const {
    gameState,
    isLoaded: gameLoaded,
    onCellComplete,
    pendingBadge,
    pendingLevelUp,
    pendingPoints,
    clearPendingBadge,
    clearPendingLevelUp,
    clearPendingPoints,
    resetGameState,
  } = useGameState()

  const handleCellComplete = useCallback((position: number) => {
    const cell = cells.find(c => c.position === position)
    if (!cell || cell.is_free || !cell.goal_text) return

    const { wasCompletion, prevBingoLines: bingosBefore } = updateCell(position, { is_completed: !cell.is_completed })

    if (wasCompletion) {
      const updatedCells = cells.map(c =>
        c.position === position ? { ...c, is_completed: true } : c
      )
      onCellComplete(updatedCells, size, bingosBefore)
    }
  }, [cells, size, updateCell, onCellComplete])

  const handleClearProgress = useCallback(() => {
    if (window.confirm('達成状況をリセットしますか？（目標は残ります）')) {
      resetProgress()
    }
  }, [resetProgress])

  const filledCells = cells.filter(c => c.goal_text && !c.is_free).length
  const totalEditableCells = cells.filter(c => !c.is_free).length
  const hasGoals = filledCells > 0

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
      {/* Notifications */}
      {pendingPoints && (
        <PointsGain points={pendingPoints} onAnimationEnd={clearPendingPoints} />
      )}
      {pendingBadge && (
        <AchievementPopup badge={pendingBadge} onClose={clearPendingBadge} />
      )}
      {pendingLevelUp && (
        <LevelUpPopup newLevel={pendingLevelUp} onClose={clearPendingLevelUp} />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        bingoLines={stats.bingoLines}
        completedCells={stats.completedCells}
        totalCells={stats.totalCells}
        level={gameState.level}
        size={size}
        cells={cells}
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Todo Bingo 2025
              </h1>
              <p className="text-gray-500 text-sm">今年の目標をビンゴで達成しよう</p>
            </div>
            <div className="flex items-center gap-3">
              <PointsDisplay points={gameState.totalPoints} size="sm" />
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                title="シェア"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Game Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LevelBadge
            level={gameState.level}
            totalPoints={gameState.totalPoints}
            showProgress
          />
          <StreakCounter
            currentStreak={gameState.currentStreak}
            maxStreak={gameState.maxStreak}
            lastActivityDate={gameState.lastActivityDate}
          />
        </div>

        {/* No Goals Warning */}
        {!hasGoals && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <h3 className="font-medium text-yellow-800">目標を入力してください</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  まずは目標を設定しましょう。入力が完了したら達成を記録できます。
                </p>
                <Link
                  href="/goals"
                  className="inline-block mt-3 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                >
                  目標を入力する
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mode Indicator */}
        <div className="text-center text-sm font-medium py-3 rounded-lg bg-green-100 text-green-700">
          🎯 達成した目標のマスをクリックしてください
          {hasGoals && (
            <span className="ml-2 text-green-600">
              ({stats.completedCells}/{filledCells} 達成)
            </span>
          )}
        </div>

        {/* Bingo Card */}
        <BingoCard
          cells={cells}
          size={size}
          mode="play"
          title={title}
          onCellUpdate={(position) => handleCellComplete(position)}
        />

        {/* Status */}
        <BingoStatus cells={cells} size={size} />

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/goals"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            目標を編集
          </Link>
          <ShareButton
            data={{
              title: 'Todo Bingo 2025',
              text: '',
              bingoLines: stats.bingoLines,
              completedCells: stats.completedCells,
              totalCells: stats.totalCells,
              level: gameState.level,
            }}
          />
        </div>

        {/* Ranking Toggle */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <button
            onClick={() => setShowRanking(!showRanking)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <span>🏆</span> ランキング
            </h3>
            <span className="text-gray-400">{showRanking ? '▲' : '▼'}</span>
          </button>
          {showRanking && (
            <div className="border-t">
              <Ranking
                currentUserPoints={gameState.totalPoints}
                currentUserLevel={gameState.level}
                currentUserBingos={gameState.totalBingos}
              />
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/goals"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
          >
            <span className="text-2xl">📝</span>
            <div>
              <h3 className="font-medium text-gray-800">目標入力</h3>
              <p className="text-sm text-gray-500">リスト形式</p>
            </div>
          </Link>
          <Link
            href="/analytics"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
          >
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="font-medium text-gray-800">統計・分析</h3>
              <p className="text-sm text-gray-500">達成状況を確認</p>
            </div>
          </Link>
          <Link
            href="/settings"
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
          >
            <span className="text-2xl">⚙️</span>
            <div>
              <h3 className="font-medium text-gray-800">設定</h3>
              <p className="text-sm text-gray-500">テーマなど</p>
            </div>
          </Link>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-medium text-gray-800 mb-2">💡 ヒント</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 目標入力ページでリスト形式で簡単に入力</li>
            <li>• マスをクリックして達成マーク</li>
            <li>• 縦・横・斜めのラインを揃えてビンゴ!</li>
            <li>• 連続で達成するとストリークボーナス!</li>
            <li>• バッジを集めて実績をアンロック!</li>
            <li>• SNSでシェアして友達と競おう!</li>
          </ul>
        </div>

        {/* Data Management */}
        <div className="flex justify-center gap-4 text-xs">
          <button
            onClick={handleClearProgress}
            className="text-orange-500 hover:text-orange-600 underline"
          >
            進捗をリセット
          </button>
          <button
            onClick={resetGameState}
            className="text-gray-400 hover:text-red-500 underline"
          >
            ゲームデータをリセット
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        <p>Todo Bingo - 目標達成ゲーム</p>
      </footer>
    </div>
  )
}
