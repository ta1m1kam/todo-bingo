'use client'

import { useMemo } from 'react'
import type { Badge } from '@/types'
import { formatPoints, getLevelTitle } from '@/lib/utils/points'

interface AnnualReportProps {
  year: number
  totalPoints: number
  level: number
  totalCellsCompleted: number
  totalBingos: number
  earnedBadges: Badge[]
  maxStreak: number
  activityDates: string[]
}

export function AnnualReport({
  year,
  totalPoints,
  level,
  totalCellsCompleted,
  totalBingos,
  earnedBadges,
  maxStreak,
  activityDates,
}: AnnualReportProps) {
  const stats = useMemo(() => {
    const yearDates = activityDates.filter(d => d.startsWith(String(year)))

    const monthlyActivity: Record<string, number> = {}
    yearDates.forEach(date => {
      const month = date.substring(5, 7)
      monthlyActivity[month] = (monthlyActivity[month] || 0) + 1
    })

    const mostActiveMonth = Object.entries(monthlyActivity)
      .sort((a, b) => b[1] - a[1])[0]

    const dayOfWeekCounts: number[] = [0, 0, 0, 0, 0, 0, 0]
    yearDates.forEach(date => {
      const day = new Date(date).getDay()
      dayOfWeekCounts[day]++
    })
    const mostActiveDay = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts))
    const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']

    return {
      activeDays: yearDates.length,
      mostActiveMonth: mostActiveMonth
        ? new Date(`${year}-${mostActiveMonth}-01`).toLocaleDateString('ja-JP', { month: 'long' })
        : null,
      mostActiveMonthCount: mostActiveMonth ? mostActiveMonth[1] : 0,
      mostActiveDay: dayNames[mostActiveDay],
      mostActiveDayCount: dayOfWeekCounts[mostActiveDay],
    }
  }, [activityDates, year])

  const progress = useMemo(() => {
    const now = new Date()
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31)
    const totalDays = Math.ceil((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24))
    const elapsedDays = Math.ceil((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24))
    const yearProgress = Math.min(100, Math.round((elapsedDays / totalDays) * 100))
    return { yearProgress, elapsedDays, totalDays }
  }, [year])

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg overflow-hidden text-white">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-1">{year}年 年間レポート</h3>
        <p className="text-white/70 text-sm">
          今年も{progress.elapsedDays}日が経過（{progress.yearProgress}%）
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur p-6 space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{formatPoints(totalPoints)}</div>
            <div className="text-xs text-white/70">獲得ポイント</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">Lv.{level}</div>
            <div className="text-xs text-white/70">{getLevelTitle(level)}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totalCellsCompleted}</div>
            <div className="text-xs text-white/70">達成マス</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totalBingos}</div>
            <div className="text-xs text-white/70">ビンゴ数</div>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <span>✨</span> ハイライト
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-white/70">アクティブ日数</div>
              <div className="text-xl font-bold">{stats.activeDays}日</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-white/70">最長ストリーク</div>
              <div className="text-xl font-bold">{maxStreak}日連続</div>
            </div>
            {stats.mostActiveMonth && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-sm text-white/70">最もアクティブな月</div>
                <div className="text-xl font-bold">{stats.mostActiveMonth}</div>
                <div className="text-xs text-white/50">{stats.mostActiveMonthCount}日達成</div>
              </div>
            )}
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-white/70">最もアクティブな曜日</div>
              <div className="text-xl font-bold">{stats.mostActiveDay}</div>
              <div className="text-xs text-white/50">{stats.mostActiveDayCount}回達成</div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <span>🏅</span> 獲得バッジ ({earnedBadges.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map(badge => (
                <div
                  key={badge.id}
                  className="bg-white/20 rounded-full px-3 py-1 text-sm flex items-center gap-1"
                  title={badge.description}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <p className="text-sm">
            {totalCellsCompleted === 0 && '最初の目標を達成して、素晴らしい1年をスタートしよう！'}
            {totalCellsCompleted > 0 && totalCellsCompleted < 10 && '良いスタートです！この調子で目標を達成しましょう！'}
            {totalCellsCompleted >= 10 && totalCellsCompleted < 25 && '素晴らしい進捗です！着実に目標を達成していますね！'}
            {totalCellsCompleted >= 25 && '驚異的な達成力です！あなたの努力は確実に実を結んでいます！'}
          </p>
        </div>
      </div>
    </div>
  )
}
