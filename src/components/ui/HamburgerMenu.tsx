'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/', label: 'ホーム', icon: '🏠', description: 'ビンゴカード' },
  { href: '/goals', label: '目標入力', icon: '📝', description: 'リスト形式で入力' },
  { href: '/battles', label: 'バトル', icon: '⚔️', description: 'フレンドと対戦' },
  { href: '/friends', label: 'フレンド', icon: '👥', description: 'フレンド管理' },
  { href: '/analytics', label: '統計・分析', icon: '📊', description: '達成状況を確認' },
  { href: '/settings', label: '設定', icon: '⚙️', description: 'テーマなど' },
]

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="メニューを開く"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span
            className={`block h-0.5 w-6 bg-gray-600 transform transition-all duration-300 ${
              isOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-gray-600 transform transition-all duration-300 ${
              isOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="py-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-800'}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
