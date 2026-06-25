import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Characters from './pages/Characters'
import Settings from './pages/Settings'
import Diary from './pages/Diary'
import './styles/global.css'

type Page = 'dashboard' | 'characters' | 'diary' | 'settings'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-emoji">🎪</span>
          <span className="logo-text">The Circus</span>
        </div>
        <ul className="sidebar-nav">
          {([
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'characters', label: 'Characters', icon: '🎭' },
            { id: 'diary', label: 'Diary', icon: '📔' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ] as const).map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="content">
        {page === 'dashboard' && <Dashboard />}
        {page === 'characters' && <Characters />}
        {page === 'diary' && <Diary />}
        {page === 'settings' && <Settings />}
      </main>
    </div>
  )
}
