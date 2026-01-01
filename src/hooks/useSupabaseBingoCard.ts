'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { BingoSize } from '@/types'
import { createEmptyCells, calculateBingoStats } from '@/lib/utils/bingo'

interface LocalCell {
  position: number
  goal_text: string
  is_completed: boolean
  is_free: boolean
}

interface BingoCardState {
  size: BingoSize
  hasFreeCenter: boolean
  cells: LocalCell[]
  title: string
  cardId: string | null
}

const createInitialState = (size: BingoSize = 5, hasFreeCenter: boolean = false): BingoCardState => ({
  size,
  hasFreeCenter,
  cells: createEmptyCells(size, hasFreeCenter) as LocalCell[],
  title: '2025年の目標',
  cardId: null,
})

export function useSupabaseBingoCard() {
  const { user } = useAuth()
  const [cardState, setCardState] = useState<BingoCardState>(() => createInitialState())
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [prevBingoLines, setPrevBingoLines] = useState(0)

  // Load from Supabase
  useEffect(() => {
    if (!user) {
      setIsLoaded(true)
      return
    }

    const loadFromSupabase = async () => {
      const supabase = createClient()

      try {
        // Get active bingo card
        const { data: cards } = await supabase
          .from('bingo_cards')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1)

        if (cards && cards.length > 0) {
          const card = cards[0]

          // Get cells for this card
          const { data: cells } = await supabase
            .from('bingo_cells')
            .select('*')
            .eq('card_id', card.id)
            .order('position')

          if (cells) {
            interface DbCell {
              position: number
              goal_text: string | null
              is_completed: boolean
              is_free: boolean
            }
            const localCells: LocalCell[] = cells.map((c: DbCell) => ({
              position: c.position,
              goal_text: c.goal_text || '',
              is_completed: c.is_completed,
              is_free: c.is_free,
            }))

            setCardState({
              size: card.size as BingoSize,
              hasFreeCenter: card.has_free_center,
              cells: localCells,
              title: card.title,
              cardId: card.id,
            })

            const stats = calculateBingoStats(localCells, card.size)
            setPrevBingoLines(stats.bingoLines)
          }
        } else {
          // Create new card if none exists
          const newState = createInitialState()
          const { data: newCard } = await supabase
            .from('bingo_cards')
            .insert({
              user_id: user.id,
              title: newState.title,
              size: newState.size,
              has_free_center: newState.hasFreeCenter,
              is_active: true,
            })
            .select()
            .single()

          if (newCard) {
            // Create cells
            const cellsToInsert = newState.cells.map(c => ({
              card_id: newCard.id,
              position: c.position,
              goal_text: c.goal_text,
              is_completed: c.is_completed,
              is_free: c.is_free,
            }))

            await supabase.from('bingo_cells').insert(cellsToInsert)

            setCardState({ ...newState, cardId: newCard.id })
          }
        }
      } catch (error) {
        console.error('Load error:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadFromSupabase()
  }, [user])

  const stats = useMemo(() =>
    calculateBingoStats(cardState.cells, cardState.size),
    [cardState.cells, cardState.size]
  )

  const updateCell = useCallback(async (
    position: number,
    updates: Partial<Pick<LocalCell, 'goal_text' | 'is_completed'>>
  ): Promise<{ wasCompletion: boolean; prevBingoLines: number }> => {
    if (!user || !cardState.cardId) {
      return { wasCompletion: false, prevBingoLines: 0 }
    }

    let wasCompletion = false
    let bingoLinesBefore = 0

    const cell = cardState.cells.find(c => c.position === position)
    if (cell && !cell.is_completed && updates.is_completed) {
      wasCompletion = true
      bingoLinesBefore = calculateBingoStats(cardState.cells, cardState.size).bingoLines
    }

    const newCells = cardState.cells.map(c =>
      c.position === position ? { ...c, ...updates } : c
    )

    setCardState(prev => ({ ...prev, cells: newCells }))

    if (wasCompletion) {
      const newStats = calculateBingoStats(newCells, cardState.size)
      setPrevBingoLines(newStats.bingoLines)
    }

    // Save to Supabase
    setIsSaving(true)
    try {
      const supabase = createClient()
      await supabase
        .from('bingo_cells')
        .update({
          goal_text: updates.goal_text !== undefined ? updates.goal_text : cell?.goal_text,
          is_completed: updates.is_completed !== undefined ? updates.is_completed : cell?.is_completed,
          completed_at: updates.is_completed ? new Date().toISOString() : null,
        })
        .eq('card_id', cardState.cardId)
        .eq('position', position)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }

    return { wasCompletion, prevBingoLines: bingoLinesBefore }
  }, [user, cardState.cardId, cardState.cells, cardState.size])

  const setTitle = useCallback(async (title: string) => {
    if (!user || !cardState.cardId) return

    setCardState(prev => ({ ...prev, title }))

    try {
      const supabase = createClient()
      await supabase
        .from('bingo_cards')
        .update({ title })
        .eq('id', cardState.cardId)
    } catch (error) {
      console.error('Title save error:', error)
    }
  }, [user, cardState.cardId])

  const changeSize = useCallback(async (newSize: BingoSize) => {
    if (!user) return

    const supabase = createClient()
    const newState = createInitialState(newSize, cardState.hasFreeCenter)

    try {
      // Deactivate old card
      if (cardState.cardId) {
        await supabase
          .from('bingo_cards')
          .update({ is_active: false })
          .eq('id', cardState.cardId)
      }

      // Create new card
      const { data: newCard } = await supabase
        .from('bingo_cards')
        .insert({
          user_id: user.id,
          title: cardState.title,
          size: newSize,
          has_free_center: cardState.hasFreeCenter,
          is_active: true,
        })
        .select()
        .single()

      if (newCard) {
        const cellsToInsert = newState.cells.map(c => ({
          card_id: newCard.id,
          position: c.position,
          goal_text: c.goal_text,
          is_completed: c.is_completed,
          is_free: c.is_free,
        }))

        await supabase.from('bingo_cells').insert(cellsToInsert)

        setCardState({
          ...newState,
          title: cardState.title,
          cardId: newCard.id,
        })
        setPrevBingoLines(0)
      }
    } catch (error) {
      console.error('Change size error:', error)
    }
  }, [user, cardState.cardId, cardState.title, cardState.hasFreeCenter])

  const toggleFreeCenter = useCallback(async (enabled: boolean) => {
    if (!user) return

    const supabase = createClient()
    const newState = createInitialState(cardState.size, enabled)

    try {
      if (cardState.cardId) {
        await supabase
          .from('bingo_cards')
          .update({ is_active: false })
          .eq('id', cardState.cardId)
      }

      const { data: newCard } = await supabase
        .from('bingo_cards')
        .insert({
          user_id: user.id,
          title: cardState.title,
          size: cardState.size,
          has_free_center: enabled,
          is_active: true,
        })
        .select()
        .single()

      if (newCard) {
        const cellsToInsert = newState.cells.map(c => ({
          card_id: newCard.id,
          position: c.position,
          goal_text: c.goal_text,
          is_completed: c.is_completed,
          is_free: c.is_free,
        }))

        await supabase.from('bingo_cells').insert(cellsToInsert)

        setCardState({
          ...newState,
          title: cardState.title,
          cardId: newCard.id,
        })
        setPrevBingoLines(0)
      }
    } catch (error) {
      console.error('Toggle free center error:', error)
    }
  }, [user, cardState.cardId, cardState.title, cardState.size])

  const resetCard = useCallback(async () => {
    if (!user || !cardState.cardId) return

    const supabase = createClient()
    const newState = createInitialState(cardState.size, cardState.hasFreeCenter)

    try {
      // Reset all cells
      for (const cell of newState.cells) {
        await supabase
          .from('bingo_cells')
          .update({
            goal_text: '',
            is_completed: cell.is_free,
            completed_at: null,
          })
          .eq('card_id', cardState.cardId)
          .eq('position', cell.position)
      }

      setCardState(prev => ({
        ...prev,
        cells: newState.cells,
      }))
      setPrevBingoLines(0)
    } catch (error) {
      console.error('Reset error:', error)
    }
  }, [user, cardState.cardId, cardState.size, cardState.hasFreeCenter])

  const resetProgress = useCallback(async () => {
    if (!user || !cardState.cardId) return

    const supabase = createClient()

    try {
      // Reset completion status but keep goal text
      await supabase
        .from('bingo_cells')
        .update({
          is_completed: false,
          completed_at: null,
        })
        .eq('card_id', cardState.cardId)
        .eq('is_free', false)

      setCardState(prev => ({
        ...prev,
        cells: prev.cells.map(cell => ({
          ...cell,
          is_completed: cell.is_free,
        })),
      }))
      setPrevBingoLines(0)
    } catch (error) {
      console.error('Reset progress error:', error)
    }
  }, [user, cardState.cardId])

  return {
    ...cardState,
    stats,
    isLoaded,
    isSaving,
    prevBingoLines,
    updateCell,
    changeSize,
    toggleFreeCenter,
    setTitle,
    resetCard,
    resetProgress,
  }
}
