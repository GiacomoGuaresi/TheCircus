import type { LLMMessage, LLMProviderName, ServiceStatus } from '@models/types'

export interface ILLMProvider {
  readonly name: LLMProviderName
  readonly model: string
  complete(messages: LLMMessage[], maxTokens?: number): Promise<string>
  getStatus(): Promise<ServiceStatus>
}
