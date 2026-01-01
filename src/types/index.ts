export * from './database'
export * from './battle'

export type BingoMode = 'edit' | 'play'

export type BingoSize = 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface BingoLine {
  type: 'row' | 'column' | 'diagonal'
  index: number
  cells: number[]
  isComplete: boolean
}

export interface BingoStats {
  totalCells: number
  completedCells: number
  completionRate: number
  bingoLines: number
  totalBingoLines: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition: string
}

export interface Theme {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  cellColor: string
  completedColor: string
}

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: '最初の1マスを達成',
    icon: '🎯',
    condition: 'complete_first_cell',
  },
  {
    id: 'first_bingo',
    name: 'First Bingo',
    description: '初めてビンゴを達成',
    icon: '🎰',
    condition: 'complete_first_bingo',
  },
  {
    id: 'triple_line',
    name: 'Triple Line',
    description: '3ライン同時達成',
    icon: '⭐',
    condition: 'complete_three_lines',
  },
  {
    id: 'blackout',
    name: 'Blackout',
    description: '全マス達成',
    icon: '🏆',
    condition: 'complete_all_cells',
  },
  {
    id: 'week_streak',
    name: 'Week Streak',
    description: '7日連続達成',
    icon: '🔥',
    condition: 'streak_7_days',
  },
  {
    id: 'month_streak',
    name: 'Month Streak',
    description: '30日連続達成',
    icon: '💪',
    condition: 'streak_30_days',
  },
  {
    id: 'customizer',
    name: 'Customizer',
    description: 'テーマをカスタマイズ',
    icon: '🎨',
    condition: 'customize_theme',
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: '5人にシェア',
    icon: '👥',
    condition: 'share_5_times',
  },
]

export const THEME_DEFINITIONS: Theme[] = [
  {
    id: 'default',
    name: 'デフォルト',
    primaryColor: '#3b82f6',
    secondaryColor: '#60a5fa',
    backgroundColor: '#f8fafc',
    cellColor: '#ffffff',
    completedColor: '#22c55e',
  },
  {
    id: 'dark',
    name: 'ダーク',
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    backgroundColor: '#0f172a',
    cellColor: '#1e293b',
    completedColor: '#10b981',
  },
  {
    id: 'sakura',
    name: 'さくら',
    primaryColor: '#ec4899',
    secondaryColor: '#f472b6',
    backgroundColor: '#fdf2f8',
    cellColor: '#ffffff',
    completedColor: '#f472b6',
  },
  {
    id: 'ocean',
    name: 'オーシャン',
    primaryColor: '#0ea5e9',
    secondaryColor: '#38bdf8',
    backgroundColor: '#f0f9ff',
    cellColor: '#ffffff',
    completedColor: '#14b8a6',
  },
  {
    id: 'forest',
    name: 'フォレスト',
    primaryColor: '#22c55e',
    secondaryColor: '#4ade80',
    backgroundColor: '#f0fdf4',
    cellColor: '#ffffff',
    completedColor: '#86efac',
  },
  {
    id: 'sunset',
    name: 'サンセット',
    primaryColor: '#f97316',
    secondaryColor: '#fb923c',
    backgroundColor: '#fff7ed',
    cellColor: '#ffffff',
    completedColor: '#fbbf24',
  },
]

export const POINTS = {
  CELL_COMPLETE: 100,
  BINGO_BONUS: 500,
  STREAK_MULTIPLIER_BASE: 1.1,
  STREAK_MULTIPLIER_MAX: 2.0,
} as const

export const CATEGORIES = [
  '健康',
  '学習',
  '仕事',
  '趣味',
  '人間関係',
  'お金',
  '自己成長',
  'その他',
] as const

export type Category = (typeof CATEGORIES)[number]
