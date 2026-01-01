'use client'

import { useMemo } from 'react'
import { BingoCell } from './BingoCell'
import type { BingoCell as BingoCellType, BingoMode, BingoSize } from '@/types'
import { getCompletedLinePositions } from '@/lib/utils/bingo'

interface BingoCardProps {
  cells: Pick<BingoCellType, 'position' | 'goal_text' | 'is_completed' | 'is_free'>[]
  size: BingoSize
  mode: BingoMode
  title?: string
  onCellUpdate: (position: number, updates: Partial<Pick<BingoCellType, 'goal_text' | 'is_completed'>>) => void
}

export function BingoCard({ cells, size, mode, title, onCellUpdate }: BingoCardProps) {
  const completedLinePositions = useMemo(() => {
    return getCompletedLinePositions(cells, size)
  }, [cells, size])

  const sortedCells = useMemo(() => {
    return [...cells].sort((a, b) => a.position - b.position)
  }, [cells])

  return (
    <div className="w-full max-w-2xl mx-auto">
      {title && (
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">{title}</h2>
      )}
      <div
        className="grid gap-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {sortedCells.map((cell) => (
          <BingoCell
            key={cell.position}
            cell={cell}
            mode={mode}
            isInCompletedLine={completedLinePositions.has(cell.position)}
            size={size}
            onUpdate={onCellUpdate}
          />
        ))}
      </div>
    </div>
  )
}
