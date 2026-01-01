import type { BingoCell, BingoLine, BingoStats, BingoSize } from '@/types'

export function createEmptyCells(size: BingoSize, hasFreeCenter: boolean = false): Omit<BingoCell, 'id' | 'card_id' | 'created_at' | 'updated_at'>[] {
  const totalCells = size * size
  const centerPosition = Math.floor(totalCells / 2)

  return Array.from({ length: totalCells }, (_, i) => ({
    position: i,
    goal_text: '',
    is_completed: hasFreeCenter && size % 2 === 1 && i === centerPosition,
    is_free: hasFreeCenter && size % 2 === 1 && i === centerPosition,
    completed_at: null,
    category: null,
    difficulty: 1,
    points_earned: 0,
  }))
}

export function getRowCells(size: BingoSize, row: number): number[] {
  return Array.from({ length: size }, (_, col) => row * size + col)
}

export function getColumnCells(size: BingoSize, col: number): number[] {
  return Array.from({ length: size }, (_, row) => row * size + col)
}

export function getDiagonalCells(size: BingoSize): { main: number[]; anti: number[] } {
  const main = Array.from({ length: size }, (_, i) => i * size + i)
  const anti = Array.from({ length: size }, (_, i) => i * size + (size - 1 - i))
  return { main, anti }
}

export function checkBingoLines(cells: Pick<BingoCell, 'position' | 'is_completed'>[], size: BingoSize): BingoLine[] {
  const lines: BingoLine[] = []
  const cellMap = new Map(cells.map(c => [c.position, c.is_completed]))

  // Check rows
  for (let row = 0; row < size; row++) {
    const rowCells = getRowCells(size, row)
    const isComplete = rowCells.every(pos => cellMap.get(pos))
    lines.push({
      type: 'row',
      index: row,
      cells: rowCells,
      isComplete,
    })
  }

  // Check columns
  for (let col = 0; col < size; col++) {
    const colCells = getColumnCells(size, col)
    const isComplete = colCells.every(pos => cellMap.get(pos))
    lines.push({
      type: 'column',
      index: col,
      cells: colCells,
      isComplete,
    })
  }

  // Check diagonals
  const { main, anti } = getDiagonalCells(size)

  lines.push({
    type: 'diagonal',
    index: 0,
    cells: main,
    isComplete: main.every(pos => cellMap.get(pos)),
  })

  lines.push({
    type: 'diagonal',
    index: 1,
    cells: anti,
    isComplete: anti.every(pos => cellMap.get(pos)),
  })

  return lines
}

export function calculateBingoStats(cells: Pick<BingoCell, 'position' | 'is_completed'>[], size: BingoSize): BingoStats {
  const totalCells = size * size
  const completedCells = cells.filter(c => c.is_completed).length
  const lines = checkBingoLines(cells, size)
  const bingoLines = lines.filter(l => l.isComplete).length
  const totalBingoLines = size * 2 + 2 // rows + columns + 2 diagonals

  return {
    totalCells,
    completedCells,
    completionRate: Math.round((completedCells / totalCells) * 100),
    bingoLines,
    totalBingoLines,
  }
}

export function getCellsToNextBingo(cells: Pick<BingoCell, 'position' | 'is_completed'>[], size: BingoSize): number {
  const lines = checkBingoLines(cells, size)
  const incompleteLines = lines.filter(l => !l.isComplete)

  if (incompleteLines.length === 0) return 0

  const cellMap = new Map(cells.map(c => [c.position, c.is_completed]))

  let minRemaining: number = size
  for (const line of incompleteLines) {
    const remaining = line.cells.filter(pos => !cellMap.get(pos)).length
    if (remaining < minRemaining) {
      minRemaining = remaining
    }
  }

  return minRemaining
}

export function getCompletedLinePositions(cells: Pick<BingoCell, 'position' | 'is_completed'>[], size: BingoSize): Set<number> {
  const lines = checkBingoLines(cells, size)
  const completedPositions = new Set<number>()

  for (const line of lines) {
    if (line.isComplete) {
      line.cells.forEach(pos => completedPositions.add(pos))
    }
  }

  return completedPositions
}

export function positionToCoords(position: number, size: BingoSize): { row: number; col: number } {
  return {
    row: Math.floor(position / size),
    col: position % size,
  }
}

export function coordsToPosition(row: number, col: number, size: BingoSize): number {
  return row * size + col
}
