'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { BattleWithProfiles, CreateBattleInput, BattleListFilter } from '@/types'

interface UseBattlesReturn {
  battles: BattleWithProfiles[]
  pendingBattles: BattleWithProfiles[]
  activeBattles: BattleWithProfiles[]
  completedBattles: BattleWithProfiles[]
  isLoading: boolean
  error: Error | null
  createBattle: (input: CreateBattleInput) => Promise<void>
  acceptBattle: (battleId: string) => Promise<void>
  rejectBattle: (battleId: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useBattles(filter?: BattleListFilter): UseBattlesReturn {
  const { user } = useAuth()
  const [battles, setBattles] = useState<BattleWithProfiles[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBattles = useCallback(async () => {
    if (!user) {
      setBattles([])
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('battles')
        .select(`
          *,
          creator:profiles!battles_creator_id_fkey(id, display_name, avatar_url, level, total_points),
          opponent:profiles!battles_opponent_id_fkey(id, display_name, avatar_url, level, total_points)
        `)
        .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (filter?.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status]
        query = query.in('status', statuses)
      }

      if (filter?.limit) {
        query = query.limit(filter.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setBattles((data as BattleWithProfiles[]) || [])
    } catch (err) {
      setError(err as Error)
      console.error('Fetch battles error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user, filter?.status, filter?.limit])

  useEffect(() => {
    fetchBattles()
  }, [fetchBattles])

  useEffect(() => {
    if (!user) return

    const supabase = createClient()
    const channel = supabase
      .channel('battles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battles',
        },
        () => {
          fetchBattles()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchBattles])

  const createBattle = useCallback(async (input: CreateBattleInput) => {
    if (!user) throw new Error('User not authenticated')

    const supabase = createClient()
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + input.durationDays)

    const { error: createError } = await supabase
      .from('battles')
      .insert({
        creator_id: user.id,
        opponent_id: input.opponentId,
        duration_days: input.durationDays,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        bonus_points: input.bonusPoints || 1000,
        status: 'pending',
      })

    if (createError) throw createError

    await fetchBattles()
  }, [user, fetchBattles])

  const acceptBattle = useCallback(async (battleId: string) => {
    if (!user) throw new Error('User not authenticated')

    const supabase = createClient()
    const now = new Date()

    const { data: battle } = await supabase
      .from('battles')
      .select('duration_days')
      .eq('id', battleId)
      .single()

    if (!battle) throw new Error('Battle not found')

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + battle.duration_days)

    const { error: updateError } = await supabase
      .from('battles')
      .update({
        status: 'active',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
      })
      .eq('id', battleId)
      .eq('opponent_id', user.id)
      .eq('status', 'pending')

    if (updateError) throw updateError

    await fetchBattles()
  }, [user, fetchBattles])

  const rejectBattle = useCallback(async (battleId: string) => {
    if (!user) throw new Error('User not authenticated')

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('battles')
      .update({ status: 'cancelled' })
      .eq('id', battleId)
      .eq('opponent_id', user.id)
      .eq('status', 'pending')

    if (updateError) throw updateError

    await fetchBattles()
  }, [user, fetchBattles])

  const pendingBattles = battles.filter(b => b.status === 'pending')
  const activeBattles = battles.filter(b => b.status === 'active')
  const completedBattles = battles.filter(b => b.status === 'completed')

  return {
    battles,
    pendingBattles,
    activeBattles,
    completedBattles,
    isLoading,
    error,
    createBattle,
    acceptBattle,
    rejectBattle,
    refetch: fetchBattles,
  }
}
