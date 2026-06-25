import axios from 'axios'
import { AIProviderError } from '@utils/errorHandler'
import { logger } from '@utils/logger'
import type { ImageGenerationParams, ImageProviderName, ServiceStatus } from '@models/types'
import type { IImageProvider } from './IImageProvider'

// Pollinations.ai — completely free, no API key required.
// Docs: https://pollinations.ai
export class PollinationsProvider implements IImageProvider {
  readonly name: ImageProviderName = 'pollinations'
  private readonly baseUrl = 'https://image.pollinations.ai/prompt'

  async generateImage(params: ImageGenerationParams): Promise<Buffer> {
    const encodedPrompt = encodeURIComponent(params.prompt)
    const queryParams = new URLSearchParams({
      width: String(params.width),
      height: String(params.height),
      nologo: 'true',
      enhance: 'false',
      ...(params.seed !== undefined ? { seed: String(params.seed) } : {}),
      ...(params.negative_prompt ? { negative: params.negative_prompt } : {})
    })

    const url = `${this.baseUrl}/${encodedPrompt}?${queryParams}`
    logger.debug('PollinationsProvider: requesting image', { url })

    try {
      const response = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
        timeout: 60_000
      })
      return Buffer.from(response.data)
    } catch (err) {
      throw new AIProviderError(`Pollinations request failed: ${err}`, 'pollinations', err)
    }
  }

  async getStatus(): Promise<ServiceStatus> {
    const start = Date.now()
    try {
      await axios.head('https://image.pollinations.ai', { timeout: 5_000 })
      return { available: true, provider: 'pollinations', latency_ms: Date.now() - start }
    } catch {
      return { available: false, provider: 'pollinations', error: 'Service unreachable' }
    }
  }
}
