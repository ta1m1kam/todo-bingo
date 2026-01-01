'use client'

import { useEffect, useState } from 'react'
import type { Badge } from '@/types'

interface AchievementPopupProps {
  badge: Badge
  onClose: () => void
}

export function AchievementPopup({ badge, onClose }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className="rounded-xl p-4 shadow-lg flex items-center gap-4 min-w-[280px]"
        style={{ backgroundColor: '#C4A57B' }}
      >
        <div className="text-5xl">{badge.icon}</div>
        <div className="text-white">
          <div className="text-xs font-medium opacity-90">バッジ獲得!</div>
          <div className="text-lg font-bold">{badge.name}</div>
          <div className="text-sm opacity-90">{badge.description}</div>
        </div>
      </div>
    </div>
  )
}

interface BadgeDisplayProps {
  badges: Badge[]
  earnedBadgeIds: string[]
  size?: 'sm' | 'md' | 'lg'
}

export function BadgeDisplay({ badges, earnedBadgeIds, size = 'md' }: BadgeDisplayProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-3xl',
    lg: 'w-20 h-20 text-5xl',
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {badges.map((badge) => {
        const isEarned = earnedBadgeIds.includes(badge.id)
        return (
          <div
            key={badge.id}
            className={`flex flex-col items-center gap-1 ${!isEarned ? 'opacity-40 grayscale' : ''}`}
            title={isEarned ? `${badge.name}: ${badge.description}` : `???: ${badge.description}`}
          >
            <div
              className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${
                isEarned
                  ? 'shadow-md'
                  : 'bg-gray-200'
              }`}
              style={isEarned ? { backgroundColor: '#FEF9F4', border: '2px solid #E5D5C3' } : {}}
            >
              {isEarned ? badge.icon : '?'}
            </div>
            <span className={`text-xs text-center ${isEarned ? 'text-gray-700' : 'text-gray-400'}`}>
              {isEarned ? badge.name : '???'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface BadgeGridProps {
  badges: Badge[]
  earnedBadgeIds: string[]
  onBadgeClick?: (badge: Badge) => void
}

export function BadgeGrid({ badges, earnedBadgeIds, onBadgeClick }: BadgeGridProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>🏅</span> バッジコレクション
        <span className="text-sm font-normal text-gray-500">
          ({earnedBadgeIds.length}/{badges.length})
        </span>
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
        {badges.map((badge) => {
          const isEarned = earnedBadgeIds.includes(badge.id)
          return (
            <button
              key={badge.id}
              onClick={() => isEarned && onBadgeClick?.(badge)}
              className={`group flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isEarned
                  ? 'hover:bg-amber-50 cursor-pointer'
                  : 'cursor-not-allowed opacity-50 grayscale'
              }`}
              disabled={!isEarned}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform ${
                  isEarned
                    ? 'shadow-md group-hover:scale-110'
                    : 'bg-gray-200'
                }`}
                style={isEarned ? { backgroundColor: '#FEF9F4', border: '2px solid #E5D5C3' } : {}}
              >
                {isEarned ? badge.icon : '🔒'}
              </div>
              <span className={`text-xs text-center line-clamp-1 ${isEarned ? 'text-gray-700' : 'text-gray-400'}`}>
                {isEarned ? badge.name : '???'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
