'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useBattleStats } from '@/hooks'
import type { BattleWithProfiles } from '@/types'
import { BattleStatusBadge } from './BattleStatusBadge'
import { ScoreBar } from './ScoreBar'

interface BattleCardProps {
  battle: BattleWithProfiles
  onAccept?: (battleId: string) => void
  onReject?: (battleId: string) => void
}

export function BattleCard({ battle, onAccept, onReject }: BattleCardProps) {
  const { user } = useAuth()
  const { stats, isLoading } = useBattleStats(battle.status === 'active' || battle.status === 'completed' ? battle.id : null)

  const isCreator = user?.id === battle.creator_id
  const opponent = isCreator ? battle.opponent : battle.creator
  const isPendingForMe = battle.status === 'pending' && !isCreator

  const myScore = isCreator ? stats?.creatorScore : stats?.opponentScore
  const opponentScore = isCreator ? stats?.opponentScore : stats?.creatorScore

  const formatTimeRemaining = () => {
    if (!stats || !stats.isActive) return null
    if (stats.daysRemaining === 0) return '今日終了'
    return `残り ${stats.daysRemaining} 日`
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <BattleStatusBadge status={battle.status} />
        {battle.status === 'active' && stats && (
          <span className="text-sm text-gray-600">{formatTimeRemaining()}</span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
          {(opponent.display_name || '?').charAt(0)}
        </div>
        <div>
          <p className="font-bold text-gray-800">{opponent.display_name || '名無し'}</p>
          <p className="text-sm text-gray-600">Lv.{opponent.level}</p>
        </div>
      </div>

      {battle.status === 'active' && !isLoading && stats && myScore && opponentScore && (
        <div className="space-y-3 mb-4">
          <ScoreBar
            label="あなた"
            points={myScore.totalPoints}
            maxPoints={Math.max(myScore.totalPoints, opponentScore.totalPoints, 1)}
            color="blue"
          />
          <ScoreBar
            label={opponent.display_name || '名無し'}
            points={opponentScore.totalPoints}
            maxPoints={Math.max(myScore.totalPoints, opponentScore.totalPoints, 1)}
            color="purple"
          />
        </div>
      )}

      {battle.status === 'completed' && stats && (
        <div className="text-center py-4">
          {stats.winner === null ? (
            <p className="text-lg font-bold text-gray-600">引き分け</p>
          ) : (stats.winner === 'creator' && isCreator) || (stats.winner === 'opponent' && !isCreator) ? (
            <>
              <p className="text-2xl font-bold text-yellow-500">🎉 勝利！</p>
              <p className="text-sm text-gray-600 mt-1">+{battle.bonus_points.toLocaleString()}pt ボーナス獲得</p>
            </>
          ) : (
            <p className="text-lg font-bold text-gray-600">敗北</p>
          )}
        </div>
      )}

      {isPendingForMe && onAccept && onReject && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onReject(battle.id)}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            拒否
          </button>
          <button
            onClick={() => onAccept(battle.id)}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            承認
          </button>
        </div>
      )}

      {battle.status === 'pending' && isCreator && (
        <p className="text-sm text-gray-500 text-center mt-4">
          相手の承認を待っています...
        </p>
      )}
    </div>
  )
}
