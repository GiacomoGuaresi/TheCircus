import type { LLMMessage, LLMProviderName, ServiceStatus } from '@models/types'
import type { ILLMProvider } from './ILLMProvider'

// Returns deterministic template responses — useful in tests/dev without any API key
export class MockLLMProvider implements ILLMProvider {
  readonly name: LLMProviderName = 'mock'
  readonly model = 'mock-v1'

  async complete(messages: LLMMessage[]): Promise<string> {
    const lastUser = messages.filter((m) => m.role === 'user').at(-1)?.content ?? ''

    if (lastUser.toLowerCase().includes('scenario')) {
      return JSON.stringify({
        title: 'The Digital Carnival',
        description: 'The characters find themselves in a surreal digital carnival with glitching rides and impossible colors.',
        theme: 'adventure',
        setting: 'A vast digital carnival with neon lights and impossible architecture',
        atmosphere: 'Whimsical yet slightly unsettling',
        action: 'The characters explore the carnival, discovering secrets hidden in the glitches',
        outcome: 'They find a mysterious door that leads deeper into the circus'
      })
    }

    if (lastUser.toLowerCase().includes('prompt')) {
      return 'digital art, surreal carnival, vibrant neon colors, glitching environment, dynamic composition, high detail, cinematic lighting'
    }

    if (lastUser.toLowerCase().includes('update') || lastUser.toLowerCase().includes('character')) {
      return JSON.stringify({ mood: 'curious', energy_level: 75, notes: 'Excited after the adventure' })
    }

    return 'A wonderful digital adventure unfolds in the circus of infinite possibilities.'
  }

  async getStatus(): Promise<ServiceStatus> {
    return { available: true, provider: 'mock', latency_ms: 0 }
  }
}
