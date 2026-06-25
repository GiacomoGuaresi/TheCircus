import axios from 'axios'
import { AIProviderError } from '@utils/errorHandler'
import { logger } from '@utils/logger'
import type { ImageGenerationParams, ImageProviderName, ServiceStatus } from '@models/types'
import type { IImageProvider } from './IImageProvider'

// Hugging Face Inference API — free tier available (account required).
// Default model: black-forest-labs/FLUX.1-schnell (fast, good quality)
const DEFAULT_MODEL = 'black-forest-labs/FLUX.1-schnell'

export class HuggingFaceProvider implements IImageProvider {
  readonly name: ImageProviderName = 'huggingface'

  constructor(
    private apiKey: string,
    private model = DEFAULT_MODEL
  ) {}

  async generateImage(params: ImageGenerationParams): Promise<Buffer> {
    const url = `https://api-inference.huggingface.co/models/${this.model}`
    logger.debug('HuggingFaceProvider: requesting image', { model: this.model })

    try {
      const response = await axios.post<ArrayBuffer>(
        url,
        {
          inputs: params.prompt,
          parameters: {
            negative_prompt: params.negative_prompt,
            width: params.width,
            height: params.height,
            num_inference_steps: params.steps ?? 20,
            guidance_scale: params.guidance_scale ?? 7.5
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer',
          timeout: 120_000
        }
      )
      return Buffer.from(response.data)
    } catch (err) {
      throw new AIProviderError(`HuggingFace request failed: ${err}`, 'huggingface', err)
    }
  }

  async getStatus(): Promise<ServiceStatus> {
    const start = Date.now()
    try {
      await axios.get(`https://api-inference.huggingface.co/models/${this.model}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: 5_000
      })
      return { available: true, provider: 'huggingface', latency_ms: Date.now() - start }
    } catch {
      return { available: false, provider: 'huggingface', error: 'Model unavailable or key invalid' }
    }
  }
}
