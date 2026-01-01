'use client'

import type { BattleWithProfiles } from '@/types'
import { BattleCard } from './BattleCard'

interface BattleListProps {
  battles: BattleWithProfiles[]
  emptyMessage?: string
  onAccept?: (battleId: string) => void
  onReject?: (battleId: string) => void
}

export function BattleList({
  battles,
  emptyMessage = 'バトルがありません',
  onAccept,
  onReject,
}: BattleListProps) {
  if (battles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {battles.map((battle) => (
        <BattleCard
          key={battle.id}
          battle={battle}
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
    </div>
  )
}
