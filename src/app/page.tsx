'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { BingoCard, CardTabs, CreateCardModal } from '@/components/bingo'
import {
  PointsGain,
  LevelUpPopup,
  AchievementPopup,
} from '@/components/gamification'
import { ShareModal } from '@/components/social'
import { UserMenu } from '@/components/auth'
import { HamburgerMenu } from '@/components/ui'
import { useActiveBingoCard, useGameState, useBingoCards } from '@/hooks'

export default function Home() {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { cards, isLoading: cardsLoading } = useBingoCards()

  const {
    size,
    cells,
    title,
    stats,
    isLoaded: cardLoaded,
    isSaving,
    updateCell,
  } = useActiveBingoCard()

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
  } = useGameState()

  const handleCellComplete = useCallback(async (position: number) => {
    const cell = cells.find(c => c.position === position)
    if (!cell || cell.is_free || !cell.goal_text) return

    const { wasCompletion, prevBingoLines: bingosBefore } = await updateCell(position, { is_completed: !cell.is_completed })

    if (wasCompletion) {
      const updatedCells = cells.map(c =>
        c.position === position ? { ...c, is_completed: true } : c
      )
      onCellComplete(updatedCells, size, bingosBefore)
    }
  }, [cells, size, updateCell, onCellComplete])

  const filledCells = cells.filter(c => c.goal_text && !c.is_free).length
  const hasGoals = filledCells > 0

  const isLoaded = cardLoaded && gameLoaded && !cardsLoading

  if (!isLoaded) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-background)' }}>
        <header className="bg-white/95 shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HamburgerMenu />
                <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                  とぅーどぅーびんご
                </h1>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--theme-primary)' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-background)' }}>
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
        title={title || 'とぅーどぅーびんご'}
      />

      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Header */}
      <header className="bg-white/95 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HamburgerMenu />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                  とぅーどぅーびんご
                </h1>
                {hasGoals && (
                  <p className="text-sm text-gray-500">
                    {stats.completedCells}/{filledCells} 達成
                    {stats.bingoLines > 0 && ` · ${stats.bingoLines} ビンゴ`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSaving && (
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--theme-primary)' }} />
              )}
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="シェア"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Card Tabs */}
      {cards.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <CardTabs onCreateClick={() => setShowCreateModal(true)} />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* No Cards - Show Create Card */}
        {cards.length === 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">ビンゴカードを作成しましょう</h2>
            <p className="text-gray-600 mb-6">目標を設定してビンゴを達成しよう！</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-block px-6 py-3 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              最初のカードを作成
            </button>
          </div>
        )}

        {/* No Goals Warning */}
        {cards.length > 0 && !hasGoals && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-yellow-800 mb-3">まずは目標を入力しましょう</p>
            <Link
              href="/goals"
              className="inline-block px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
            >
              目標を入力する
            </Link>
          </div>
        )}

        {/* Bingo Card */}
        <BingoCard
          cells={cells}
          size={size}
          mode="play"
          title={title}
          onCellUpdate={(position) => handleCellComplete(position)}
        />

        {/* Action Button */}
        <div className="flex justify-center">
          <Link
            href="/goals"
            className="px-6 py-3 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            目標を編集
          </Link>
        </div>
      </main>
    </div>
  )
}
