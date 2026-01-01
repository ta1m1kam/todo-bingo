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
    id: 'natural',
    name: 'ナチュラル',
    primaryColor: '#8B7355',
    secondaryColor: '#A68968',
    backgroundColor: '#FAF8F5',
    cellColor: '#FFFFFF',
    completedColor: '#7A9B76',
  },
  {
    id: 'forest',
    name: 'フォレスト',
    primaryColor: '#7A9B76',
    secondaryColor: '#96AF92',
    backgroundColor: '#F5F8F4',
    cellColor: '#FFFFFF',
    completedColor: '#C4A57B',
  },
  {
    id: 'sunset',
    name: 'サンセット',
    primaryColor: '#C47957',
    secondaryColor: '#D49B7D',
    backgroundColor: '#FDF8F3',
    cellColor: '#FFFFFF',
    completedColor: '#8B9D83',
  },
  {
    id: 'sky',
    name: 'スカイ',
    primaryColor: '#6B8FAD',
    secondaryColor: '#8BA7BF',
    backgroundColor: '#F5F8FA',
    cellColor: '#FFFFFF',
    completedColor: '#88A08B',
  },
  {
    id: 'sakura',
    name: 'さくら',
    primaryColor: '#C9A6A6',
    secondaryColor: '#D9BFBF',
    backgroundColor: '#FBF8F8',
    cellColor: '#FFFFFF',
    completedColor: '#88A08B',
  },
  {
    id: 'night',
    name: 'ナイト',
    primaryColor: '#8B9DC3',
    secondaryColor: '#A3B1D1',
    backgroundColor: '#2A2A35',
    cellColor: '#3A3A45',
    completedColor: '#7B9B8D',
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
