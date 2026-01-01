'use client'

import { useEffect, useState, useRef } from 'react'
import { ShareButton } from './ShareButton'
import type { BingoSize } from '@/types'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  bingoLines: number
  completedCells: number
  totalCells: number
  level: number
  size: BingoSize
  cells: { is_completed: boolean }[]
}

export function ShareModal({
  isOpen,
  onClose,
  bingoLines,
  completedCells,
  totalCells,
  level,
  size,
  cells,
}: ShareModalProps) {
  const [ogImageUrl, setOgImageUrl] = useState('')
  const [showAnonymous, setShowAnonymous] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isOpen) {
      const cellsData = cells.map(c => c.is_completed ? '1' : '0').join(',')
      const params = new URLSearchParams({
        bingo: bingoLines.toString(),
        completed: completedCells.toString(),
        total: totalCells.toString(),
        level: level.toString(),
        size: size.toString(),
        cells: cellsData,
      })
      setOgImageUrl(`/api/og?${params.toString()}`)
    }
  }, [isOpen, bingoLines, completedCells, totalCells, level, size, cells])

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      drawPreview()
    }
  }, [isOpen, cells, size, showAnonymous])

  const drawPreview = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cellSize = 40
    const gap = 4
    const padding = 20
    const width = size * cellSize + (size - 1) * gap + padding * 2
    const height = width + 60

    canvas.width = width
    canvas.height = height

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Draw cells
    cells.slice(0, size * size).forEach((cell, i) => {
      const row = Math.floor(i / size)
      const col = i % size
      const x = padding + col * (cellSize + gap)
      const y = padding + row * (cellSize + gap)

      ctx.fillStyle = cell.is_completed
        ? '#22c55e'
        : 'rgba(255,255,255,0.2)'
      ctx.beginPath()
      ctx.roundRect(x, y, cellSize, cellSize, 6)
      ctx.fill()

      if (cell.is_completed) {
        ctx.fillStyle = 'white'
        ctx.font = 'bold 20px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('✓', x + cellSize / 2, y + cellSize / 2)
      }
    })

    // Stats
    const statsY = padding + size * (cellSize + gap) + 20
    ctx.fillStyle = 'white'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    const rate = Math.round((completedCells / totalCells) * 100)
    ctx.fillText(`${bingoLines}ビンゴ | ${rate}% | Lv.${level}`, width / 2, statsY)
  }

  const downloadImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'todo-bingo.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">進捗をシェア</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-lg shadow-md max-w-full"
              style={{ maxHeight: 300 }}
            />
          </div>

          {/* Options */}
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showAnonymous}
              onChange={(e) => setShowAnonymous(e.target.checked)}
              className="rounded"
            />
            目標内容を隠す（匿名モード）
          </label>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-100 rounded-lg p-2">
              <div className="text-xl font-bold text-green-600">{bingoLines}</div>
              <div className="text-xs text-green-700">ビンゴ</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-2">
              <div className="text-xl font-bold text-blue-600">
                {Math.round((completedCells / totalCells) * 100)}%
              </div>
              <div className="text-xs text-blue-700">達成率</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-2">
              <div className="text-xl font-bold text-purple-600">Lv.{level}</div>
              <div className="text-xs text-purple-700">レベル</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={downloadImage}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              📥 画像を保存
            </button>
            <ShareButton
              data={{
                title: 'Todo Bingo 2025',
                text: '',
                bingoLines,
                completedCells,
                totalCells,
                level,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
