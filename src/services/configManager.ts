import fs from 'fs-extra'
import path from 'path'
import { readJSON, writeJSON, fileExists } from '@utils/fileHelpers'
import { logger } from '@utils/logger'
import { ConfigError } from '@utils/errorHandler'
import { AppConfigSchema } from '@models/schemas'
import type { AppConfig } from '@models/types'
import { CONFIG_FILE, CONFIG_DEFAULT_FILE } from '@models/constants'

export class ConfigManager {
  private config?: AppConfig
  private configPath: string
  private defaultPath: string

  constructor(private rootDir: string) {
    this.configPath = path.join(rootDir, CONFIG_FILE)
    this.defaultPath = path.join(rootDir, CONFIG_DEFAULT_FILE)
  }

  async load(): Promise<AppConfig> {
    const sourcePath = (await fileExists(this.configPath)) ? this.configPath : this.defaultPath

    if (!(await fileExists(sourcePath))) {
      throw new ConfigError(`No config file found at ${sourcePath}`)
    }

    const raw = await readJSON<unknown>(sourcePath)
    const result = AppConfigSchema.safeParse(raw)

    if (!result.success) {
      throw new ConfigError(`Invalid config: ${result.error.message}`)
    }

    this.config = result.data
    logger.info(`ConfigManager: loaded from ${sourcePath}`)
    return this.config
  }

  get(): AppConfig {
    if (!this.config) throw new ConfigError('Config not loaded — call load() first')
    return this.config
  }

  async save(config: AppConfig): Promise<void> {
    const result = AppConfigSchema.safeParse(config)
    if (!result.success) throw new ConfigError(`Invalid config: ${result.error.message}`)
    this.config = result.data
    await writeJSON(this.configPath, this.config)
    logger.info('ConfigManager: config saved')
  }

  async update(partial: Partial<AppConfig>): Promise<AppConfig> {
    const current = this.get()
    const merged = deepMerge(current, partial) as AppConfig
    await this.save(merged)
    return merged
  }

  async reset(): Promise<AppConfig> {
    if (await fileExists(this.configPath)) {
      await fs.remove(this.configPath)
    }
    return this.load()
  }
}

function deepMerge(target: unknown, source: unknown): unknown {
  if (typeof source !== 'object' || source === null) return source
  if (typeof target !== 'object' || target === null) return source
  const result = { ...(target as Record<string, unknown>) }
  for (const key of Object.keys(source as Record<string, unknown>)) {
    const src = (source as Record<string, unknown>)[key]
    const tgt = (target as Record<string, unknown>)[key]
    result[key] = deepMerge(tgt, src)
  }
  return result
}
