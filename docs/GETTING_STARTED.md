# Guida di Inizio Rapido (Getting Started)

## Comprensione Rapida del Progetto

### In 30 Secondi
The Circus è un'app desktop che **ogni ora genera automaticamente un nuovo wallpaper**.
- Ogni wallpaper mostra personaggi digitali vivendo avventure in mondi surreali
- Le avventure sono generate con AI (immagini + testo)
- Lo stato dei personaggi evolve nel tempo basandosi su ciò che accade
- Tutto è registrato in un "diario" che influenza le generazioni future

### In 2 Minuti
**Come funziona il ciclo:**
1. Timer schedula una generazione ogni X ore
2. Sistema carica i profili dei personaggi (JSON file con aspetto, personalità)
3. Sistema consulta il diario degli ultimi 7 giorni per capire la storia
4. Seleziona 1-4 personaggi casualmente (con bias verso quelli non visti di recente)
5. Genera una situazione coerente con la storia passata e le personalità
6. Trasforma la situazione in un prompt dettagliato per AI
7. Genera un'immagine usando Stable Diffusion/DALL-E
8. Aggiorna i profili dei personaggi (mood, energy, storia)
9. Scrive un diario entry con tutti i dettagli
10. Imposta l'immagine come wallpaper desktop
11. Ripete dal punto 1

---

## Documentazione Disponibile

- [**README.md**](../README.md) - Panoramica generale e struttura
- [**DATA_STRUCTURES.md**](../DATA_STRUCTURES.md) - Formato dei file (personaggi, diario, config)
- [**ARCHITECTURE.md**](architecture/ARCHITECTURE.md) - Componenti sistema e interazioni
- [**WORKFLOW.md**](../WORKFLOW.md) - Dettagli algoritmi e flussi di lavoro
- [**COMPONENTS_TECH.md**](../COMPONENTS_TECH.md) - Stack tech e interfacce codice

**👈 Inizia da qui:**
1. Leggi questo file (5 min)
2. Leggi README.md (10 min)
3. Leggi DATA_STRUCTURES.md (15 min)
4. Leggi ARCHITECTURE.md (20 min)
5. Leggi WORKFLOW.md come reference durante implementazione

---

## Setup Iniziale Ambiente

### Prerequisiti
- Node.js 18+ (verifica: `node --version`)
- npm 9+ (verifica: `npm --version`)
- Git
- API key per AI service (Stability.ai oppure OpenAI)

### Installazione Progetto

```bash
# Clone repository
cd /Users/giacomoguaresi/Source/GingerRepos/TheCircus

# Installa dipendenze
npm install

# Setup environment
cp .env.example .env
# Modifica .env con tue API keys

# Compila TypeScript
npm run type-check

# Start dev server
npm run dev
```

### Struttura Cartelle Importante

```
data/                 ← Qui finiscono i file runtime
├── characters/       ← Profili personaggi
├── diary/           ← Diario giornaliero
└── generated/       ← Wallpaper generati

config/
└── config.json      ← Configurazione applicazione

src/
├── core/            ← Logica principale
├── services/        ← Moduli specializzati
├── ui/              ← Interfaccia React
└── models/          ← Definizioni TypeScript
```

---

## Creazione Primo Personaggio

### Manualmente (via JSON)

```bash
# 1. Crea file personaggio
cat > data/characters/pomni_001.json << 'EOF'
{
  "id": "pomni_001",
  "name": "Pomni",
  "appearance": {
    "description": "An anxious human-like figure with digital glitches, asymmetrical features",
    "clothing": "Patchwork outfit with mismatched colors",
    "distinguishing_features": ["digital_scars", "glitching_hair", "wide_eyes"],
    "color_palette": ["#FF6B9D", "#FFB6D9", "#4D0015"],
    "art_style_preference": "digital_realism"
  },
  "personality": {
    "traits": ["anxious", "compassionate", "resilient", "overthinking"],
    "quirks": "Fidgets constantly, tries to see good in everyone",
    "dialogue_style": "Rapid speech when nervous, thoughtful when calm",
    "fears": ["being_forgotten", "losing_humanity"],
    "desires": ["escape", "meaning", "connection"],
    "humor_level": 35
  },
  "history": {
    "backstory": "Recently arrived in the Digital Circus, struggling to understand this reality",
    "past_events": [],
    "relationships": {}
  },
  "current_state": {
    "mood": "anxious_but_hopeful",
    "energy_level": 60,
    "last_action": "exploring",
    "current_objective": "understand this world",
    "notes": "New arrival, still confused"
  },
  "metadata": {
    "created_at": "2025-01-01T12:00:00Z",
    "last_updated": "2025-01-01T12:00:00Z",
    "appearance_last_changed": "2025-01-01T12:00:00Z",
    "creation_method": "manual"
  }
}
EOF

# 2. Valida il file
npm run validate-character data/characters/pomni_001.json
```

### Via UI (quando pronta)
```
Dashboard → Characters → Add Character → Form → Save
```

---

## Trigger Generazione Manuale

### Via CLI
```bash
npm run generate
```

### Via API (IPC/HTTP)
```typescript
// Electron IPC
ipcMain.handle('generate-wallpaper', async () => {
  const result = await generator.generate();
  return result;
});
```

### Via UI
```
Dashboard → Generate Now (pulsante)
```

---

## Visualizzare Risultati

