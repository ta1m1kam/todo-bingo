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

  const getCellStyle = () => {
    if (cell.is_free) {
      return {
        backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, white)',
        borderColor: 'color-mix(in srgb, var(--theme-secondary) 30%, white)'
      }
    }
    if (cell.is_completed) {
      if (isInCompletedLine) {
        return {
          backgroundColor: 'var(--theme-completed)',
          borderColor: 'var(--theme-completed)'
        }
      }
      return {
        backgroundColor: 'color-mix(in srgb, var(--theme-completed) 20%, white)',
        borderColor: 'color-mix(in srgb, var(--theme-completed) 50%, white)'
      }
    }
    return {
      backgroundColor: 'var(--theme-cell)',
      borderColor: '#E8E5E0'
    }
  }

  return (
    <div
      className={`
        relative ${cellSize} p-2 rounded-lg border-2 transition-all duration-200
        flex items-center justify-center text-center
        ${cell.is_free
          ? 'cursor-default'
          : cell.is_completed
            ? isInCompletedLine
              ? 'text-white shadow-md scale-[1.02]'
              : 'text-green-800'
            : mode === 'edit'
              ? 'hover:shadow-md cursor-text text-gray-900'
              : 'hover:shadow-md cursor-pointer text-gray-900'
        }
      `}
      style={getCellStyle()}
      onClick={handleClick}
    >
      {cell.is_free ? (
        <span className="font-bold" style={{ color: 'var(--theme-secondary)' }}>FREE</span>
      ) : isEditing ? (
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full h-full resize-none bg-transparent outline-none text-center text-gray-900 placeholder:text-gray-400 ${fontSize}`}
          placeholder="目標を入力..."
          maxLength={100}
        />
      ) : (
        <>
          <span className={`${fontSize} font-medium break-words line-clamp-3`}>
            {cell.goal_text || (mode === 'edit' ? <span className="text-gray-400 font-normal">クリックして入力</span> : '')}
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
