import axios from 'axios'
import { AIProviderError } from '@utils/errorHandler'
import { logger } from '@utils/logger'
import type { ImageGenerationParams, ImageProviderName, ServiceStatus } from '@models/types'
import type { IImageProvider } from './IImageProvider'

// Stability.ai API — paid, but high quality (SDXL, SD3).
// Docs: https://platform.stability.ai/docs/api-reference
export class StabilityProvider implements IImageProvider {
  readonly name: ImageProviderName = 'stability'
  private readonly baseUrl = 'https://api.stability.ai/v1/generation'

  constructor(
    private apiKey: string,
    private engineId = 'stable-diffusion-xl-1024-v1-0'
  ) {}

  async generateImage(params: ImageGenerationParams): Promise<Buffer> {
    const url = `${this.baseUrl}/${this.engineId}/text-to-image`
    logger.debug('StabilityProvider: requesting image', { engine: this.engineId })

    try {
      const response = await axios.post(
        url,
        {
          text_prompts: [
            { text: params.prompt, weight: 1 },
            ...(params.negative_prompt ? [{ text: params.negative_prompt, weight: -1 }] : [])
          ],
          cfg_scale: params.guidance_scale ?? 7,
          height: params.height,
          width: params.width,
          steps: params.steps ?? 30,
          samples: 1,
          sampler: 'dpmpp_2m_karras',
          ...(params.seed !== undefined ? { seed: params.seed } : {})
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          timeout: 120_000
        }
      )

      const base64 = response.data.artifacts[0].base64
      return Buffer.from(base64, 'base64')
    } catch (err) {
      throw new AIProviderError(`Stability request failed: ${err}`, 'stability', err)
    }
  }

  async getStatus(): Promise<ServiceStatus> {
    const start = Date.now()
    try {
      await axios.get('https://api.stability.ai/v1/user/account', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: 5_000
      })
      return { available: true, provider: 'stability', latency_ms: Date.now() - start }
    } catch {
      return { available: false, provider: 'stability', error: 'Invalid API key or service down' }
    }
  }
}
