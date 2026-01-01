'use client'

import { getLevelProgress, getLevelTitle } from '@/lib/utils/points'

interface LevelBadgeProps {
  level: number
  totalPoints: number
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LevelBadge({ level, totalPoints, showProgress = true, size = 'md' }: LevelBadgeProps) {
  const progress = getLevelProgress(totalPoints)
  const title = getLevelTitle(level)

  const sizeClasses = {
    sm: {
      container: 'p-2',
      level: 'text-lg',
      title: 'text-xs',
      progress: 'h-1',
    },
    md: {
      container: 'p-3',
      level: 'text-2xl',
      title: 'text-sm',
      progress: 'h-2',
    },
    lg: {
      container: 'p-4',
      level: 'text-4xl',
      title: 'text-base',
      progress: 'h-3',
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className={`bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl ${classes.container} text-white shadow-lg`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
          <span className={`${classes.level} font-bold`}>{level}</span>
        </div>
        <div className="flex-1">
          <div className={`${classes.title} font-medium opacity-90`}>{title}</div>
          {showProgress && (
            <div className="mt-1">
              <div className={`w-full ${classes.progress} bg-white/30 rounded-full overflow-hidden`}>
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <div className="text-xs opacity-75 mt-0.5">
                {progress.current} / {progress.next} pt
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface LevelUpPopupProps {
  newLevel: number
  onClose: () => void
}

export function LevelUpPopup({ newLevel, onClose }: LevelUpPopupProps) {
  const title = getLevelTitle(newLevel)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl animate-scale-in max-w-sm mx-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Level Up!</h2>
        <div className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Lv.{newLevel}
        </div>
        <div className="text-lg text-gray-600 mb-6">{title}</div>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          やったね！
        </button>
      </div>
    </div>
  )
}
