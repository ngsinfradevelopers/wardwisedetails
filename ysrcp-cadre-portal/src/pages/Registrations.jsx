import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CandidateCard from '../components/CandidateCard.jsx'
import { db } from '../store/db.js'

export default function Registrations() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [committee, setCommittee] = useState('')
  const [view, setView] = useState(0)
  const [registrations, setRegistrations] = useState([])
  const [error, setError] = useState('')
  const load = () => db.getRegistrations().then(setRegistrations).catch(err => setError(err.message))
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => registrations.filter(r => {
    const text = `${r.name} ${r.surname} ${r.id} ${r.phone} ${r.voterId}`.toLowerCase()
    return (!query || text.includes(query.toLowerCase())) &&
      (!status || r.status === status) &&
      (!committee || r.committeeType === committee)
  }), [registrations, query, status, committee])

  const remove = async id => {
    try { await db.deleteRegistration(id); await load() } catch (err) { setError(err.message) }
  }

  return (
    <div className="stack">
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
      </div>
      {view === 0 ? filtered.map(r => <CandidateCard key={r.id} r={r} onDelete={remove} />) : (
        <div className="panel">
          {filtered.map(r => (
            <div className="recent-row" key={r.id}>
              {r.photo ? <img src={r.photo} className="mini-photo" alt="" /> : <span className="mini-photo placeholder">{(r.name || '?')[0]}</span>}
              <div><strong>{r.name}{r.surname ? ` ${r.surname}` : ''}</strong><small>{r.id} · {r.committeeType} · {r.designation}</small></div>
              <span className={`pill ${r.status?.replace(' ', '')}`}>{r.status}</span>
              <Link className="btn ghost" to={`/register/${r.id}`}>Edit</Link>
            </div>
          ))}
        </div>
      )}
      {!filtered.length && <div className="panel"><p className="muted">{error || 'No registrations match your filters.'}</p></div>}
    </div>
  )
}