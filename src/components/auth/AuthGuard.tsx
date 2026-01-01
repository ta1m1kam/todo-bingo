'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(true)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // Set a timeout for loading state
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true)
      }, 5000) // 5 seconds timeout
      return () => clearTimeout(timer)
    } else {
      setLoadingTimeout(false)
    }
  }, [isLoading])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (e) {
      console.error('Logout error:', e)
    }
    // Force reload regardless of result
    window.location.href = '/'
  }

  const handleForceLogout = () => {
    // Clear all cookies and localStorage, then reload
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
    localStorage.clear()
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header during loading - always show logout */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Todo Bingo 2025
                </h1>
                <p className="text-gray-500 text-sm">今年の目標をビンゴで達成しよう</p>
              </div>
              <button
                onClick={handleForceLogout}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                ログアウト
              </button>
            </div>
          </div>
        </header>

        {/* Loading content */}
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500 mb-4">読み込み中...</p>

            {loadingTimeout && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 max-w-sm mx-auto">
                <p className="text-yellow-800 text-sm mb-3">
                  読み込みに時間がかかっています
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    再読み込み
                  </button>
                  <button
                    onClick={handleForceLogout}
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                  >
                    強制ログアウト
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Welcome Screen */}
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Todo Bingo 2025
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              今年の目標をビンゴで達成しよう
            </p>
            <p className="text-gray-500">
              ログインして進捗を保存・共有しましょう
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
              <span className="text-3xl mb-2 block">🎯</span>
              <h3 className="font-medium text-gray-800">目標管理</h3>
              <p className="text-sm text-gray-500">ビンゴ形式で楽しく</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
              <span className="text-3xl mb-2 block">🏆</span>
              <h3 className="font-medium text-gray-800">バッジ収集</h3>
              <p className="text-sm text-gray-500">実績をアンロック</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
              <span className="text-3xl mb-2 block">📊</span>
              <h3 className="font-medium text-gray-800">進捗分析</h3>
              <p className="text-sm text-gray-500">達成状況を可視化</p>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            ログインして始める
          </button>

          {/* Demo Info */}
          <p className="mt-6 text-sm text-gray-400">
            初めての方は新規登録からどうぞ
          </p>
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    )
  }

  return <>{children}</>
}
