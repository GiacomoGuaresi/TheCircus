import { logger } from '@utils/logger'
import { CharacterLoadError } from '@utils/errorHandler'
import { CharacterSchema } from '@models/schemas'
import { CHARACTER_CACHE_TTL_MS } from '@models/constants'
import type { Character, DiaryEntry, ValidationResult } from '@models/types'
import type { FileManager } from './fileManager'

export class CharacterAnalyzer {
  private cache: Map<string, Character> = new Map()
  private cacheTimestamp: Map<string, number> = new Map()

  constructor(private fileManager: FileManager) {}

  async loadAllCharacters(): Promise<Character[]> {
    const characters = await this.fileManager.loadAllCharacters()
    const valid: Character[] = []

    for (const raw of characters) {
      const result = this.validateCharacter(raw)
      if (result.valid) {
        this.setCache(raw.id, raw)
        valid.push(raw)
      } else {
        logger.warn(`CharacterAnalyzer: invalid character ${raw.id}`, result.errors)
      }
    }

    return valid
  }

  async getCharacterById(id: string): Promise<Character> {
    const cached = this.getCache(id)
    if (cached) return cached

    const char = await this.fileManager.loadCharacter(id)
    if (!char) throw new CharacterLoadError(id, 'File not found')

    this.setCache(id, char)
    return char
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<void> {
    const char = await this.getCharacterById(id)
    const updated: Character = {
      ...char,
      ...updates,
      metadata: {
        ...char.metadata,
        last_updated: new Date().toISOString()
      }
    }
    await this.fileManager.saveCharacter(updated)
    this.setCache(id, updated)
    logger.debug(`CharacterAnalyzer: updated character ${id}`)
  }

  async selectCharactersForScenario(
    minCount: number,
    maxCount: number,
    randomnessFactor: number,
    recentEntries: DiaryEntry[]
  ): Promise<Character[]> {
    const all = await this.loadAllCharacters()
    if (all.length === 0) throw new Error('No characters available')

    const count = Math.min(
      all.length,
      Math.max(minCount, Math.round(minCount + Math.random() * (maxCount - minCount)))
    )

    const scored = all.map((char) => ({
      char,
      score: this.calculateInterestScore(char, recentEntries, randomnessFactor)
    }))

    scored.sort((a, b) => b.score - a.score)

    const selected = scored.slice(0, count).map((s) => s.char)
    logger.debug(`CharacterAnalyzer: selected ${selected.map((c) => c.name).join(', ')}`)
    return selected
  }

  private calculateInterestScore(
    char: Character,
    recentEntries: DiaryEntry[],
    randomnessFactor: number
  ): number {
    let score = 50

    // Favor characters not seen recently
    const lastAppearance = recentEntries.findIndex((e) =>
      e.characters_involved.some((ci) => ci.id === char.id)
    )
    if (lastAppearance === -1) {
      score += 30 // never appeared recently
    } else {
      score -= lastAppearance * 5 // appeared N entries ago
    }

    // Energy affects likelihood (low energy chars appear less)
    score += (char.current_state.energy_level - 50) * 0.2

    // Randomness injection
    score += (Math.random() - 0.5) * 100 * randomnessFactor

    return score
  }

  validateCharacter(char: unknown): ValidationResult {
    const result = CharacterSchema.safeParse(char)
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
    }
  }

  getCharacterContext(char: Character): string {
    return [
      `Name: ${char.name}`,
      `Appearance: ${char.appearance.description}`,
      `Traits: ${char.personality.traits.join(', ')}`,
      `Current mood: ${char.current_state.mood}`,
      `Energy: ${char.current_state.energy_level}/100`,
      `Current objective: ${char.current_state.current_objective}`,
      char.history.backstory ? `Backstory: ${char.history.backstory}` : ''
    ]
      .filter(Boolean)
      .join('\n')
  }

  private setCache(id: string, char: Character): void {
    this.cache.set(id, char)
    this.cacheTimestamp.set(id, Date.now())
  }

  private getCache(id: string): Character | undefined {
    const ts = this.cacheTimestamp.get(id)
    if (!ts || Date.now() - ts > CHARACTER_CACHE_TTL_MS) {
      this.cache.delete(id)
      this.cacheTimestamp.delete(id)
      return undefined
    }
    return this.cache.get(id)
  }

  invalidateCache(id?: string): void {
    if (id) {
      this.cache.delete(id)
      this.cacheTimestamp.delete(id)
    } else {
      this.cache.clear()
      this.cacheTimestamp.clear()
    }
  }
}
