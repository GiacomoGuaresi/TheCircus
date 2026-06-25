import type { ImageGenerationParams, ImageProviderName, ServiceStatus } from '@models/types'
import type { IImageProvider } from './IImageProvider'

// Generates a colored placeholder image — used in development/tests without any API key
export class MockImageProvider implements IImageProvider {
  readonly name: ImageProviderName = 'mock'

  async generateImage(params: ImageGenerationParams): Promise<Buffer> {
    // Dynamic import to avoid hard dep on 'canvas' if not installed
    try {
      const { createCanvas } = await import('canvas')
      return this.drawCanvas(createCanvas, params)
    } catch {
      return this.drawFallback(params)
    }
  }

  private drawCanvas(
    createCanvasFn: typeof createCanvas,
    params: ImageGenerationParams
  ): Buffer {
    const canvas = createCanvasFn(params.width, params.height)
    const ctx = canvas.getContext('2d')

    const hue = Math.abs(params.prompt.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 360
    ctx.fillStyle = `hsl(${hue}, 60%, 30%)`
    ctx.fillRect(0, 0, params.width, params.height)

    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * params.width
      const y = Math.random() * params.height
      const r = 50 + Math.random() * 150
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = `${Math.round(params.width / 30)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('[MOCK IMAGE]', params.width / 2, params.height / 2)
    ctx.font = `${Math.round(params.width / 50)}px sans-serif`
    const truncated = params.prompt.slice(0, 60) + (params.prompt.length > 60 ? '…' : '')
    ctx.fillText(truncated, params.width / 2, params.height / 2 + 40)

    return canvas.toBuffer('image/png')
  }

  private drawFallback(params: ImageGenerationParams): Buffer {
    // Minimal 1x1 transparent PNG when canvas is unavailable
    const PNG_1x1 = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
    return PNG_1x1
  }

  async getStatus(): Promise<ServiceStatus> {
    return { available: true, provider: 'mock', latency_ms: 0 }
  }
}
