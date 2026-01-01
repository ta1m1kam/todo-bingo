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
      <span className={`${sizeClasses[size]} font-bold`} style={{ color: '#C4A57B' }}>
        {formatPoints(points)}
      </span>
      <span className={`${size === 'sm' ? 'text-sm' : 'text-base'} font-medium`} style={{ color: '#8B7355' }}>
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
      <div className="text-4xl font-bold drop-shadow-lg" style={{ color: 'var(--theme-completed)' }}>
        +{formatPoints(points)} pt
      </div>
    </div>
  )
}
