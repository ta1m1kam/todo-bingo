'use client'

import { useState, useRef, useEffect } from 'react'
import { useBingoCards } from '@/hooks'

interface CardTabsProps {
  onCreateClick: () => void
}

export function CardTabs({ onCreateClick }: CardTabsProps) {
  const { cards, activeCardId, switchCard, deleteCard, canCreateCard, isLoading } = useBingoCards()
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDelete = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (cardId === activeCardId) {
      alert('アクティブなカードは削除できません。別のカードに切り替えてから削除してください。')
      return
    }
    if (cards.length <= 1) {
      alert('最後のカードは削除できません。')
      return
    }
    if (window.confirm('このカードを削除しますか？この操作は取り消せません。')) {
      await deleteCard(cardId)
    }
    setMenuOpenId(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-lg">
        <div className="animate-pulse h-8 w-24 bg-gray-200 rounded-lg"></div>
        <div className="animate-pulse h-8 w-24 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (cards.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {cards.map((card) => (
        <div key={card.id} className="relative flex-shrink-0">
          <button
            onClick={() => switchCard(card.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              flex items-center gap-2 min-w-[100px] max-w-[160px]
              ${card.id === activeCardId
                ? 'bg-gradient-to-r text-white shadow-md'
                : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-sm'
              }
            `}
            style={card.id === activeCardId ? {
              backgroundImage: 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary))'
            } : undefined}
          >
            <span className="truncate">{card.title}</span>
            {cards.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpenId(menuOpenId === card.id ? null : card.id)
                }}
                className={`
                  ml-auto p-1 rounded-full transition-colors
                  ${card.id === activeCardId
                    ? 'hover:bg-white/20'
                    : 'hover:bg-gray-200'
                  }
                `}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </button>

          {menuOpenId === card.id && (
            <div
              ref={menuRef}
              className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 min-w-[120px]"
            >
              <button
                onClick={(e) => handleDelete(card.id, e)}
                disabled={card.id === activeCardId || cards.length <= 1}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                削除
              </button>
            </div>
          )}
        </div>
      ))}

      {canCreateCard && (
        <button
          onClick={onCreateClick}
          className="flex-shrink-0 px-3 py-2 rounded-lg bg-white/80 text-gray-600 hover:bg-white hover:shadow-sm transition-all flex items-center gap-1 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規
        </button>
      )}
    </div>
  )
}
