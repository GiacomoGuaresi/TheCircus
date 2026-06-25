import path from 'path'
import { logger } from '@utils/logger'
import { timestampFilename } from '@utils/fileHelpers'
import type { AIImageConfig, ImageResult, ImageProviderName, ServiceStatus } from '@models/types'
import type { IImageProvider } from './providers/image/IImageProvider'
import { MockImageProvider } from './providers/image/MockImageProvider'
import { PollinationsProvider } from './providers/image/PollinationsProvider'
import { HuggingFaceProvider } from './providers/image/HuggingFaceProvider'
import { StabilityProvider } from './providers/image/StabilityProvider'

export class AIImageService {
  private provider: IImageProvider

  constructor(config: AIImageConfig) {
    this.provider = AIImageService.createProvider(config)
    logger.info(`AIImageService: using provider "${this.provider.name}"`)
  }

  static createProvider(config: AIImageConfig): IImageProvider {
    switch (config.provider) {
      case 'pollinations':
        return new PollinationsProvider()
      case 'huggingface':
        return new HuggingFaceProvider(
          process.env.HUGGINGFACE_API_KEY ?? '',
          config.model
        )
      case 'stability':
        return new StabilityProvider(
          process.env.STABILITY_API_KEY ?? '',
          config.model
        )
      case 'mock':
      default:
        return new MockImageProvider()
    }
  }

  async generateAndSave(
    prompt: string,
    config: AIImageConfig,
    outputDir: string
  ): Promise<ImageResult> {
    const start = Date.now()
    logger.info(`AIImageService: generating image (${this.provider.name})`)

    const buffer = await this.provider.generateImage({
      prompt,
      negative_prompt: config.negative_prompt,
      width: config.width,
      height: config.height,
      steps: config.steps,
      guidance_scale: config.guidance_scale
    })

    const filename = timestampFilename('png')
    const filePath = path.join(outputDir, filename)

    const fs = await import('fs-extra')
    await fs.default.writeFile(filePath, buffer)

    const result: ImageResult = {
      local_path: filePath,
      provider_used: this.provider.name,
      generation_time_ms: Date.now() - start,
      prompt_used: prompt
    }

    logger.info(`AIImageService: image saved to ${filePath} (${result.generation_time_ms}ms)`)
    return result
  }

  async getStatus(): Promise<ServiceStatus> {
    return this.provider.getStatus()
  }

  switchProvider(config: AIImageConfig): void {
    this.provider = AIImageService.createProvider(config)
    logger.info(`AIImageService: switched to provider "${this.provider.name}"`)
  }

  get currentProvider(): ImageProviderName {
    return this.provider.name
  }
}
