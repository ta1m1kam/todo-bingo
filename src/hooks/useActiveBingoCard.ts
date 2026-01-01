'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useBingoCardContext } from '@/contexts/BingoCardContext'
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

export function useActiveBingoCard() {
  const { user, isLoading: authLoading } = useAuth()
  const { activeCardId, refreshCards } = useBingoCardContext()
  const [cardState, setCardState] = useState<BingoCardState>(() => createInitialState())
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [prevBingoLines, setPrevBingoLines] = useState(0)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setIsLoaded(true)
      return
    }

    if (!activeCardId) {
      setIsLoaded(true)
      return
    }

    const loadCard = async () => {
      setIsLoaded(false)
      const supabase = createClient()

      try {
        const { data: card, error: cardError } = await supabase
          .from('bingo_cards')
          .select('*')
          .eq('id', activeCardId)
          .single()

        if (cardError || !card) {
          console.error('Failed to load card:', cardError)
          setIsLoaded(true)
          return
        }

        const { data: cells, error: cellsError } = await supabase
          .from('bingo_cells')
          .select('*')
          .eq('card_id', activeCardId)
          .order('position')

        if (cellsError) {
          console.error('Failed to load cells:', cellsError)
          setIsLoaded(true)
          return
        }

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
      } catch (error) {
        console.error('Load error:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadCard()
  }, [user, authLoading, activeCardId])

  const stats = useMemo(() =>
    calculateBingoStats(cardState.cells, cardState.size),
    [cardState.cells, cardState.size]
  )

  const updateCell = useCallback(async (
    position: number,
    updates: Partial<Pick<LocalCell, 'goal_text' | 'is_completed'>>
  ): Promise<{ wasCompletion: boolean; prevBingoLines: number }> => {
    let wasCompletion = false
    let bingoLinesBefore = 0
    let cellGoalText: string | undefined
    let cellIsCompleted: boolean | undefined

    // Use functional update to ensure we always work with the latest state
    // This is critical when multiple updateCell calls happen in parallel
    setCardState(prev => {
      const cell = prev.cells.find(c => c.position === position)
      cellGoalText = cell?.goal_text
      cellIsCompleted = cell?.is_completed

      if (cell && !cell.is_completed && updates.is_completed) {
        wasCompletion = true
        bingoLinesBefore = calculateBingoStats(prev.cells, prev.size).bingoLines
      }

      const newCells = prev.cells.map(c =>
        c.position === position ? { ...c, ...updates } : c
      )

      if (wasCompletion) {
        const newStats = calculateBingoStats(newCells, prev.size)
        setPrevBingoLines(newStats.bingoLines)
      }

      return { ...prev, cells: newCells }
    })

    // Only save to DB if user and cardId exist
    if (!user || !cardState.cardId) {
      return { wasCompletion: false, prevBingoLines: 0 }
    }

    setIsSaving(true)
    try {
      const supabase = createClient()
      await supabase
        .from('bingo_cells')
        .update({
          goal_text: updates.goal_text !== undefined ? updates.goal_text : cellGoalText,
          is_completed: updates.is_completed !== undefined ? updates.is_completed : cellIsCompleted,
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
  }, [user, cardState.cardId])

  const setTitle = useCallback(async (title: string) => {
    // Always update local state first
    setCardState(prev => ({ ...prev, title }))

    // Only save to DB if user and cardId exist
    if (!user || !cardState.cardId) return

    try {
      const supabase = createClient()
      await supabase
        .from('bingo_cards')
        .update({ title })
        .eq('id', cardState.cardId)

      refreshCards()
    } catch (error) {
      console.error('Title save error:', error)
    }
  }, [user, cardState.cardId, refreshCards])

  const changeSize = useCallback(async (newSize: BingoSize) => {
    if (!user || !cardState.cardId) return

    const supabase = createClient()
    const newState = createInitialState(newSize, cardState.hasFreeCenter)

    try {
      await supabase
        .from('bingo_cells')
        .delete()
        .eq('card_id', cardState.cardId)

      await supabase
        .from('bingo_cards')
        .update({
          size: newSize,
          has_free_center: cardState.hasFreeCenter,
        })
        .eq('id', cardState.cardId)

      const cellsToInsert = newState.cells.map(c => ({
        card_id: cardState.cardId,
        position: c.position,
        goal_text: c.goal_text,
        is_completed: c.is_completed,
        is_free: c.is_free,
      }))

      await supabase.from('bingo_cells').insert(cellsToInsert)

      setCardState({
        ...newState,
        title: cardState.title,
        cardId: cardState.cardId,
      })
      setPrevBingoLines(0)
    } catch (error) {
      console.error('Change size error:', error)
    }
  }, [user, cardState.cardId, cardState.title, cardState.hasFreeCenter])

  const toggleFreeCenter = useCallback(async (enabled: boolean) => {
    if (!user || !cardState.cardId) return

    const supabase = createClient()
    const newState = createInitialState(cardState.size, enabled)

    try {
      await supabase
        .from('bingo_cells')
        .delete()
        .eq('card_id', cardState.cardId)

      await supabase
        .from('bingo_cards')
        .update({
          has_free_center: enabled,
        })
        .eq('id', cardState.cardId)

      const cellsToInsert = newState.cells.map(c => ({
        card_id: cardState.cardId,
        position: c.position,
        goal_text: c.goal_text,
        is_completed: c.is_completed,
        is_free: c.is_free,
      }))

      await supabase.from('bingo_cells').insert(cellsToInsert)

      setCardState({
        ...newState,
        title: cardState.title,
        cardId: cardState.cardId,
      })
      setPrevBingoLines(0)
    } catch (error) {
      console.error('Toggle free center error:', error)
    }
  }, [user, cardState.cardId, cardState.title, cardState.size])

  const resetCard = useCallback(async () => {
    if (!user || !cardState.cardId) return

    const supabase = createClient()
    const newState = createInitialState(cardState.size, cardState.hasFreeCenter)

    try {
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
