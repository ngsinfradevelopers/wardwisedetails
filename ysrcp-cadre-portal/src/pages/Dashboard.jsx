import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../store/db.js'
import StatCard from '../components/StatCard.jsx'
import { useSession } from '../hooks/useSession.js'

const quick = [
  { to: '/register', icon: '👤+', label: 'Register' },
  { to: '/registrations', icon: '⬆', label: 'Registrations' },
  { to: '/settings', icon: '☷', label: 'Settings' },
]

export default function Dashboard() {
  const { displayName } = useSession()
  const [st, setStats] = useState({ total: 0, partyCore: 0, affiliated: 0, pct: 0 })
  const [recent, setRecent] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([db.stats(), db.getRegistrations()])
      .then(([stats, registrations]) => { setStats(stats); setRecent(registrations.slice(0, 5)) })
      .catch(err => setError(err.message))
  }, [])
  return (
    <div className="stack">
      <div className="hero">
        <div>
          <h1>Welcome back, {displayName.split(' ')[0]}</h1>
          <p className="muted">Santhyamgulur — live operational overview</p>
          <div className="stats">
            <StatCard label="TOTAL REGISTRATIONS" value={st.total} tone="t-green" />
            <StatCard label="PARTY CORE" value={st.partyCore} tone="t-blue" />
            <StatCard label="AFFILIATED WINGS" value={st.affiliated} tone="t-gold" />
          </div>
        </div>
        <img src="/leaders.jpeg" className="hero-img" alt="YSRCP leaders" />
      </div>

      <div className="quick-row">
        {quick.map(q => (
          <Link to={q.to} className="quick" key={q.to}>
            <span>{q.icon}</span>
            <p>{q.label}</p>
          </Link>
        ))}
      </div>

      <div className="panel">
        <h3>Committee Split</h3>
        <div className="donut-wrap">
          <div className="donut" style={{ background: `conic-gradient(#16a34a 0 ${st.pct}%, #f59e0b ${st.pct}% 100%)` }}>
            <div className="donut-hole"><strong>{(st.total / 1000).toFixed(1)}K</strong><small>Total</small></div>
          </div>
          <div className="legend">
            <span><i className="dot g" /> Party Core {st.pct}%</span>
            <span><i className="dot o" /> Affiliated {100 - st.pct}%</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Latest 5 Registrations</h3>
        {recent.map(r => (
          <Link to="/registrations" className="recent-row" key={r.id}>
            {r.photo ? <img src={r.photo} className="mini-photo" alt="" /> : <span className="mini-photo placeholder">{(r.name || '?')[0]}</span>}
            <div>
              <strong>{r.name}{r.surname ? ' ' + r.surname : ''}</strong>
              <small>{r.designation} · {r.committeeType} · {r.ward}</small>
            </div>
            <span className={`pill ${r.status?.replace(' ', '')}`}>{r.status}</span>
          </Link>
        ))}
        {!recent.length && <p className="muted">{error || 'No registrations yet.'}</p>}
      </div>
    </div>
  )
}
