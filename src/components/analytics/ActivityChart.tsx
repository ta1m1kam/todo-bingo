'use client'

import { useMemo } from 'react'

interface ActivityChartProps {
  activityDates: string[]
  totalCellsCompleted: number
}

export function ActivityChart({ activityDates, totalCellsCompleted }: ActivityChartProps) {
  const monthlyData = useMemo(() => {
    const months: { [key: string]: number } = {}
    const currentYear = new Date().getFullYear()

    for (let i = 0; i < 12; i++) {
      const monthKey = `${currentYear}-${String(i + 1).padStart(2, '0')}`
      months[monthKey] = 0
    }

    activityDates.forEach(date => {
      const month = date.substring(0, 7)
      if (months[month] !== undefined) {
        months[month]++
      }
    })

    return Object.entries(months).map(([month, count]) => ({
      month,
      label: new Date(month + '-01').toLocaleDateString('ja-JP', { month: 'short' }),
      count,
    }))
  }, [activityDates])

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1)

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
        <span>📈</span> 月別アクティビティ
      </h3>

      <div className="flex items-end gap-2 h-40">
        {monthlyData.map(({ month, label, count }) => {
          const height = count > 0 ? (count / maxCount) * 100 : 4
          const isCurrentMonth = month === new Date().toISOString().substring(0, 7)

          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full flex justify-center">
                {count > 0 && (
                  <span className="absolute -top-5 text-xs text-gray-500">
                    {count}
                  </span>
                )}
                <div
                  className={`w-full max-w-8 rounded-t transition-all duration-500 ${
                    isCurrentMonth
                      ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                      : 'bg-gradient-to-t from-indigo-400 to-indigo-300'
                  }`}
                  style={{ height: `${height}%`, minHeight: '4px' }}
                />
              </div>
              <span className={`text-xs ${isCurrentMonth ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t flex justify-between text-sm">
        <div>
          <span className="text-gray-500">今年の達成日数:</span>
          <span className="ml-2 font-bold text-indigo-600">{activityDates.length}日</span>
        </div>
        <div>
          <span className="text-gray-500">総達成マス:</span>
          <span className="ml-2 font-bold text-green-600">{totalCellsCompleted}マス</span>
        </div>
      </div>
    </div>
  )
}
