'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const errorMessage = message
    ? decodeURIComponent(message)
    : 'ログイン処理中にエラーが発生しました。もう一度お試しください。'

  const isEmailConflict = errorMessage.includes('既に') || errorMessage.includes('別の方法')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="text-5xl mb-4">{isEmailConflict ? '🔐' : '😢'}</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">
          {isEmailConflict ? 'アカウントが見つかりました' : '認証エラー'}
        </h1>
        <p className="text-gray-600 mb-6">
          {errorMessage}
        </p>
        {isEmailConflict && (
          <p className="text-sm text-gray-500 mb-4">
            メールアドレスとパスワードでログインするか、登録時に使用した方法でログインしてください。
          </p>
        )}
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
