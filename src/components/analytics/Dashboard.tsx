'use client'

import { useState } from 'react'
import { ActivityChart } from './ActivityChart'
import { WeeklyProgress } from './WeeklyProgress'
import { CategoryAnalysis } from './CategoryAnalysis'
import { AnnualReport } from './AnnualReport'
import { BADGE_DEFINITIONS, type Badge } from '@/types'

interface DashboardCell {
  category?: string
  is_completed: boolean
}

interface DashboardProps {
  totalPoints: number
  level: number
  totalCellsCompleted: number
  totalBingos: number
  earnedBadgeIds: string[]
  maxStreak: number
  activityDates: string[]
  cells: DashboardCell[]
}

type TabType = 'overview' | 'activity' | 'category' | 'report'

export function Dashboard({
  totalPoints,
  level,
  totalCellsCompleted,
  totalBingos,
  earnedBadgeIds,
  maxStreak,
  activityDates,
  cells,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const earnedBadges: Badge[] = BADGE_DEFINITIONS.filter(b =>
    earnedBadgeIds.includes(b.id)
  )

  const currentYear = new Date().getFullYear()

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: '概要', icon: '📊' },
    { id: 'activity', label: 'アクティビティ', icon: '📈' },
    { id: 'category', label: 'カテゴリ', icon: '🏷️' },
    { id: 'report', label: '年間レポート', icon: '📋' },
  ]

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md p-2">
        <div className="flex overflow-x-auto gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <WeeklyProgress activityDates={activityDates} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickStat
              icon="🎯"
              label="達成マス"
              value={totalCellsCompleted}
              color="blue"
            />
            <QuickStat
              icon="🎰"
              label="ビンゴ"
              value={totalBingos}
              color="green"
            />
            <QuickStat
              icon="🏅"
              label="バッジ"
              value={earnedBadges.length}
              color="purple"
            />
            <QuickStat
              icon="🔥"
              label="最長連続"
              value={`${maxStreak}日`}
              color="orange"
            />
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-4">
          <ActivityChart
            activityDates={activityDates}
            totalCellsCompleted={totalCellsCompleted}
          />
          <WeeklyProgress activityDates={activityDates} />
        </div>
      )}

      {activeTab === 'category' && (
        <CategoryAnalysis cells={cells} />
      )}

      {activeTab === 'report' && (
        <AnnualReport
          year={currentYear}
          totalPoints={totalPoints}
          level={level}
          totalCellsCompleted={totalCellsCompleted}
          totalBingos={totalBingos}
          earnedBadges={earnedBadges}
          maxStreak={maxStreak}
          activityDates={activityDates}
        />
      )}
    </div>
  )
}

interface QuickStatProps {
  icon: string
  label: string
  value: number | string
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function QuickStat({ icon, label, value, color }: QuickStatProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-3 text-white`}>
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-white/70">{label}</div>
    </div>
  )
}
