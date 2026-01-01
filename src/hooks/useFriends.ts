'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { Friend } from '@/types'

interface UseFriendsReturn {
  friends: Friend[]
  pendingRequests: Friend[]
  sentRequests: Friend[]
  acceptedFriends: Friend[]
  isLoading: boolean
  error: Error | null
  sendFriendRequest: (friendId: string) => Promise<void>
  acceptFriendRequest: (friendshipId: string) => Promise<void>
  rejectFriendRequest: (friendshipId: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useFriends(): UseFriendsReturn {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFriends = useCallback(async () => {
    if (!user) {
      setFriends([])
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data: sentData, error: sentError } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          friend:profiles!friendships_friend_id_fkey(id, display_name, level, total_points, avatar_url)
        `)
        .eq('user_id', user.id)

      const { data: receivedData, error: receivedError } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          user:profiles!friendships_user_id_fkey(id, display_name, level, total_points, avatar_url)
        `)
        .eq('friend_id', user.id)

      if (sentError) throw sentError
      if (receivedError) throw receivedError

      interface SentFriendship {
        id: string
        status: 'pending' | 'accepted' | 'rejected'
        friend: {
          id: string
          display_name: string | null
          level: number
          total_points: number
          avatar_url: string | null
        }
      }

      interface ReceivedFriendship {
        id: string
        status: 'pending' | 'accepted' | 'rejected'
        user: {
          id: string
          display_name: string | null
          level: number
          total_points: number
          avatar_url: string | null
        }
      }

      const allFriends: Friend[] = [
        ...((sentData as SentFriendship[]) || []).map((f) => ({
          id: f.friend.id,
          friendshipId: f.id,
          displayName: f.friend.display_name || '名無し',
          level: f.friend.level || 1,
          totalPoints: f.friend.total_points || 0,
          avatarUrl: f.friend.avatar_url,
          status: f.status,
          isRequester: true,
        })),
        ...((receivedData as ReceivedFriendship[]) || []).map((f) => ({
          id: f.user.id,
          friendshipId: f.id,
          displayName: f.user.display_name || '名無し',
          level: f.user.level || 1,
          totalPoints: f.user.total_points || 0,
          avatarUrl: f.user.avatar_url,
          status: f.status,
          isRequester: false,
        })),
      ]

      setFriends(allFriends)
    } catch (err) {
      setError(err as Error)
      console.error('Fetch friends error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchFriends()
  }, [fetchFriends])

  const sendFriendRequest = useCallback(async (friendId: string) => {
    if (!user) throw new Error('User not authenticated')

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
      })

    if (insertError) throw insertError

    await fetchFriends()
  }, [user, fetchFriends])

  const acceptFriendRequest = useCallback(async (friendshipId: string) => {
    if (!user) throw new Error('User not authenticated')

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .eq('friend_id', user.id)

    if (updateError) throw updateError

    await fetchFriends()
  }, [user, fetchFriends])

  const rejectFriendRequest = useCallback(async (friendshipId: string) => {
    if (!user) throw new Error('User not authenticated')

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('friendships')
      .update({ status: 'rejected' })
      .eq('id', friendshipId)
      .eq('friend_id', user.id)

    if (updateError) throw updateError

    await fetchFriends()
  }, [user, fetchFriends])

  const pendingRequests = friends.filter(f => f.status === 'pending' && !f.isRequester)
  const sentRequests = friends.filter(f => f.status === 'pending' && f.isRequester)
  const acceptedFriends = friends.filter(f => f.status === 'accepted')

  return {
    friends,
    pendingRequests,
    sentRequests,
    acceptedFriends,
    isLoading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    refetch: fetchFriends,
  }
}
