import { THEME_STYLE_TAGS } from '@models/constants'
import type { Character, Scenario } from '@models/types'
import type { LLMService } from './ai/LLMService'
import { logger } from '@utils/logger'

const DIGITAL_CIRCUS_STYLE =
  'digital art, surreal dreamlike world, vibrant colors, impossible architecture, glitch effects, cartoon style, high detail, cinematic composition'

export class PromptEngineer {
  constructor(private llmService: LLMService) {}

  async generateImagePrompt(scenario: Scenario, characters: Character[]): Promise<string> {
    const parts = [
      this.buildCharacterDescriptions(characters, scenario),
      this.buildSceneDescription(scenario),
      this.buildStyleTags(scenario)
    ]

    const basePrompt = parts.filter(Boolean).join(', ')

    // Try to enhance with LLM for better Stable Diffusion syntax
    try {
      const enhanced = await this.enhanceWithLLM(basePrompt, scenario)
      logger.debug('PromptEngineer: enhanced prompt with LLM')
      return enhanced
    } catch {
      logger.debug('PromptEngineer: using base prompt (LLM enhancement skipped)')
      return basePrompt
    }
  }

  private buildCharacterDescriptions(characters: Character[], scenario: Scenario): string {
    return characters
      .map((char) => {
        const role = scenario.character_roles.find((r) => r.character_id === char.id)
        const features = char.appearance.distinguishing_features.slice(0, 3).join(', ')
        return `${char.name} (${char.appearance.description}, ${char.appearance.clothing}${features ? ', ' + features : ''})`
      })
      .join(', ')
  }

  private buildSceneDescription(scenario: Scenario): string {
    return `${scenario.setting}, ${scenario.atmosphere}, ${scenario.action}`
  }

  private buildStyleTags(scenario: Scenario): string {
    const themeStyles = THEME_STYLE_TAGS[scenario.theme] ?? []
    return [...themeStyles, DIGITAL_CIRCUS_STYLE].join(', ')
  }

  private async enhanceWithLLM(basePrompt: string, scenario: Scenario): Promise<string> {
    const result = await this.llmService.complete(
      [
        {
          role: 'system',
          content:
            'You are an expert at writing Stable Diffusion prompts. Rewrite the given prompt to be more vivid and effective for image generation. Keep it under 200 words. Return ONLY the prompt text, no explanation.'
        },
        {
          role: 'user',
          content: `Base prompt: ${basePrompt}\n\nNarrative context: ${scenario.narrative}\n\nEnhanced SD prompt:`
        }
      ],
      200
    )

    return result.content.trim() || basePrompt
  }

  buildNegativePrompt(): string {
    return [
      'text', 'watermark', 'signature', 'blurry', 'low quality',
      'deformed', 'ugly', 'bad anatomy', 'duplicate', 'extra limbs',
      'nsfw', 'nude'
    ].join(', ')
  }
}
