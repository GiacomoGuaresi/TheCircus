# Architettura del Sistema

## Panoramica Componenti

```
┌─────────────────────────────────────────────────────────────┐
│                    ELECTRON APP (UI)                        │
│              (Status, Settings, Character Editor)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  APPLICATION CORE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Scheduler   │  │  Generator   │  │ File Manager │      │
│  │              │  │              │  │              │      │
│  │ (node-cron)  │  │ (Orchestrator)  │(I/O async)  │      │
│  └──────┬───────┘  └────────┬─────┘  └──────┬───────┘      │
│         │                   │               │               │
│  ┌──────▼────────────────────▼──────────────▼─────┐        │
│  │          Core Services (Modular)              │        │
│  │                                                │        │
│  │  • AI Prompt Engineer       (AI Logic)        │        │
│  │  • Character Analyzer       (Context)         │        │
│  │  • Scenario Generator       (Composition)     │        │
│  │  • Diary Manager            (History)         │        │
│  │  • AI Image Generation      (External API)    │        │
│  │  • Desktop Integration      (OS Interface)    │        │
│  │  • Config Manager           (Settings)        │        │
│  └──────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼────┐  ┌─────▼─────┐  ┌────▼──────────┐
│  FILE SYS  │  │  EXT APIs  │  │ DESKTOP ENV  │
│            │  │            │  │              │
│ data/      │  │ Stable     │  │ Wallpaper    │
│ config/    │  │ Diffusion  │  │ Integration  │
│ docs/      │  │ / DALL-E   │  │              │
└────────────┘  └────────────┘  └───────────────┘
```

## Componenti Dettagliati

### 1. Scheduler (Ciclo Principale)

**Responsabilità**: Gestire timing e trigger della generazione

**Interfaccia**:
```typescript
interface IScheduler {
  start(): Promise<void>
  stop(): Promise<void>
  trigger(): Promise<void>  // Generazione manuale
  getNextExecutionTime(): Date
  getExecutionHistory(): ScheduleLog[]
}
```

**Input**:
- Configurazione timing da `config.json`
- Trigger manuale dall'UI

**Output**:
- Chiamate al Generator quando è ora

---

### 2. Generator (Orchestratore Principale)

**Responsabilità**: Coordinare il flusso completo di generazione

**Algoritmo**:
```
1. Load character profiles
   ↓
2. Load diary (ultimi 7 giorni)
   ↓
3. Analyze current state
   ↓
4. Select characters for scenario
   ↓
5. Generate scenario
   ↓
6. Create AI prompt
   ↓
7. Generate image
   ↓
8. Update character profiles
   ↓
9. Write diary entry
   ↓
10. Set wallpaper
   ↓
11. Emit completion event
```

**Interfaccia**:
```typescript
interface IGenerator {
  generate(): Promise<GenerationResult>
  getGenerationHistory(): GenerationLog[]
  validateEnvironment(): Promise<ValidationResult>
}

interface GenerationResult {
  success: boolean
  imagePath: string
  diaryEntry: DiaryEntry
  timestamp: Date
  duration_ms: number
}
```

---

### 3. Character Analyzer

**Responsabilità**: Analizzare profili e stato attuale dei personaggi

**Funzioni**:
- Caricare profili JSON
- Validare coerenza profili
- Selezionare personaggi rilevanti per scenario
- Estrarre informazioni per prompt AI
- Identificare relazioni e dinamiche
- Calcolare "interessantezza" per selezione casuale

**Interfaccia**:
```typescript
interface ICharacterAnalyzer {
  loadAllCharacters(): Promise<Character[]>
  getCharacterById(id: string): Promise<Character>
  selectCharactersForScenario(count: number): Promise<Character[]>
  getCharacterContext(id: string): Promise<string>  // Testo per AI
  updateCharacter(id: string, updates: Partial<Character>): Promise<void>
}
```

---

### 4. Diary Manager

**Responsabilità**: Gestire persistenza e consultazione della storia

**Funzioni**:
- Leggere voci diario recenti
- Cercare pattern nei diari passati
- Scrivere nuove voci
- Mantenere indice per ricerche veloci
- Pulizia diario vecchio

**Interfaccia**:
```typescript
interface IDiaryManager {
  getRecentEntries(days: number): Promise<DiaryEntry[]>
  getEntriesByTheme(theme: string): Promise<DiaryEntry[]>
  getCharacterAppearances(characterId: string, days: number): Promise<DiaryEntry[]>
  writeEntry(entry: DiaryEntry): Promise<void>
  searchEntries(query: string): Promise<DiaryEntry[]>
}
```

---

### 5. Scenario Generator

**Responsabilità**: Creare una situazione coherente basata su input

**Input**:
- Lista di personaggi selezionati
- Fattore di casualità (0-1)
- Diario recente
- Configurazione temi preferiti

**Output**:
- Descrizione situazione
- Tema
- Ruoli per personaggi
- Azioni/dialogo potenziale

**Logica**:
```typescript
interface IScenarioGenerator {
  generateScenario(
    characters: Character[],
    recentHistory: DiaryEntry[],
    randomnessFactor: number
  ): Promise<Scenario>
}

interface Scenario {
  title: string
  description: string
  setting: string
  theme: string
  character_roles: Map<string, string>  // character_id -> role
  suggested_narrative: string
}
```

---

### 6. AI Prompt Engineer

**Responsabilità**: Trasformare dati grezzi in prompt efficaci per AI

**Input**:
- Scenario
- Descrizioni personaggi
- Tema
- Stile preferenze

