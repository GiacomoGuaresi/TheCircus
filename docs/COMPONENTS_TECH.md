# Guida Componenti Tecnici

## Stack Tecnologico Raccomandato

### Core Application
- **Runtime**: Node.js 18+ (TypeScript)
- **Desktop Framework**: Electron 27+ o Tauri 1.5+
- **Build Tool**: Vite (fast HMR) + esbuild

### Backend Services
- **Task Scheduling**: node-cron o node-schedule
- **File Operations**: fs-extra (async wrapper)
- **JSON Processing**: zod (validation) + json-schema-to-ts
- **Concurrency**: p-queue (queued async operations)

### Frontend UI
- **Framework**: React 18+ (with TypeScript)
- **UI Library**: shadcn/ui oppure Material UI
- **State Management**: zustand (lightweight) o Recoil
- **Styling**: Tailwind CSS

### AI Integration
- **Stable Diffusion**: @stability/sdk
- **OpenAI DALL-E**: openai SDK
- **Image Processing**: sharp (resize, optimize)

### Testing
- **Unit Tests**: Vitest (fast)
- **Integration Tests**: Jest con mocking
- **E2E Tests**: Playwright
- **Type Safety**: TypeScript strict mode

### Development Tools
- **Linting**: ESLint + Prettier
- **Type Checking**: tsc --noEmit
- **Debugging**: VS Code + Node.js debugger

---

## Struttura Directory Progetto

```
TheCircus/
├── docs/                              # Documentazione (questa)
│   ├── ARCHITECTURE.md
│   ├── DATA_STRUCTURES.md
│   ├── WORKFLOW.md
│   └── COMPONENTS_TECH.md (questo file)
│
├── src/
│   ├── main.ts                        # Entry point (ipc setup)
│   ├── preload.ts                     # Electron preload (IPC bridge)
│   │
│   ├── core/
│   │   ├── scheduler.ts               # Ciclo di scheduling
│   │   ├── generator.ts               # Orchestratore principale
│   │   └── index.ts                   # Exports pubblici
│   │
│   ├── services/
│   │   ├── characterAnalyzer.ts       # Analisi profili
│   │   ├── diaryManager.ts            # Gestione diario
│   │   ├── scenarioGenerator.ts       # Generazione situazioni
│   │   ├── promptEngineer.ts          # Prompt optimization
│   │   ├── aiImageService.ts          # Interfaccia AI
│   │   ├── desktopService.ts          # Wallpaper management
│   │   ├── fileManager.ts             # I/O operations
│   │   ├── configManager.ts           # Configurazione
│   │   └── index.ts                   # Exports
│   │
│   ├── models/
│   │   ├── types.ts                   # Definizioni TypeScript
│   │   ├── schemas.ts                 # Zod schemas per validazione
│   │   └── constants.ts               # Costanti globali
│   │
│   ├── ui/
│   │   ├── App.tsx                    # Root component
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Vista principale
│   │   │   ├── Characters.tsx         # Gestione personaggi
│   │   │   ├── Settings.tsx           # Configurazioni
│   │   │   └── Diary.tsx              # Visualizzazione diario
│   │   ├── components/
│   │   │   ├── CharacterCard.tsx
│   │   │   ├── GenerationStatus.tsx
│   │   │   ├── DiaryViewer.tsx
│   │   │   └── ...
│   │   └── hooks/
│   │       ├── useGenerator.ts        # Hook per generazione
│   │       ├── useCharacters.ts       # Hook per personaggi
│   │       └── useConfig.ts           # Hook per config
│   │
│   ├── utils/
│   │   ├── logger.ts                  # Sistema logging
│   │   ├── errorHandler.ts            # Gestione errori
│   │   ├── validators.ts              # Funzioni validazione
│   │   ├── fileHelpers.ts             # Utility file operations
│   │   └── prompts.ts                 # Template prompt
│   │
│   └── ipc/
│       ├── handlers.ts                # IPC event handlers
│       └── channels.ts                # Costanti canali IPC
│
├── data/                              # Runtime data directory
│   ├── characters/                    # Profili personaggi
│   ├── diary/                         # File diario
│   └── generated/                     # Wallpaper generati
│
├── config/
│   ├── config.json                    # Configurazione utente
│   ├── config.default.json            # Default values
│   └── defaults.ts                    # Costanti defaults
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── integration/
│   │   ├── workflow.test.ts           # Test ciclo completo
│   │   └── generator.test.ts
│   └── fixtures/                      # Test data
│
├── .env.example                       # Template variabili ambiente
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── electron-builder.yml               # Build config
└── README.md
```

