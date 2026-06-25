# Strutture Dati

## Profilo Personaggio

### File di Salvataggio
**Locazione**: `data/characters/{character_id}.json`

```json
{
  "id": "string (unique identifier)",
  "name": "string (nome del personaggio)",
  "appearance": {
    "description": "string (descrizione fisica dettagliata per prompt AI)",
    "clothing": "string (abbigliamento e stile)",
    "distinguishing_features": ["array", "di", "caratteristiche", "distintive"],
    "color_palette": ["hex_color_1", "hex_color_2"],
    "art_style_preference": "string (es: 'cyberpunk', 'surreal', 'minimalist')"
  },
  "personality": {
    "traits": ["array", "di", "tratti", "caratteriali"],
    "quirks": "string (peculiarità, abitudini)",
    "dialogue_style": "string (come il personaggio parla)",
    "fears": ["array", "delle", "paure"],
    "desires": ["array", "dei", "desideri"],
    "humor_level": "number (0-100 - quanto è sarcastico/ironico/serio)"
  },
  "history": {
    "backstory": "string (breve storia del personaggio)",
    "past_events": [
      {
        "date": "YYYY-MM-DD",
        "description": "string (evento significativo)"
      }
    ],
    "relationships": {
      "character_id": "relationship_type (es: 'friend', 'rival', 'love_interest')"
    }
  },
  "current_state": {
    "mood": "string (stato emotivo attuale)",
    "energy_level": "number (0-100)",
    "last_action": "string (cosa stava facendo)",
    "current_objective": "string (cosa vuole raggiungere)",
    "notes": "string (note libere sullo stato attuale)"
  },
  "metadata": {
    "created_at": "ISO-8601 timestamp",
    "last_updated": "ISO-8601 timestamp",
    "appearance_last_changed": "ISO-8601 timestamp",
    "creation_method": "string (es: 'manual', 'imported', 'ai_generated')"
  }
}
```

### Esempio Concreto

```json
{
  "id": "jax_001",
  "name": "Jax",
  "appearance": {
    "description": "An abstract humanoid figure with a purple and blue digital aesthetic, constantly glitching and shifting",
    "clothing": "Pixelated suit with LED accents and digital patterns",
    "distinguishing_features": ["glitching_effect", "digital_tail", "pixelated_smile"],
    "color_palette": ["#7B4EDA", "#0096FF", "#00D4FF"],
    "art_style_preference": "digital_surrealism"
  },
  "personality": {
    "traits": ["chaotic", "mischievous", "charming", "unpredictable"],
    "quirks": "Constantly makes jokes at worst moments, never takes things seriously",
    "dialogue_style": "Rapid-fire jokes and abstract references, tends to rhyme",
    "fears": ["boredom", "being ignored"],
    "desires": ["chaos", "entertainment", "connection"],
    "humor_level": 85
  },
  "history": {
    "backstory": "A digital trickster bound to this circus world, always seeking amusement",
    "past_events": [],
    "relationships": {
      "pomni_001": "friend",
      "ragatha_001": "playful_rival"
    }
  },
  "current_state": {
    "mood": "mischievous",
    "energy_level": 95,
    "last_action": "playing pranks on other characters",
    "current_objective": "find something entertaining to do",
    "notes": "Seems unusually quiet lately - plotting something?"
  },
  "metadata": {
    "created_at": "2025-01-01T12:00:00Z",
    "last_updated": "2025-01-15T08:30:00Z",
    "appearance_last_changed": "2025-01-01T12:00:00Z",
    "creation_method": "manual"
  }
}
```

---

## Voce Diario

### File di Salvataggio
**Locazione**: `data/diary/{YYYY-MM-DD}.json`

Una voce per ogni giorno in cui avviene una generazione.

```json
{
  "date": "YYYY-MM-DD",
  "timestamp": "ISO-8601 datetime",
  "scenario": {
    "title": "string (titolo della situazione)",
    "description": "string (descrizione lunga della situazione generata)",
    "setting": "string (dove accade - ambiente/mondo)",
    "theme": "string (tema principale - es: 'adventure', 'mystery', 'romance')",
    "random_seed": "number (seed utilizzato per riproducibilità)",
    "random_factors_applied": {
      "key": "value (fattori casuali usati per generazione)"
    }
  },
  "characters_involved": [
    {
      "character_id": "string",
      "role": "string (ruolo nella scena - es: 'protagonist', 'antagonist')",
      "actions": "string (cosa ha fatto il personaggio)",
      "dialogue": "string (battute principali o riassunto dialogo)",
      "emotional_arc": "string (come si sentiva/evolveva emotivamente)",
      "state_updates": {
        "mood": "string (nuovo mood)",
        "energy_level": "number",
        "notes": "string (cosa ricordare del personaggio)"
      }
    }
  ],
  "worldState": {
    "atmosphere": "string (atmosfera del mondo in quel momento)",
    "environmental_changes": ["array", "di", "cambiamenti", "ambientali"],
    "discovered_locations": ["array", "di", "nuovi", "luoghi"]
  },
  "ai_generation": {
    "image_prompt": "string (prompt utilizzato per generazione immagine)",
    "image_model": "string (quale AI è stato usato)",
    "image_path": "string (path al file immagine generato)",
    "generation_time_ms": "number (tempo di generazione)"
  },
  "narrative_notes": "string (note narrative per capire il contesto)"
}
```

