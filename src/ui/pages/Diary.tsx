import React, { useState, useEffect } from 'react'
import { api } from '../hooks/useAPI'
import type { DiaryEntry } from '../../models/types'

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<DiaryEntry | null>(null)

  useEffect(() => {
    api.diary.recent(30).then((e) => {
      setEntries(e as DiaryEntry[])
      setLoading(false)
    })
  }, [])

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (q.trim().length < 2) {
      const all = await api.diary.recent(30) as DiaryEntry[]
      setEntries(all)
    } else {
      const results = await api.diary.search(q) as DiaryEntry[]
      setEntries(results)
    }
  }

  if (loading) return <div style={{ padding: 24 }}><div className="spinner" /></div>

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 48px)' }}>
      {/* List */}
      <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="page-header">
          <h1 className="page-title">📔 Diary</h1>
        </div>

        <input
          className="form-input"
          placeholder="Search entries…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 12 }}
        />

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📔</div>
              <div className="empty-state-title">No entries yet</div>
              <p>Generate a wallpaper to create the first entry</p>
            </div>
          ) : entries.map((e) => (
            <div
              key={e.id}
              className="card"
              style={{ cursor: 'pointer', border: selected?.id === e.id ? '1px solid var(--accent)' : undefined, padding: 12 }}
              onClick={() => setSelected(e)}
            >
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{e.date}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{e.scenario.title}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="badge badge-muted">{e.scenario.theme}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {e.characters_involved.map((c) => c.name).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {selected ? (
          <DiaryDetail entry={selected} />
        ) : (
          <div className="empty-state" style={{ marginTop: 80 }}>
            <div className="empty-state-icon">👈</div>
            <div className="empty-state-title">Select an entry</div>
          </div>
        )}
      </div>
    </div>
  )
}

function DiaryDetail({ entry: e }: { entry: DiaryEntry }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
        <span className="badge badge-muted">{e.scenario.theme}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.timestamp}</span>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{e.scenario.title}</h2>

      {e.image.path && (
        <img
          src={`file://${e.image.path}`}
          alt={e.scenario.title}
          style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
        />
      )}

      <div className="card">
        <div className="card-title">Scenario</div>
        <p style={{ fontSize: 14, marginBottom: 8 }}>{e.scenario.description}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          <strong>Setting:</strong> {e.scenario.setting}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          <strong>Outcome:</strong> {e.scenario.outcome}
        </p>
      </div>

      <div className="card">
        <div className="card-title">Characters</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {e.characters_involved.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span><strong>{c.name}</strong> — {c.role}</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {c.mood_before} → {c.mood_after} · ⚡{c.energy_before}→{c.energy_after}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Generation</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          Provider: {e.image.provider_used} · {e.image.generation_time_ms}ms
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {e.image.prompt_used}
        </p>
      </div>
    </div>
  )
}
