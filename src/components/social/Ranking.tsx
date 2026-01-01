'use client'

import { useMemo } from 'react'
import { formatPoints, getLevelTitle } from '@/lib/utils/points'

interface RankingUser {
  id: string
  name: string
  avatar?: string
  points: number
  level: number
  bingoCount: number
  isCurrentUser?: boolean
}

interface RankingProps {
  currentUserPoints: number
  currentUserLevel: number
  currentUserBingos: number
}

// Sample ranking data (in real app, this would come from Supabase)
const SAMPLE_USERS: Omit<RankingUser, 'isCurrentUser'>[] = [
  { id: '1', name: 'ゴール達人', points: 15000, level: 12, bingoCount: 24 },
  { id: '2', name: '目標マスター', points: 12500, level: 11, bingoCount: 20 },
  { id: '3', name: 'ビンゴキング', points: 10000, level: 10, bingoCount: 18 },
  { id: '4', name: '挑戦者A', points: 8500, level: 9, bingoCount: 15 },
  { id: '5', name: 'チャレンジャー', points: 7000, level: 8, bingoCount: 12 },
  { id: '6', name: '努力家さん', points: 5500, level: 7, bingoCount: 10 },
  { id: '7', name: 'がんばり屋', points: 4000, level: 6, bingoCount: 8 },
  { id: '8', name: 'ルーキー', points: 2500, level: 5, bingoCount: 5 },
  { id: '9', name: '新人さん', points: 1500, level: 4, bingoCount: 3 },
  { id: '10', name: 'ビギナー', points: 500, level: 2, bingoCount: 1 },
]

export function Ranking({ currentUserPoints, currentUserLevel, currentUserBingos }: RankingProps) {
  const rankedUsers = useMemo((): RankingUser[] => {
    const currentUser: RankingUser = {
      id: 'current',
      name: 'あなた',
      points: currentUserPoints,
      level: currentUserLevel,
      bingoCount: currentUserBingos,
      isCurrentUser: true,
    }

    const allUsers: RankingUser[] = [...SAMPLE_USERS.map(u => ({ ...u, isCurrentUser: false })), currentUser]
    return allUsers.sort((a, b) => b.points - a.points)
  }, [currentUserPoints, currentUserLevel, currentUserBingos])

  const currentUserRank = useMemo(() => {
    return rankedUsers.findIndex(u => u.isCurrentUser) + 1
  }, [rankedUsers])

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🏆</span> ランキング
        </h3>
        <p className="text-sm text-white/80 mt-1">
          あなたの順位: {currentUserRank}位
        </p>
      </div>

      <div className="divide-y">
        {rankedUsers.slice(0, 10).map((user, index) => (
          <RankingRow
            key={user.id}
            rank={index + 1}
            user={user}
          />
        ))}
      </div>

      {currentUserRank > 10 && (
        <div className="p-2 bg-gray-50">
          <div className="text-center text-gray-400 text-sm py-2">...</div>
          <RankingRow
            rank={currentUserRank}
            user={rankedUsers[currentUserRank - 1]}
          />
        </div>
      )}
    </div>
  )
}

interface RankingRowProps {
  rank: number
  user: RankingUser
}

function RankingRow({ rank, user }: RankingRowProps) {
  const getRankBadge = () => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🥇</span>
      case 2:
        return <span className="text-2xl">🥈</span>
      case 3:
        return <span className="text-2xl">🥉</span>
      default:
        return (
          <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
            {rank}
          </span>
        )
    }
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 ${
        user.isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'
      } transition-colors`}
    >
      <div className="w-10 flex justify-center">{getRankBadge()}</div>

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
        {user.avatar || user.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium truncate ${user.isCurrentUser ? 'text-blue-600' : 'text-gray-800'}`}>
            {user.name}
          </span>
          {user.isCurrentUser && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              YOU
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Lv.{user.level} {getLevelTitle(user.level)}
        </div>
      </div>

      <div className="text-right">
        <div className="font-bold text-gray-800">{formatPoints(user.points)}</div>
        <div className="text-xs text-gray-500">{user.bingoCount}ビンゴ</div>
      </div>
    </div>
  )
}

interface WeeklyRankingProps {
  currentUserPoints: number
}

export function WeeklyRanking({ currentUserPoints }: WeeklyRankingProps) {
  const weeklyUsers = useMemo(() => {
    // Simulate weekly points (random subset of total)
    return SAMPLE_USERS.map(u => ({
      ...u,
      points: Math.floor(u.points * (0.1 + Math.random() * 0.3)),
    })).sort((a, b) => b.points - a.points)
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-green-400 to-teal-500 p-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📅</span> 今週のランキング
        </h3>
      </div>

      <div className="divide-y">
        {weeklyUsers.slice(0, 5).map((user, index) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 text-center font-bold text-gray-500">
              {index + 1}
            </div>
            <div className="flex-1 font-medium text-gray-800 truncate">
              {user.name}
            </div>
            <div className="font-bold text-green-600">
              +{formatPoints(user.points)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
