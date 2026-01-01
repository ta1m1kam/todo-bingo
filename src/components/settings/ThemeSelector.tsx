'use client'

import { useTheme } from '@/contexts/ThemeContext'

export function ThemeSelector() {
  const { currentTheme, setTheme, themes } = useTheme()

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
        <span>🎨</span> テーマ選択
      </h3>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`relative p-2 rounded-lg transition-all ${
              currentTheme.id === theme.id
                ? 'ring-2 ring-offset-2 ring-indigo-500'
                : 'hover:scale-105'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                }}
              />
              <span className="text-xs text-gray-600">{theme.name}</span>
            </div>
            {currentTheme.id === theme.id && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>現在のテーマ:</span>
          <span
            className="px-2 py-1 rounded font-medium"
            style={{
              backgroundColor: currentTheme.backgroundColor,
              color: currentTheme.primaryColor,
            }}
          >
            {currentTheme.name}
          </span>
        </div>
      </div>
    </div>
  )
}
