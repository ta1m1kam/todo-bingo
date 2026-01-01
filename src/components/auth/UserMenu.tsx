'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface UserMenuProps {
  onLoginClick: () => void
}

export function UserMenu({ onLoginClick }: UserMenuProps) {
  const { user, profile, isLoading, signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
      >
        ログイン
      </button>
    )
  }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {displayName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>レベル</span>
                  <span className="font-medium">Lv.{profile?.level || 1}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>ポイント</span>
                  <span className="font-medium">{profile?.total_points?.toLocaleString() || 0}</span>
                </div>
              </div>
              <hr className="my-1" />
              <button
                onClick={async () => {
                  await signOut()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
