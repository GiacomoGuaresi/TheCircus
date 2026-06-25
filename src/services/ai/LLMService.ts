import { logger } from '@utils/logger'
import type { AILLMConfig, LLMMessage, LLMResult, LLMProviderName, ServiceStatus } from '@models/types'
import type { ILLMProvider } from './providers/llm/ILLMProvider'
import { MockLLMProvider } from './providers/llm/MockLLMProvider'
import { GroqProvider } from './providers/llm/GroqProvider'
import { GeminiProvider } from './providers/llm/GeminiProvider'
import { OllamaProvider } from './providers/llm/OllamaProvider'

export class LLMService {
  private provider: ILLMProvider

  constructor(config: AILLMConfig) {
    this.provider = LLMService.createProvider(config)
    logger.info(`LLMService: using provider "${this.provider.name}" (${this.provider.model})`)
  }

  static createProvider(config: AILLMConfig): ILLMProvider {
    switch (config.provider) {
      case 'groq':
        return new GroqProvider(process.env.GROQ_API_KEY ?? '', config.model)
      case 'gemini':
        return new GeminiProvider(process.env.GEMINI_API_KEY ?? '', config.model)
      case 'ollama':
        return new OllamaProvider(config.model, process.env.OLLAMA_BASE_URL)
      case 'mock':
      default:
        return new MockLLMProvider()
    }
  }

  async complete(messages: LLMMessage[], maxTokens?: number): Promise<LLMResult> {
    const start = Date.now()
    const content = await this.provider.complete(messages, maxTokens)
    return {
      content,
      provider_used: this.provider.name,
      model_used: this.provider.model,
      duration_ms: Date.now() - start
    }
  }

  async completeJSON<T>(messages: LLMMessage[], maxTokens?: number): Promise<T> {
    const result = await this.complete(messages, maxTokens)
    const text = result.content.trim()

    // Strip markdown code fences if present
    const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    return JSON.parse(jsonText) as T
  }

  async getStatus(): Promise<ServiceStatus> {
    return this.provider.getStatus()
  }

  switchProvider(config: AILLMConfig): void {
    this.provider = LLMService.createProvider(config)
    logger.info(`LLMService: switched to provider "${this.provider.name}"`)
  }

  get currentProvider(): LLMProviderName {
    return this.provider.name
  }
}
