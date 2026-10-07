import React, { useEffect, useState } from 'react'
import { db } from '../store/db.js'

function ListSetting({ label, values, onChange }) {
  const [value, setValue] = useState('')
  const add = () => {
    const next = value.trim()
    if (next && !values.includes(next)) onChange([...values, next])
    setValue('')
  }
  return (
    <div className="setting-row">
      <label>{label}</label>
      <div className="chips">
        {values.map(item => <span className="chip" key={item}>{item}<button type="button" onClick={() => onChange(values.filter(v => v !== item))}>×</button></span>)}
      </div>
      <div className="inline-add">
        <input value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={`Add ${label.toLowerCase()}`} />
        <button type="button" className="btn ghost" onClick={add}>Add</button>
      </div>
    </div>
  )
}

export default function Settings() {
  const [settings, setSettings] = useState(db.getSettings())
  const [saved, setSaved] = useState(false)
  const [wards, setWards] = useState([])
  const [castes, setCastes] = useState([])
  const [subCastes, setSubCastes] = useState([])
  const [wardDraft, setWardDraft] = useState({ ward_no: '', label: '', mandal: '' })
  const [casteDraft, setCasteDraft] = useState({ name: '', category: 'OC' })
  const [subCasteDraft, setSubCasteDraft] = useState({ caste_id: '', name: '' })
  const [remoteError, setRemoteError] = useState('')
  const update = (key, value) => setSettings(current => ({ ...current, [key]: value }))
  const save = () => { db.updateSettings(settings); setSaved(true); window.setTimeout(() => setSaved(false), 1800) }
  const loadRemote = () => Promise.all([db.fetchAllWards(), db.fetchCastes(), db.fetchSubCastes()]).then(([nextWards, nextCastes, nextSubCastes]) => { setWards(nextWards); setCastes(nextCastes); setSubCastes(nextSubCastes) }).catch(error => setRemoteError(error.message))
  useEffect(() => { loadRemote() }, [])
  const addWard = async event => { event.preventDefault(); try { await db.addWard({ ...wardDraft, ward_no: Number(wardDraft.ward_no), active: true }); setWardDraft({ ward_no: '', label: '', mandal: '' }); await loadRemote() } catch (error) { setRemoteError(error.message) } }
  const addCaste = async event => { event.preventDefault(); try { await db.addCaste({ ...casteDraft, sort_order: 0 }); setCasteDraft({ name: '', category: 'OC' }); await loadRemote() } catch (error) { setRemoteError(error.message) } }
  const addSubCaste = async event => { event.preventDefault(); try { await db.addSubCaste({ ...subCasteDraft, sort_order: 0 }); setSubCasteDraft({ caste_id: '', name: '' }); await loadRemote() } catch (error) { setRemoteError(error.message) } }
  const toggleWard = async ward => { try { await db.updateWard(ward.id, { active: !ward.active }); await loadRemote() } catch (error) { setRemoteError(error.message) } }

  return (
    <div className="stack">
      <div className="panel">
        <h3>Portal Settings</h3>
        <p className="muted">Manage the options available on registration forms.</p>
      </div>
      <div className="panel">
        <h3>Ward, Caste and Sub-caste Data</h3>
        {remoteError && <p className="error">{remoteError}</p>}
        <form className="grid2" onSubmit={addWard}>
          <div className="field"><label>Ward Number</label><input type="number" min="1" value={wardDraft.ward_no} onChange={e => setWardDraft({ ...wardDraft, ward_no: e.target.value })} required /></div>
          <div className="field"><label>Ward Label</label><input value={wardDraft.label} onChange={e => setWardDraft({ ...wardDraft, label: e.target.value })} placeholder="Ward-13" required /></div>
          <div className="field"><label>Mandal</label><input value={wardDraft.mandal} onChange={e => setWardDraft({ ...wardDraft, mandal: e.target.value })} required /></div>
          <div className="actions-row"><button className="btn green">Add Ward</button></div>
        </form>
        <div className="card-details">
          {wards.map(ward => <div className="recent-row" key={ward.id}><strong>{ward.label}</strong><small>{ward.mandal} · Ward {ward.ward_no}</small><button type="button" className="btn ghost" onClick={() => toggleWard(ward)}>{ward.active ? 'Deactivate' : 'Activate'}</button></div>)}
        </div>
        <form className="grid2" onSubmit={addCaste}>
          <div className="field"><label>Caste Name</label><input value={casteDraft.name} onChange={e => setCasteDraft({ ...casteDraft, name: e.target.value })} required /></div>
          <div className="field"><label>Category</label><select value={casteDraft.category} onChange={e => setCasteDraft({ ...casteDraft, category: e.target.value })}>{settings.casteCategories.map(category => <option key={category}>{category}</option>)}</select></div>
          <div className="actions-row"><button className="btn green">Add Caste</button></div>
        </form>
        <form className="grid2" onSubmit={addSubCaste}>
          <div className="field"><label>Caste</label><select value={subCasteDraft.caste_id} onChange={e => setSubCasteDraft({ ...subCasteDraft, caste_id: e.target.value })} required><option value="">Select caste</option>{castes.map(caste => <option key={caste.id} value={caste.id}>{caste.name} ({caste.category})</option>)}</select></div>
          <div className="field"><label>Sub-caste Name</label><input value={subCasteDraft.name} onChange={e => setSubCasteDraft({ ...subCasteDraft, name: e.target.value })} required /></div>
          <div className="actions-row"><button className="btn green">Add Sub-caste</button></div>
        </form>
        <p className="muted">{castes.length} castes · {subCastes.length} sub-castes · {wards.filter(ward => ward.active).length} active wards</p>
      </div>
      <div className="panel">
        <ListSetting label="Genders" values={settings.genders} onChange={value => update('genders', value)} />
        <ListSetting label="Qualifications" values={settings.qualifications} onChange={value => update('qualifications', value)} />
        <ListSetting label="Professions" values={settings.professions} onChange={value => update('professions', value)} />
        <ListSetting label="Designations" values={settings.designations} onChange={value => update('designations', value)} />
        <ListSetting label="Committee Levels" values={settings.levels} onChange={value => update('levels', value)} />
        <ListSetting label="Statuses" values={settings.statuses} onChange={value => update('statuses', value)} />
      </div>
      <div className="actions-row">
        {saved && <span className="muted">Settings saved</span>}
        <button className="btn green" onClick={save}>Save Settings</button>
      </div>
    </div>
  )
}