# The Circus — AI-Powered Desktop Wallpaper Generator

App desktop (Electron + React + TypeScript) che genera automaticamente wallpaper ogni ora usando AI. Ispirata a *The Amazing Digital Circus*, i personaggi vivono avventure in un mondo digitale surreale, con uno stato che evolve nel tempo.

## Come funziona

```
Scheduler (ogni X ore)
    ↓
Carica personaggi + diario degli ultimi 7 giorni
    ↓
Seleziona 1–3 personaggi (bias verso chi non appare da più tempo)
    ↓
Genera scenario con LLM (Groq / Gemini / Ollama)
    ↓
Costruisce prompt immagine ottimizzato per Stable Diffusion
    ↓
Genera immagine (Pollinations / HuggingFace / Stability)
    ↓
Aggiorna stato personaggi + scrive diario
    ↓
Imposta il wallpaper desktop
```

## Prerequisiti

- Node.js 18+
- npm 9+
- Chiave API per almeno un provider (vedi `.env.example` per i link)

## Quick Start

```bash
# Installa dipendenze
npm install

# Copia e configura le variabili d'ambiente
cp .env.example .env
# Modifica .env con le tue chiavi API

# Avvia in modalità sviluppo
npm run dev
```

Il default usa **Pollinations.ai** (immagini, completamente gratuito, nessuna chiave) e **Groq** (scenari, free tier).

## Providers AI

### Image Generation

| Provider | Costo | Note |
|---|---|---|
| **Pollinations.ai** | Gratis | Nessuna chiave, pronto subito |
| **Hugging Face** | Free tier | FLUX.1-schnell, ottima qualità |
| **Stability.ai** | A pagamento | SDXL, alta qualità |
| **Mock** | Gratis | Solo sviluppo, genera placeholder |

### Language Model (scenario generation)

| Provider | Costo | Note |
|---|---|---|
| **Groq** | Free tier | Llama 3.3 70B, velocissimo |
| **Gemini Flash** | Free tier | 1M token/giorno |
| **Ollama** | Gratis | Locale, nessun limite |
| **Mock** | Gratis | Solo sviluppo |

Cambia provider in `config/config.default.json`:

```json
{
  "ai_image": { "provider": "pollinations" },
  "ai_llm":   { "provider": "groq" }
}
```

## Struttura Progetto

```
src/
├── main.ts                  # Entry point Electron
├── preload.ts               # Bridge IPC renderer↔main
├── core/
│   ├── generator.ts         # Orchestratore generazione
│   └── scheduler.ts         # Cron loop
├── services/
│   ├── ai/
│   │   ├── providers/
│   │   │   ├── image/       # Pollinations, HuggingFace, Stability, Mock
│   │   │   └── llm/         # Groq, Gemini, Ollama, Mock
│   │   ├── AIImageService.ts   # Factory image provider
│   │   └── LLMService.ts       # Factory LLM provider
│   ├── characterAnalyzer.ts
│   ├── diaryManager.ts
│   ├── scenarioGenerator.ts
│   ├── promptEngineer.ts
│   ├── desktopService.ts
│   ├── fileManager.ts
│   └── configManager.ts
├── models/
│   ├── types.ts             # Interfacce TypeScript
│   ├── schemas.ts           # Validazione Zod
│   └── constants.ts
├── ui/                      # React frontend
│   ├── pages/               # Dashboard, Characters, Diary, Settings
│   └── hooks/               # useGenerator, useCharacters, useConfig
└── ipc/                     # Channels + handlers Electron IPC

data/
├── characters/              # Profili personaggi (JSON)
├── diary/                   # Voci diario giornaliero (JSON)
└── generated/               # Wallpaper generati (PNG)

config/
└── config.default.json      # Configurazione default
```

## Aggiungere un Personaggio

Crea un file JSON in `data/characters/`:

```json
{
  "id": "nome_001",
  "name": "Nome Personaggio",
  "appearance": {
    "description": "Descrizione visiva",
    "clothing": "Abiti",
    "distinguishing_features": ["feature1", "feature2"],
    "color_palette": ["#FF6B9D", "#4DC1C1"],
    "art_style_preference": "digital_cartoon"
  },
  "personality": {
    "traits": ["trait1", "trait2"],
    "quirks": "Comportamento caratteristico",
    "dialogue_style": "Come parla",
    "fears": ["paura1"],
    "desires": ["desiderio1"],
    "humor_level": 50
  },
  "history": {
    "backstory": "Storia del personaggio",
    "past_events": [],
    "relationships": {}
  },
  "current_state": {
    "mood": "curious",
    "energy_level": 70,
    "last_action": "exploring",
    "current_objective": "discover the circus",
    "notes": ""
  },
  "metadata": {
    "created_at": "2025-01-15T12:00:00.000Z",
    "last_updated": "2025-01-15T12:00:00.000Z",
    "appearance_last_changed": "2025-01-15T12:00:00.000Z",
    "creation_method": "manual"
  }
}
```

## Comandi

```bash
npm run dev          # Sviluppo con hot reload
npm run build        # Build produzione
npm run type-check   # TypeScript check
npm run test         # Tutti i test
npm run test:watch   # Test in watch mode
npm run test:coverage
```

## Aggiungere un Nuovo Provider AI

### Immagine

1. Crea `src/services/ai/providers/image/MyProvider.ts` implementando `IImageProvider`
2. Aggiungi il case in `AIImageService.createProvider()`
3. Aggiungi il tipo in `ImageProviderName` (`src/models/types.ts`)
4. Aggiungi il case in `AppConfigSchema` (`src/models/schemas.ts`)

### LLM

1. Crea `src/services/ai/providers/llm/MyProvider.ts` implementando `ILLMProvider`
2. Aggiungi il case in `LLMService.createProvider()`
3. Aggiungi il tipo in `LLMProviderName`

## Documentazione Dettagliata

- [Architettura](docs/architecture/ARCHITECTURE.md)
- [Strutture Dati](docs/DATA_STRUCTURES.md)
- [Flusso di Lavoro](docs/WORKFLOW.md)
- [Componenti Tecnici](docs/COMPONENTS_TECH.md)
