import { useState, useEffect, useCallback } from 'react'
import { api } from './useAPI'
import type { GenerationResult } from '../../models/types'

export function useGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null)
  const [schedulerRunning, setSchedulerRunning] = useState(false)
  const [nextGeneration, setNextGeneration] = useState<Date | null>(null)

  useEffect(() => {
    api.scheduler.status().then((s) => {
      setSchedulerRunning(s.running)
      setNextGeneration(s.next ? new Date(s.next) : null)
    })

    const offStart = api.scheduler.onTickStart(() => setIsGenerating(true))
    const offComplete = api.scheduler.onTickComplete((log: unknown) => {
      setIsGenerating(false)
      const l = log as { success: boolean }
      if (l.success) {
        api.scheduler.status().then((s) => setNextGeneration(s.next ? new Date(s.next) : null))
      }
    })
    const offError = api.scheduler.onTickError(() => setIsGenerating(false))

    return () => { offStart(); offComplete(); offError() }
  }, [])

  const generate = useCallback(async () => {
    setIsGenerating(true)
    try {
      const result = await api.generate() as GenerationResult
      setLastResult(result)
      return result
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const toggleScheduler = useCallback(async () => {
    if (schedulerRunning) {
      await api.scheduler.stop()
      setSchedulerRunning(false)
    } else {
      await api.scheduler.start()
      setSchedulerRunning(true)
    }
  }, [schedulerRunning])

  return { isGenerating, lastResult, schedulerRunning, nextGeneration, generate, toggleScheduler }
}
