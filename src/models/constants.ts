import type { ScenarioTheme } from './types'

export const SCENARIO_THEMES: ScenarioTheme[] = [
  'adventure', 'mystery', 'romance', 'comedy', 'horror', 'slice_of_life'
]

export const DEFAULT_THEME_WEIGHTS: Record<ScenarioTheme, number> = {
  adventure: 25,
  mystery: 20,
  comedy: 20,
  slice_of_life: 15,
  romance: 10,
  horror: 10
}

export const THEME_STYLE_TAGS: Record<ScenarioTheme, string[]> = {
  adventure: ['dynamic', 'epic', 'vibrant', 'action-packed', 'dramatic lighting'],
  mystery: ['moody', 'shadowy', 'intricate', 'atmospheric', 'cool tones'],
  romance: ['soft', 'romantic', 'ethereal', 'warm tones', 'dreamy'],
  comedy: ['playful', 'colorful', 'expressive', 'exaggerated', 'bright'],
  horror: ['dark', 'unsettling', 'intense', 'eerie', 'high contrast'],
  slice_of_life: ['cozy', 'warm', 'peaceful', 'detailed', 'naturalistic']
}

export const DIARY_RETENTION_DAYS = 30
export const CHARACTER_CACHE_TTL_MS = 5 * 60 * 1000
export const MAX_DIARY_CONTEXT_DAYS = 7
export const DEFAULT_DATA_DIR = 'data'
export const CHARACTERS_DIR = 'characters'
export const DIARY_DIR = 'diary'
export const GENERATED_DIR = 'generated'
export const DIARY_INDEX_FILE = '_index.json'
export const CONFIG_FILE = 'config/config.json'
export const CONFIG_DEFAULT_FILE = 'config/config.default.json'
export const LOGS_DIR = 'logs'
