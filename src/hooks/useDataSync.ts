'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { syncLocalDataToSupabase, loadDataFromSupabase } from '@/lib/services/dataSync'

export function useDataSync() {
  const { user } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)
  const [hasSynced, setHasSynced] = useState(false)

  const syncToCloud = useCallback(async () => {
    if (!user || isSyncing) return

    setIsSyncing(true)
    try {
      const result = await syncLocalDataToSupabase(user.id)
      if (result.success) {
        setHasSynced(true)
      }
    } finally {
      setIsSyncing(false)
    }
  }, [user, isSyncing])

  const loadFromCloud = useCallback(async () => {
    if (!user) return null

    setIsSyncing(true)
    try {
      const data = await loadDataFromSupabase(user.id)
      return data
    } finally {
      setIsSyncing(false)
    }
  }, [user])

  useEffect(() => {
    if (user && !hasSynced) {
      syncToCloud()
    }
  }, [user, hasSynced, syncToCloud])

  return {
    isSyncing,
    hasSynced,
    syncToCloud,
    loadFromCloud,
    isAuthenticated: !!user,
  }
}
