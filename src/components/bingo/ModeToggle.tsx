'use client'

import type { BingoMode } from '@/types'

interface ModeToggleProps {
  mode: BingoMode
  onModeChange: (mode: BingoMode) => void
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 rounded-full">
      <button
        onClick={() => onModeChange('edit')}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all
          ${mode === 'edit'
            ? 'bg-white text-blue-600 shadow-md'
            : 'text-gray-600 hover:text-gray-800'
          }
        `}
      >
        ✏️ 編集モード
      </button>
      <button
        onClick={() => onModeChange('play')}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all
          ${mode === 'play'
            ? 'bg-white text-green-600 shadow-md'
            : 'text-gray-600 hover:text-gray-800'
          }
        `}
      >
        🎯 達成モード
      </button>
    </div>
  )
}
