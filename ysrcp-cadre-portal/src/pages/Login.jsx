import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../store/db.js'

// Email + password login only — no OTP
export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const submit = async e => {
    e.preventDefault()
    const ok = await db.login(email.trim().toLowerCase(), password)
    if (ok) nav('/')
    else setErr('Invalid email or password')
  }
  return (
    <div className="login-wrap">
      <div className="login-left">
        <img src="/leaders.jpeg" alt="YSRCP Leaders" className="leader-img" />
        <h2>Sri Y.S. Jagan Mohan Reddy</h2>
        <p>YSRCP Cadre Portal — empowering every cadre, building a better Andhra Pradesh</p>
      </div>
      <form className="login-card" onSubmit={submit}>
        <h3>YSRCP Cadre Registration</h3>
        <small>Sign in to your account</small>
        <label>Email Address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        {err && <p className="error">{err}</p>}
        <button className="btn green block">Sign In</button>
        <small className="hint"> Enter Your password </small>
      </form>
    </div>
  )
}
