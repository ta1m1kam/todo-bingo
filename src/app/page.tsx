'use client'

import { useState, useCallback } from 'react'
import { BingoCard, BingoStatus, ModeToggle, SizeSelector } from '@/components/bingo'
import {
  PointsDisplay,
  PointsGain,
  LevelBadge,
  LevelUpPopup,
  AchievementPopup,
  BadgeGrid,
  StreakCounter,
  StreakCalendar,
} from '@/components/gamification'
import { ShareButton, ShareModal, Ranking } from '@/components/social'
import { Dashboard } from '@/components/analytics'
import { AuthModal, UserMenu } from '@/components/auth'
import { useBingoCard, useGameState } from '@/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { BADGE_DEFINITIONS } from '@/types'
import type { BingoMode } from '@/types'

export default function Home() {
  const [mode, setMode] = useState<BingoMode>('edit')
  const [showCalendar, setShowCalendar] = useState(false)
  const [showRanking, setShowRanking] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const { user } = useAuth()

  const {
    size,
    hasFreeCenter,
    cells,
    title,
    stats,
    isLoaded: cardLoaded,
    prevBingoLines,
    updateCell,
    changeSize,
    toggleFreeCenter,
    resetCard,
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

  const handleCellUpdate = useCallback((position: number, updates: Parameters<typeof updateCell>[1]) => {
    const { wasCompletion, prevBingoLines: bingosBefore } = updateCell(position, updates)

    if (wasCompletion && updates.is_completed) {
      const updatedCells = cells.map(c =>
        c.position === position ? { ...c, ...updates } : c
      )
      onCellComplete(updatedCells, size, bingosBefore)
    }
  }, [cells, size, updateCell, onCellComplete])

  const handleSizeChange = useCallback((newSize: typeof size) => {
    if (cells.some(c => c.goal_text || c.is_completed)) {
      if (!window.confirm('サイズを変更するとすべてのデータがリセットされます。続けますか？')) {
        return
      }
    }
    changeSize(newSize)
  }, [cells, changeSize])

  const handleFreeCenterChange = useCallback((enabled: boolean) => {
    if (cells.some(c => c.goal_text || c.is_completed)) {
      if (!window.confirm('設定を変更するとすべてのデータがリセットされます。続けますか？')) {
        return
      }
    }
    toggleFreeCenter(enabled)
  }, [cells, toggleFreeCenter])

  const handleReset = useCallback(() => {
    if (window.confirm('すべてのマスをリセットしますか？')) {
      resetCard()
    }
  }, [resetCard])

  const handleClearProgress = useCallback(() => {
    if (window.confirm('達成状況をリセットしますか？（目標は残ります）')) {
      resetProgress()
    }
  }, [resetProgress])

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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

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
              <UserMenu onLoginClick={() => setShowAuthModal(true)} />
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

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <SizeSelector
              size={size}
              onSizeChange={handleSizeChange}
            />
            <ModeToggle mode={mode} onModeChange={setMode} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasFreeCenter}
                onChange={(e) => handleFreeCenterChange(e.target.checked)}
                disabled={size % 2 === 0}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
              />
              <span className={`text-sm ${size % 2 === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                中央フリーマス
              </span>
            </label>

            <button
              onClick={handleClearProgress}
              className="text-sm text-orange-600 hover:text-orange-700 underline"
            >
              進捗をリセット
            </button>

            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              すべてリセット
            </button>
          </div>
        </div>

        {/* Mode Indicator */}
        <div className={`text-center text-sm font-medium py-2 rounded-lg ${
          mode === 'edit'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {mode === 'edit'
            ? '✏️ マスをクリックして目標を入力してください'
            : '🎯 達成した目標のマスをクリックしてください'
          }
        </div>

        {/* Bingo Card */}
        <BingoCard
          cells={cells}
          size={size}
          mode={mode}
          title={title}
          onCellUpdate={handleCellUpdate}
        />

        {/* Status */}
        <BingoStatus cells={cells} size={size} />

        {/* Share Button */}
        <div className="flex justify-center">
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

        {/* Badges */}
        <BadgeGrid
          badges={BADGE_DEFINITIONS}
          earnedBadgeIds={gameState.earnedBadgeIds}
        />

        {/* Dashboard Toggle */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <span>📊</span> ダッシュボード
            </h3>
            <span className="text-gray-400">{showDashboard ? '▲' : '▼'}</span>
          </button>
          {showDashboard && (
            <div className="border-t p-4">
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
            </div>
          )}
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

        {/* Activity Calendar Toggle */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <span>📅</span> アクティビティカレンダー
            </h3>
            <span className="text-gray-400">{showCalendar ? '▲' : '▼'}</span>
          </button>
          {showCalendar && (
            <div className="mt-4">
              <StreakCalendar activityDates={gameState.activityDates} />
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-medium text-gray-800 mb-2">💡 ヒント</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 編集モードでマスをクリックして目標を入力</li>
            <li>• 達成モードでマスをクリックして達成マーク</li>
            <li>• 縦・横・斜めのラインを揃えてビンゴ!</li>
            <li>• 連続で達成するとストリークボーナス!</li>
            <li>• バッジを集めて実績をアンロック!</li>
            <li>• SNSでシェアして友達と競おう!</li>
          </ul>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-medium text-gray-800 mb-3">📊 統計</h3>
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

        {/* Data Management */}
        <div className="text-center">
          <button
            onClick={resetGameState}
            className="text-xs text-gray-400 hover:text-red-500 underline"
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
