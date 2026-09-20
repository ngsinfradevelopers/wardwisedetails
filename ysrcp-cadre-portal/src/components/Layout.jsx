import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { db } from '../store/db.js'

const nav = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/register', label: 'New Registration', icon: '👤+' },
  { to: '/registrations', label: 'Registrations', icon: '☷' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Layout() {
  const nav2 = useNavigate()
  const s = db.session()
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
          <span className="avatar">{(s?.name || 'A')[0]}</span>
          <div>
            <strong>{s?.name || 'Admin'}</strong>
            <button className="link" onClick={() => { db.logout(); nav2('/login') }}>Logout ⎋</button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <span className="crumbs">Home / <b>{location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1)}</b></span>
          <span className="top-right"><span className="avatar green">{(s?.name || 'A')[0]}</span> {s?.name}</span>
        </header>
        <div className="page"><Outlet /></div>
      </main>
    </div>
  )
}
