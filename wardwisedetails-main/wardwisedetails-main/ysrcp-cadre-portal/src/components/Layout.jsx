import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { db } from '../store/db.js'
import { useSession } from '../hooks/useSession.js'

const nav = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/register', label: 'New Registration', icon: '👤+' },
  { to: '/registrations', label: 'Registrations', icon: '☷' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
  { to: '/print', label: 'Print Reports', icon: '▤' },
]

export default function Layout() {
  const nav2 = useNavigate()
  const { displayName } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return undefined
    const closeOnEscape = event => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  return (
    <div className="shell">
      <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">Y</span>
          <div>
            <strong>YSRCP Cadre</strong>
            <small>Cadre Portal</small>
          </div>
        </div>
        <nav id="main-navigation">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} onClick={() => setMenuOpen(false)} className={({ isActive }) => 'navlink' + (isActive ? ' active' : '')}>
              <span className="navicon">{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <span className="avatar">{displayName[0]}</span>
          <div>
            <strong>{displayName}</strong>
            <button className="link" onClick={async () => { setMenuOpen(false); await db.logout(); nav2('/login') }}>Logout ⎋</button>
          </div>
        </div>
      </aside>
      {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />}
      <main className="main">
        <header className="topbar">
          <span className="crumbs">Home / <b>{location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1)}</b></span>
          <span className="top-right"><span className="avatar green">{displayName[0]}</span> {displayName}</span>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen(open => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>
        <div className="page"><Outlet /></div>
      </main>
    </div>
  )
}
