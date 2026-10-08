import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CandidateCard from '../components/CandidateCard.jsx'
import { db } from '../store/db.js'

export default function Registrations() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [committee, setCommittee] = useState('')
  const [party, setParty] = useState('')
  const [view, setView] = useState(0)
  const [registrations, setRegistrations] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const load = async () => {
    setLoading(true)
    try {
      setRegistrations(await db.getRegistrations())
      setError('')
    } catch (err) {
      setError(err.message || 'Could not load registrations.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [])

  const filtered = useMemo(() => registrations.filter(r => {
    const text = Object.values(r).filter(Boolean).join(' ').toLowerCase()
    return (!query || text.includes(query.toLowerCase())) &&
      (!status || r.status === status) &&
    (!committee || r.committeeType === committee) &&
    (!party || r.partyAffiliation === party)
  }), [registrations, query, status, committee, party])

  const remove = async id => {
    try { await db.deleteRegistration(id); await load() } catch (err) { setError(err.message) }
  }

  return (
    <div className="stack">
      {error && <div className="panel"><p className="error">{error}</p></div>}
      <div className="panel">
        <div className="card-head">
          <div className="card-id">
            <h3>Registrations</h3>
            <p className="muted">{filtered.length} of {registrations.length} records</p>
          </div>
          <Link className="btn green" to="/register">New Registration</Link>
        </div>
        <div className="filters">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, ID, phone or voter ID" />
          <select value={committee} onChange={e => setCommittee(e.target.value)}>
            <option value="">All committees</option>
            <option value="Party Core Committee">Party Core Committee</option>
            <option value="Affiliated Wing">Affiliated Wing</option>
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Not Verified">Not Verified</option>
          </select>
          <div className="view-toggle">
            <button className={view === 0 ? 'on' : ''} onClick={() => setView(0)}>Cards</button>
            <button className={view === 1 ? 'on' : ''} onClick={() => setView(1)}>Compact</button>
          </div>
        </div>
        <div className="party-filters" role="group" aria-label="Filter registrations by party">
          {[['', 'All Parties'], ['Y', 'Party (Y)'], ['N', 'Party (N)'], ['O', 'Party (O)']].map(([value, label]) => {
            const count = value ? registrations.filter(r => r.partyAffiliation === value).length : registrations.length
            return (
              <button
                key={value || 'all'}
                type="button"
                className={`btn ${party === value ? 'green' : 'ghost'}`}
                aria-pressed={party === value}
                onClick={() => setParty(value)}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>
      </div>
      {view === 0 ? filtered.map(r => <CandidateCard key={r.id} r={r} onDelete={remove} />) : (
        <div className="panel">
          {filtered.map(r => (
            <div className="recent-row" key={r.id}>
              {r.photo ? <img src={r.photo} className="mini-photo" alt="" /> : <span className="mini-photo placeholder">{(r.name || '?')[0]}</span>}
              <div><strong>{r.name}{r.surname ? ` ${r.surname}` : ''}</strong><small>{r.id} · {r.partyAffiliation ? `Party (${r.partyAffiliation}) · ` : ''}{r.committeeType} · {r.designation} · Updated {r.updatedAt || r.createdAt ? new Date(r.updatedAt || r.createdAt).toLocaleString('en-IN') : '—'}</small></div>
              <span className={`pill ${r.status?.replace(' ', '')}`}>{r.status}</span>
              <Link className="btn ghost" to={`/register/${r.id}`}>Edit</Link>
            </div>
          ))}
        </div>
      )}
      {!loading && !filtered.length && !error && <div className="panel"><p className="muted">No registrations match your filters.</p></div>}
      {loading && <div className="panel"><p className="muted">Loading registrations...</p></div>}
    </div>
  )
}