---

## Moduli Core - Interfacce Dettagliate

### 1. Scheduler (`src/core/scheduler.ts`)

```typescript
import EventEmitter from 'events';
import cron from 'node-cron';

interface ScheduleConfig {
  intervalHours: number;
  enabled: boolean;
  timezone: string;
  cronExpression?: string;  // Alternative a interval
}

interface ScheduleLog {
  timestamp: Date;
  success: boolean;
  duration_ms: number;
  error?: string;
}

export class Scheduler extends EventEmitter {
  private task?: cron.ScheduledTask;
  private logs: ScheduleLog[] = [];

  constructor(
    private config: ScheduleConfig,
    private onTick: () => Promise<void>
  ) {
    super();
  }

  async start(): Promise<void> {
    // Crea cron task basato su config
    // Emette 'scheduled-tick' quando è ora
  }

  async stop(): Promise<void> {
    // Ferma task, cleanup
  }

  async trigger(): Promise<void> {
    // Trigger manuale (ignora schedule)
  }

  getNextExecutionTime(): Date {
    // Ritorna quando sarà il prossimo tick
  }

  getExecutionHistory(limit = 100): ScheduleLog[] {
    // Ritorna ultimi N log
  }
}
```

### 2. Generator (`src/core/generator.ts`)

```typescript
import { CharacterAnalyzer } from '../services/characterAnalyzer';
import { DiaryManager } from '../services/diaryManager';
import { ScenarioGenerator } from '../services/scenarioGenerator';
import { AIPromptEngineer } from '../services/promptEngineer';
import { AIImageService } from '../services/aiImageService';
import { DesktopService } from '../services/desktopService';

interface GenerationResult {
  success: boolean;
  imagePath: string;
  diaryEntry?: DiaryEntry;
  duration_ms: number;
  timestamp: Date;
  error?: string;
}

export class Generator {
  constructor(
    private characterAnalyzer: CharacterAnalyzer,
    private diaryManager: DiaryManager,
    private scenarioGenerator: ScenarioGenerator,
    private promptEngineer: AIPromptEngineer,
    private aiImageService: AIImageService,
    private desktopService: DesktopService,
    private config: AppConfig
  ) {}

  async generate(): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      // 1. Load characters and diary
      const characters = await this.characterAnalyzer.loadAllCharacters();
      const recentDiary = await this.diaryManager.getRecentEntries(7);

      // 2. Select characters
      const selectedChars = await this.characterAnalyzer.selectCharactersForScenario(
        this.config.generation.minimum_characters_per_scenario,
        this.config.generation.maximum_characters_per_scenario,
        this.config.generation.randomness_factor
      );

      // 3. Generate scenario
      const scenario = await this.scenarioGenerator.generateScenario(
        selectedChars,
        recentDiary,
        this.config.generation.randomness_factor
      );

      // 4. Create prompt
      const prompt = await this.promptEngineer.generateImagePrompt(
        scenario,
        selectedChars
      );

      // 5. Generate image
      const imageResult = await this.aiImageService.generateImage(
        prompt,
        this.config.ai
      );

      // 6. Update characters
      for (const char of selectedChars) {
        // Update based on scenario
      }

      // 7. Write diary
      const diaryEntry = await this.diaryManager.writeEntry({
        date: new Date().toISOString().split('T')[0],
        // ... populate all fields
      });

      // 8. Set wallpaper
      await this.desktopService.setWallpaper(imageResult.local_path);

      return {
        success: true,
        imagePath: imageResult.local_path,
        diaryEntry,
        duration_ms: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        imagePath: '',
        duration_ms: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
```

