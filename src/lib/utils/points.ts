import { POINTS } from '@/types'

export function calculateCellPoints(difficulty: number = 1, streak: number = 0): number {
  const basePoints = POINTS.CELL_COMPLETE * difficulty
  const multiplier = calculateStreakMultiplier(streak)
  return Math.round(basePoints * multiplier)
}

export function calculateBingoBonus(linesCompleted: number = 1): number {
  return POINTS.BINGO_BONUS * linesCompleted
}

export function calculateStreakMultiplier(streak: number): number {
  if (streak <= 0) return 1

  const multiplier = POINTS.STREAK_MULTIPLIER_BASE + (streak - 1) * 0.1
  return Math.min(multiplier, POINTS.STREAK_MULTIPLIER_MAX)
}

export function calculateLevelFromPoints(totalPoints: number): number {
  // Level formula: Level = floor(sqrt(points / 100)) + 1
  // Level 1: 0-99 points
  // Level 2: 100-399 points
  // Level 3: 400-899 points
  // etc.
  return Math.floor(Math.sqrt(totalPoints / 100)) + 1
}

export function getPointsForNextLevel(currentLevel: number): number {
  // Points needed for next level
  return currentLevel * currentLevel * 100
}

export function getLevelProgress(totalPoints: number): { current: number; next: number; progress: number } {
  const currentLevel = calculateLevelFromPoints(totalPoints)
  const currentLevelPoints = (currentLevel - 1) * (currentLevel - 1) * 100
  const nextLevelPoints = currentLevel * currentLevel * 100
  const pointsInLevel = totalPoints - currentLevelPoints
  const pointsNeeded = nextLevelPoints - currentLevelPoints
  const progress = Math.round((pointsInLevel / pointsNeeded) * 100)

  return {
    current: pointsInLevel,
    next: pointsNeeded,
    progress,
  }
}

export function getLevelTitle(level: number): string {
  if (level >= 50) return '伝説の目標達成者'
  if (level >= 40) return 'マスター'
  if (level >= 30) return 'エキスパート'
  if (level >= 20) return 'ベテラン'
  if (level >= 15) return 'アドバンス'
  if (level >= 10) return '中級者'
  if (level >= 5) return '見習い'
  if (level >= 2) return '初心者'
  return 'ビギナー'
}

export function formatPoints(points: number): string {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`
  }
  return points.toString()
}
