'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import type { BingoCell, BingoSize } from '@/types'
import { createEmptyCells, calculateBingoStats } from '@/lib/utils/bingo'

type LocalCell = Pick<BingoCell, 'position' | 'goal_text' | 'is_completed' | 'is_free'>

interface BingoCardState {
  size: BingoSize
  hasFreeCenter: boolean
  cells: LocalCell[]
  title: string
}

const STORAGE_KEY = 'todo-bingo-card-state'

const createInitialState = (size: BingoSize = 5, hasFreeCenter: boolean = false): BingoCardState => ({
  size,
  hasFreeCenter,
  cells: createEmptyCells(size, hasFreeCenter) as LocalCell[],
  title: '2025年の目標',
})

export function useBingoCard() {
  const [cardState, setCardState] = useState<BingoCardState>(() => createInitialState())
  const [isLoaded, setIsLoaded] = useState(false)
  const [prevBingoLines, setPrevBingoLines] = useState(0)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCardState(parsed)
        // Calculate initial bingo lines
        const stats = calculateBingoStats(parsed.cells, parsed.size)
        setPrevBingoLines(stats.bingoLines)
      } catch {
        // Invalid data, use initial state
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cardState))
    }
  }, [cardState, isLoaded])

  const stats = useMemo(() =>
    calculateBingoStats(cardState.cells, cardState.size),
    [cardState.cells, cardState.size]
  )

  const updateCell = useCallback((
    position: number,
    updates: Partial<Pick<BingoCell, 'goal_text' | 'is_completed'>>
  ): { wasCompletion: boolean; prevBingoLines: number } => {
    let wasCompletion = false
    let bingoLinesBefore = 0

    setCardState(prev => {
      const cell = prev.cells.find(c => c.position === position)
      if (cell && !cell.is_completed && updates.is_completed) {
        wasCompletion = true
        bingoLinesBefore = calculateBingoStats(prev.cells, prev.size).bingoLines
      }

      const newCells = prev.cells.map(c =>
        c.position === position ? { ...c, ...updates } : c
      )

      // Update prevBingoLines after state update
      if (wasCompletion) {
        const newStats = calculateBingoStats(newCells, prev.size)
        setPrevBingoLines(newStats.bingoLines)
      }

      return { ...prev, cells: newCells }
    })

    return { wasCompletion, prevBingoLines: bingoLinesBefore }
  }, [])

  const changeSize = useCallback((newSize: BingoSize) => {
    setCardState(prev => ({
      ...prev,
      size: newSize,
      cells: createEmptyCells(newSize, prev.hasFreeCenter) as LocalCell[],
    }))
    setPrevBingoLines(0)
  }, [])

  const toggleFreeCenter = useCallback((enabled: boolean) => {
    setCardState(prev => ({
      ...prev,
      hasFreeCenter: enabled,
      cells: createEmptyCells(prev.size, enabled) as LocalCell[],
    }))
    setPrevBingoLines(0)
  }, [])

  const setTitle = useCallback((title: string) => {
    setCardState(prev => ({ ...prev, title }))
  }, [])

  const resetCard = useCallback(() => {
    setCardState(prev => createInitialState(prev.size, prev.hasFreeCenter))
    setPrevBingoLines(0)
  }, [])

  const resetProgress = useCallback(() => {
    setCardState(prev => ({
      ...prev,
      cells: prev.cells.map(cell => ({
        ...cell,
        is_completed: cell.is_free,
      })),
    }))
    setPrevBingoLines(0)
  }, [])

  return {
    ...cardState,
    stats,
    isLoaded,
    prevBingoLines,
    updateCell,
    changeSize,
    toggleFreeCenter,
    setTitle,
    resetCard,
    resetProgress,
  }
}
