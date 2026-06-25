import path from 'path'
import { logger } from '@utils/logger'
import { GENERATED_DIR } from '@models/constants'
import type { AppConfig, GenerationResult, Character } from '@models/types'
import type { CharacterAnalyzer } from '@services/characterAnalyzer'
import type { DiaryManager } from '@services/diaryManager'
import type { ScenarioGenerator } from '@services/scenarioGenerator'
import type { PromptEngineer } from '@services/promptEngineer'
import type { AIImageService } from '@services/ai/AIImageService'
import type { DesktopService } from '@services/desktopService'

export class Generator {
  constructor(
    private characterAnalyzer: CharacterAnalyzer,
    private diaryManager: DiaryManager,
    private scenarioGenerator: ScenarioGenerator,
    private promptEngineer: PromptEngineer,
    private aiImageService: AIImageService,
    private desktopService: DesktopService,
    private config: AppConfig
  ) {}

  async generate(): Promise<GenerationResult> {
    const start = Date.now()
    logger.info('Generator: starting generation cycle')

    try {
      // 1. Load context
      const recentEntries = await this.diaryManager.getRecentEntries(7)
      const selectedCharacters = await this.characterAnalyzer.selectCharactersForScenario(
        this.config.generation.minimum_characters_per_scenario,
        this.config.generation.maximum_characters_per_scenario,
        this.config.generation.randomness_factor,
        recentEntries
      )

      // 2. Generate scenario
      const scenario = await this.scenarioGenerator.generateScenario(
        selectedCharacters,
        recentEntries,
        this.config.generation.randomness_factor
      )

      // 3. Build image prompt
      const imagePrompt = await this.promptEngineer.generateImagePrompt(scenario, selectedCharacters)
      const negativePrompt = this.promptEngineer.buildNegativePrompt()

      // 4. Generate image
      const outputDir = path.join(this.config.data_dir, GENERATED_DIR)
      const imageResult = await this.aiImageService.generateAndSave(
        imagePrompt,
        { ...this.config.ai_image, negative_prompt: negativePrompt },
        outputDir
      )

      // 5. Update character states
      const characterInfos = await this.updateCharacters(selectedCharacters, scenario)

      // 6. Write diary entry
      const diaryEntry = await this.diaryManager.writeEntry({
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        characters_involved: characterInfos,
        scenario: {
          title: scenario.title,
          description: scenario.description,
          theme: scenario.theme,
          setting: scenario.setting,
          outcome: scenario.outcome
        },
        image: {
          path: imageResult.local_path,
          prompt_used: imageResult.prompt_used,
          generation_time_ms: imageResult.generation_time_ms,
          seed_used: imageResult.seed_used,
          provider_used: imageResult.provider_used
        },
        generation_duration_ms: Date.now() - start
      })

      // 7. Set wallpaper
      if (this.desktopService.isSupported()) {
        await this.desktopService.setWallpaper(imageResult.local_path)
      }

      const result: GenerationResult = {
        success: true,
        image_path: imageResult.local_path,
        diary_entry: diaryEntry,
        duration_ms: Date.now() - start,
        timestamp: new Date().toISOString()
      }

      logger.info(`Generator: cycle complete in ${result.duration_ms}ms — "${scenario.title}"`)
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      logger.error('Generator: cycle failed', { error })
      return {
        success: false,
        duration_ms: Date.now() - start,
        timestamp: new Date().toISOString(),
        error
      }
    }
  }

  private async updateCharacters(
    characters: Character[],
    scenario: { character_roles: Array<{ character_id: string; role: string }> }
  ): Promise<Array<{
    id: string; name: string; role: string
    mood_before: string; mood_after: string
    energy_before: number; energy_after: number
  }>> {
    const infos = []

    for (const char of characters) {
      const role = scenario.character_roles.find((r) => r.character_id === char.id)?.role ?? 'participant'
      const moodBefore = char.current_state.mood
      const energyBefore = char.current_state.energy_level

      // Simple state evolution: energy decreases after each event
      const energyDelta = Math.round((Math.random() - 0.3) * 20)
      const newEnergy = Math.max(10, Math.min(100, energyBefore + energyDelta))

      const moods = ['excited', 'curious', 'tired', 'happy', 'contemplative', 'anxious', 'relieved']
      const newMood = moods[Math.floor(Math.random() * moods.length)]

      await this.characterAnalyzer.updateCharacter(char.id, {
        current_state: {
          ...char.current_state,
          mood: newMood,
          energy_level: newEnergy,
          last_action: role
        }
      })

      infos.push({
        id: char.id,
        name: char.name,
        role,
        mood_before: moodBefore,
        mood_after: newMood,
        energy_before: energyBefore,
        energy_after: newEnergy
      })
    }

    return infos
  }

  updateConfig(config: AppConfig): void {
    this.config = config
    this.aiImageService.switchProvider(config.ai_image)
  }
}
