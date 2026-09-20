import React, { useEffect, useMemo, useState } from 'react'
import { db } from '../store/db.js'
import { buildCadrePdf, buildMemberPdf } from '../lib/pdf.js'

export default function Print() {
  const [records, setRecords] = useState([])
  const [mode, setMode] = useState('all')
  const [ward, setWard] = useState('')
  const [fromWard, setFromWard] = useState('13')
  const [toWard, setToWard] = useState('19')
  const [memberId, setMemberId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { db.getRegistrations().then(setRecords).catch(err => setError(err.message)) }, [])

  const wards = [...new Set(records.map(record => record.ward).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const filtered = useMemo(() => records.filter(record => {
    const number = Number.parseInt(String(record.ward).replace(/\D/g, ''), 10)
    if (mode === 'ward') return record.ward === ward
    if (mode === 'range') return number >= Number(fromWard) && number <= Number(toWard)
    if (mode === 'member') return record.id === memberId
    return true
  }), [records, mode, ward, fromWard, toWard, memberId])

  const print = () => {
    const record = mode === 'member' ? filtered[0] : null
    if (mode === 'member' && !record) return
    const html = record ? buildMemberPdf(record) : buildCadrePdf(filtered, mode === 'all' ? 'All Ward Cadre Report' : mode === 'ward' ? `${ward} Cadre Report` : `Ward ${fromWard} to ${toWard} Cadre Report`)
    const popup = window.open('', '_blank')
    if (!popup) return
    popup.document.write(html)
    popup.document.close()
    popup.focus()
    popup.print()
  }

  return (
    <div className="stack">
      <div className="panel">
        <h3>Print Reports</h3>
        <p className="muted">Generate a printable report or save it as PDF.</p>
        {error && <p className="error">{error}</p>}
        <div className="filters">
          <select value={mode} onChange={e => setMode(e.target.value)}>
            <option value="all">All wards</option>
            <option value="range">Ward range</option>
            <option value="ward">Single ward</option>
            <option value="member">Single member</option>
          </select>
          {mode === 'range' && <><input type="number" value={fromWard} onChange={e => setFromWard(e.target.value)} placeholder="From ward" /><input type="number" value={toWard} onChange={e => setToWard(e.target.value)} placeholder="To ward" /></>}
          {mode === 'ward' && <select value={ward} onChange={e => setWard(e.target.value)}><option value="">Select ward</option>{wards.map(item => <option key={item} value={item}>{item}</option>)}</select>}
          {mode === 'member' && <select value={memberId} onChange={e => setMemberId(e.target.value)}><option value="">Select member</option>{records.map(record => <option key={record.id} value={record.id}>{record.name} · {record.ward}</option>)}</select>}
          <button className="btn green" onClick={print} disabled={!filtered.length}>Print / Save PDF</button>
        </div>
        <p className="muted">{filtered.length} record{filtered.length === 1 ? '' : 's'} selected.</p>
      </div>
    </div>
  )
}