**Output**:
- Prompt ottimizzato per AI
- Parametri generazione

**Funzioni**:
```typescript
interface IAIPromptEngineer {
  generateImagePrompt(scenario: Scenario, characters: Character[]): Promise<string>
  getOptimalParams(): GenerationParams
  enhancePrompt(basePrompt: string): Promise<string>
  extractStyleTags(theme: string): string[]
}
```

**Tecnica**: Prompt engineering con template, context injection, style guide

---

### 7. AI Image Generation Service

**Responsabilità**: Interfaccia con servizi AI esterni

**Input**:
- Prompt testuale
- Parametri (risoluzione, steps, etc)
- API credentials

**Output**:
- URL immagine generata
- Metadata generazione

**Interfaccia**:
```typescript
interface IAIImageService {
  generateImage(prompt: string, params: GenerationParams): Promise<ImageResult>
  downloadImage(url: string, filePath: string): Promise<void>
  getServiceStatus(): Promise<ServiceStatus>
}

interface ImageResult {
  url: string
  base64?: string
  local_path?: string
  generation_time_ms: number
  seed_used: number
}
```

**Provider Support**:
- Stable Diffusion (local/API)
- OpenAI DALL-E
- Midjourney (con estensione)

---

### 8. File Manager

**Responsabilità**: Gestire I/O file in modo sicuro e performante

**Operazioni**:
- Lettura/scrittura JSON (personaggi, diario, config)
- Gestione directory
- Backup
- Cleanup file vecchi
- Lock files per concorrenza

**Interfaccia**:
```typescript
interface IFileManager {
  readJSON<T>(path: string): Promise<T>
  writeJSON<T>(path: string, data: T): Promise<void>
  ensureDirectory(path: string): Promise<void>
  backupDirectory(path: string, backupPath: string): Promise<void>
  cleanupOldFiles(dirPath: string, olderThanDays: number): Promise<void>
}
```

---

### 9. Desktop Integration Service

**Responsabilità**: Interagire con OS per wallpaper

**Funzioni**:
- Impostare wallpaper
- Rilevare display multipli
- Gestire fallback per diversi OS

**Interfaccia**:
```typescript
interface IDesktopService {
  setWallpaper(imagePath: string, display?: number): Promise<void>
  getActiveWallpaper(): Promise<string>
  getDisplays(): Promise<Display[]>
  isSupported(): boolean
}
```

---

### 10. Config Manager

**Responsabilità**: Gestire configurazione centralizzata

**Funzioni**:
- Caricare config da file
- Merging con defaults
- Validare config
- Notificare cambiamenti

**Interfaccia**:
```typescript
interface IConfigManager {
  getConfig(): AppConfig
  updateConfig(updates: Partial<AppConfig>): Promise<void>
  resetToDefaults(): Promise<void>
  validate(): ValidationResult
  onConfigChanged(callback: Listener): Unsubscribe
}
```

---

## Flusso di Dati Completo

### Scenario 1: Generazione Schedulata

```
Scheduler fires at scheduled time
    ↓
Generator.generate() is called
    ↓
CharacterAnalyzer loads all characters from disk
    ↓
DiaryManager loads recent entries (last 7 days)
    ↓
Analyzer selects 1-4 characters based on randomness + history
    ↓
ScenarioGenerator creates coherent situation
    ↓
AIPromptEngineer transforms scenario into detailed prompt
    ↓
AIImageService sends prompt to external API
    ↓
Wait for image generation (8-30 seconds)
    ↓
FileManager downloads/saves image
    ↓
CharacterAnalyzer updates relevant character profiles
    ↓
DiaryManager writes new entry with full context
    ↓
DesktopService sets image as wallpaper
    ↓
Event emitted: GenerationCompleted
    ↓
UI updates to show new wallpaper + stats
```

### Scenario 2: Modifica Manuale Personaggio

```
User edits character in UI
    ↓
Character validated
    ↓
FileManager saves updated profile
    ↓
ConfigManager notes profile change timestamp
    ↓
Next generation userà il profilo aggiornato
```

---

## Pattern di Errore e Recovery

### Errori Gestibili

1. **Network timeout (AI API)**
   - Retry con backoff esponenziale (max 3 tentativi)
   - Fallback: usare immagine cache se disponibile
   - Log errore, continua ciclo

2. **Character profile corrupted**
   - Tentare restore da backup
   - Se fallisce, ricreare con defaults
   - Alert all'utente

3. **Diary file locked**
   - Retry con lock timeout
   - Se fallisce, skip entry ma continua

4. **Wallpaper set failed**
   - Log errore
   - Continua ciclo (immagine salvata per uso manuale)

### Errori Fatali

1. **Configurazione invalida**
   - Refuse to start
   - Show error dialog

2. **No characters configured**
   - Refuse to generate
   - Show setup wizard

---

## Performance Considerations

1. **Lazy Loading**: Caricare personaggi solo quando necessario
2. **Caching**: Cache profili personaggi in memoria con invalidazione
3. **Async I/O**: Tutti file operations sono async
4. **Concurrency**: Lock files per operazioni conflittuali
5. **Memory**: Limitare numero di diary entries in memoria
6. **Timeout**: Set timeout per AI API calls (avoid hangs)

---

## Testing Strategy

Per ogni componente:
- **Unit tests**: Logica isolata
- **Integration tests**: Flusso completo con file system mock
- **E2E tests**: Test completo con file system reale
- **Performance tests**: Timing generazione

