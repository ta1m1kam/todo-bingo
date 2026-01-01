'use client'

import { useMemo } from 'react'
import { CATEGORIES, type Category } from '@/types'

interface CellWithCategory {
  category?: string
  is_completed: boolean
}

interface CategoryAnalysisProps {
  cells: CellWithCategory[]
}

const CATEGORY_COLORS: Record<Category, string> = {
  '健康': 'bg-green-500',
  '学習': 'bg-blue-500',
  '仕事': 'bg-purple-500',
  '趣味': 'bg-pink-500',
  '人間関係': 'bg-yellow-500',
  'お金': 'bg-emerald-500',
  '自己成長': 'bg-indigo-500',
  'その他': 'bg-gray-500',
}

const CATEGORY_ICONS: Record<Category, string> = {
  '健康': '💪',
  '学習': '📚',
  '仕事': '💼',
  '趣味': '🎮',
  '人間関係': '👥',
  'お金': '💰',
  '自己成長': '🌱',
  'その他': '📌',
}

export function CategoryAnalysis({ cells }: CategoryAnalysisProps) {
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {}

    CATEGORIES.forEach(cat => {
      stats[cat] = { total: 0, completed: 0 }
    })

    cells.forEach(cell => {
      const category = cell.category || 'その他'
      if (stats[category]) {
        stats[category].total++
        if (cell.is_completed) {
          stats[category].completed++
        }
      }
    })

    return Object.entries(stats)
      .filter(([, { total }]) => total > 0)
      .map(([category, { total, completed }]) => ({
        category: category as Category,
        total,
        completed,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
  }, [cells])

  const totalCells = cells.length
  const completedCells = cells.filter(c => c.is_completed).length

  if (categoryStats.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4">
        <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
          <span>🏷️</span> カテゴリ分析
        </h3>
        <p className="text-gray-500 text-sm text-center py-8">
          目標にカテゴリを設定すると分析が表示されます
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
        <span>🏷️</span> カテゴリ分析
      </h3>

      <div className="space-y-3">
        {categoryStats.map(({ category, total, completed, rate }) => (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>{CATEGORY_ICONS[category]}</span>
                <span className="font-medium text-gray-700">{category}</span>
              </div>
              <div className="text-gray-500">
                {completed}/{total} ({rate}%)
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${CATEGORY_COLORS[category]} transition-all duration-500`}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600">
              {categoryStats.length}
            </div>
            <div className="text-xs text-gray-500">カテゴリ数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500">全体達成率</div>
          </div>
        </div>
      </div>
    </div>
  )
}
