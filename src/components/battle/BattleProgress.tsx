'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useBattleStats } from '@/hooks'
import type { BattleWithProfiles } from '@/types'

interface BattleProgressProps {
  battle: BattleWithProfiles
}

export function BattleProgress({ battle }: BattleProgressProps) {
  const { user } = useAuth()
  const { stats, isLoading } = useBattleStats(battle.id)

  if (isLoading || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const isCreator = user?.id === battle.creator_id
  const myScore = isCreator ? stats.creatorScore : stats.opponentScore
  const opponentScore = isCreator ? stats.opponentScore : stats.creatorScore

  const totalPoints = myScore.totalPoints + opponentScore.totalPoints
  const myPercentage = totalPoints > 0 ? (myScore.totalPoints / totalPoints) * 100 : 50

  const getStatusEmoji = () => {
    if (myScore.totalPoints > opponentScore.totalPoints) return '🔥'
    if (myScore.totalPoints < opponentScore.totalPoints) return '📈'
    return '⚖️'
  }

  const getStatusText = () => {
    if (myScore.totalPoints > opponentScore.totalPoints) return 'リード中！'
    if (myScore.totalPoints < opponentScore.totalPoints) return '追い上げよう！'
    return '同点'
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">バトル進行中</h3>
        <div className="text-right">
          <span className="text-sm text-gray-500">
            {stats.daysRemaining === 0 ? '今日終了' : `残り ${stats.daysRemaining} 日`}
          </span>
          <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-blue-600">
            あなた ({myScore.totalPoints.toLocaleString()}pt)
          </span>
          <span className="font-medium text-purple-600">
            {opponentScore.userName} ({opponentScore.totalPoints.toLocaleString()}pt)
          </span>
        </div>
        <div className="h-10 bg-gray-200 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white text-sm font-bold transition-all duration-500"
            style={{ width: `${myPercentage}%` }}
          >
            {myPercentage > 20 && `${myScore.totalPoints}pt`}
          </div>
          <div
            className="bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold transition-all duration-500"
            style={{ width: `${100 - myPercentage}%` }}
          >
            {myPercentage < 80 && `${opponentScore.totalPoints}pt`}
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-gray-800">
          {getStatusEmoji()} {getStatusText()}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          勝利ボーナス: +{battle.bonus_points.toLocaleString()}pt
        </div>
      </div>
    </div>
  )
}