### Ultima Generazione
```bash
# Mostra percorso immagine
cat data/diary/_index.json | tail -1
# → "file": "data/generated/2025-01-15_14-00-00.png"

# Apri in preview
open data/generated/2025-01-15_14-00-00.png
```

### Diario Completo
```bash
# Leggi voce di oggi
cat data/diary/2025-01-15.json | jq .

# Cerca scenario di un tema
grep "adventure" data/diary/*.json
```

### Stato Personaggi
```bash
# Vedi come è cambiato un personaggio
cat data/characters/jax_001.json | jq .current_state
```

---

## Checklist Sviluppo

### Fase 1: Setup Base ✓
- [x] Documentazione struttura
- [ ] Setup TypeScript + Electron
- [ ] Setup React + Vite
- [ ] Setup testing framework

### Fase 2: Core Services
- [ ] File Manager (I/O async safe)
- [ ] Config Manager (load/save config)
- [ ] Character Analyzer (load/validate)
- [ ] Diary Manager (read/write)

### Fase 3: Generazione
- [ ] Scenario Generator (create situation)
- [ ] AI Prompt Engineer (optimize prompt)
- [ ] AI Image Service (call API + download)
- [ ] Character Update Logic (evolve profiles)

### Fase 4: Integration
- [ ] Scheduler (cron loop)
- [ ] Generator Orchestrator (coordinate all)
- [ ] Desktop Service (set wallpaper)
- [ ] Error handling & recovery

### Fase 5: UI
- [ ] Dashboard (status + preview)
- [ ] Character Manager (edit profiles)
- [ ] Settings (config editor)
- [ ] Diary Viewer (history search)

### Fase 6: Polish
- [ ] Unit tests (70% coverage min)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Logging system
- [ ] Analytics/metrics

### Fase 7: Release
- [ ] Build process
- [ ] Auto-updates
- [ ] Release notes
- [ ] User documentation

---

## Troubleshooting Comune

### "No characters configured"
```bash
# Soluzione: Crea almeno un file in data/characters/
npm run create-example-character
```

### "Config file invalid"
```bash
# Soluzione: Ripristina defaults
npm run reset-config
```

### "AI API timeout"
```bash
# Aumenta timeout in config.json
"ai": {
  "timeout_ms": 60000  // default 30000
}
```

### "Wallpaper didn't change"
```bash
# Verifica sistema operativo supportato
npm run test-desktop-service

# Prova manualmente
open data/generated/latest.png
# Drag & drop on desktop background
```

### "Diary entry not saved"
```bash
# Verifica permissions directory
ls -la data/diary/
chmod 755 data/diary/

# Prova write test
npm run test-file-manager
```

---

## Performance Target

| Operazione | Target | Hard Limit |
|-----------|--------|-----------|
| Ciclo completo generazione | 30 secondi | 60 secondi |
| Generazione immagine | 15-30 sec | 60 secondi |
| Load characters | <1 sec | <2 sec |
| Save diario | <500 ms | <1 sec |
| Set wallpaper | <3 sec | <5 sec |

Se supera hard limit → Alert all'utente

---

## Comandi Utility

```bash
# Development
npm run dev              # Start dev server con hot reload
npm run build            # Build app
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:coverage    # Coverage report

# Data Management
npm run create-example-character   # Setup demo characters
npm run reset-data                 # Clear all generated data
npm run backup-data                # Backup data/ directory
npm run validate-data              # Check data integrity

# Debugging
npm run debug            # Start con debugger
npm run logs             # View application logs
npm run analyze-performance  # Profile generation

# Clean
npm run clean            # Delete build artifacts
npm run clean:all        # Also delete node_modules
```

---

## Architecture Decision Records (ADR)

### ADR-001: File-Based Storage (vs Database)
**Decisione**: Usare file JSON su disk instead di database
- ✅ Simplicità
- ✅ Portabilità (easy backup)
- ✅ Versioning con git
- ❌ Performance per query complesse (not critical for this app)

### ADR-002: Electron Desktop Framework
**Decisione**: Usare Electron instead di Tauri
- ✅ Maturo ecosystem
- ✅ Easy React integration
- ✅ Multiplatform support
- ❌ Maggior bundle size

### ADR-003: External AI Service
**Decisione**: Usare API esterna (Stability.ai) vs Local Model
- ✅ Qualità immagini superiore
- ✅ Niente GPU required
- ✅ Always latest models
- ❌ Richiede internet + API key

---

## Resource Links

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Stability.ai API](https://platform.stability.ai/docs)
- [OpenAI DALL-E](https://platform.openai.com/docs/guides/images)
- [Node.js File System](https://nodejs.org/api/fs.html)

---

## Contatti e Supporto

- **Issues/Bugs**: Create GitHub issue
- **Feature Requests**: Discuss in PR
- **Documentation**: Update docs/ folder
- **Questions**: Check documentation first

---

## Prossimi Step

1. **Ora**: Leggi questa documentazione
2. **Dopo**: Setup ambiente e installa dipendenze
3. **Poi**: Implementa File Manager + Config Manager
4. **Quindi**: Implementa Character Analyzer
5. **Infine**: Integra tutto nel Generator

**Tempo stimato**: 2-4 settimane per MVP (dipende da una persona vs team)

---

## Changelog Documentazione

- **v1.0** (2025-01-15): Documentazione iniziale completa

