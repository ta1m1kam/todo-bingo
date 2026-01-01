'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
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
  const { user, profile, refreshProfile, isLoading: authLoading } = useAuth()
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [isLoaded, setIsLoaded] = useState(false)
  const [pendingBadge, setPendingBadge] = useState<Badge | null>(null)
  const [pendingLevelUp, setPendingLevelUp] = useState<number | null>(null)
  const [pendingPoints, setPendingPoints] = useState<number | null>(null)

  // Load from Supabase
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    if (!user) {
      setIsLoaded(true)
      return
    }

    const loadFromSupabase = async () => {
      const supabase = createClient()

      try {
        // Load profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('level, total_points, current_streak, max_streak, last_activity_date')
          .eq('id', user.id)
          .single()

        // Load earned badges
        const { data: badges } = await supabase
          .from('achievements')
          .select('badge_id')
          .eq('user_id', user.id)

        // Load activity dates
        const { data: activities } = await supabase
          .from('activity_log')
          .select('created_at')
          .eq('user_id', user.id)

        // Calculate total cells completed and bingos from activity log
        const { data: cellActivities } = await supabase
          .from('activity_log')
          .select('activity_type, points_earned')
          .eq('user_id', user.id)

        let totalCellsCompleted = 0
        let totalBingos = 0
        if (cellActivities) {
          totalCellsCompleted = cellActivities.filter((a: { activity_type: string }) => a.activity_type === 'cell_complete').length
          totalBingos = cellActivities.filter((a: { activity_type: string }) => a.activity_type === 'bingo').length
        }

        const earnedBadgeIds = badges?.map((b: { badge_id: string }) => b.badge_id) || []
        const activityDates: string[] = activities
          ? Array.from(new Set(activities.map((a: { created_at: string }) => a.created_at.split('T')[0])))
          : []

        setGameState({
          totalPoints: profileData?.total_points || 0,
          level: profileData?.level || 1,
          earnedBadgeIds,
          currentStreak: profileData?.current_streak || 0,
          maxStreak: profileData?.max_streak || 0,
          lastActivityDate: profileData?.last_activity_date || null,
          activityDates,
          totalCellsCompleted,
          totalBingos,
        })
      } catch (error) {
        console.error('Load game state error:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadFromSupabase()
  }, [user, authLoading])

  // Sync profile changes
  useEffect(() => {
    if (profile) {
      setGameState(prev => ({
        ...prev,
        totalPoints: profile.total_points || 0,
        level: profile.level || 1,
        currentStreak: profile.current_streak || 0,
        maxStreak: profile.max_streak || 0,
      }))
    }
  }, [profile])

  const saveToSupabase = useCallback(async (updates: Partial<GameState>, newBadge?: Badge) => {
    if (!user) return

    const supabase = createClient()

    try {
      // Update profile
      const profileUpdates: Record<string, unknown> = {}
      if (updates.totalPoints !== undefined) profileUpdates.total_points = updates.totalPoints
      if (updates.level !== undefined) profileUpdates.level = updates.level
      if (updates.currentStreak !== undefined) profileUpdates.current_streak = updates.currentStreak
      if (updates.maxStreak !== undefined) profileUpdates.max_streak = updates.maxStreak
      if (updates.lastActivityDate !== undefined) profileUpdates.last_activity_date = updates.lastActivityDate

      if (Object.keys(profileUpdates).length > 0) {
        await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id)
      }

      // Add new badge
      if (newBadge) {
        await supabase
          .from('achievements')
          .insert({
            user_id: user.id,
            badge_id: newBadge.id,
          })
      }

      // Refresh profile in auth context
      await refreshProfile()
    } catch (error) {
      console.error('Save game state error:', error)
    }
  }, [user, refreshProfile])

  const logActivity = useCallback(async (activityType: string, pointsEarned: number) => {
    if (!user) return

    const supabase = createClient()
    try {
      await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          points_earned: pointsEarned,
        })
    } catch (error) {
      console.error('Log activity error:', error)
    }
  }, [user])

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

      // Build state updates
      const stateUpdates: Partial<GameState> = {
        ...streakUpdates,
        totalPoints: newTotalPoints,
        level: newLevel,
        earnedBadgeIds: newBadges,
        totalCellsCompleted: newTotalCells,
        totalBingos: newTotalBingos,
      }

      // Save to Supabase (async, don't await)
      saveToSupabase(stateUpdates, newBadge ?? undefined)
      logActivity('cell_complete', cellPoints)
      if (newBingoLines > 0) {
        logActivity('bingo', bingoPoints)
      }

      return {
        ...prev,
        ...stateUpdates,
      }
    })
  }, [checkAndAwardBadge, updateStreak, saveToSupabase, logActivity])

  const clearPendingBadge = useCallback(() => setPendingBadge(null), [])
  const clearPendingLevelUp = useCallback(() => setPendingLevelUp(null), [])
  const clearPendingPoints = useCallback(() => setPendingPoints(null), [])

  const resetGameState = useCallback(async () => {
    if (!user) return
    if (!window.confirm('ゲームデータをリセットしますか？')) return

    const supabase = createClient()

    try {
      // Reset profile stats
      await supabase
        .from('profiles')
        .update({
          level: 1,
          total_points: 0,
          current_streak: 0,
          max_streak: 0,
          last_activity_date: null,
        })
        .eq('id', user.id)

      // Delete all achievements
      await supabase
        .from('achievements')
        .delete()
        .eq('user_id', user.id)

      // Delete activity log
      await supabase
        .from('activity_log')
        .delete()
        .eq('user_id', user.id)

      setGameState(initialGameState)
      await refreshProfile()
    } catch (error) {
      console.error('Reset game state error:', error)
    }
  }, [user, refreshProfile])

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