---

## Services - Interfacce Dettagliate

### 1. Character Analyzer

```typescript
export interface ICharacterAnalyzer {
  loadAllCharacters(): Promise<Character[]>;
  getCharacterById(id: string): Promise<Character>;
  selectCharactersForScenario(
    minCount: number,
    maxCount: number,
    randomnessFactor: number
  ): Promise<Character[]>;
  getCharacterContext(id: string): Promise<string>;
  updateCharacter(id: string, updates: Partial<Character>): Promise<void>;
  validateCharacter(char: Character): ValidationResult;
}

export class CharacterAnalyzer implements ICharacterAnalyzer {
  private cache: Map<string, Character> = new Map();
  private cacheTimestamp: Map<string, number> = new Map();
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 min

  async loadAllCharacters(): Promise<Character[]> {
    // Load from data/characters/
    // Validate each
    // Cache con TTL
  }

  private calculateInterestScore(
    char: Character,
    recentDiary: DiaryEntry[]
  ): number {
    // Logica di scoring come descritto in WORKFLOW.md
  }

  async selectCharactersForScenario(
    minCount: number,
    maxCount: number,
    randomnessFactor: number
  ): Promise<Character[]> {
    const allChars = await this.loadAllCharacters();
    const recentDiary = await diaryManager.getRecentEntries(7);

    // Calculate scores, apply randomness, select
  }
}
```

### 2. Diary Manager

```typescript
export interface IDiaryManager {
  getRecentEntries(days: number): Promise<DiaryEntry[]>;
  getEntriesByTheme(theme: string): Promise<DiaryEntry[]>;
  getCharacterAppearances(characterId: string, days?: number): Promise<DiaryEntry[]>;
  writeEntry(entry: DiaryEntry): Promise<void>;
  searchEntries(query: string): Promise<DiaryEntry[]>;
  getIndex(): Promise<DiaryIndex>;
}

export class DiaryManager implements IDiaryManager {
  async getRecentEntries(days: number): Promise<DiaryEntry[]> {
    // Read data/diary/{date}.json files
    // Load ultimi N giorni
    // Return sorted by date desc
  }

  async writeEntry(entry: DiaryEntry): Promise<void> {
    // Valida entry
    // Salva in data/diary/{date}.json
    // Aggiorna _index.json
  }

  async searchEntries(query: string): Promise<DiaryEntry[]> {
    // Leggere tutta la cartella (o load index)
    // Cercare query in scenario descriptions
    // Return matching entries
  }
}
```

### 3. Scenario Generator

```typescript
export interface IScenarioGenerator {
  generateScenario(
    characters: Character[],
    recentHistory: DiaryEntry[],
    randomnessFactor: number
  ): Promise<Scenario>;
  selectTheme(weights: ThemeWeights): string;
  generateNarrative(chars: Character[], theme: string): Promise<string>;
}

export class ScenarioGenerator implements IScenarioGenerator {
  private themes = ['adventure', 'mystery', 'romance', 'comedy', 'horror'];

  async generateScenario(
    characters: Character[],
    recentHistory: DiaryEntry[],
    randomnessFactor: number
  ): Promise<Scenario> {
    // 1. Analyze character profiles
    // 2. Review recent history for patterns
    // 3. Select theme
    // 4. Generate situation
    // 5. Assign roles
    // 6. Create narrative
  }

  selectTheme(weights: Record<string, number>): string {
    // Weighted random selection based on config weights
  }

  private async generateNarrative(
    chars: Character[],
    theme: string
  ): Promise<string> {
    // Potrebbe usare un piccolo LLM oppure
    // Template-based generation con random selection
  }
}
```

### 4. AI Prompt Engineer

