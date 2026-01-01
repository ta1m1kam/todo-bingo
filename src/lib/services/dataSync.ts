import { createClient } from '@/lib/supabase/client'
import type { BingoSize } from '@/types'

interface LocalBingoCell {
  position: number
  goal_text: string
  is_completed: boolean
  is_free: boolean
  completed_at: string | null
  category?: string
}

interface LocalGameState {
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

interface LocalBingoData {
  size: BingoSize
  hasFreeCenter: boolean
  cells: LocalBingoCell[]
  title: string
}

const BINGO_STORAGE_KEY = 'todo-bingo-card'
const GAME_STATE_STORAGE_KEY = 'todo-bingo-game-state'

export async function syncLocalDataToSupabase(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const localBingoData = localStorage.getItem(BINGO_STORAGE_KEY)
    const localGameState = localStorage.getItem(GAME_STATE_STORAGE_KEY)

    if (!localBingoData && !localGameState) {
      return { success: true }
    }

    const bingoData: LocalBingoData | null = localBingoData ? JSON.parse(localBingoData) : null
    const gameState: LocalGameState | null = localGameState ? JSON.parse(localGameState) : null

    if (gameState) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          level: gameState.level,
          total_points: gameState.totalPoints,
          current_streak: gameState.currentStreak,
          max_streak: gameState.maxStreak,
          last_activity_date: gameState.lastActivityDate,
        })
        .eq('id', userId)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }

      if (gameState.earnedBadgeIds.length > 0) {
        for (const badgeId of gameState.earnedBadgeIds) {
          await supabase
            .from('achievements')
            .upsert({
              user_id: userId,
              badge_id: badgeId,
            }, { onConflict: 'user_id,badge_id' })
        }
      }

      if (gameState.activityDates.length > 0) {
        for (const date of gameState.activityDates) {
          await supabase
            .from('activity_log')
            .insert({
              user_id: userId,
              activity_type: 'daily_activity',
              points_earned: 0,
              created_at: `${date}T12:00:00Z`,
            })
        }
      }
    }

    if (bingoData && bingoData.cells.some(c => c.goal_text)) {
      const { data: existingCards } = await supabase
        .from('bingo_cards')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)

      let cardId: string

      if (existingCards && existingCards.length > 0) {
        cardId = existingCards[0].id

        await supabase
          .from('bingo_cards')
          .update({
            size: bingoData.size,
            has_free_center: bingoData.hasFreeCenter,
            title: bingoData.title || '2025 Goals',
          })
          .eq('id', cardId)

        await supabase
          .from('bingo_cells')
          .delete()
          .eq('card_id', cardId)
      } else {
        const { data: newCard, error: cardError } = await supabase
          .from('bingo_cards')
          .insert({
            user_id: userId,
            size: bingoData.size,
            has_free_center: bingoData.hasFreeCenter,
            title: bingoData.title || '2025 Goals',
            is_active: true,
          })
          .select()
          .single()

        if (cardError || !newCard) {
          throw new Error('Failed to create bingo card')
        }

        cardId = newCard.id
      }

      for (const cell of bingoData.cells) {
        await supabase
          .from('bingo_cells')
          .insert({
            card_id: cardId,
            position: cell.position,
            goal_text: cell.goal_text || '',
            is_completed: cell.is_completed,
            is_free: cell.is_free,
            completed_at: cell.completed_at,
            category: cell.category || null,
          })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Sync error:', error)
    return { success: false, error: String(error) }
  }
}

export async function loadDataFromSupabase(userId: string): Promise<{
  bingoData: LocalBingoData | null
  gameState: LocalGameState | null
}> {
  const supabase = createClient()

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const { data: achievements } = await supabase
      .from('achievements')
      .select('badge_id')
      .eq('user_id', userId)

    const { data: activities } = await supabase
      .from('activity_log')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    const { data: card } = await supabase
      .from('bingo_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    let cells: LocalBingoCell[] = []
    if (card) {
      const { data: cellsData } = await supabase
        .from('bingo_cells')
        .select('*')
        .eq('card_id', card.id)
        .order('position')

      if (cellsData) {
        cells = cellsData.map((c: {
          position: number
          goal_text: string
          is_completed: boolean
          is_free: boolean
          completed_at: string | null
          category: string | null
        }) => ({
          position: c.position,
          goal_text: c.goal_text,
          is_completed: c.is_completed,
          is_free: c.is_free,
          completed_at: c.completed_at,
          category: c.category || undefined,
        }))
      }
    }

    const activityDates = activities
      ? [...new Set(activities.map((a: { created_at: string }) => a.created_at.split('T')[0]))]
      : []

    const completedCellsCount = cells.filter(c => c.is_completed && !c.is_free).length

    const gameState: LocalGameState = {
      totalPoints: profile?.total_points || 0,
      level: profile?.level || 1,
      earnedBadgeIds: achievements?.map((a: { badge_id: string }) => a.badge_id) || [],
      currentStreak: profile?.current_streak || 0,
      maxStreak: profile?.max_streak || 0,
      lastActivityDate: profile?.last_activity_date || null,
      activityDates,
      totalCellsCompleted: completedCellsCount,
      totalBingos: 0,
    }

    const bingoData: LocalBingoData | null = card ? {
      size: card.size as BingoSize,
      hasFreeCenter: card.has_free_center,
      cells,
      title: card.title,
    } : null

    return { bingoData, gameState }
  } catch (error) {
    console.error('Load error:', error)
    return { bingoData: null, gameState: null }
  }
}

export async function saveCellToSupabase(
  userId: string,
  cardId: string,
  position: number,
  updates: Partial<LocalBingoCell>
): Promise<boolean> {
  const supabase = createClient()
  void userId

  try {
    const { error } = await supabase
      .from('bingo_cells')
      .update({
        goal_text: updates.goal_text,
        is_completed: updates.is_completed,
        completed_at: updates.is_completed ? new Date().toISOString() : null,
        category: updates.category,
      })
      .eq('card_id', cardId)
      .eq('position', position)

    return !error
  } catch {
    return false
  }
}

export async function updateProfileStats(
  userId: string,
  stats: Partial<{
    totalPoints: number
    level: number
    currentStreak: number
    maxStreak: number
    lastActivityDate: string
  }>
): Promise<boolean> {
  const supabase = createClient()

  try {
    const updateData: Record<string, unknown> = {}
    if (stats.totalPoints !== undefined) updateData.total_points = stats.totalPoints
    if (stats.level !== undefined) updateData.level = stats.level
    if (stats.currentStreak !== undefined) updateData.current_streak = stats.currentStreak
    if (stats.maxStreak !== undefined) updateData.max_streak = stats.maxStreak
    if (stats.lastActivityDate !== undefined) updateData.last_activity_date = stats.lastActivityDate

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    return !error
  } catch {
    return false
  }
}

export async function addAchievement(userId: string, badgeId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('achievements')
      .insert({
        user_id: userId,
        badge_id: badgeId,
      })

    return !error
  } catch {
    return false
  }
}
