import { logger } from '@utils/logger'
import { SCENARIO_THEMES, DEFAULT_THEME_WEIGHTS } from '@models/constants'
import type { Character, DiaryEntry, Scenario, ScenarioTheme } from '@models/types'
import type { LLMService } from './ai/LLMService'
import type { CharacterAnalyzer } from './characterAnalyzer'

const SYSTEM_PROMPT = `You are a creative writer for "The Circus", a surreal digital world inspired by "The Amazing Digital Circus".
Generate vivid, imaginative scenarios for the characters to experience. The world is digital, glitchy, and dreamlike.
Always respond with valid JSON only — no extra text.`

export class ScenarioGenerator {
  constructor(
    private llmService: LLMService,
    private characterAnalyzer: CharacterAnalyzer
  ) {}

  async generateScenario(
    characters: Character[],
    recentHistory: DiaryEntry[],
    randomnessFactor: number
  ): Promise<Scenario> {
    const theme = this.selectTheme(recentHistory, randomnessFactor)
    const characterContexts = characters.map((c) => this.characterAnalyzer.getCharacterContext(c))
    const historyContext = this.buildHistoryContext(recentHistory)

    logger.debug(`ScenarioGenerator: generating scenario (theme: ${theme})`)

    const userPrompt = `
Generate a scenario for these characters in The Circus digital world.

CHARACTERS:
${characterContexts.join('\n\n')}

RECENT HISTORY (last events):
${historyContext}

THEME: ${theme}
RANDOMNESS: ${Math.round(randomnessFactor * 100)}% (higher = more unexpected/weird events)

Generate a JSON object with this exact structure:
{
  "title": "Short evocative title (max 8 words)",
  "description": "2-3 sentence description of what happens",
  "theme": "${theme}",
  "setting": "Specific location in the digital circus world",
  "atmosphere": "The mood and feel of the scene",
  "action": "What the characters are actively doing",
  "character_roles": [
    {"character_id": "ID", "role": "protagonist/antagonist/observer/etc", "description": "their specific role in this scene"}
  ],
  "outcome": "How the scene ends or what changes",
  "narrative": "Full 3-4 sentence narrative description for image generation context"
}`

    try {
      const raw = await this.llmService.completeJSON<Omit<Scenario, 'character_roles'> & {
        character_roles: Array<{ character_id: string; role: string; description: string }>
      }>(
        [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        512
      )

      // Map character IDs to roles
      const scenario: Scenario = {
        ...raw,
        theme: theme,
        character_roles: raw.character_roles.map((r) => ({
          character_id: r.character_id,
          role: r.role,
          description: r.description
        }))
      }

      logger.info(`ScenarioGenerator: generated "${scenario.title}"`)
      return scenario
    } catch (err) {
      logger.warn('ScenarioGenerator: LLM failed, using fallback scenario', err)
      return this.fallbackScenario(characters, theme)
    }
  }

  selectTheme(recentHistory: DiaryEntry[], randomnessFactor: number): ScenarioTheme {
    // Avoid repeating the same theme from last 3 entries
    const recentThemes = recentHistory.slice(0, 3).map((e) => e.scenario.theme as ScenarioTheme)

    const weights = { ...DEFAULT_THEME_WEIGHTS }
    for (const theme of recentThemes) {
      if (weights[theme]) weights[theme] *= 0.3
    }

    // Apply randomness: flatten weights when randomness is high
    if (randomnessFactor > 0.7) {
      for (const t of SCENARIO_THEMES) weights[t] = (weights[t] + 20) / 2
    }

    return this.weightedRandom(weights)
  }

  private weightedRandom(weights: Record<string, number>): ScenarioTheme {
    const total = Object.values(weights).reduce((a, b) => a + b, 0)
    let random = Math.random() * total
    for (const [theme, weight] of Object.entries(weights)) {
      random -= weight
      if (random <= 0) return theme as ScenarioTheme
    }
    return 'adventure'
  }

  private buildHistoryContext(history: DiaryEntry[]): string {
    if (history.length === 0) return 'No previous events — this is the beginning of the story.'
    return history
      .slice(0, 3)
      .map((e) => `- ${e.date}: "${e.scenario.title}" — ${e.scenario.outcome}`)
      .join('\n')
  }

  private fallbackScenario(characters: Character[], theme: ScenarioTheme): Scenario {
    const names = characters.map((c) => c.name).join(' and ')
    return {
      title: `${names} in the Digital Maze`,
      description: `${names} find themselves navigating a glitching section of the Circus.`,
      theme,
      setting: 'The glitching corridors of the Digital Circus',
      atmosphere: 'Surreal and slightly unsettling',
      action: 'Exploring and discovering',
      character_roles: characters.map((c) => ({
        character_id: c.id,
        role: 'explorer',
        description: `${c.name} explores the environment`
      })),
      outcome: 'The characters discover something unexpected',
      narrative: `${names} wander through the impossible geometry of the Circus, where reality bends and glitches reveal hidden paths.`
    }
  }
}
