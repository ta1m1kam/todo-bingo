'use client'

import type { BattleStatus } from '@/types'

interface BattleStatusBadgeProps {
  status: BattleStatus
}

const statusConfig: Record<BattleStatus, { label: string; className: string }> = {
  pending: {
    label: '申請中',
    className: 'bg-yellow-100 text-yellow-800',
  },
  active: {
    label: '進行中',
    className: 'bg-green-100 text-green-800',
  },
  completed: {
    label: '完了',
    className: 'bg-gray-100 text-gray-800',
  },
  cancelled: {
    label: 'キャンセル',
    className: 'bg-red-100 text-red-800',
  },
}

export function BattleStatusBadge({ status }: BattleStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  )
}
