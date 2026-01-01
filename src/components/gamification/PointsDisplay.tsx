'use client'

import { formatPoints } from '@/lib/utils/points'

interface PointsDisplayProps {
  points: number
  showAnimation?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function PointsDisplay({ points, showAnimation = false, size = 'md' }: PointsDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  return (
    <div className={`flex items-center gap-2 ${showAnimation ? 'animate-bounce' : ''}`}>
      <span className={`${sizeClasses[size]} font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent`}>
        {formatPoints(points)}
      </span>
      <span className={`${size === 'sm' ? 'text-sm' : 'text-base'} text-yellow-600 font-medium`}>
        pt
      </span>
    </div>
  )
}

interface PointsGainProps {
  points: number
  onAnimationEnd?: () => void
}

export function PointsGain({ points, onAnimationEnd }: PointsGainProps) {
  return (
    <div
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-[float-up_1s_ease-out_forwards]"
      onAnimationEnd={onAnimationEnd}
    >
      <div className="text-4xl font-bold text-green-500 drop-shadow-lg">
        +{formatPoints(points)} pt
      </div>
    </div>
  )
}