```typescript
export interface IAIPromptEngineer {
  generateImagePrompt(scenario: Scenario, characters: Character[]): Promise<string>;
  getOptimalParams(): GenerationParams;
  enhancePrompt(basePrompt: string): Promise<string>;
}

export class AIPromptEngineer implements IAIPromptEngineer {
  private templates = {
    characters: 'Characters: {descriptions}',
    scene: 'Scene: {setting}, {atmosphere}',
    action: 'Action: {what_happening}',
    style: 'Style: {art_style}, {lighting}',
    quality: 'Quality: {technical_specs}'
  };

  async generateImagePrompt(
    scenario: Scenario,
    characters: Character[]
  ): Promise<string> {
    // 1. Build character descriptions
    // 2. Build scene description
    // 3. Extract action from scenario
    // 4. Determine style tags
    // 5. Combine using template
    // 6. Optional: enhance with LLM
  }

  private buildCharacterDescription(char: Character): string {
    return `${char.name}: ${char.appearance.description}, 
            ${char.appearance.clothing}, 
            distinguishing features: ${char.appearance.distinguishing_features.join(', ')}`;
  }

  private extractStyleTags(theme: string): string[] {
    // Map theme a stile visivo
    const themeStyles = {
      'adventure': ['dynamic', 'epic', 'vibrant'],
      'mystery': ['moody', 'shadowy', 'intricate'],
      'horror': ['dark', 'unsettling', 'intense'],
      'romance': ['soft', 'romantic', 'ethereal'],
      'comedy': ['playful', 'colorful', 'expressive']
    };
    return themeStyles[theme] || [];
  }
}
```

### 5. AI Image Service

```typescript
export interface IAIImageService {
  generateImage(prompt: string, config: AIConfig): Promise<ImageResult>;
  downloadImage(url: string, filePath: string): Promise<void>;
  getServiceStatus(): Promise<ServiceStatus>;
}

export class StableDiffusionService implements IAIImageService {
  constructor(private apiKey: string, private baseUrl: string) {}

  async generateImage(
    prompt: string,
    config: AIConfig
  ): Promise<ImageResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/v1/generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text_prompts: [
            { text: prompt, weight: 1 },
            { text: config.negative_prompt, weight: -1 }
          ],
          cfg_scale: config.guidance_scale,
          steps: config.steps,
          height: config.image_height,
          width: config.image_width,
          samples: 1,
          sampler_id: 'dpmpp_2m_karras'
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      const imageBase64 = data.artifacts[0].base64;

      const filePath = await this.saveImage(imageBase64);

      return {
        url: '',
        local_path: filePath,
        generation_time_ms: Date.now() - startTime,
        seed_used: data.artifacts[0].seed
      };
    } catch (error) {
      throw new Error(`Image generation failed: ${error}`);
    }
  }

  private async saveImage(base64: string): Promise<string> {
    const buffer = Buffer.from(base64, 'base64');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = `data/generated/${timestamp}.png`;
    
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
  }
}
```

### 6. Desktop Service

```typescript
export interface IDesktopService {
  setWallpaper(imagePath: string, display?: number): Promise<void>;
  getActiveWallpaper(): Promise<string>;
  isSupported(): boolean;
}

export class DesktopService implements IDesktopService {
  private platform = process.platform;

  async setWallpaper(imagePath: string, display?: number): Promise<void> {
    const absolutePath = path.resolve(imagePath);

    if (this.platform === 'darwin') {
      await this.setWallpaperMacOS(absolutePath);
    } else if (this.platform === 'win32') {
      await this.setWallpaperWindows(absolutePath);
    } else if (this.platform === 'linux') {
      await this.setWallpaperLinux(absolutePath);
    } else {
      throw new Error('Unsupported platform');
    }

    // Delay to allow system processing
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  private async setWallpaperMacOS(imagePath: string): Promise<void> {
    // Use AppleScript via osascript
    const script = `
      tell application "Finder"
        set desktop picture to POSIX file "${imagePath}"
      end tell
    `;
    // Execute via child_process
  }

  private async setWallpaperWindows(imagePath: string): Promise<void> {
    // Windows Registry modification
    // oppure usar library: windows-wallpaper
  }

  private async setWallpaperLinux(imagePath: string): Promise<void> {
    // Use gsettings o feh command
  }

  isSupported(): boolean {
    return ['darwin', 'win32', 'linux'].includes(this.platform);
  }
}
```

