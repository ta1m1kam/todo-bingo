'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HamburgerMenu } from '@/components/ui'
import { UserMenu } from '@/components/auth'
import { useFriends } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export default function FriendsPage() {
  const { user } = useAuth()
  const {
    pendingRequests,
    sentRequests,
    acceptedFriends,
    isLoading,
    acceptFriendRequest,
    rejectFriendRequest,
    sendFriendRequest,
    refetch,
  } = useFriends()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{
    id: string
    display_name: string | null
    level: number
    total_points: number
  }>>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return

    setIsSearching(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, level, total_points')
        .neq('id', user.id)
        .ilike('display_name', `%${searchQuery}%`)
        .limit(10)

      if (error) throw error

      const existingFriendIds = new Set([
        ...acceptedFriends.map(f => f.id),
        ...sentRequests.map(f => f.id),
        ...pendingRequests.map(f => f.id),
      ])

      const filteredResults = (data || []).filter((u: { id: string }) => !existingFriendIds.has(u.id))
      setSearchResults(filteredResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async (friendId: string) => {
    try {
      await sendFriendRequest(friendId)
      setSearchResults(prev => prev.filter(u => u.id !== friendId))
    } catch (error) {
      console.error('Send friend request error:', error)
      alert('フレンド申請に失敗しました')
    }
  }

  const handleAccept = async (friendshipId: string) => {
    try {
      await acceptFriendRequest(friendshipId)
    } catch (error) {
      console.error('Accept friend request error:', error)
      alert('承認に失敗しました')
    }
  }

  const handleReject = async (friendshipId: string) => {
    if (!window.confirm('このフレンド申請を拒否しますか？')) return
    try {
      await rejectFriendRequest(friendshipId)
    } catch (error) {
      console.error('Reject friend request error:', error)
      alert('拒否に失敗しました')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #e0f2fe)' }}>
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HamburgerMenu />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                👥 フレンド
              </h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md p-4">
              <h2 className="font-bold text-gray-800 mb-3">ユーザーを検索</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="表示名で検索..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isSearching ? '検索中...' : '検索'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 divide-y border rounded-lg">
                  {searchResults.map((result) => (
                    <div key={result.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                          {(result.display_name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{result.display_name || '名無し'}</p>
                          <p className="text-sm text-gray-500">Lv.{result.level} • {result.total_points.toLocaleString()}pt</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(result.id)}
                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        申請
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pendingRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-blue-50 p-4 border-b">
                  <h2 className="font-bold text-gray-800">
                    フレンド申請 ({pendingRequests.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {pendingRequests.map((friend) => (
                    <div key={friend.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {friend.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{friend.displayName}</p>
                          <p className="text-sm text-gray-500">Lv.{friend.level} • {friend.totalPoints.toLocaleString()}pt</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(friend.friendshipId)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          拒否
                        </button>
                        <button
                          onClick={() => handleAccept(friend.friendshipId)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          承認
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h2 className="font-bold text-gray-800">
                  フレンド ({acceptedFriends.length})
                </h2>
              </div>
              {acceptedFriends.length > 0 ? (
                <div className="divide-y">
                  {acceptedFriends.map((friend) => (
                    <div key={friend.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold">
                          {friend.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{friend.displayName}</p>
                          <p className="text-sm text-gray-500">Lv.{friend.level} • {friend.totalPoints.toLocaleString()}pt</p>
                        </div>
                      </div>
                      <Link
                        href="/battles"
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        バトル
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-5xl mb-4">👥</div>
                  <p>まだフレンドがいません</p>
                  <p className="text-sm mt-2">上の検索からユーザーを探してフレンド申請しよう！</p>
                </div>
              )}
            </div>

            {sentRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h2 className="font-bold text-gray-800">
                    送信済み ({sentRequests.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {sentRequests.map((friend) => (
                    <div key={friend.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                          {friend.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">{friend.displayName}</p>
                          <p className="text-sm text-gray-400">承認待ち...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
