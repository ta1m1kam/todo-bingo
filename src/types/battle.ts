import type { Battle, BattlePoints, Profile } from './database'

export type BattleStatus = Battle['status']
export type BattleType = Battle['battle_type']

export interface BattleWithProfiles extends Battle {
  creator: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'level' | 'total_points'>
  opponent: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'level' | 'total_points'>
}

export interface BattleScore {
  userId: string
  userName: string
  avatarUrl: string | null
  totalPoints: number
  dailyPoints: BattlePoints[]
  rank?: number
}

export interface BattleStats {
  battleId: string
  creatorScore: BattleScore
  opponentScore: BattleScore
  daysRemaining: number
  daysElapsed: number
  totalDays: number
  progressPercent: number
  isActive: boolean
  winner: 'creator' | 'opponent' | 'draw' | null
}

export interface CreateBattleInput {
  opponentId: string
  durationDays: number
  bonusPoints?: number
}

export interface BattleListFilter {
  status?: BattleStatus | BattleStatus[]
  includeCompleted?: boolean
  limit?: number
}

export interface Friend {
  id: string
  friendshipId: string
  displayName: string
  level: number
  totalPoints: number
  avatarUrl: string | null
  status: 'pending' | 'accepted' | 'rejected'
  isRequester: boolean
}

export const BATTLE_DURATIONS = [
  { label: '3日間', days: 3 },
  { label: '1週間', days: 7 },
  { label: '2週間', days: 14 },
  { label: '1ヶ月', days: 30 },
] as const

export const BATTLE_BONUS_POINTS = 1000
