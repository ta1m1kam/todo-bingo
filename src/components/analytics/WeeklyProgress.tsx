'use client'

import { useMemo } from 'react'

interface WeeklyProgressProps {
  activityDates: string[]
}

export function WeeklyProgress({ activityDates }: WeeklyProgressProps) {
  const weeklyData = useMemo(() => {
    const weeks: { weekStart: string; count: number; days: boolean[] }[] = []
    const today = new Date()
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek - 7 * 3)

    for (let w = 0; w < 4; w++) {
      const weekStart = new Date(startOfWeek)
      weekStart.setDate(startOfWeek.getDate() + w * 7)
      const weekStartStr = weekStart.toISOString().split('T')[0]

      const days: boolean[] = []
      let count = 0

      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(weekStart.getDate() + d)
        const dayStr = day.toISOString().split('T')[0]
        const isActive = activityDates.includes(dayStr)
        days.push(isActive)
        if (isActive) count++
      }

      weeks.push({
        weekStart: weekStartStr,
        count,
        days,
      })
    }

    return weeks
  }, [activityDates])

  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
        <span>📅</span> 週間アクティビティ
      </h3>

      <div className="space-y-3">
        <div className="flex gap-2 justify-end pr-12">
          {dayNames.map(day => (
            <div key={day} className="w-6 text-center text-xs text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {weeklyData.map(({ weekStart, count, days }, weekIndex) => {
          const isCurrentWeek = weekIndex === weeklyData.length - 1
          const weekLabel = new Date(weekStart).toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
          })

          return (
            <div key={weekStart} className="flex items-center gap-2">
              <span className={`text-xs w-16 ${isCurrentWeek ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                {weekLabel}〜
              </span>
              <div className="flex gap-2">
                {days.map((isActive, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-6 h-6 rounded ${
                      isActive
                        ? 'bg-green-500'
                        : 'bg-gray-100'
                    }`}
                    title={isActive ? '達成あり' : '達成なし'}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 w-8">
                {count}日
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>達成あり</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded" />
            <span>達成なし</span>
          </div>
        </div>
      </div>
    </div>
  )
}