### Esempio Concreto

```json
{
  "date": "2025-01-15",
  "timestamp": "2025-01-15T14:00:00Z",
  "scenario": {
    "title": "The Glitch Fair",
    "description": "A mysterious carnival appears in the digital landscape, filled with malfunctioning games and impossible geometry",
    "setting": "A fractal carnival suspended between dimensions",
    "theme": "adventure",
    "random_seed": 42857,
    "random_factors_applied": {
      "setting_randomness": 0.7,
      "theme_selection": "adventure",
      "character_count": 3
    }
  },
  "characters_involved": [
    {
      "character_id": "jax_001",
      "role": "protagonist",
      "actions": "Led the group through the carnival, making jokes despite obvious dangers",
      "dialogue": "'Welcome to the most dangerous fun you'll have!'",
      "emotional_arc": "Started excited, became cautiously heroic",
      "state_updates": {
        "mood": "adventurous_and_protective",
        "energy_level": 75,
        "notes": "Showed genuine care for group - character development?"
      }
    }
  ],
  "worldState": {
    "atmosphere": "whimsical but eerie",
    "environmental_changes": ["carnival_appeared_suddenly", "gravity_fluctuating"],
    "discovered_locations": ["glitch_fair", "mirror_maze"]
  },
  "ai_generation": {
    "image_prompt": "A surreal digital carnival with glitching effects, fractal geometry, purple and blue neon lights, abstract humanoid figures navigating impossible fairground rides",
    "image_model": "stable_diffusion",
    "image_path": "data/generated/2025-01-15_14-00-00.png",
    "generation_time_ms": 8500
  },
  "narrative_notes": "Jax showed more depth today - worth exploring in future scenarios"
}
```

---

## Struttura di Configurazione Globale

### File di Salvataggio
**Locazione**: `config/config.json`

```json
{
  "app": {
    "name": "The Circus",
    "version": "1.0.0",
    "debug_mode": false
  },
  "scheduling": {
    "interval_hours": 1,
    "enabled": true,
    "timezone": "UTC",
    "preferred_generation_time": "HH:MM (24h format, null for any time)"
  },
  "ai": {
    "provider": "string (es: 'stable_diffusion', 'openai', 'custom')",
    "api_key": "string (API key - gestire in .env)",
    "model": "string (modello specifico)",
    "image_width": 1920,
    "image_height": 1080,
    "quality_preset": "string (es: 'fast', 'balanced', 'maximum')",
    "style_override": "string (null o override globale dello stile)"
  },
  "generation": {
    "randomness_factor": 0.5,
    "consider_recent_history_days": 7,
    "minimum_characters_per_scenario": 1,
    "maximum_characters_per_scenario": 4,
    "theme_weights": {
      "adventure": 0.3,
      "mystery": 0.25,
      "romance": 0.15,
      "comedy": 0.2,
      "horror": 0.1
    }
  },
  "storage": {
    "characters_path": "data/characters/",
    "diary_path": "data/diary/",
    "generated_images_path": "data/generated/",
    "keep_generated_images_days": 30
  },
  "desktop": {
    "auto_set_wallpaper": true,
    "wallpaper_update_delay_seconds": 5
  },
  "advanced": {
    "seed_randomization": true,
    "character_evolution_enabled": true,
    "prompt_enhancement_enabled": true,
    "save_prompts_for_reference": true
  }
}
```

---

## Indice Diario (opzionale ma utile)

### File di Salvataggio
**Locazione**: `data/diary/_index.json`

Per facilitare ricerche veloci nel diario senza caricare tutti i file JSON.

```json
{
  "total_entries": 42,
  "date_range": {
    "first": "2025-01-01",
    "last": "2025-02-11"
  },
  "entries": [
    {
      "date": "2025-01-15",
      "title": "The Glitch Fair",
      "themes": ["adventure", "discovery"],
      "characters": ["jax_001", "pomni_001"],
      "file": "data/diary/2025-01-15.json"
    }
  ],
  "character_appearance_count": {
    "jax_001": 15,
    "pomni_001": 22
  },
  "theme_distribution": {
    "adventure": 18,
    "mystery": 12,
    "comedy": 8,
    "horror": 4
  }
}
```

---

## Note Implementative

1. **Validazione**: Ogni caricamento di profilo deve validare la struttura
2. **Defaults**: Definire valori default sensati per campi opzionali
3. **Versionamento**: Aggiungere versione schema nei file per future migrazioni
4. **Backup**: Sistema di backup automatico della directory `data/`
5. **Encoding**: Usare UTF-8 per tutti i file JSON
