'use client'

import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="text-5xl mb-4">😢</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">
          認証エラー
        </h1>
        <p className="text-gray-600 mb-6">
          ログイン処理中にエラーが発生しました。もう一度お試しください。
        </p>
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
