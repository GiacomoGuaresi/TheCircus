import React, { useState } from 'react'
import { useCharacters } from '../hooks/useCharacters'
import type { Character } from '../../models/types'

export default function Characters() {
  const { characters, loading, error, saveCharacter, deleteCharacter } = useCharacters()
  const [selected, setSelected] = useState<Character | null>(null)
  const [editing, setEditing] = useState(false)

  if (loading) return <div style={{ padding: 24 }}><div className="spinner" /></div>
  if (error) return <div className="card"><p style={{ color: 'var(--error)' }}>{error}</p></div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">🎭 Characters</h1>
          <p className="page-subtitle">{characters.length} character{characters.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎭</div>
          <div className="empty-state-title">No characters yet</div>
          <p>Add character JSON files to <code>data/characters/</code></p>
        </div>
      ) : (
        <div className="grid grid-auto">
          {characters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              selected={selected?.id === char.id}
              onSelect={() => setSelected(char)}
              onEdit={() => { setSelected(char); setEditing(true) }}
              onDelete={() => deleteCharacter(char.id)}
            />
          ))}
        </div>
      )}

      {editing && selected && (
        <CharacterEditor
          character={selected}
          onSave={async (c) => { await saveCharacter(c); setEditing(false) }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}

function CharacterCard({ character: c, selected, onSelect, onEdit, onDelete }: {
  character: Character
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const moodColors: Record<string, string> = {
    excited: '#ff9800', happy: '#4caf50', tired: '#9e9e9e',
    anxious: '#ff5722', curious: '#2196f3', contemplative: '#9c27b0'
  }
  const moodColor = moodColors[c.current_state.mood] ?? 'var(--text-muted)'

  return (
    <div
      className="card"
      style={{ cursor: 'pointer', border: selected ? '1px solid var(--accent)' : undefined }}
      onClick={onSelect}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); onEdit() }}>Edit</button>
          <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); onDelete() }}>✕</button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{c.appearance.description}</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {c.personality.traits.slice(0, 3).map((t) => (
          <span key={t} className="badge badge-muted">{t}</span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: moodColor }}>● {c.current_state.mood}</span>
        <span style={{ color: 'var(--text-muted)' }}>⚡ {c.current_state.energy_level}%</span>
      </div>

      <div style={{ marginTop: 8, height: 3, background: 'var(--border)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${c.current_state.energy_level}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function CharacterEditor({ character, onSave, onClose }: {
  character: Character
  onSave: (c: Character) => Promise<void>
  onClose: () => void
}) {
  const [draft, setDraft] = useState(JSON.stringify(character, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const parsed = JSON.parse(draft) as Character
      await onSave(parsed)
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="card" style={{ width: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16 }}>Edit {character.name}</h2>
          <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={onClose}>✕</button>
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ flex: 1, minHeight: 400, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: 12, fontFamily: 'monospace', fontSize: 12, resize: 'none' }}
        />

        {error && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 8 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
