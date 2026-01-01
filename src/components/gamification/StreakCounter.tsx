'use client'

interface StreakCounterProps {
  currentStreak: number
  maxStreak: number
  lastActivityDate?: string | null
}

export function StreakCounter({ currentStreak, maxStreak, lastActivityDate }: StreakCounterProps) {
  const isActiveToday = lastActivityDate === new Date().toISOString().split('T')[0]

  const getStreakEmoji = () => {
    if (currentStreak >= 30) return '💪'
    if (currentStreak >= 14) return '🔥'
    if (currentStreak >= 7) return '⚡'
    if (currentStreak >= 3) return '✨'
    return '🌱'
  }

  const getStreakColor = () => {
    if (currentStreak >= 30) return 'from-purple-500 to-pink-500'
    if (currentStreak >= 14) return 'from-red-500 to-orange-500'
    if (currentStreak >= 7) return 'from-orange-500 to-yellow-500'
    if (currentStreak >= 3) return 'from-yellow-500 to-green-500'
    return 'from-green-500 to-teal-500'
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 mb-1">連続達成</div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{getStreakEmoji()}</span>
            <span className={`text-3xl font-bold bg-gradient-to-r ${getStreakColor()} bg-clip-text text-transparent`}>
              {currentStreak}
            </span>
            <span className="text-lg text-gray-600">日</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">最高記録</div>
          <div className="text-xl font-bold text-gray-700">{maxStreak}日</div>
        </div>
      </div>
      {!isActiveToday && currentStreak > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-center">
          <span className="text-sm text-yellow-700">
            今日も頑張って記録を伸ばそう！
          </span>
        </div>
      )}
      {currentStreak >= 7 && (
        <div className="mt-3 flex justify-center gap-1">
          {Array.from({ length: Math.min(currentStreak, 30) }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < 7
                  ? 'bg-green-400'
                  : i < 14
                    ? 'bg-yellow-400'
                    : i < 21
                      ? 'bg-orange-400'
                      : 'bg-red-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface StreakCalendarProps {
  activityDates: string[]
  month?: Date
}

export function StreakCalendar({ activityDates, month = new Date() }: StreakCalendarProps) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const lastDay = new Date(year, monthIndex + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  const activitySet = new Set(activityDates)

  const days = []
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      day: d,
      date: dateStr,
      hasActivity: activitySet.has(dateStr),
      isToday: dateStr === new Date().toISOString().split('T')[0],
    })
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
        {year}年{monthIndex + 1}月
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((d) => (
          <div key={d} className="text-xs text-gray-400 py-1">
            {d}
          </div>
        ))}
        {days.map((day, i) =>
          day === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <div
              key={day.date}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-lg
                ${day.hasActivity
                  ? 'bg-green-500 text-white font-medium'
                  : day.isToday
                    ? 'bg-blue-100 text-blue-600 font-medium ring-2 ring-blue-400'
                    : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {day.day}
            </div>
          )
        )}
      </div>
    </div>
  )
}
