import { z } from 'zod'

export const CharacterAppearanceSchema = z.object({
  description: z.string().min(1),
  clothing: z.string().min(1),
  distinguishing_features: z.array(z.string()),
  color_palette: z.array(z.string()),
  art_style_preference: z.string()
})

export const CharacterPersonalitySchema = z.object({
  traits: z.array(z.string()).min(1),
  quirks: z.string(),
  dialogue_style: z.string(),
  fears: z.array(z.string()),
  desires: z.array(z.string()),
  humor_level: z.number().min(0).max(100)
})

export const CharacterHistorySchema = z.object({
  backstory: z.string(),
  past_events: z.array(z.string()),
  relationships: z.record(z.string())
})

export const CharacterStateSchema = z.object({
  mood: z.string().min(1),
  energy_level: z.number().min(0).max(100),
  last_action: z.string(),
  current_objective: z.string(),
  notes: z.string()
})

export const CharacterMetadataSchema = z.object({
  created_at: z.string().datetime(),
  last_updated: z.string().datetime(),
  appearance_last_changed: z.string().datetime(),
  creation_method: z.enum(['manual', 'ui', 'generated'])
})

export const CharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  appearance: CharacterAppearanceSchema,
  personality: CharacterPersonalitySchema,
  history: CharacterHistorySchema,
  current_state: CharacterStateSchema,
  metadata: CharacterMetadataSchema
})

export const DiaryEntrySchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timestamp: z.string().datetime(),
  characters_involved: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    mood_before: z.string(),
    mood_after: z.string(),
    energy_before: z.number(),
    energy_after: z.number()
  })),
  scenario: z.object({
    title: z.string(),
    description: z.string(),
    theme: z.string(),
    setting: z.string(),
    outcome: z.string()
  }),
  image: z.object({
    path: z.string(),
    prompt_used: z.string(),
    generation_time_ms: z.number(),
    seed_used: z.number().optional(),
    provider_used: z.string()
  }),
  generation_duration_ms: z.number(),
  notes: z.string().optional()
})

export const AppConfigSchema = z.object({
  ai_image: z.object({
    provider: z.enum(['pollinations', 'huggingface', 'stability', 'replicate', 'mock']),
    model: z.string().optional(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    steps: z.number().int().positive(),
    guidance_scale: z.number().positive(),
    negative_prompt: z.string(),
    timeout_ms: z.number().int().positive()
  }),
  ai_llm: z.object({
    provider: z.enum(['groq', 'gemini', 'ollama', 'openrouter', 'mock']),
    model: z.string().optional(),
    max_tokens: z.number().int().positive(),
    temperature: z.number().min(0).max(2),
    timeout_ms: z.number().int().positive()
  }),
  generation: z.object({
    interval_hours: z.number().positive(),
    minimum_characters_per_scenario: z.number().int().min(1),
    maximum_characters_per_scenario: z.number().int().min(1),
    randomness_factor: z.number().min(0).max(1),
    theme_weights: z.record(z.number())
  }),
  data_dir: z.string(),
  log_level: z.enum(['debug', 'info', 'warn', 'error']),
  timezone: z.string()
})
