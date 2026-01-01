'use client'

import type { BingoSize } from '@/types'

interface SizeSelectorProps {
  size: BingoSize
  onSizeChange: (size: BingoSize) => void
  disabled?: boolean
}

const SIZES: BingoSize[] = [3, 4, 5, 6, 7, 8, 9]

export function SizeSelector({ size, onSizeChange, disabled = false }: SizeSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-600">サイズ:</span>
      <div className="flex gap-1">
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => onSizeChange(s)}
            disabled={disabled}
            className={`
              w-10 h-10 rounded-lg text-sm font-medium transition-all
              ${size === s
                ? 'bg-blue-500 text-white shadow-md'
                : disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {s}x{s}
          </button>
        ))}
      </div>
    </div>
  )
}
