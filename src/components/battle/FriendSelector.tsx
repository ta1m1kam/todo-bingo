'use client'

import { useFriends } from '@/hooks'

interface FriendSelectorProps {
  selectedId: string | null
  onChange: (id: string | null) => void
}

export function FriendSelector({ selectedId, onChange }: FriendSelectorProps) {
  const { acceptedFriends, isLoading } = useFriends()

  if (isLoading) {
    return (
      <div className="py-4 text-center text-gray-500">
        読み込み中...
      </div>
    )
  }

  if (acceptedFriends.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        フレンドがいません。まずはフレンドを追加してください。
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {acceptedFriends.map((friend) => (
        <button
          key={friend.id}
          type="button"
          onClick={() => onChange(selectedId === friend.id ? null : friend.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
            selectedId === friend.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold">
            {friend.displayName.charAt(0)}
          </div>
          <div className="text-left flex-1">
            <p className="font-medium text-gray-800">{friend.displayName}</p>
            <p className="text-sm text-gray-500">Lv.{friend.level} • {friend.totalPoints.toLocaleString()}pt</p>
          </div>
          {selectedId === friend.id && (
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}
