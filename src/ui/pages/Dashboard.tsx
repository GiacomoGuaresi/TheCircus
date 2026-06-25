import React, { useEffect, useState } from 'react'
import { useGenerator } from '../hooks/useGenerator'
import { api } from '../hooks/useAPI'
import type { ServiceStatus } from '../../models/types'

export default function Dashboard() {
  const { isGenerating, lastResult, schedulerRunning, nextGeneration, generate, toggleScheduler } = useGenerator()
  const [statuses, setStatuses] = useState<{ image?: ServiceStatus; llm?: ServiceStatus; desktop?: ServiceStatus }>({})

  useEffect(() => {
    Promise.all([
      api.status.aiImage(),
      api.status.aiLLM(),
      api.status.desktop()
    ]).then(([image, llm, desktop]) => {
      setStatuses({ image: image as ServiceStatus, llm: llm as ServiceStatus, desktop: desktop as ServiceStatus })
    })
  }, [])

  const formatTime = (d: Date | null) => {
    if (!d) return '—'
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎪 The Circus</h1>
        <p className="page-subtitle">AI-powered wallpaper generator</p>
      </div>

      {/* Status bar */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <StatusCard label="Image Provider" status={statuses.image} />
        <StatusCard label="LLM Provider" status={statuses.llm} />
        <StatusCard label="Desktop" status={statuses.desktop} />
      </div>

      {/* Main controls */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          className="btn btn-primary"
          onClick={generate}
          disabled={isGenerating}
          style={{ fontSize: 16, padding: '12px 24px' }}
        >
          {isGenerating ? <><span className="spinner" /> Generating…</> : '✨ Generate Now'}
        </button>

        <button
          className={`btn ${schedulerRunning ? 'btn-secondary' : 'btn-ghost'}`}
          onClick={toggleScheduler}
        >
          {schedulerRunning ? '⏸ Pause Auto' : '▶ Start Auto'}
        </button>

        {schedulerRunning && nextGeneration && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Next: {formatTime(nextGeneration)}
          </span>
        )}
      </div>

      {/* Last generation */}
      {lastResult && (
        <div className="card">
          <div className="card-title">Last Generation</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {lastResult.image_path && (
              <img
                src={`file://${lastResult.image_path}`}
                alt="Last generated wallpaper"
                style={{ width: 200, height: 120, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
              />
            )}
            <div>
              {lastResult.success ? (
                <>
                  <span className="badge badge-success">✓ Success</span>
                  <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                    {lastResult.diary_entry?.scenario.title}
                  </p>
                  <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                    {lastResult.duration_ms}ms · {lastResult.diary_entry?.image.provider_used}
                  </p>
                </>
              ) : (
                <>
                  <span className="badge badge-error">✗ Failed</span>
                  <p style={{ marginTop: 8, fontSize: 13, color: 'var(--error)' }}>{lastResult.error}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusCard({ label, status }: { label: string; status?: ServiceStatus }) {
  if (!status) return (
    <div className="card">
      <div className="card-title">{label}</div>
      <div className="spinner" style={{ width: 16, height: 16 }} />
    </div>
  )

  return (
    <div className="card">
      <div className="card-title">{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className={`badge ${status.available ? 'badge-success' : 'badge-error'}`}>
          {status.available ? '● Online' : '● Offline'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{status.provider}</span>
      </div>
      {status.latency_ms !== undefined && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{status.latency_ms}ms</p>
      )}
      {status.error && (
        <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 4 }}>{status.error}</p>
      )}
    </div>
  )
}