---

## UI Components - React

### 1. Dashboard Page

```typescript
// src/ui/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useGenerator } from '../hooks/useGenerator';
import GenerationStatus from '../components/GenerationStatus';
import CharacterGrid from '../components/CharacterGrid';

export default function Dashboard() {
  const {
    isGenerating,
    lastGeneration,
    nextGeneration,
    manualGenerate,
    generationHistory
  } = useGenerator();

  return (
    <div className="dashboard">
      <h1>The Circus</h1>
      
      <GenerationStatus
        isGenerating={isGenerating}
        lastGeneration={lastGeneration}
        nextGeneration={nextGeneration}
        onManualTrigger={manualGenerate}
      />

      <div className="wallpaper-preview">
        {lastGeneration?.imagePath && (
          <img
            src={`file://${lastGeneration.imagePath}`}
            alt="Current Wallpaper"
          />
        )}
      </div>

      <CharacterGrid />
      
      <div className="stats">
        Total generations: {generationHistory.length}
      </div>
    </div>
  );
}
```

---

## Testing Strategy

### Unit Test Example

```typescript
// tests/unit/services/promptEngineer.test.ts
import { describe, it, expect } from 'vitest';
import { AIPromptEngineer } from '../../../src/services/promptEngineer';

describe('AIPromptEngineer', () => {
  let engineer: AIPromptEngineer;

  beforeEach(() => {
    engineer = new AIPromptEngineer();
  });

  it('should generate valid prompt from scenario', async () => {
    const mockScenario = {
      title: 'Test',
      description: 'A test scenario',
      setting: 'Digital realm',
      theme: 'adventure',
      character_roles: new Map()
    };

    const mockCharacters = [{
      id: 'test_1',
      name: 'Test Character',
      appearance: {
        description: 'A test character'
      }
    }];

    const prompt = await engineer.generateImagePrompt(
      mockScenario,
      mockCharacters
    );

    expect(prompt).toBeTruthy();
    expect(prompt).toContain('Test Character');
    expect(prompt).toContain('Digital realm');
  });
});
```

### Integration Test Example

```typescript
// tests/integration/workflow.test.ts
describe('Complete Generation Workflow', () => {
  it('should complete full generation cycle', async () => {
    const generator = new Generator(
      charAnalyzer,
      diaryManager,
      scenarioGen,
      promptEng,
      aiService,
      desktopService,
      mockConfig
    );

    const result = await generator.generate();

    expect(result.success).toBe(true);
    expect(result.imagePath).toBeTruthy();
    expect(result.duration_ms).toBeGreaterThan(0);
  });
});
```

---

## Configurazione Build

### package.json Dipendenze Chiave

```json
{
  "dependencies": {
    "electron": "^27.0.0",
    "react": "^18.2.0",
    "node-cron": "^3.0.0",
    "fs-extra": "^11.2.0",
    "zod": "^3.22.0",
    "sharp": "^0.33.0",
    "@stability/sdk": "latest",
    "openai": "latest"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "vitest": "^0.34.0",
    "playwright": "^1.40.0",
    "prettier": "^3.1.0",
    "eslint": "^8.54.0",
    "vite": "^5.0.0"
  }
}
```

---

## Prossimi Step Implementazione

1. ✓ Documentazione architettura
2. → Setup progetto TypeScript + Electron + React
3. → Implementare file manager e config manager
4. → Implementare character analyzer
5. → Implementare diary manager
6. → Implementare scenario generator
7. → Implementare prompt engineer
8. → Integrare AI service (inizio con mock)
9. → UI base e hooks
10. → Desktop service
11. → Scheduler
12. → Generator orchestratore
13. → Testing completo
14. → Build e release

