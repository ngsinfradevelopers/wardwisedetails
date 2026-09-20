import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../store/db.js'
import PhotoUpload from '../components/PhotoUpload.jsx'

const VOTER_RE = /^[A-Za-z]{3}\d{7}$/
const PHONE_RE = /^\d{10}$/
const EMPTY = {
  committeeType: '', committeeLevel: '', designation: '',
  surname: '', name: '', fatherHusband: '', age: '', voterId: '', phone: '',
  gender: '', qualification: '', profession: '', caste: '', casteCategory: '',
  village: 'Santhyamgulur', district: 'Prakasam', mandal: '', ward: '', status: 'Pending', photo: null,
}

export default function Register() {
  const { id } = useParams()
  const nav = useNavigate()
  const settings = db.getSettings()
  const isEdit = !!id
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit) {
      const r = db.getRegistration(id)
      if (r) setForm({ ...EMPTY, ...r })
    }
  }, [id])

  const wards = useMemo(
    () => settings.mandals.find(m => m.name === form.mandal)?.wards || [],
    [form.mandal, settings]
  )

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

  const submit = ev => {
    ev.preventDefault()
    if (!validate()) return
    const payload = { ...form, age: Number(form.age), voterId: form.voterId.toUpperCase() }
    if (isEdit) db.updateRegistration(id, payload)
    else db.addRegistration(payload)
    nav('/registrations')
  }

  return (
    <form className="stack" onSubmit={submit}>
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
            <label>Caste (Optional)</label>
            <select value={form.caste} onChange={e => {
              const c = settings.castes.find(x => x.name === e.target.value)
              setForm(f => ({ ...f, caste: e.target.value, casteCategory: c ? c.category : f.casteCategory }))
            }}>
              <option value="">Search or select caste</option>
              {settings.castes.map(c => <option key={c.name} value={c.name}>{c.name} ({c.category})</option>)}
            </select>
          </div>
          <div className="field">
            <label>Caste Category</label>
            <select value={form.casteCategory} onChange={e => set('casteCategory', e.target.value)}>
              <option value="">Select category</option>
              {settings.casteCategories.map(c => <option key={c} value={c}>{c}</option>)}
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
                {wards.map(w => <option key={w} value={w}>{w}</option>)}
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
