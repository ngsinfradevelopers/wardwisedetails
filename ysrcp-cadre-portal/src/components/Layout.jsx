import React from 'react'
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
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">Y</span>
          <div>
            <strong>YSRCP Cadre</strong>
            <small>Cadre Portal</small>
          </div>
        </div>
        <nav>
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => 'navlink' + (isActive ? ' active' : '')}>
              <span className="navicon">{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <span className="avatar">{displayName[0]}</span>
          <div>
            <strong>{displayName}</strong>
            <button className="link" onClick={async () => { await db.logout(); nav2('/login') }}>Logout ⎋</button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <span className="crumbs">Home / <b>{location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1)}</b></span>
          <span className="top-right"><span className="avatar green">{displayName[0]}</span> {displayName}</span>
        </header>
        <div className="page"><Outlet /></div>
      </main>
    </div>
  )
}
