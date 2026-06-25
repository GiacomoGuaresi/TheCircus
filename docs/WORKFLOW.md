# Flusso di Lavoro Dettagliato

## Ciclo Principale di Generazione

### Fase 1: Inizializzazione e Caricamento

```
1.1 - Scheduler trigger
      └─ Check system availability
      └─ Validate config is valid
      
1.2 - Load character database
      └─ Read all files from data/characters/
      └─ Validate each profile
      └─ Cache in memory with timestamp
      
1.3 - Load recent diary
      └─ Read entries from last 7 days
      └─ Build narrative context
      └─ Index character appearances
      
1.4 - Calculate world state
      └─ Aggregate emotions across characters
      └─ Detect narrative patterns
      └─ Identify unresolved plot threads
```

**Validazioni**:
- Almeno 1 personaggio deve esistere
- Config must be parseable
- Diary entries must have valid dates

---

### Fase 2: Selezione Personaggi

**Input**:
- Lista completa personaggi
- Diario recente
- Configurazione (min/max chars per scenario)
- Fattore casualità (0-1)

**Algoritmo Selezione**:

```
Step 1: Calculate "Interest Score" per personaggio
        ├─ Base score: Random(0, 1)
        ├─ Appearance frequency last 7 days: * 0.8
        │  (personaggi che non compaiono da tempo: +0.5)
        ├─ Unresolved relationships: +0.4
        ├─ Recent emotional changes: +0.3
        └─ Character energy level: map to 0-0.5

Step 2: Seed randomness with config randomness_factor
        └─ randomness_factor ∈ [0, 1]
        └─ 0 = deterministic (same pattern)
        └─ 1 = fully random

Step 3: Select top N characters by score
        ├─ Apply randomness_factor to shuffle
        └─ Clamp between min/max from config

Step 4: Ensure diversity
        └─ If all same "role" type: replace one
```

**Pseudo-codice**:

```typescript
function selectCharacters(
  characters: Character[],
  recentDiary: DiaryEntry[],
  randomnessFactor: number,
  minChars: number,
  maxChars: number
): Character[] {
  
  // 1. Calcola score
  const scores = characters.map(char => {
    const baseScore = Math.random();
    const appearanceFreq = recentDiary.filter(
      d => d.characters_involved.some(c => c.character_id === char.id)
    ).length;
    const appearanceMultiplier = appearanceFreq > 0 ? 
      1 - (appearanceFreq / 7 * 0.8) : 1.5;
    
    return {
      char,
      score: baseScore * appearanceMultiplier
    };
  });
  
  // 2. Applica randomness
  const adjustedScores = scores.map(s => ({
    ...s,
    score: s.score * (1 - randomnessFactor) + 
           Math.random() * randomnessFactor
  }));
  
  // 3. Sort e seleziona
  const selected = adjustedScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChars)
    .map(s => s.char);
  
  // 4. Assicura minimo
  if (selected.length < minChars) {
    selected.push(...characters.slice(0, minChars - selected.length));
  }
  
  return selected;
}
```

---

### Fase 3: Generazione Scenario

**Input**:
- Personaggi selezionati (1-4)
- Configurazione temi
- Diario storico
- Seed casuale

**Processo**:

```
Step 1: Analizza profili personaggi
        ├─ Estrai tratti chiave
        ├─ Identifica desideri/paure
        └─ Rileva relazioni interpersonali

Step 2: Consulta diario per pattern narrativi
        ├─ Cosa è accaduto di recente?
        ├─ Quali temi ricorrono?
        ├─ Quali conflitti sono irrisolti?
        └─ Quali progressioni di character ho?

Step 3: Seleziona tema casualmente
        └─ Usa weight da config
        ├─ adventure: 30%
        ├─ mystery: 25%
        ├─ romance: 15%
        ├─ comedy: 20%
        └─ horror: 10%

Step 4: Genera situazione coerente
        ├─ Tema deve includere i personaggi
        ├─ Deve collegare a storia passata
        ├─ Deve avere conflitto/tensione
        └─ Deve essere visivamente descrittivo

Step 5: Assegna ruoli
        ├─ Identifica: protagonista, antagonista, supporter
        ├─ Basa su personalità e relazioni
        └─ Genera azioni coerenti con carattere

Step 6: Crea arco narrativo
        ├─ Stato iniziale
        ├─ Conflitto/sfida
        ├─ Climax
        └─ Risoluzione
```

**Esempio**:

