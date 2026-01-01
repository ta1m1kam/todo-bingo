'use client'

import { useState, useRef, useEffect } from 'react'
import type { BingoCell as BingoCellType, BingoMode } from '@/types'

interface BingoCellProps {
  cell: Pick<BingoCellType, 'position' | 'goal_text' | 'is_completed' | 'is_free'>
  mode: BingoMode
  isInCompletedLine: boolean
  size: number
  onUpdate: (position: number, updates: Partial<Pick<BingoCellType, 'goal_text' | 'is_completed'>>) => void
}

export function BingoCell({ cell, mode, isInCompletedLine, size, onUpdate }: BingoCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(cell.goal_text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setEditText(cell.goal_text)
  }, [cell.goal_text])

  const handleClick = () => {
    if (cell.is_free) return

    if (mode === 'edit') {
      setIsEditing(true)
    } else {
      onUpdate(cell.position, { is_completed: !cell.is_completed })
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editText !== cell.goal_text) {
      onUpdate(cell.position, { goal_text: editText })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      textareaRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setEditText(cell.goal_text)
      setIsEditing(false)
    }
  }

  const cellSize = size <= 5 ? 'min-h-[80px]' : size <= 7 ? 'min-h-[60px]' : 'min-h-[50px]'
  const fontSize = size <= 5 ? 'text-sm' : size <= 7 ? 'text-xs' : 'text-[10px]'

  return (
    <div
      className={`
        relative ${cellSize} p-2 rounded-lg border-2 transition-all duration-200
        flex items-center justify-center text-center
        ${cell.is_free
          ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 cursor-default'
          : cell.is_completed
            ? isInCompletedLine
              ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-600 text-white shadow-lg scale-[1.02]'
              : 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 text-green-800'
            : mode === 'edit'
              ? 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md cursor-text'
              : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-md cursor-pointer'
        }
      `}
      onClick={handleClick}
    >
      {cell.is_free ? (
        <span className="text-yellow-700 font-bold">FREE</span>
      ) : isEditing ? (
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full h-full resize-none bg-transparent outline-none text-center ${fontSize}`}
          placeholder="目標を入力..."
          maxLength={100}
        />
      ) : (
        <>
          <span className={`${fontSize} break-words line-clamp-3`}>
            {cell.goal_text || (mode === 'edit' ? 'クリックして入力' : '')}
          </span>
          {cell.is_completed && !cell.is_free && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-4xl opacity-30">✓</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
