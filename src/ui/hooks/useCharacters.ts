import { useState, useEffect, useCallback } from 'react'
import { api } from './useAPI'
import type { Character } from '../../models/types'

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const chars = await api.characters.list() as Character[]
      setCharacters(chars)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  const saveCharacter = useCallback(async (char: Character) => {
    await api.characters.save(char)
    await reload()
  }, [reload])

  const deleteCharacter = useCallback(async (id: string) => {
    await api.characters.delete(id)
    await reload()
  }, [reload])

  return { characters, loading, error, reload, saveCharacter, deleteCharacter }
}
