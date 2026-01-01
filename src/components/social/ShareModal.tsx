'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { ShareButton } from './ShareButton'
import type { BingoCell, BingoSize } from '@/types'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  bingoLines: number
  completedCells: number
  totalCells: number
  level: number
  size: BingoSize
  cells: Pick<BingoCell, 'is_completed' | 'goal_text' | 'is_free'>[]
  title?: string
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
  title = 'Todo Bingo 2025',
}: ShareModalProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [showGoals, setShowGoals] = useState(true)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const completionRate = totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0

  const buildOgUrl = useCallback(() => {
    const cellsData = cells.map(c => c.is_completed ? '1' : '0').join(',')
    const params = new URLSearchParams({
      bingo: bingoLines.toString(),
      completed: completedCells.toString(),
      total: totalCells.toString(),
      level: level.toString(),
      size: size.toString(),
      cells: cellsData,
      showGoals: showGoals ? '1' : '0',
    })
    return `/api/og?${params.toString()}`
  }, [bingoLines, completedCells, totalCells, level, size, cells, showGoals])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 600
    const height = 315
    canvas.width = width
    canvas.height = height

    // Get theme colors from CSS variables
    const computedStyle = getComputedStyle(document.documentElement)
    const primaryColor = computedStyle.getPropertyValue('--theme-primary').trim() || '#6366f1'
    const secondaryColor = computedStyle.getPropertyValue('--theme-secondary').trim() || '#8b5cf6'
    const completedColor = computedStyle.getPropertyValue('--theme-completed').trim() || '#22c55e'

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, primaryColor)
    gradient.addColorStop(1, secondaryColor)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Title
    ctx.fillStyle = 'white'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(title, width / 2, 45)

    // Calculate grid dimensions
    const cellSize = Math.min(30, Math.floor(180 / size))
    const gap = 3
    const gridWidth = size * cellSize + (size - 1) * gap
    const gridStartX = (width - gridWidth) / 2
    const gridStartY = 70

    // Draw cells
    cells.slice(0, size * size).forEach((cell, i) => {
      const row = Math.floor(i / size)
      const col = i % size
      const x = gridStartX + col * (cellSize + gap)
      const y = gridStartY + row * (cellSize + gap)

      if (cell.is_free) {
        // FREE cell
        ctx.fillStyle = '#fbbf24'
      } else if (cell.is_completed) {
        // Completed cell
        ctx.fillStyle = completedColor
      } else {
        // Not completed
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
      }

      ctx.beginPath()
      ctx.roundRect(x, y, cellSize, cellSize, 4)
      ctx.fill()

      // Show checkmark for completed cells
      if (cell.is_completed && !cell.is_free) {
        ctx.fillStyle = 'white'
        ctx.font = `bold ${cellSize * 0.5}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('✓', x + cellSize / 2, y + cellSize / 2)
      }

      // Show star for FREE cell
      if (cell.is_free) {
        ctx.fillStyle = 'white'
        ctx.font = `bold ${cellSize * 0.5}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('★', x + cellSize / 2, y + cellSize / 2)
      }
    })

    // Stats section
    const statsY = gridStartY + size * (cellSize + gap) + 30
    const statsGap = 120

    // Bingo count
    ctx.fillStyle = 'white'
    ctx.font = 'bold 32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(bingoLines.toString(), width / 2 - statsGap, statsY)
    ctx.font = '14px sans-serif'
    ctx.fillText('ビンゴ', width / 2 - statsGap, statsY + 22)

    // Completion rate
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(`${completionRate}%`, width / 2, statsY)
    ctx.font = '14px sans-serif'
    ctx.fillText('達成率', width / 2, statsY + 22)

    // Level
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(`Lv.${level}`, width / 2 + statsGap, statsY)
    ctx.font = '14px sans-serif'
    ctx.fillText('レベル', width / 2 + statsGap, statsY + 22)

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '12px sans-serif'
    ctx.fillText('#TodoBingo #目標達成 #2025年の目標', width / 2, height - 15)
  }, [cells, size, bingoLines, completionRate, level, title])

  useEffect(() => {
    if (isOpen) {
      setImageLoading(true)
      drawCanvas()

      // Preload OG image for download
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        imageRef.current = img
        setImageLoading(false)
      }
      img.onerror = () => {
        setImageLoading(false)
      }
      img.src = buildOgUrl()
    }
  }, [isOpen, buildOgUrl, drawCanvas])

  // Redraw canvas when showGoals changes
  useEffect(() => {
    if (isOpen) {
      drawCanvas()
    }
  }, [isOpen, showGoals, drawCanvas])

  const downloadImage = async () => {
    setDownloadLoading(true)
    try {
      // Use canvas for download (works better cross-origin)
      const canvas = canvasRef.current
      if (!canvas) return

      const link = document.createElement('a')
      link.download = `todo-bingo-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Download error:', error)
      alert('画像のダウンロードに失敗しました')
    } finally {
      setDownloadLoading(false)
    }
  }

  const copyImageToClipboard = async () => {
    try {
      const canvas = canvasRef.current
      if (!canvas) return

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b)
          else reject(new Error('Failed to create blob'))
        }, 'image/png')
      })

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      alert('画像をクリップボードにコピーしました！')
    } catch {
      // Fallback: copy URL instead
      await navigator.clipboard.writeText(`${window.location.origin}${buildOgUrl()}`)
      alert('画像URLをコピーしました')
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="p-4 text-white"
          style={{ background: 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary))' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📤</span> 進捗をシェア
            </h2>
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
          <div className="relative bg-gray-100 rounded-xl overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full rounded-lg shadow-md"
              style={{ aspectRatio: '600/315' }}
            />
          </div>

          {/* Options */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showGoals}
                onChange={(e) => setShowGoals(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">達成状況を表示</span>
                <p className="text-xs text-gray-500">チェックを外すと匿名モードになります</p>
              </div>
            </label>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{bingoLines}</div>
              <div className="text-xs text-green-700 font-medium">ビンゴ</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
              <div className="text-xs text-blue-700 font-medium">達成率</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">Lv.{level}</div>
              <div className="text-xs text-purple-700 font-medium">レベル</div>
            </div>
          </div>

          {/* Goal summary (if showing goals) */}
          {showGoals && completedCells > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">達成した目標</h4>
              <div className="flex flex-wrap gap-1">
                {cells
                  .filter(c => c.is_completed && !c.is_free && c.goal_text)
                  .slice(0, 5)
                  .map((cell, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {cell.goal_text && cell.goal_text.length > 10
                        ? cell.goal_text.slice(0, 10) + '...'
                        : cell.goal_text}
                    </span>
                  ))}
                {cells.filter(c => c.is_completed && !c.is_free && c.goal_text).length > 5 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{cells.filter(c => c.is_completed && !c.is_free && c.goal_text).length - 5}件
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Primary actions */}
            <div className="flex gap-2">
              <button
                onClick={downloadImage}
                disabled={downloadLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {downloadLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <span>📥</span>
                )}
                画像を保存
              </button>
              <button
                onClick={copyImageToClipboard}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <span>📋</span>
                コピー
              </button>
            </div>

            {/* Share button */}
            <div className="flex justify-center">
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

          {/* Tips */}
          <div className="text-center text-xs text-gray-400">
            💡 画像を保存してSNSに投稿しよう！
          </div>
        </div>
      </div>
    </div>
  )
}
