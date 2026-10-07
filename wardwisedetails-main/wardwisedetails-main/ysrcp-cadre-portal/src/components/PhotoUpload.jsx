import React, { useRef } from 'react'

// Photo upload — max 5MB, PNG/JPG/JPEG, stored as base64 in the record
export default function PhotoUpload({ value, onChange }) {
  const ref = useRef()
  const pick = f => {
    if (!f) return
    if (f.size > 5 * 1024 * 1024) return alert('Image must be under 5MB')
    const r = new FileReader()
    r.onload = () => onChange(r.result)
    r.readAsDataURL(f)
  }
  return (
    <div className="upload" onClick={() => ref.current?.click()}>
      <input ref={ref} type="file" accept="image/png,image/jpeg" hidden onChange={e => pick(e.target.files[0])} />
      {value ? <img src={value} className="preview" alt="candidate" /> : (
        <div className="upload-inner">
          <span className="upload-ico">🖼</span>
          <p>Click to upload photograph</p>
          <small>PNG, JPG, JPEG up to 5MB</small>
        </div>
      )}
      {value && <button type="button" className="remove-photo" onClick={e => { e.stopPropagation(); onChange(null) }}>✕ Remove</button>}
    </div>
  )
}