```
Personaggi: [Jax, Pomni]
Tema selezionato: adventure
Diario recente: Jax è stato tranquillo
Setting: Digital forest with glitching trees

Scenario:
- Jax wakes up in a digital forest (unexpectedly calm)
- Pomni appears confused, lost
- They must navigate impossible geometry
- Jax's calm nature contrasts with Pomni's panic
- They find a strange crystal that shifts reality
- They must decide: take it or leave it?

Arco emozionale:
- Inizio: Jax sereno, Pomni spaventata
- Metà: Bonding, Jax protegge Pomni
- Fine: Incertezza sulla scelta - cliffhanger
```

---

### Fase 4: Generazione Prompt AI

**Input**:
- Scenario dettagliato
- Profili personaggi (apparenza)
- Configurazione stile globale
- Tema

**Processo**:

```
Step 1: Build character descriptions
        └─ Combina appearance + clothing + distinguishing_features

Step 2: Build scene description
        ├─ Setting visivo
        ├─ Atmosfera
        ├─ Azioni principali
        └─ Emozioni da trasmettere

Step 3: Add style tags
        ├─ Art style (es: digital_surrealism)
        ├─ Lighting (es: neon, cinematic)
        ├─ Quality (es: highly detailed)
        └─ Camera (es: wide shot, dynamic)

Step 4: Add negative prompts
        ├─ Cosa evitare
        └─ Cosa scartare

Step 5: Combine in final prompt
        └─ Structure: [characters] [action] [setting] [style] [quality]

Step 6: Enhance with AI
        └─ Optional: usa piccolo LLM per migliorare prompt
```

**Template Prompt**:

```
Characters: {detailed_character_description}

Setting & Atmosphere: {vivid_scene_description}

Action: {what's happening in the scene}

Emotion & Mood: {emotional_tone}

Visual Style: {art_style} with {lighting} lighting, 
{color_palette}, {composition_type}

Technical: {resolution}, highly detailed, professional,
{camera_angle}, dynamic composition

Negative Prompt: blurry, low quality, distorted,
amateur, dark faces, missing limbs, text overlay
```

**Esempio Finale**:

```
A glitched abstract purple figure named Jax with digital effects
and a panicked human-like character named Pomni, navigating
an impossible forest of fractal trees that shift and twist.

The forest exists between digital dimensions with 
neon blue and purple lighting, floating glitch particles,
and surreal gravity anomalies.

They stand at a crossroads discovering a reality-bending crystal
that shimmers with impossible colors. The moment is tense but
hopeful, with visible concern from Jax towards Pomni.

Aesthetic: digital surrealism, cyberpunk, glitch art
Lighting: neon glow with volumetric light rays
Colors: deep purples, electric blues, cyan accents
Composition: cinematic wide shot, dynamic depth

Highly detailed, professional, 1920x1080, intricate lighting,
dynamic composition, surreal perspective

Negative: blurry, low quality, distorted, amateur, dark faces,
missing limbs, text, watermark
```

---

### Fase 5: Generazione Immagine

**Input**:
- Prompt completo
- Parametri generazione da config

**Processo**:

```
Step 1: Prepara parametri per AI service
        ├─ Risoluzione
        ├─ Guidance scale
        ├─ Steps (determinazione qualità vs tempo)
        └─ Seed (per riproducibilità)

Step 2: Invia a provider esterno
        ├─ Handle timeouts (retry logic)
        ├─ Progress tracking
        └─ Error handling

Step 3: Monitor progress
        ├─ Log inizio generazione
        ├─ Track tempo
        └─ Set timeout di sicurezza (max 2 min)

Step 4: Scarica risultato
        ├─ Valida immagine è valida
        ├─ Salva in data/generated/
        ├─ Genera thumbnail
        └─ Calcola hash per deduplicazione

Step 5: Fallback strategy
        ├─ Se fails: retry 2 volte
        ├─ Se fallisce ancora: usa cached image se disponibile
        └─ Ultimo resort: placeholder image
```

**Parametri Raccomandati** (per Stable Diffusion):

```json
{
  "guidance_scale": 7.5,
  "steps": 25,
  "sampler": "DPM++ 2M Karras",
  "negative_prompt_scale": 1.0,
  "seed": random_or_config
}
```

---

### Fase 6: Aggiornamento Profili Personaggi

**Input**:
- Scenario eseguito
- Azioni personaggi
- Risultati

**Processo**:

```
Step 1: Per ogni personaggio in scenario
        
Step 2: Aggiorna state_updates
        ├─ mood (basato su scenario)
        ├─ energy_level (diminuisci da azione)
        ├─ last_action (cosa ha fatto)
        └─ notes (osservazioni)

Step 3: Aggiorna history se significativo
        ├─ Nuovo evento se > threshold importanza
        ├─ Aggiorna relationships se changed
        └─ last_updated timestamp

Step 4: Salva profili aggiornati
        └─ File write con lock
```

**Regole Aggiornamento**:

