# The Circus - AI-Powered Desktop Wallpaper Generator

## Visione Generale

**The Circus** è un'applicazione desktop che genera wallpaper dinamici basati su AI. Ispirata dalla serie animata *The Amazing Digital Circus*, l'app crea continuamente nuove scene in cui personaggi ricorrenti vivono avventure in mondi digitali.

### Concetto Base
- **Frequenza**: Genera una nuova scena ogni ora (configurabile)
- **Personaggi**: Ogni personaggio ha una propria caratterizzazione (aspetto, personalità, storia)
- **Intelligenza**: Utilizza AI per generare situazioni e immagini basate su fattori casuali e storia precedente
- **Continuità**: Mantiene un diario settimanale che influenza le generazioni future
- **Dinamicità**: Aggiorna automaticamente i profili dei personaggi e registra gli avvenimenti

## Funzionalità Principali

1. **Generazione Automatica**: Ciclo schedulato che genera wallpaper ogni X ore
2. **Sistema di Personaggi**: Profili dettagliati per ogni personaggio con persistenza
3. **AI Image Generation**: Crea immagini basate su prompt generati dal sistema
4. **Diario Dinamico**: Registra gli eventi e consulta la storia passata
5. **Evoluzione dei Personaggi**: Aggiorna i file dei personaggi basandosi su accadimenti rilevanti
6. **Configurabilità**: Parametri di scheduling, liste di personaggi, seed casuali

## Struttura Ad Alto Livello

```
TheCircus/
├── docs/                      # Documentazione
├── src/                       # Codice sorgente
│   ├── core/                  # Logica centrale
│   ├── components/            # Componenti modulari
│   ├── services/              # Servizi (AI, file management, scheduling)
│   ├── models/                # Definizioni dati
│   └── ui/                    # Interfaccia desktop
├── data/                      # Storage dati
│   ├── characters/            # Profili personaggi
│   ├── diary/                 # File diario
│   └── generated/             # Wallpaper generati
├── config/                    # Configurazione
└── package.json              # Dipendenze
```

## Flusso di Lavoro Principale

```
Timer (ogni X ore)
    ↓
Carica profili personaggi
    ↓
Leggi diario (ultimi 7 giorni)
    ↓
Analizza storia e stato personaggi
    ↓
Genera situazione con fattore casuale
    ↓
Crea prompt per AI image generation
    ↓
Genera immagine
    ↓
Aggiorna profili personaggi (se necessario)
    ↓
Registra nel diario
    ↓
Imposta wallpaper desktop
    ↓
Attendi prossimo ciclo
```

## Tecnologie Stack (Proposto)

- **Frontend Desktop**: Electron (TypeScript + React) oppure Tauri
- **Backend/Logica**: Node.js (TypeScript)
- **AI Image**: Stable Diffusion API / OpenAI DALL-E / Midjourney
- **Data Storage**: File system (JSON) oppure SQLite
- **Scheduling**: node-cron o simile
- **Desktop Integration**: node-wallpaper

## Prossimi Passi

1. ✓ Definizione architettura generale
2. → Documentazione strutture dati (personaggi, diario)
3. → Documentazione flusso dettagliato
4. → Design sistema AI prompt generation
5. → Struttura configurazione
