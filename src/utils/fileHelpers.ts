import fs from 'fs-extra'
import path from 'path'

export async function readJSON<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(content) as T
}

export async function writeJSON(filePath: string, data: unknown): Promise<void> {
  await fs.ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export async function listJSONFiles(dir: string): Promise<string[]> {
  await fs.ensureDir(dir)
  const files = await fs.readdir(dir)
  return files.filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => path.join(dir, f))
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export function timestampFilename(ext = 'png'): string {
  return new Date().toISOString().replace(/[:.]/g, '-') + `.${ext}`
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function daysAgoString(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}