```
mood: 
  ├─ adventure: energico, curiosity
  ├─ mystery: confuso, intrigato
  └─ romance: sofisticato, tenero

energy_level:
  ├─ Attività intensa: -20 a -30
  ├─ Azione moderata: -10 a -15
  └─ Inattività: +5 a +10
  
Energia rigenera naturalmente nel tempo (~+2 per ora)

Relationships:
  └─ Aggiorna solo se scenario ha interazione significativa
  └─ Change tipo: +0.1 (minor) a +0.5 (major)
```

---

### Fase 7: Scrittura Diary Entry

**Input**:
- Scenario completato
- Immagine generata
- Profili aggiornati

**Processo**:

```
Step 1: Crea entry structure
        ├─ date: today's date
        ├─ timestamp: now
        └─ Popola tutti i campi richiesti

Step 2: Popola scenario details
        ├─ title (memorabile)
        ├─ description (3-4 paragrafi)
        ├─ setting (descrizione mondo)
        ├─ theme (quale tema è stato usato)
        └─ random_seed (per debugging)

Step 3: Popola character involvement
        ├─ Per ogni char in scenario:
        │  ├─ role (protagonist, antagonist, etc)
        │  ├─ actions (cosa ha fatto)
        │  ├─ dialogue (battute/riassunto)
        │  ├─ emotional_arc (come è cambiato emotivamente)
        │  └─ state_updates (nuovo mood, energy, ecc)

Step 4: Popola world state
        ├─ atmosphere
        ├─ environmental_changes
        └─ discovered_locations

Step 5: Popola AI generation metadata
        ├─ image_prompt (usato)
        ├─ image_model (quale service)
        ├─ image_path (dove salvato)
        └─ generation_time_ms (timing)

Step 6: Scrivi file
        ├─ File path: data/diary/{YYYY-MM-DD}.json
        ├─ Se già esiste per oggi: update
        └─ Write with pretty print per leggibilità

Step 7: Aggiorna index
        └─ Aggiungi entry a data/diary/_index.json
```

---

### Fase 8: Impostazione Wallpaper

**Input**:
- Immagine generata salvata

**Processo**:

```
Step 1: Valida immagine
        ├─ File esiste?
        ├─ È valida (PNG/JPG)?
        └─ Dimensioni corrette?

Step 2: Get target display info
        └─ Multi-monitor support

Step 3: Set wallpaper
        ├─ OS-specific implementation
        ├─ Windows: Registry modification
        ├─ macOS: AppleScript / SwiftUI
        └─ Linux: dbus/command-line

Step 4: Delay and verify
        ├─ Wait 5 sec (system processing)
        └─ Verify wallpaper changed successfully

Step 5: Handle failure
        ├─ Log error
        ├─ Retry once
        └─ Continue cycle (immagine salvata per uso manuale)
```

---

## Cicli Secondari

### Ciclo di Evoluzione Giornaliera (Optional)

```
Ogni 24 ore (indipendente dalla generazione):
1. Rileggi diary entry di una settimana fa
2. Per ogni personaggio, decidi se ha "imparato" qualcosa
3. Se sì: aggiorna trait / personality leggermente
4. Ripristina parzialmente energy_level (rigenera)
5. Salva profili aggiornati
```

### Ciclo di Pulizia (Weekly)

```
Ogni domenica 3:00 AM:
1. Cleanup diary entries > 30 giorni
2. Cleanup generated images > 7 giorni
3. Backup completo data/
4. Ottimizza _index.json
5. Valida integrità tutti file
```

---

## Gestione Errori nel Flusso

### Livelli di Errore

```
CRITICAL (Stop cycle):
├─ No characters configured
├─ Config file corrupted
└─ File system not writable

WARNING (Continue, log):
├─ Character profile corrupted → use backup
├─ Diary write failed → skip entry
├─ Wallpaper set failed → log error
└─ AI API timeout → retry

INFO (Just log):
├─ Generation took longer than expected
├─ Character update minor issue
└─ Image quality lower than expected
```

### Recovery Strategy

```
try {
  generate()
} catch (error) {
  if (CRITICAL) {
    logError(error)
    notifyUser("Generation failed")
    stopScheduler()
  } else if (WARNING) {
    logWarning(error)
    continueWithFallback()
  }
}
```

---

## Performance Target

| Fase | Target Time | Tolerance |
|------|------------|-----------|
| Load characters | <1s | <2s |
| Load diary | <500ms | <1s |
| Select characters | <100ms | <200ms |
| Generate scenario | <1s | <2s |
| Create prompt | <500ms | <1s |
| Generate image | 15-30s | <60s |
| Update profiles | <500ms | <1s |
| Write diary | <500ms | <1s |
| Set wallpaper | <3s | <5s |
| **TOTAL** | **~22-35s** | **<60s** |

