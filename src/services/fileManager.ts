import fs from 'fs-extra'
import path from 'path'
import { readJSON, writeJSON, listJSONFiles, fileExists } from '@utils/fileHelpers'
import { logger } from '@utils/logger'
import { CHARACTERS_DIR, DIARY_DIR, GENERATED_DIR, DIARY_INDEX_FILE } from '@models/constants'
import type { Character, DiaryEntry, DiaryIndex } from '@models/types'

export class FileManager {
  private charactersDir: string
  private diaryDir: string
  private generatedDir: string
  private diaryIndexPath: string

  constructor(private dataDir: string) {
    this.charactersDir = path.join(dataDir, CHARACTERS_DIR)
    this.diaryDir = path.join(dataDir, DIARY_DIR)
    this.generatedDir = path.join(dataDir, GENERATED_DIR)
    this.diaryIndexPath = path.join(this.diaryDir, DIARY_INDEX_FILE)
  }

  async ensureDirs(): Promise<void> {
    await fs.ensureDir(this.charactersDir)
    await fs.ensureDir(this.diaryDir)
    await fs.ensureDir(this.generatedDir)
    logger.debug('FileManager: directories ensured')
  }

  // Characters
  async loadAllCharacters(): Promise<Character[]> {
    const files = await listJSONFiles(this.charactersDir)
    const characters = await Promise.all(files.map((f) => readJSON<Character>(f)))
    logger.debug(`FileManager: loaded ${characters.length} characters`)
    return characters
  }

  async loadCharacter(id: string): Promise<Character | null> {
    const filePath = path.join(this.charactersDir, `${id}.json`)
    if (!(await fileExists(filePath))) return null
    return readJSON<Character>(filePath)
  }

  async saveCharacter(character: Character): Promise<void> {
    const filePath = path.join(this.charactersDir, `${character.id}.json`)
    await writeJSON(filePath, character)
    logger.debug(`FileManager: saved character ${character.id}`)
  }

  async deleteCharacter(id: string): Promise<void> {
    const filePath = path.join(this.charactersDir, `${id}.json`)
    await fs.remove(filePath)
  }

  // Diary
  async loadDiaryEntry(date: string): Promise<DiaryEntry | null> {
    const filePath = path.join(this.diaryDir, `${date}.json`)
    if (!(await fileExists(filePath))) return null
    return readJSON<DiaryEntry>(filePath)
  }

  async saveDiaryEntry(entry: DiaryEntry): Promise<void> {
    const filePath = path.join(this.diaryDir, `${entry.date}.json`)
    await writeJSON(filePath, entry)
    await this.updateDiaryIndex(entry)
    logger.debug(`FileManager: saved diary entry for ${entry.date}`)
  }

  async loadDiaryIndex(): Promise<DiaryIndex> {
    if (!(await fileExists(this.diaryIndexPath))) {
      return { entries: [], last_updated: new Date().toISOString() }
    }
    return readJSON<DiaryIndex>(this.diaryIndexPath)
  }

  private async updateDiaryIndex(entry: DiaryEntry): Promise<void> {
    const index = await this.loadDiaryIndex()
    const existing = index.entries.findIndex((e) => e.date === entry.date)
    const indexEntry = {
      id: entry.id,
      date: entry.date,
      title: entry.scenario.title,
      image_path: entry.image.path
    }
    if (existing >= 0) {
      index.entries[existing] = indexEntry
    } else {
      index.entries.push(indexEntry)
      index.entries.sort((a, b) => b.date.localeCompare(a.date))
    }
    index.last_updated = new Date().toISOString()
    await writeJSON(this.diaryIndexPath, index)
  }

  async loadRecentDiaryDates(days: number): Promise<string[]> {
    const index = await this.loadDiaryIndex()
    return index.entries.slice(0, days).map((e) => e.date)
  }

  // Generated images
  generatedPath(filename: string): string {
    return path.join(this.generatedDir, filename)
  }

  async saveGeneratedImage(buffer: Buffer, filename: string): Promise<string> {
    const filePath = this.generatedPath(filename)
    await fs.writeFile(filePath, buffer)
    return filePath
  }

  // Cleanup old generated images (keep last N)
  async pruneGeneratedImages(keepCount = 50): Promise<void> {
    const files = await fs.readdir(this.generatedDir)
    const images = files
      .filter((f) => /\.(png|jpg|webp)$/.test(f))
      .map((f) => ({ name: f, path: path.join(this.generatedDir, f) }))
      .sort((a, b) => b.name.localeCompare(a.name))

    const toDelete = images.slice(keepCount)
    await Promise.all(toDelete.map((f) => fs.remove(f.path)))
    if (toDelete.length > 0) logger.info(`FileManager: pruned ${toDelete.length} old images`)
  }
}
