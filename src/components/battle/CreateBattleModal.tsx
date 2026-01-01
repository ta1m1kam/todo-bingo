'use client'

import { useState } from 'react'
import { useBattles } from '@/hooks'
import { BATTLE_DURATIONS } from '@/types'
import { FriendSelector } from './FriendSelector'

interface CreateBattleModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateBattleModal({ isOpen, onClose }: CreateBattleModalProps) {
  const { createBattle } = useBattles()
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [durationDays, setDurationDays] = useState(7)
  const [bonusPoints, setBonusPoints] = useState(1000)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFriendId) return

    setIsSubmitting(true)
    setError(null)

    try {
      await createBattle({
        opponentId: selectedFriendId,
        durationDays,
        bonusPoints,
      })
      setSelectedFriendId(null)
      setDurationDays(7)
      setBonusPoints(1000)
      onClose()
    } catch (err) {
      setError('バトルの作成に失敗しました')
      console.error('Create battle error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">⚔️ バトル作成</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対戦相手を選択
            </label>
            <FriendSelector
              selectedId={selectedFriendId}
              onChange={setSelectedFriendId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              バトル期間
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BATTLE_DURATIONS.map((d) => (
                <button
                  key={d.days}
                  type="button"
                  onClick={() => setDurationDays(d.days)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    durationDays === d.days
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              勝利ボーナスポイント
            </label>
            <input
              type="number"
              value={bonusPoints}
              onChange={(e) => setBonusPoints(Number(e.target.value))}
              min={0}
              step={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              勝者に付与されるボーナスポイントです
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={isSubmitting || !selectedFriendId}
            >
              {isSubmitting ? '送信中...' : 'バトル申請'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
