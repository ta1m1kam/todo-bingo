'use client'

import { useState, useCallback, useEffect } from 'react'
import { BADGE_DEFINITIONS, type Badge, type BingoSize } from '@/types'
import { calculateCellPoints, calculateBingoBonus, calculateLevelFromPoints } from '@/lib/utils/points'
import { calculateBingoStats } from '@/lib/utils/bingo'

interface GameState {
  totalPoints: number
  level: number
  earnedBadgeIds: string[]
  currentStreak: number
  maxStreak: number
  lastActivityDate: string | null
  activityDates: string[]
  totalCellsCompleted: number
  totalBingos: number
}

const STORAGE_KEY = 'todo-bingo-game-state'

const initialGameState: GameState = {
  totalPoints: 0,
  level: 1,
  earnedBadgeIds: [],
  currentStreak: 0,
  maxStreak: 0,
  lastActivityDate: null,
  activityDates: [],
  totalCellsCompleted: 0,
  totalBingos: 0,
}

interface CellState {
  position: number
  is_completed: boolean
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [isLoaded, setIsLoaded] = useState(false)
  const [pendingBadge, setPendingBadge] = useState<Badge | null>(null)
  const [pendingLevelUp, setPendingLevelUp] = useState<number | null>(null)
  const [pendingPoints, setPendingPoints] = useState<number | null>(null)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setGameState({ ...initialGameState, ...parsed })
      } catch {
        // Invalid data, use initial state
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState))
    }
  }, [gameState, isLoaded])

  const checkAndAwardBadge = useCallback((badgeId: string, earned: string[]): Badge | null => {
    if (!earned.includes(badgeId)) {
      const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId)
      if (badge) {
        return badge
      }
    }
    return null
  }, [])

  const updateStreak = useCallback((state: GameState): Partial<GameState> => {
    const today = new Date().toISOString().split('T')[0]

    if (state.lastActivityDate === today) {
      return {}
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newStreak = state.currentStreak
    if (state.lastActivityDate === yesterdayStr) {
      newStreak = state.currentStreak + 1
    } else if (state.lastActivityDate !== today) {
      newStreak = 1
    }

    const newMaxStreak = Math.max(state.maxStreak, newStreak)
    const newActivityDates = state.activityDates.includes(today)
      ? state.activityDates
      : [...state.activityDates, today]

    return {
      currentStreak: newStreak,
      maxStreak: newMaxStreak,
      lastActivityDate: today,
      activityDates: newActivityDates,
    }
  }, [])

  const onCellComplete = useCallback((
    cells: CellState[],
    size: BingoSize,
    prevBingoLines: number
  ) => {
    setGameState(prev => {
      const stats = calculateBingoStats(cells, size)
      const newBingoLines = stats.bingoLines - prevBingoLines

      // Calculate points
      const cellPoints = calculateCellPoints(1, prev.currentStreak)
      const bingoPoints = newBingoLines > 0 ? calculateBingoBonus(newBingoLines) : 0
      const totalNewPoints = cellPoints + bingoPoints

      const newTotalPoints = prev.totalPoints + totalNewPoints
      const newLevel = calculateLevelFromPoints(newTotalPoints)
      const newTotalCells = prev.totalCellsCompleted + 1
      const newTotalBingos = prev.totalBingos + newBingoLines

      // Check for badges
      const newBadges = [...prev.earnedBadgeIds]
      let newBadge: Badge | null = null

      // First cell
      if (newTotalCells === 1) {
        const badge = checkAndAwardBadge('first_step', newBadges)
        if (badge) {
          newBadges.push(badge.id)
          newBadge = badge
        }
      }

      // First bingo
      if (prev.totalBingos === 0 && newTotalBingos > 0) {
        const badge = checkAndAwardBadge('first_bingo', newBadges)
        if (badge) {
          newBadges.push(badge.id)
          if (!newBadge) newBadge = badge
        }
      }

      // Triple line (3 or more bingos at once)
      if (newBingoLines >= 3) {
        const badge = checkAndAwardBadge('triple_line', newBadges)
        if (badge) {
          newBadges.push(badge.id)
          if (!newBadge) newBadge = badge
        }
      }

      // Blackout
      if (stats.completionRate === 100) {
        const badge = checkAndAwardBadge('blackout', newBadges)
        if (badge) {
          newBadges.push(badge.id)
          if (!newBadge) newBadge = badge
        }
      }

      // Update streak
      const streakUpdates = updateStreak(prev)
      const updatedStreak = streakUpdates.currentStreak ?? prev.currentStreak

      // Week streak
      if (updatedStreak >= 7) {
        const badge = checkAndAwardBadge('week_streak', newBadges)
        if (badge) {
          newBadges.push(badge.id)
          if (!newBadge) newBadge = badge
        }
      }

      // Month streak
      if (updatedStreak >= 30) {
        const badge = checkAndAwardBadge('month_streak', newBadges)
        if (badge) {
          newBadges.push(badge.id)
          if (!newBadge) newBadge = badge
        }
      }

      // Show notifications
      if (totalNewPoints > 0) {
        setPendingPoints(totalNewPoints)
      }
      if (newBadge) {
        setPendingBadge(newBadge)
      }
      if (newLevel > prev.level) {
        setPendingLevelUp(newLevel)
      }

      return {
        ...prev,
        ...streakUpdates,
        totalPoints: newTotalPoints,
        level: newLevel,
        earnedBadgeIds: newBadges,
        totalCellsCompleted: newTotalCells,
        totalBingos: newTotalBingos,
      }
    })
  }, [checkAndAwardBadge, updateStreak])

  const clearPendingBadge = useCallback(() => setPendingBadge(null), [])
  const clearPendingLevelUp = useCallback(() => setPendingLevelUp(null), [])
  const clearPendingPoints = useCallback(() => setPendingPoints(null), [])

  const resetGameState = useCallback(() => {
    if (window.confirm('ゲームデータをリセットしますか？')) {
      setGameState(initialGameState)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  return {
    gameState,
    isLoaded,
    onCellComplete,
    pendingBadge,
    pendingLevelUp,
    pendingPoints,
    clearPendingBadge,
    clearPendingLevelUp,
    clearPendingPoints,
    resetGameState,
  }
}
