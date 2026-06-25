import type { ImageGenerationParams, ImageProviderName, ServiceStatus } from '@models/types'

export interface IImageProvider {
  readonly name: ImageProviderName
  generateImage(params: ImageGenerationParams): Promise<Buffer>
  getStatus(): Promise<ServiceStatus>
}
