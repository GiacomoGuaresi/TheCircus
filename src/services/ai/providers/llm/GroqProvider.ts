import Groq from 'groq-sdk'
import { AIProviderError } from '@utils/errorHandler'
import { logger } from '@utils/logger'
import type { LLMMessage, LLMProviderName, ServiceStatus } from '@models/types'
import type { ILLMProvider } from './ILLMProvider'

// Groq — free tier with generous limits, very fast inference.
// Default model: llama-3.3-70b-versatile (smart, fast, free)
// Docs: https://console.groq.com/docs/openai
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

export class GroqProvider implements ILLMProvider {
  readonly name: LLMProviderName = 'groq'
  readonly model: string
  private client: Groq

  constructor(apiKey: string, model = DEFAULT_MODEL) {
    this.model = model
    this.client = new Groq({ apiKey })
  }

  async complete(messages: LLMMessage[], maxTokens = 1024): Promise<string> {
    logger.debug('GroqProvider: completing', { model: this.model, messages: messages.length })

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.8
      })

      return response.choices[0]?.message?.content ?? ''
    } catch (err) {
      throw new AIProviderError(`Groq completion failed: ${err}`, 'groq', err)
    }
  }

  async getStatus(): Promise<ServiceStatus> {
    const start = Date.now()
    try {
      await this.client.models.list()
      return { available: true, provider: 'groq', latency_ms: Date.now() - start }
    } catch {
      return { available: false, provider: 'groq', error: 'Invalid API key or service down' }
    }
  }
}
