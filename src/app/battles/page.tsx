'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HamburgerMenu } from '@/components/ui'
import { UserMenu } from '@/components/auth'
import { BattleList, CreateBattleModal, BattleProgress } from '@/components/battle'
import { useBattles } from '@/hooks'

type TabType = 'active' | 'pending' | 'completed'

export default function BattlesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('active')

  const {
    pendingBattles,
    activeBattles,
    completedBattles,
    isLoading,
    acceptBattle,
    rejectBattle,
  } = useBattles()

  const handleAccept = async (battleId: string) => {
    try {
      await acceptBattle(battleId)
    } catch (error) {
      console.error('Accept battle error:', error)
      alert('バトルの承認に失敗しました')
    }
  }

  const handleReject = async (battleId: string) => {
    if (!window.confirm('このバトル申請を拒否しますか？')) return
    try {
      await rejectBattle(battleId)
    } catch (error) {
      console.error('Reject battle error:', error)
      alert('バトルの拒否に失敗しました')
    }
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'active', label: '進行中', count: activeBattles.length },
    { key: 'pending', label: '申請中', count: pendingBattles.length },
    { key: 'completed', label: '完了', count: completedBattles.length },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-background)' }}>
      <CreateBattleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <header className="bg-white/95 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HamburgerMenu />
              <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                ⚔️ バトル
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                + 新規バトル
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {activeBattles.length > 0 && activeTab === 'active' && (
              <div className="space-y-4">
                {activeBattles.map((battle) => (
                  <BattleProgress key={battle.id} battle={battle} />
                ))}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab.key
                        ? ''
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={activeTab === tab.key ? { color: 'var(--theme-primary)' } : {}}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                        activeTab === tab.key
                          ? ''
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      style={activeTab === tab.key ? { backgroundColor: 'color-mix(in srgb, var(--theme-primary) 20%, white)', color: 'var(--theme-primary)' } : {}}>
                        {tab.count}
                      </span>
                    )}
                    {activeTab === tab.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--theme-primary)' }} />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === 'active' && (
                  <BattleList
                    battles={activeBattles}
                    emptyMessage="進行中のバトルがありません"
                  />
                )}
                {activeTab === 'pending' && (
                  <BattleList
                    battles={pendingBattles}
                    emptyMessage="申請中のバトルがありません"
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                )}
                {activeTab === 'completed' && (
                  <BattleList
                    battles={completedBattles}
                    emptyMessage="完了したバトルがありません"
                  />
                )}
              </div>
            </div>

            {pendingBattles.length === 0 && activeBattles.length === 0 && completedBattles.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">⚔️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">バトルを始めよう！</h3>
                <p className="text-gray-600 mb-6">
                  フレンドとポイントを競い合って、勝利ボーナスを獲得しよう
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 text-white rounded-xl hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    バトルを申請する
                  </button>
                  <Link
                    href="/friends"
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    フレンドを追加する
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
