import React, { useState } from 'react'
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
  const update = (key, value) => setSettings(current => ({ ...current, [key]: value }))
  const save = () => { db.updateSettings(settings); setSaved(true); window.setTimeout(() => setSaved(false), 1800) }

  return (
    <div className="stack">
      <div className="panel">
        <h3>Portal Settings</h3>
        <p className="muted">Manage the options available on registration forms.</p>
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