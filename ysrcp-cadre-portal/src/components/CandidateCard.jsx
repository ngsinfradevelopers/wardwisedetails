import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CandidateCard({ r, onDelete }) {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  return (
    <div className="card">
      <div className="card-head">
        {r.photo
          ? <img src={r.photo} className="photo" alt="" />
          : <span className="photo placeholder">{(r.name || '?')[0]}</span>}
        <div className="card-id">
          <strong>{r.name}{r.surname ? ' ' + r.surname : ''}</strong>
          <small className="tag">{r.id}</small>
        </div>
        <div className="card-actions">
          <button className="btn green" onClick={() => nav(`/register/${r.id}`)}>Edit</button>
          <button className="btn ghost" onClick={() => setOpen(o => !o)}>{open ? 'Hide Details' : 'View Details'}</button>
          <button className="btn red" onClick={() => { if (confirm(`Delete ${r.name}?`)) onDelete(r.id) }}>Delete</button>
        </div>
      </div>
      <div className="card-grid">
        <div><small>COMMITTEE</small><p>{r.committeeType}</p></div>
        <div><small>POSITION</small><p>{r.designation}</p></div>
        <div><small>LEVEL</small><p>{r.committeeLevel}</p></div>
        <div><small>LOCATION</small><p>{r.ward}, {r.mandal}</p></div>
        <div><small>VOTER ID</small><p>{r.voterId || '—'}</p></div>
        <div><small>PHONE</small><p>+91 {r.phone}</p></div>
        <div><small>CREATED</small><p>{new Date(r.createdAt).toLocaleString('en-IN')}</p></div>
        <div><small>STATUS</small><p><span className={`pill ${r.status?.replace(' ', '')}`}>{r.status}</span></p></div>
      </div>
      {open && (
        <div className="card-details">
          <div><small>FATHER / HUSBAND</small><p>{r.fatherHusband}</p></div>
          <div><small>AGE</small><p>{r.age}</p></div>
          <div><small>GENDER</small><p>{r.gender || '—'}</p></div>
          <div><small>QUALIFICATION</small><p>{r.qualification}</p></div>
          <div><small>PROFESSION</small><p>{r.profession || '—'}</p></div>
          <div><small>CASTE</small><p>{r.caste || '—'} {r.casteCategory ? `(${r.casteCategory})` : ''}</p></div>
          <div><small>VILLAGE / CITY</small><p>{r.village}</p></div>
          <div><small>DISTRICT</small><p>{r.district}</p></div>
          <div><small>CREATED BY</small><p>{r.createdBy}</p></div>
          <div><small>LAST MODIFIED</small><p>{new Date(r.updatedAt).toLocaleString('en-IN')}</p></div>
        </div>
      )}
    </div>
  )
}
