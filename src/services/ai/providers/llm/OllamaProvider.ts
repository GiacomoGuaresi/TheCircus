import axios from 'axios'
import { AIProviderError } from '@utils/errorHandler'
import { logger } from '@utils/logger'
import type { LLMMessage, LLMProviderName, ServiceStatus } from '@models/types'
import type { ILLMProvider } from './ILLMProvider'

// Ollama — local LLM server, completely free, no API key.
// Install: https://ollama.ai — then run: ollama pull llama3.2
const DEFAULT_MODEL = 'llama3.2'
const DEFAULT_BASE_URL = 'http://localhost:11434'

export class OllamaProvider implements ILLMProvider {
  readonly name: LLMProviderName = 'ollama'
  readonly model: string
  private baseUrl: string

  constructor(model = DEFAULT_MODEL, baseUrl = DEFAULT_BASE_URL) {
    this.model = model
    this.baseUrl = baseUrl
  }

  async complete(messages: LLMMessage[], maxTokens = 1024): Promise<string> {
    logger.debug('OllamaProvider: completing', { model: this.model })

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: this.model,
          messages,
          stream: false,
          options: { num_predict: maxTokens, temperature: 0.8 }
        },
        { timeout: 120_000 }
      )
      return response.data.message?.content ?? ''
    } catch (err) {
      throw new AIProviderError(`Ollama completion failed: ${err}`, 'ollama', err)
    }
  }

  async getStatus(): Promise<ServiceStatus> {
    const start = Date.now()
    try {
      await axios.get(`${this.baseUrl}/api/tags`, { timeout: 3_000 })
      return { available: true, provider: 'ollama', latency_ms: Date.now() - start }
    } catch {
      return { available: false, provider: 'ollama', error: 'Ollama not running (start with: ollama serve)' }
    }
  }
}
