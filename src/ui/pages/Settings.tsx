import React from 'react'
import { useConfig } from '../hooks/useConfig'
import type { AppConfig, ImageProviderName, LLMProviderName } from '../../models/types'

const IMAGE_PROVIDERS: { value: ImageProviderName; label: string; free: boolean }[] = [
  { value: 'mock', label: 'Mock (development)', free: true },
  { value: 'pollinations', label: 'Pollinations.ai', free: true },
  { value: 'huggingface', label: 'Hugging Face (FLUX)', free: true },
  { value: 'stability', label: 'Stability.ai', free: false },
  { value: 'replicate', label: 'Replicate', free: false }
]

const LLM_PROVIDERS: { value: LLMProviderName; label: string; free: boolean }[] = [
  { value: 'mock', label: 'Mock (development)', free: true },
  { value: 'groq', label: 'Groq (Llama 3)', free: true },
  { value: 'gemini', label: 'Google Gemini Flash', free: true },
  { value: 'ollama', label: 'Ollama (local)', free: true },
  { value: 'openrouter', label: 'OpenRouter', free: false }
]

export default function Settings() {
  const { config, loading, saving, save, reset } = useConfig()

  if (loading || !config) return <div style={{ padding: 24 }}><div className="spinner" /></div>

  const update = (path: string, value: unknown) => {
    const parts = path.split('.')
    const newConfig = structuredClone(config)
    let obj: Record<string, unknown> = newConfig as unknown as Record<string, unknown>
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]] as Record<string, unknown>
    }
    obj[parts[parts.length - 1]] = value
    save(newConfig)
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">⚙️ Settings</h1>
          <p className="page-subtitle">Configure AI providers and generation parameters</p>
        </div>
        <button className="btn btn-ghost" onClick={reset}>Reset to defaults</button>
      </div>

      {saving && <div style={{ marginBottom: 12 }}><span className="badge badge-success">✓ Saved</span></div>}

      {/* Image Provider */}
      <div className="card">
        <div className="card-title">Image Generation</div>

        <div className="form-group">
          <label className="form-label">Provider</label>
          <select
            className="form-input"
            value={config.ai_image.provider}
            onChange={(e) => update('ai_image.provider', e.target.value)}
          >
            {IMAGE_PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}{p.free ? ' ✓ Free' : ' $ Paid'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-3">
          <div className="form-group">
            <label className="form-label">Width</label>
            <input className="form-input" type="number" value={config.ai_image.width} onChange={(e) => update('ai_image.width', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Height</label>
            <input className="form-input" type="number" value={config.ai_image.height} onChange={(e) => update('ai_image.height', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Steps</label>
            <input className="form-input" type="number" value={config.ai_image.steps} onChange={(e) => update('ai_image.steps', Number(e.target.value))} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Negative Prompt</label>
          <input className="form-input" value={config.ai_image.negative_prompt} onChange={(e) => update('ai_image.negative_prompt', e.target.value)} />
        </div>
      </div>

      {/* LLM Provider */}
      <div className="card">
        <div className="card-title">Language Model (Scenario Generation)</div>

        <div className="form-group">
          <label className="form-label">Provider</label>
          <select
            className="form-input"
            value={config.ai_llm.provider}
            onChange={(e) => update('ai_llm.provider', e.target.value)}
          >
            {LLM_PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}{p.free ? ' ✓ Free' : ' $ Paid'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Temperature</label>
            <input className="form-input" type="number" step="0.1" min="0" max="2" value={config.ai_llm.temperature} onChange={(e) => update('ai_llm.temperature', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Tokens</label>
            <input className="form-input" type="number" value={config.ai_llm.max_tokens} onChange={(e) => update('ai_llm.max_tokens', Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Scheduling */}
      <div className="card">
        <div className="card-title">Scheduling</div>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Interval (hours)</label>
            <input className="form-input" type="number" min="0.1" step="0.5" value={config.generation.interval_hours} onChange={(e) => update('generation.interval_hours', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Randomness Factor (0–1)</label>
            <input className="form-input" type="number" min="0" max="1" step="0.1" value={config.generation.randomness_factor} onChange={(e) => update('generation.randomness_factor', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Min Characters / Scene</label>
            <input className="form-input" type="number" min="1" value={config.generation.minimum_characters_per_scenario} onChange={(e) => update('generation.minimum_characters_per_scenario', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Characters / Scene</label>
            <input className="form-input" type="number" min="1" value={config.generation.maximum_characters_per_scenario} onChange={(e) => update('generation.maximum_characters_per_scenario', Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* API Keys info */}
      <div className="card">
        <div className="card-title">API Keys</div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
          Set API keys in your <code>.env</code> file in the project root:
        </p>
        <pre style={{ background: 'var(--bg-3)', padding: 12, borderRadius: 6, fontSize: 12, color: 'var(--text-muted)' }}>
{`GROQ_API_KEY=...
GEMINI_API_KEY=...
HUGGINGFACE_API_KEY=...
STABILITY_API_KEY=...`}
        </pre>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          <strong>Free providers:</strong> Pollinations (no key), Groq (free tier), Gemini Flash (free tier), Ollama (local)
        </p>
      </div>
    </div>
  )
}
