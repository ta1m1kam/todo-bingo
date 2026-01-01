'use client'

import { useState, useRef, useEffect } from 'react'
import { useBingoCards } from '@/hooks'

interface CardTabsProps {
  onCreateClick: () => void
}

export function CardTabs({ onCreateClick }: CardTabsProps) {
  const { cards, activeCardId, switchCard, deleteCard, canCreateCard, isLoading } = useBingoCards()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeIndex = cards.findIndex(c => c.id === activeCardId)
  const activeCard = cards[activeIndex]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handlePrev = () => {
    if (activeIndex > 0) {
      switchCard(cards[activeIndex - 1].id)
    }
  }

  const handleNext = () => {
    if (activeIndex < cards.length - 1) {
      switchCard(cards[activeIndex + 1].id)
    }
  }

  const handleDelete = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (cardId === activeCardId) return
    if (cards.length <= 1) return
    if (window.confirm('このカードを削除しますか？\nこの操作は取り消せません。')) {
      await deleteCard(cardId)
      setIsDropdownOpen(false)
    }
  }

  const handleCardSelect = (cardId: string) => {
    switchCard(cardId)
    setIsDropdownOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2">
        <div className="animate-pulse h-12 w-full max-w-sm bg-gray-200 rounded-xl"></div>
      </div>
    )
  }

  if (cards.length === 0) {
    return null
  }

  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < cards.length - 1

  return (
    <div className="flex items-center justify-center gap-2 px-2">
      {/* Previous Button */}
      <button
        onClick={handlePrev}
        disabled={!hasPrev}
        className={`
          p-3 rounded-full transition-all flex-shrink-0
          ${hasPrev
            ? 'bg-white shadow-md hover:shadow-lg hover:scale-105 text-gray-700'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }
        `}
        title="前のカード"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Card Selector */}
      <div className="relative flex-1 max-w-sm" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="
            w-full px-4 py-3 rounded-xl
            bg-white shadow-md hover:shadow-lg
            flex items-center justify-between gap-2
            transition-all
          "
        >
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <span>{activeIndex + 1}/{cards.length}</span>
              {canCreateCard && <span className="text-xs">（最大5枚）</span>}
            </div>
            <div className="font-bold text-gray-800 truncate">
              {activeCard?.title || 'カードを選択'}
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {cards.map((card, index) => {
                const isActive = card.id === activeCardId
                const canDelete = cards.length > 1 && !isActive

                return (
                  <div
                    key={card.id}
                    className={`
                      flex items-center justify-between gap-2 px-4 py-3
                      ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      ${index !== cards.length - 1 ? 'border-b border-gray-100' : ''}
                      cursor-pointer
                    `}
                    onClick={() => handleCardSelect(card.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-sm text-gray-400 w-6">{index + 1}</span>
                      <span className={`truncate ${isActive ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                        {card.title}
                      </span>
                      {isActive && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    {canDelete && (
                      <button
                        onClick={(e) => handleDelete(card.id, e)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                        title="削除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Create New Button in Dropdown */}
            {canCreateCard && (
              <button
                onClick={() => {
                  setIsDropdownOpen(false)
                  onCreateClick()
                }}
                className="
                  w-full px-4 py-3 border-t border-gray-200
                  flex items-center justify-center gap-2
                  text-gray-600 hover:bg-gray-50 transition-colors
                  font-medium
                "
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新しいカードを作成
              </button>
            )}
          </div>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!hasNext}
        className={`
          p-3 rounded-full transition-all flex-shrink-0
          ${hasNext
            ? 'bg-white shadow-md hover:shadow-lg hover:scale-105 text-gray-700'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }
        `}
        title="次のカード"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
