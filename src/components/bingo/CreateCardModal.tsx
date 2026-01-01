'use client'

import { useState, useEffect, useRef } from 'react'
import { useBingoCards } from '@/hooks'

interface CreateCardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateCardModal({ isOpen, onClose }: CreateCardModalProps) {
  const { createCard, canCreateCard, cardCount } = useBingoCards()
  const [title, setTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setError(null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('タイトルを入力してください')
      return
    }
    if (!canCreateCard) {
      setError('カードは最大5枚までです')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const newCardId = await createCard(title.trim())
      if (newCardId) {
        onClose()
      } else {
        setError('カードの作成に失敗しました')
      }
    } catch {
      setError('カードの作成に失敗しました')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">新しいビンゴカード</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!canCreateCard && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            カードは最大5枚まで作成できます。新しいカードを作成するには、既存のカードを削除してください。
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="card-title" className="block text-sm font-medium text-gray-700 mb-1">
              カードのタイトル
            </label>
            <input
              ref={inputRef}
              id="card-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 仕事の目標、健康チャレンジ"
              maxLength={50}
              disabled={!canCreateCard || isCreating}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500">{title.length}/50文字</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!canCreateCard || isCreating || !title.trim()}
              className="flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary))' }}
            >
              {isCreating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  作成中...
                </span>
              ) : (
                `作成（${cardCount}/5枚）`
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          カードのサイズやFREEマスは、設定ページから後で変更できます。
        </p>
      </div>
    </div>
  )
}
