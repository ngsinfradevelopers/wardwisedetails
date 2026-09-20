import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../store/db.js'
import PhotoUpload from '../components/PhotoUpload.jsx'

const VOTER_RE = /^[A-Za-z]{3}\d{7}$/
const PHONE_RE = /^\d{10}$/
const EMPTY = {
  committeeType: '', committeeLevel: '', designation: '',
  surname: '', name: '', fatherHusband: '', age: '', voterId: '', phone: '',
  gender: '', qualification: '', profession: '', caste: '', casteCategory: '', subCaste: '',
  village: 'Santhyamguluru', district: 'Prakasam', mandal: '', ward: '', status: 'Pending', photo: null,
}

export default function Register() {
  const { id } = useParams()
  const nav = useNavigate()
  const [settings, setSettings] = useState(db.getSettings())
  const [portalWards, setPortalWards] = useState([])
  const [castes, setCastes] = useState([])
  const [subCastes, setSubCastes] = useState([])
  const isEdit = !!id
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    Promise.all([db.fetchWards(), db.fetchCastes()]).then(([wardsFromDb, castesFromDb]) => {
      setPortalWards(wardsFromDb)
      setCastes(castesFromDb)
      const mandals = [...new Set(wardsFromDb.map(ward => ward.mandal).filter(Boolean))]
      if (mandals.length) setSettings(current => ({ ...current, mandals: mandals.map(name => ({ name, wards: wardsFromDb.filter(ward => ward.mandal === name).map(ward => ward.label) })) }))
    }).catch(error => setLoadError(error.message))
  }, [])

  useEffect(() => {
    if (isEdit) {
      db.getRegistration(id).then(r => { if (r) setForm({ ...EMPTY, ...r }) }).catch(error => setLoadError(error.message))
    }
  }, [id])

  useEffect(() => {
    const caste = castes.find(item => item.name === form.caste)
    if (caste) db.fetchSubCastes(caste.id).then(setSubCastes).catch(error => setLoadError(error.message))
    else setSubCastes([])
  }, [castes, form.caste])

  const wards = useMemo(() => portalWards.filter(ward => ward.mandal === form.mandal), [form.mandal, portalWards])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const sel = (k, label, options, required = true) => (
    <div className="field">
      <label>{label}{required ? ' *' : ' (Optional)'}</label>
      <select value={form[k] || ''} onChange={e => set(k, e.target.value)}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[k] && <small className="error">{errors[k]}</small>}
    </div>
  )

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.fatherHusband.trim()) e.fatherHusband = "Father's / husband's name is required"
    const age = Number(form.age)
    if (!form.age || isNaN(age) || age < 18 || age > 100) e.age = 'Age must be 18–100'
    if (!PHONE_RE.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number'
    if (form.voterId && !VOTER_RE.test(form.voterId)) e.voterId = 'Voter ID must be 3 letters + 7 numbers (e.g. ABC1234567)'
    if (!form.gender) e.gender = 'Select gender'
    if (!form.qualification) e.qualification = 'Select qualification'
    if (!form.committeeType) e.committeeType = 'Select committee type'
    if (!form.designation) e.designation = 'Select designation'
    if (!form.committeeLevel) e.committeeLevel = 'Select level'
    if (!form.mandal) e.mandal = 'Select local body'
    if (!form.ward) e.ward = 'Enter / select ward'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async ev => {
    ev.preventDefault()
    if (!validate()) return
    const payload = { ...form, age: Number(form.age), voterId: form.voterId.toUpperCase() }
    try {
      if (isEdit) await db.updateRegistration(id, payload)
      else await db.addRegistration(payload)
      nav('/registrations')
    } catch (error) { setLoadError(error.message) }
  }

  return (
    <form className="stack" onSubmit={submit}>
      {loadError && <p className="error">{loadError}</p>}
      <div className="panel">
        <h3>{isEdit ? 'Edit Registration' : 'New Registration'}</h3>
        <div className="grid2">
          {sel('committeeType', 'Committee Type', settings.committeeTypes.map(c => c.name))}
          {sel('committeeLevel', 'Committee Level', settings.levels)}
          {sel('designation', 'Designation', settings.designations)}
          {sel('status', 'Status', settings.statuses)}
        </div>
      </div>

      <div className="panel">
        <h3>Personal Details</h3>
        <div className="grid2">
          <div className="field">
            <label>Surname (Optional)</label>
            <input value={form.surname} onChange={e => set('surname', e.target.value)} placeholder="Enter the surname" />
          </div>
          <div className="field">
            <label>Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter the full name" />
            {errors.name && <small className="error">{errors.name}</small>}
          </div>
          <div className="field">
            <label>Father/Husband Name *</label>
            <input value={form.fatherHusband} onChange={e => set('fatherHusband', e.target.value)} placeholder="Enter father's or husband's name" />
            {errors.fatherHusband && <small className="error">{errors.fatherHusband}</small>}
          </div>
          <div className="field">
            <label>Age in years *</label>
            <input type="number" min="18" max="100" value={form.age} onChange={e => set('age', e.target.value)} placeholder="Enter age in years (must be 18-100 years old)" />
            {errors.age && <small className="error">{errors.age}</small>}
          </div>
          <div className="field">
            <label>Voter ID (Optional)</label>
            <input value={form.voterId} onChange={e => set('voterId', e.target.value)} placeholder="Enter your 10-character Voter ID (3 letters + 7 numbers)" />
            {errors.voterId && <small className="error">{errors.voterId}</small>}
          </div>
          <div className="field">
            <label>Phone Number *</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Enter your 10-digit mobile number" />
            {errors.phone && <small className="error">{errors.phone}</small>}
          </div>
          {sel('gender', 'Gender', settings.genders)}
          {sel('qualification', 'Qualification', settings.qualifications)}
          {sel('profession', 'Profession', settings.professions, false)}
          <div className="field">
            <label>Caste Category</label>
            <select value={form.casteCategory} onChange={e => setForm(f => ({ ...f, casteCategory: e.target.value, caste: '', subCaste: '' }))}>
              <option value="">Select category</option>
              {settings.casteCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Caste (Optional)</label>
            <select value={form.caste} onChange={e => {
              const c = castes.find(x => x.name === e.target.value)
              setForm(f => ({ ...f, caste: e.target.value, casteCategory: c ? c.category : f.casteCategory, subCaste: '' }))
            }}>
              <option value="">Search or select caste</option>
              {castes.filter(c => !form.casteCategory || c.category === form.casteCategory).map(c => <option key={c.id} value={c.name}>{c.name} ({c.category})</option>)}
            </select>
          </div>
          <div className="field">
            <label>Sub-caste (Optional)</label>
            <select value={form.subCaste} onChange={e => set('subCaste', e.target.value)} disabled={!form.caste}>
              <option value="">Select sub-caste</option>
              {subCastes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Location</h3>
        <div className="grid2">
          <div className="field">
            <label>Village / City</label>
            <input value={form.village} disabled />
          </div>
          <div className="field">
            <label>District</label>
            <input value={form.district} disabled />
          </div>
          {sel('mandal', 'Municipality / Corporation / Mandal', settings.mandals.map(m => m.name))}
          <div className="field">
            <label>Ward Number *</label>
            {wards.length ? (
              <select value={form.ward} onChange={e => set('ward', e.target.value)}>
                <option value="">Select ward</option>
                {wards.map(w => <option key={w.id} value={w.label}>{w.label}</option>)}
              </select>
            ) : (
              <input value={form.ward} onChange={e => set('ward', e.target.value)} placeholder="Enter your ward number" disabled={!form.mandal} />
            )}
            {errors.ward && <small className="error">{errors.ward}</small>}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Upload Your Photograph (Optional)</h3>
        <p className="muted">Upload a clear, recent passport-size photograph</p>
        <PhotoUpload value={form.photo} onChange={v => set('photo', v)} />
      </div>

      <div className="actions-row">
        <button type="button" className="btn ghost" onClick={() => nav('/registrations')}>Cancel</button>
        <button className="btn green">{isEdit ? 'Update Registration' : 'Submit Registration'}</button>
      </div>
    </form>
  )
}
