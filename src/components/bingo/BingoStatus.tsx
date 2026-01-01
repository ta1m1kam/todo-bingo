'use client'

import { useMemo } from 'react'
import type { BingoCell, BingoSize } from '@/types'
import { calculateBingoStats, getCellsToNextBingo } from '@/lib/utils/bingo'

interface BingoStatusProps {
  cells: Pick<BingoCell, 'position' | 'is_completed'>[]
  size: BingoSize
}

export function BingoStatus({ cells, size }: BingoStatusProps) {
  const stats = useMemo(() => calculateBingoStats(cells, size), [cells, size])
  const cellsToNext = useMemo(() => getCellsToNextBingo(cells, size), [cells, size])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">達成進捗</span>
          <span className="text-lg font-bold text-blue-600">
            {stats.completedCells}/{stats.totalCells} ({stats.completionRate}%)
          </span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Bingo Lines */}
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl font-bold text-green-600">{stats.bingoLines}</div>
          <div className="text-xs text-gray-500 mt-1">ビンゴ達成</div>
          <div className="text-xs text-gray-400">/ {stats.totalBingoLines}ライン</div>
        </div>

        {/* Completed Cells */}
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.completedCells}</div>
          <div className="text-xs text-gray-500 mt-1">達成マス</div>
          <div className="text-xs text-gray-400">/ {stats.totalCells}マス</div>
        </div>

        {/* Cells to Next Bingo */}
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl font-bold text-orange-500">
            {stats.bingoLines === stats.totalBingoLines ? '🎉' : cellsToNext}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.bingoLines === stats.totalBingoLines ? '全制覇!' : '次のビンゴまで'}
          </div>
          <div className="text-xs text-gray-400">
            {stats.bingoLines === stats.totalBingoLines ? 'Blackout!' : 'マス'}
          </div>
        </div>
      </div>

      {/* Achievement Messages */}
      {stats.completionRate === 100 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-center text-white shadow-lg animate-pulse">
          <span className="text-2xl">🏆</span>
          <span className="ml-2 font-bold">全マス達成おめでとう!</span>
          <span className="text-2xl ml-2">🏆</span>
        </div>
      )}

      {stats.bingoLines > 0 && stats.completionRate < 100 && (
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 text-center text-white shadow-md">
          <span className="font-medium">
            {stats.bingoLines}ライン達成中!
            {stats.bingoLines >= 3 && ' 🔥 絶好調!'}
          </span>
        </div>
      )}
    </div>
  )
}
