// ─── Character ───────────────────────────────────────────────────────────────

export interface CharacterAppearance {
  description: string
  clothing: string
  distinguishing_features: string[]
  color_palette: string[]
  art_style_preference: string
}

export interface CharacterPersonality {
  traits: string[]
  quirks: string
  dialogue_style: string
  fears: string[]
  desires: string[]
  humor_level: number // 0–100
}

export interface CharacterHistory {
  backstory: string
  past_events: string[]
  relationships: Record<string, string> // characterId → relationship description
}

export interface CharacterState {
  mood: string
  energy_level: number // 0–100
  last_action: string
  current_objective: string
  notes: string
}

export interface CharacterMetadata {
  created_at: string
  last_updated: string
  appearance_last_changed: string
  creation_method: 'manual' | 'ui' | 'generated'
}

export interface Character {
  id: string
  name: string
  appearance: CharacterAppearance
  personality: CharacterPersonality
  history: CharacterHistory
  current_state: CharacterState
  metadata: CharacterMetadata
}

// ─── Diary ───────────────────────────────────────────────────────────────────

export interface DiaryImageInfo {
  path: string
  prompt_used: string
  generation_time_ms: number
  seed_used?: number
  provider_used: string
}

export interface DiaryCharacterInfo {
  id: string
  name: string
  role: string
  mood_before: string
  mood_after: string
  energy_before: number
  energy_after: number
}

export interface DiaryEntry {
  id: string
  date: string // YYYY-MM-DD
  timestamp: string // ISO 8601
  characters_involved: DiaryCharacterInfo[]
  scenario: {
    title: string
    description: string
    theme: string
    setting: string
    outcome: string
  }
  image: DiaryImageInfo
  generation_duration_ms: number
  notes?: string
}

export interface DiaryIndex {
  entries: Array<{
    id: string
    date: string
    title: string
    image_path: string
  }>
  last_updated: string
}

// ─── Scenario ────────────────────────────────────────────────────────────────

export interface CharacterRole {
  character_id: string
  role: string
  description: string
}

export interface Scenario {
  title: string
  description: string
  theme: ScenarioTheme
  setting: string
  atmosphere: string
  action: string
  character_roles: CharacterRole[]
  outcome: string
  narrative: string
}

export type ScenarioTheme = 'adventure' | 'mystery' | 'romance' | 'comedy' | 'horror' | 'slice_of_life'

// ─── AI ──────────────────────────────────────────────────────────────────────

export type ImageProviderName = 'pollinations' | 'huggingface' | 'stability' | 'replicate' | 'mock'
export type LLMProviderName = 'groq' | 'gemini' | 'ollama' | 'openrouter' | 'mock'

export interface ImageGenerationParams {
  prompt: string
  negative_prompt?: string
  width: number
  height: number
  steps?: number
  guidance_scale?: number
  seed?: number
}

export interface ImageResult {
  local_path: string
  provider_used: ImageProviderName
  generation_time_ms: number
  seed_used?: number
  prompt_used: string
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResult {
  content: string
  provider_used: LLMProviderName
  model_used: string
  tokens_used?: number
  duration_ms: number
}

// ─── Config ──────────────────────────────────────────────────────────────────

export interface AIImageConfig {
  provider: ImageProviderName
  model?: string
  width: number
  height: number
  steps: number
  guidance_scale: number
  negative_prompt: string
  timeout_ms: number
}

export interface AILLMConfig {
  provider: LLMProviderName
  model?: string
  max_tokens: number
  temperature: number
  timeout_ms: number
}

export interface GenerationConfig {
  interval_hours: number
  minimum_characters_per_scenario: number
  maximum_characters_per_scenario: number
  randomness_factor: number // 0.0–1.0
  theme_weights: Record<ScenarioTheme, number>
}

export interface AppConfig {
  ai_image: AIImageConfig
  ai_llm: AILLMConfig
  generation: GenerationConfig
  data_dir: string
  log_level: 'debug' | 'info' | 'warn' | 'error'
  timezone: string
}

// ─── Generation Result ───────────────────────────────────────────────────────

export interface GenerationResult {
  success: boolean
  image_path?: string
  diary_entry?: DiaryEntry
  duration_ms: number
  timestamp: string
  error?: string
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// ─── Service Status ──────────────────────────────────────────────────────────

export interface ServiceStatus {
  available: boolean
  provider: string
  latency_ms?: number
  error?: string
}
