import { v4 as uuidv4 } from 'uuid'
import { logger } from '@utils/logger'
import { MAX_DIARY_CONTEXT_DAYS } from '@models/constants'
import type { DiaryEntry, DiaryIndex } from '@models/types'
import type { FileManager } from './fileManager'
import { daysAgoString, todayString } from '@utils/fileHelpers'

export class DiaryManager {
  constructor(private fileManager: FileManager) {}

  async getRecentEntries(days = MAX_DIARY_CONTEXT_DAYS): Promise<DiaryEntry[]> {
    const dates = await this.fileManager.loadRecentDiaryDates(days)
    const entries = await Promise.all(dates.map((d) => this.fileManager.loadDiaryEntry(d)))
    return entries.filter((e): e is DiaryEntry => e !== null)
  }

  async getTodayEntry(): Promise<DiaryEntry | null> {
    return this.fileManager.loadDiaryEntry(todayString())
  }

  async getCharacterAppearances(characterId: string, days = 30): Promise<DiaryEntry[]> {
    const entries = await this.getRecentEntries(days)
    return entries.filter((e) => e.characters_involved.some((ci) => ci.id === characterId))
  }

  async searchEntries(query: string): Promise<DiaryEntry[]> {
    const index = await this.fileManager.loadDiaryIndex()
    const q = query.toLowerCase()

    const matching = index.entries
      .filter((e) => e.title.toLowerCase().includes(q))
      .slice(0, 20)

    const entries = await Promise.all(
      matching.map((e) => this.fileManager.loadDiaryEntry(e.date))
    )
    return entries.filter((e): e is DiaryEntry => e !== null)
  }

  async writeEntry(entry: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry> {
    const full: DiaryEntry = { ...entry, id: uuidv4() }
    await this.fileManager.saveDiaryEntry(full)
    logger.info(`DiaryManager: wrote entry for ${full.date} — "${full.scenario.title}"`)
    return full
  }

  async getIndex(): Promise<DiaryIndex> {
    return this.fileManager.loadDiaryIndex()
  }

  buildCharacterInfo(
    char: { id: string; name: string },
    role: string,
    moodBefore: string,
    moodAfter: string,
    energyBefore: number,
    energyAfter: number
  ): DiaryEntry['characters_involved'][number] {
    return {
      id: char.id,
      name: char.name,
      role,
      mood_before: moodBefore,
      mood_after: moodAfter,
      energy_before: energyBefore,
      energy_after: energyAfter
    }
  }
}
