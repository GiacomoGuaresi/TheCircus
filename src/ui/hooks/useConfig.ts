import { useState, useEffect, useCallback } from 'react'
import { api } from './useAPI'
import type { AppConfig } from '../../models/types'

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.config.get().then((c) => {
      setConfig(c as AppConfig)
      setLoading(false)
    })
  }, [])

  const save = useCallback(async (newConfig: AppConfig) => {
    setSaving(true)
    try {
      const saved = await api.config.save(newConfig) as AppConfig
      setConfig(saved)
      return saved
    } finally {
      setSaving(false)
    }
  }, [])

  const reset = useCallback(async () => {
    const defaultConfig = await api.config.reset() as AppConfig
    setConfig(defaultConfig)
    return defaultConfig
  }, [])

  return { config, loading, saving, save, reset }
}
