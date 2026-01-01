'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'login' | 'signup'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { signInWithEmail, signUpWithEmail, signInWithGitHub } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password)
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('メールアドレスまたはパスワードが正しくありません')
          } else if (error.message.includes('Email not confirmed')) {
            setError('メールアドレスの確認が完了していません。確認メールをご確認ください。')
          } else {
            setError(error.message)
          }
        } else {
          onClose()
        }
      } else {
        const { error } = await signUpWithEmail(email, password, displayName)
        if (error) {
          if (error.message.includes('already registered')) {
            setError('このメールアドレスは既に登録されています')
          } else {
            setError(error.message)
          }
        } else {
          setSuccessMessage('登録が完了しました！確認メールをお送りしましたので、メール内のリンクをクリックして認証を完了してください。')
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      const { error } = await signInWithGitHub()
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          setError('GitHubログインは現在利用できません。メールでログインしてください。')
        } else {
          setError(error.message)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
          <h2 className="text-xl font-bold">
            {mode === 'login' ? 'ログイン' : '新規登録'}
          </h2>
          <p className="text-sm text-white/80 mt-1">
            {mode === 'login'
              ? 'アカウントにログインして進捗を保存しましょう'
              : '新しいアカウントを作成して始めましょう'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGitHubSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <GitHubIcon />
              <span className="font-medium">GitHubで続ける</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示名
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400"
                  placeholder="お名前"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400"
                placeholder="6文字以上"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting
                ? '処理中...'
                : mode === 'login'
                  ? 'ログイン'
                  : '登録する'}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600">
            {mode === 'login' ? (
              <>
                アカウントをお持ちでない方は
                <button
                  onClick={() => {
                    setMode('signup')
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="text-indigo-600 font-medium hover:underline ml-1"
                >
                  新規登録
                </button>
              </>
            ) : (
              <>
                すでにアカウントをお持ちの方は
                <button
                  onClick={() => {
                    setMode('login')
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="text-indigo-600 font-medium hover:underline ml-1"
                >
                  ログイン
                </button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}
