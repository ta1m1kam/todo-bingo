'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { BattleStats, BattleScore } from '@/types'
import type { BattlePoints } from '@/types/database'

interface UseBattleStatsReturn {
  stats: BattleStats | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useBattleStats(battleId: string | null): UseBattleStatsReturn {
  const { user } = useAuth()
  const [stats, setStats] = useState<BattleStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBattleStats = useCallback(async () => {
    if (!battleId || !user) {
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data: battle, error: battleError } = await supabase
        .from('battles')
        .select(`
          *,
          creator:profiles!battles_creator_id_fkey(id, display_name, avatar_url),
          opponent:profiles!battles_opponent_id_fkey(id, display_name, avatar_url)
        `)
        .eq('id', battleId)
        .single()

      if (battleError) throw battleError

      const { data: points, error: pointsError } = await supabase
        .from('battle_points')
        .select('*')
        .eq('battle_id', battleId)
        .order('date', { ascending: true })

      if (pointsError) throw pointsError

      const creatorPoints = (points || []).filter((p: BattlePoints) => p.user_id === battle.creator_id)
      const opponentPoints = (points || []).filter((p: BattlePoints) => p.user_id === battle.opponent_id)

      const creatorScore: BattleScore = {
        userId: battle.creator.id,
        userName: battle.creator.display_name || '名無し',
        avatarUrl: battle.creator.avatar_url,
        totalPoints: creatorPoints.reduce((sum: number, p: BattlePoints) => sum + p.daily_points, 0),
        dailyPoints: creatorPoints,
      }

      const opponentScore: BattleScore = {
        userId: battle.opponent.id,
        userName: battle.opponent.display_name || '名無し',
        avatarUrl: battle.opponent.avatar_url,
        totalPoints: opponentPoints.reduce((sum: number, p: BattlePoints) => sum + p.daily_points, 0),
        dailyPoints: opponentPoints,
      }

      const now = new Date()
      const startDate = new Date(battle.start_date)
      const endDate = new Date(battle.end_date)
      const totalDays = battle.duration_days
      const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      const progressPercent = Math.min(100, Math.round((daysElapsed / totalDays) * 100))

      let winner: 'creator' | 'opponent' | 'draw' | null = null
      if (battle.status === 'completed') {
        if (battle.is_draw) {
          winner = 'draw'
        } else if (battle.winner_id === battle.creator_id) {
          winner = 'creator'
        } else if (battle.winner_id === battle.opponent_id) {
          winner = 'opponent'
        }
      }

      setStats({
        battleId,
        creatorScore,
        opponentScore,
        daysRemaining,
        daysElapsed,
        totalDays,
        progressPercent,
        isActive: battle.status === 'active',
        winner,
      })
    } catch (err) {
      setError(err as Error)
      console.error('Fetch battle stats error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [battleId, user])

  useEffect(() => {
    fetchBattleStats()
  }, [fetchBattleStats])

  useEffect(() => {
    if (!battleId || !user) return

    const supabase = createClient()
    const channel = supabase
      .channel(`battle_points_${battleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_points',
          filter: `battle_id=eq.${battleId}`,
        },
        () => {
          fetchBattleStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [battleId, user, fetchBattleStats])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchBattleStats,
  }
}
