'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { BingoSize } from '@/types'
import { createEmptyCells } from '@/lib/utils/bingo'

const MAX_CARDS = 5

export interface BingoCardSummary {
  id: string
  title: string
  size: number
  hasFreeCel: boolean
  createdAt: string
  isActive: boolean
}

interface BingoCardContextType {
  cards: BingoCardSummary[]
  activeCardId: string | null
  isLoading: boolean
  canCreateCard: boolean
  switchCard: (cardId: string) => Promise<void>
  createCard: (title: string) => Promise<string | null>
  deleteCard: (cardId: string) => Promise<boolean>
  renameCard: (cardId: string, title: string) => Promise<void>
  refreshCards: () => Promise<void>
}

const BingoCardContext = createContext<BingoCardContextType | undefined>(undefined)

export function BingoCardProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const [cards, setCards] = useState<BingoCardSummary[]>([])
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCards = useCallback(async () => {
    if (!user) {
      setCards([])
      setActiveCardId(null)
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bingo_cards')
        .select('id, title, size, has_free_center, created_at, is_active')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Failed to fetch cards:', error)
        return
      }

      if (data) {
        const cardList: BingoCardSummary[] = data.map(card => ({
          id: card.id,
          title: card.title,
          size: card.size,
          hasFreeCel: card.has_free_center,
          createdAt: card.created_at,
          isActive: card.is_active,
        }))

        setCards(cardList)

        const activeCard = cardList.find(c => c.isActive)
        if (activeCard) {
          setActiveCardId(activeCard.id)
        } else if (cardList.length > 0) {
          setActiveCardId(cardList[0].id)
          await supabase
            .from('bingo_cards')
            .update({ is_active: true })
            .eq('id', cardList[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    fetchCards()
  }, [authLoading, fetchCards])

  const refreshCards = useCallback(async () => {
    await fetchCards()
  }, [fetchCards])

  const switchCard = useCallback(async (cardId: string) => {
    if (!user || cardId === activeCardId) return

    try {
      const supabase = createClient()

      await supabase
        .from('bingo_cards')
        .update({ is_active: false })
        .eq('user_id', user.id)

      await supabase
        .from('bingo_cards')
        .update({ is_active: true })
        .eq('id', cardId)

      setActiveCardId(cardId)
      setCards(prev => prev.map(c => ({
        ...c,
        isActive: c.id === cardId,
      })))
    } catch (error) {
      console.error('Failed to switch card:', error)
    }
  }, [user, activeCardId])

  const createCard = useCallback(async (title: string): Promise<string | null> => {
    if (!user || cards.length >= MAX_CARDS) return null

    try {
      const supabase = createClient()
      const defaultSize: BingoSize = 5
      const defaultHasFreeCenter = false

      await supabase
        .from('bingo_cards')
        .update({ is_active: false })
        .eq('user_id', user.id)

      const { data: newCard, error } = await supabase
        .from('bingo_cards')
        .insert({
          user_id: user.id,
          title: title || '新しいビンゴカード',
          size: defaultSize,
          has_free_center: defaultHasFreeCenter,
          is_active: true,
        })
        .select()
        .single()

      if (error || !newCard) {
        console.error('Failed to create card:', error)
        return null
      }

      const emptyCells = createEmptyCells(defaultSize, defaultHasFreeCenter)
      const cellsToInsert = emptyCells.map(c => ({
        card_id: newCard.id,
        position: c.position,
        goal_text: c.goal_text,
        is_completed: c.is_completed,
        is_free: c.is_free,
      }))

      await supabase.from('bingo_cells').insert(cellsToInsert)

      const newCardSummary: BingoCardSummary = {
        id: newCard.id,
        title: newCard.title,
        size: newCard.size,
        hasFreeCel: newCard.has_free_center,
        createdAt: newCard.created_at,
        isActive: true,
      }

      setCards(prev => [...prev.map(c => ({ ...c, isActive: false })), newCardSummary])
      setActiveCardId(newCard.id)

      return newCard.id
    } catch (error) {
      console.error('Failed to create card:', error)
      return null
    }
  }, [user, cards.length])

  const deleteCard = useCallback(async (cardId: string): Promise<boolean> => {
    if (!user || cards.length <= 1) return false
    if (cardId === activeCardId) return false

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('bingo_cards')
        .delete()
        .eq('id', cardId)

      if (error) {
        console.error('Failed to delete card:', error)
        return false
      }

      setCards(prev => prev.filter(c => c.id !== cardId))
      return true
    } catch (error) {
      console.error('Failed to delete card:', error)
      return false
    }
  }, [user, cards.length, activeCardId])

  const renameCard = useCallback(async (cardId: string, title: string) => {
    if (!user) return

    try {
      const supabase = createClient()

      await supabase
        .from('bingo_cards')
        .update({ title })
        .eq('id', cardId)

      setCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, title } : c
      ))
    } catch (error) {
      console.error('Failed to rename card:', error)
    }
  }, [user])

  const canCreateCard = cards.length < MAX_CARDS

  return (
    <BingoCardContext.Provider
      value={{
        cards,
        activeCardId,
        isLoading,
        canCreateCard,
        switchCard,
        createCard,
        deleteCard,
        renameCard,
        refreshCards,
      }}
    >
      {children}
    </BingoCardContext.Provider>
  )
}

export function useBingoCardContext() {
  const context = useContext(BingoCardContext)
  if (context === undefined) {
    throw new Error('useBingoCardContext must be used within a BingoCardProvider')
  }
  return context
}
