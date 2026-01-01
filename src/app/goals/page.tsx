'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { HamburgerMenu } from '@/components/ui'
import { CardTabs, CreateCardModal } from '@/components/bingo'
import { useActiveBingoCard, useBingoCards } from '@/hooks'
import { CATEGORIES, type Category } from '@/types'

export default function GoalsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { cards, isLoading: cardsLoading } = useBingoCards()

  const {
    size,
    cells,
    title,
    hasFreeCenter,
    isLoaded: cardLoaded,
    isSaving,
    updateCell,
    setTitle,
    resetCard,
  } = useActiveBingoCard()

  const isLoaded = cardLoaded && !cardsLoading

  const handleClearAll = useCallback(() => {
    if (window.confirm('すべての目標をクリアしますか？\nこの操作は取り消せません。')) {
      resetCard()
      setLocalEdits({})
    }
  }, [resetCard])

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [localEdits, setLocalEdits] = useState<Record<number, string>>({})
  const [savingPositions, setSavingPositions] = useState<Set<number>>(new Set())
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Reset local edits when cells change from server
  useEffect(() => {
    setLocalEdits({})
  }, [cells])

  const totalCells = size * size
  const freeCells = cells.filter(c => c.is_free).length
  const editableCells = totalCells - freeCells

  // Count filled cells considering local edits
  const filledCells = cells.filter(c => {
    if (c.is_free) return false
    const displayValue = localEdits[c.position] ?? c.goal_text
    return displayValue.length > 0
  }).length

  const unsavedCount = Object.keys(localEdits).filter(pos =>
    hasUnsavedChange(Number(pos))
  ).length

  const handleLocalChange = useCallback((position: number, text: string) => {
    setLocalEdits(prev => ({ ...prev, [position]: text }))
  }, [])

  const handleSave = useCallback(async (position: number) => {
    const text = localEdits[position]
    if (text === undefined) return

    setSavingPositions(prev => new Set(prev).add(position))
    try {
      await updateCell(position, { goal_text: text })
      setLocalEdits(prev => {
        const next = { ...prev }
        delete next[position]
        return next
      })
    } finally {
      setSavingPositions(prev => {
        const next = new Set(prev)
        next.delete(position)
        return next
      })
    }
  }, [localEdits, updateCell])

  const hasUnsavedChange = useCallback((position: number): boolean => {
    const localValue = localEdits[position]
    if (localValue === undefined) return false
    const savedValue = cells.find(c => c.position === position)?.goal_text ?? ''
    return localValue !== savedValue
  }, [localEdits, cells])

  const handleSaveAll = useCallback(async () => {
    const positions = Object.keys(localEdits)
      .map(Number)
      .filter(pos => {
        const localValue = localEdits[pos]
        const savedValue = cells.find(c => c.position === pos)?.goal_text ?? ''
        return localValue !== savedValue
      })

    if (positions.length === 0) return

    setSavingPositions(new Set(positions))
    try {
      await Promise.all(
        positions.map(pos => updateCell(pos, { goal_text: localEdits[pos] }))
      )
      setLocalEdits({})
    } finally {
      setSavingPositions(new Set())
    }
  }, [localEdits, cells, updateCell])

  const getDisplayValue = (position: number): string => {
    return localEdits[position] ?? cells.find(c => c.position === position)?.goal_text ?? ''
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault()
      const nextIndex = currentIndex + 1
      if (nextIndex < cells.length) {
        const nextCell = cells[nextIndex]
        if (!nextCell.is_free) {
          inputRefs.current[nextIndex]?.focus()
          setFocusedIndex(nextIndex)
        } else if (nextIndex + 1 < cells.length) {
          inputRefs.current[nextIndex + 1]?.focus()
          setFocusedIndex(nextIndex + 1)
        }
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      const prevIndex = currentIndex - 1
      if (prevIndex >= 0) {
        const prevCell = cells[prevIndex]
        if (!prevCell.is_free) {
          inputRefs.current[prevIndex]?.focus()
          setFocusedIndex(prevIndex)
        } else if (prevIndex - 1 >= 0) {
          inputRefs.current[prevIndex - 1]?.focus()
          setFocusedIndex(prevIndex - 1)
        }
      }
    }
  }, [cells])

  const getPositionLabel = (position: number): string => {
    const row = Math.floor(position / size) + 1
    const col = (position % size) + 1
    return `${row}行${col}列`
  }

  const scrollToNext = useCallback(() => {
    const nextEmpty = cells.findIndex(c => {
      if (c.is_free) return false
      const displayValue = localEdits[c.position] ?? c.goal_text
      return !displayValue
    })
    if (nextEmpty !== -1) {
      inputRefs.current[nextEmpty]?.focus()
      inputRefs.current[nextEmpty]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setFocusedIndex(nextEmpty)
    }
  }, [cells, localEdits])

  if (!isLoaded) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-background)' }}>
        {/* Header with navigation during loading */}
        <header className="bg-white/95 shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <HamburgerMenu />
                <Link
                  href="/"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">目標入力</h1>
                  <p className="text-sm text-gray-500">リスト形式で簡単に入力</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Loading content */}
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--theme-primary)' }}></div>
            <div className="text-xl text-gray-500">読み込み中...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-background)' }}>
      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Header */}
      <header className="bg-white/95 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <HamburgerMenu />
              <Link
                href="/"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">目標入力</h1>
                <p className="text-sm text-gray-500">リスト形式で簡単に入力</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {unsavedCount > 0 && (
                <button
                  onClick={handleSaveAll}
                  disabled={savingPositions.size > 0}
                  className="px-3 py-1.5 text-white text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  {savingPositions.size > 0 ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>すべて保存 ({unsavedCount})</>
                  )}
                </button>
              )}
              <span className="text-sm text-gray-600 hidden sm:inline">
                <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>{filledCells}</span>
                <span className="text-gray-400"> / {editableCells} 入力済み</span>
              </span>
              <button
                onClick={scrollToNext}
                disabled={filledCells >= editableCells}
                className="px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                次の空欄へ
              </button>
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

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${(filledCells / editableCells) * 100}%`, backgroundColor: 'var(--theme-primary)' }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Title Input */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ビンゴカードのタイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 text-lg text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            placeholder="例: 2025年の目標"
          />
        </div>

        {/* Mini Preview */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-800">プレビュー</h2>
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              カードを見る →
            </Link>
          </div>
          <div
            className="grid gap-1 max-w-xs mx-auto"
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          >
            {cells.map((cell, index) => (
              <div
                key={index}
                className={`aspect-square rounded-sm flex items-center justify-center text-xs
                  ${cell.is_free ? 'bg-yellow-200' : cell.goal_text ? 'bg-blue-200' : 'bg-gray-100'}
                  ${focusedIndex === index ? 'ring-2 ring-blue-500' : ''}
                `}
                title={cell.goal_text || (cell.is_free ? 'FREE' : '未入力')}
              >
                {cell.is_free ? '★' : cell.goal_text ? '✓' : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Goal List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-medium text-gray-800">目標リスト</h2>
            <p className="text-sm text-gray-500 mt-1">
              Enterキーで次の項目に移動できます
            </p>
          </div>
          <div className="divide-y">
            {cells.map((cell, index) => {
              if (cell.is_free) {
                return (
                  <div
                    key={index}
                    className="px-4 py-3 bg-yellow-50 flex items-center gap-4"
                  >
                    <span className="text-sm text-gray-500 w-20 flex-shrink-0">
                      {getPositionLabel(cell.position)}
                    </span>
                    <div className="flex items-center gap-2 text-yellow-600">
                      <span className="text-lg">★</span>
                      <span className="font-medium">FREE マス</span>
                    </div>
                  </div>
                )
              }

              const displayValue = getDisplayValue(cell.position)
              const isUnsaved = hasUnsavedChange(cell.position)
              const isCellSaving = savingPositions.has(cell.position)

              return (
                <div
                  key={index}
                  className={`px-4 py-3 transition-colors ${
                    isUnsaved ? 'bg-amber-50' : focusedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-16 flex-shrink-0">
                      {getPositionLabel(cell.position)}
                    </span>
                    <div className="flex-1 relative">
                      <input
                        ref={(el) => { inputRefs.current[index] = el }}
                        type="text"
                        value={displayValue}
                        onChange={(e) => handleLocalChange(cell.position, e.target.value)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`w-full px-4 py-2 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                          isUnsaved ? 'border-amber-400' : 'border-gray-300'
                        }`}
                        placeholder="目標を入力..."
                      />
                    </div>
                    {isUnsaved ? (
                      <button
                        onClick={() => handleSave(cell.position)}
                        disabled={isCellSaving}
                        className="px-3 py-1.5 text-white text-sm rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                        style={{ backgroundColor: 'var(--theme-primary)' }}
                      >
                        {isCellSaving ? '...' : '保存'}
                      </button>
                    ) : (
                      <div className="w-14 flex-shrink-0 text-center">
                        {cell.goal_text ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-gray-300">○</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Templates */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-4">
          <h2 className="font-medium text-gray-800 mb-3">💡 目標のヒント</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((category) => (
              <GoalTemplates key={category} category={category} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            ビンゴカードに戻る
          </Link>
          <button
            onClick={handleClearAll}
            disabled={filledCells === 0}
            className="px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            すべての目標をクリア
          </button>
        </div>
      </main>
    </div>
  )
}

function GoalTemplates({ category }: { category: Category }) {
  const templates: Record<Category, string[]> = {
    '健康': ['毎日7時間睡眠', '週3回運動', '野菜を毎食食べる', '禁煙する'],
    '学習': ['英語を勉強', '資格を取得', '本を月2冊読む', '新技術を学ぶ'],
    '仕事': ['昇進する', 'プロジェクト完遂', 'スキルアップ', '残業を減らす'],
    '趣味': ['旅行に行く', '楽器を始める', '写真を撮る', 'DIYする'],
    '人間関係': ['友達と会う', '家族と過ごす', '新しい出会い', '感謝を伝える'],
    'お金': ['貯金する', '投資を始める', '節約する', '収入を増やす'],
    '自己成長': ['瞑想する', '日記を書く', '早起きする', '断捨離する'],
    'その他': ['推し活', 'ボランティア', 'イベント参加', '目標達成'],
  }

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 text-sm font-medium text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-left border border-gray-200"
      >
        {category}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          {templates[category].map((template, i) => (
            <button
              key={i}
              onClick={() => {
                navigator.clipboard.writeText(template)
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 text-sm text-gray-800 text-left hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
            >
              <span className="font-medium">{template}</span>
              <span className="text-xs text-blue-500 ml-2 block mt-0.5">クリックでコピー</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
