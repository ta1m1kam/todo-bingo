'use client'

interface ScoreBarProps {
  label: string
  points: number
  maxPoints: number
  color: 'blue' | 'purple'
  isWinner?: boolean
}

export function ScoreBar({ label, points, maxPoints, color, isWinner }: ScoreBarProps) {
  const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className={`font-medium ${isWinner ? 'text-yellow-600' : 'text-gray-700'}`}>
          {isWinner && '🏆 '}{label}
        </span>
        <span className="font-bold">{points.toLocaleString()}pt</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
