import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIProviderError } from '@utils/errorHandler'
import { logger } from '@utils/logger'
import type { LLMMessage, LLMProviderName, ServiceStatus } from '@models/types'
import type { ILLMProvider } from './ILLMProvider'

// Google Gemini — free tier: 1M tokens/day with Gemini 1.5 Flash.
// Docs: https://ai.google.dev/gemini-api/docs
const DEFAULT_MODEL = 'gemini-1.5-flash'

export class GeminiProvider implements ILLMProvider {
  readonly name: LLMProviderName = 'gemini'
  readonly model: string
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string, model = DEFAULT_MODEL) {
    this.model = model
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async complete(messages: LLMMessage[], maxTokens = 1024): Promise<string> {
    logger.debug('GeminiProvider: completing', { model: this.model })

    try {
      const geminiModel = this.genAI.getGenerativeModel({
        model: this.model,
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.8 }
      })

      // Convert messages to Gemini format
      const systemParts = messages.filter((m) => m.role === 'system').map((m) => m.content)
      const conversationMessages = messages.filter((m) => m.role !== 'system')

      const history = conversationMessages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))

      const lastMessage = conversationMessages.at(-1)?.content ?? ''
      const fullPrompt = systemParts.length > 0
        ? `${systemParts.join('\n\n')}\n\n${lastMessage}`
        : lastMessage

      const chat = geminiModel.startChat({ history })
      const result = await chat.sendMessage(fullPrompt)
      return result.response.text()
    } catch (err) {
      throw new AIProviderError(`Gemini completion failed: ${err}`, 'gemini', err)
    }
  }

  async getStatus(): Promise<ServiceStatus> {
    const start = Date.now()
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      await model.generateContent('ping')
      return { available: true, provider: 'gemini', latency_ms: Date.now() - start }
    } catch {
      return { available: false, provider: 'gemini', error: 'Invalid API key or service down' }
    }
  }
}
