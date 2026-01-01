'use client'

import { useBingoCardContext } from '@/contexts/BingoCardContext'

export function useBingoCards() {
  const {
    cards,
    activeCardId,
    isLoading,
    canCreateCard,
    switchCard,
    createCard,
    deleteCard,
    renameCard,
    refreshCards,
  } = useBingoCardContext()

  const activeCard = cards.find(c => c.id === activeCardId) || null

  return {
    cards,
    activeCard,
    activeCardId,
    isLoading,
    canCreateCard,
    cardCount: cards.length,
    switchCard,
    createCard,
    deleteCard,
    renameCard,
    refreshCards,
  }
}
