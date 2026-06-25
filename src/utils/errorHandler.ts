import { logger } from './logger'

export class CircusError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: unknown
  ) {
    super(message)
    this.name = 'CircusError'
  }
}

export class AIProviderError extends CircusError {
  constructor(message: string, provider: string, context?: unknown) {
    super(message, `AI_PROVIDER_ERROR_${provider.toUpperCase()}`, context)
    this.name = 'AIProviderError'
  }
}

export class CharacterLoadError extends CircusError {
  constructor(characterId: string, cause: unknown) {
    super(`Failed to load character: ${characterId}`, 'CHARACTER_LOAD_ERROR', cause)
    this.name = 'CharacterLoadError'
  }
}

export class ConfigError extends CircusError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR')
    this.name = 'ConfigError'
  }
}

export function handleError(error: unknown, context: string): never {
  if (error instanceof CircusError) {
    logger.error(`[${context}] ${error.message}`, { code: error.code, ctx: error.context })
    throw error
  }
  const message = error instanceof Error ? error.message : String(error)
  logger.error(`[${context}] Unexpected error: ${message}`)
  throw new CircusError(message, 'UNKNOWN_ERROR', error)
}

export function safeAsync<T>(fn: () => Promise<T>, context: string): Promise<T> {
  return fn().catch((err) => handleError(err, context))
}
