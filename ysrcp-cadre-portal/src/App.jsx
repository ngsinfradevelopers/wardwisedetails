import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Register from './pages/Register.jsx'
import Registrations from './pages/Registrations.jsx'
import Settings from './pages/Settings.jsx'
import Print from './pages/Print.jsx'
import { useSession } from './hooks/useSession.js'

function Protected({ children }) {
  const { user, loading } = useSession()
  if (loading) return <div className="page"><p className="muted">Loading session...</p></div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [, force] = useState(0)
  useEffect(() => {
    const fn = () => force(x => x + 1)
    window.addEventListener('ysrcp-db-change', fn)
    return () => window.removeEventListener('ysrcp-db-change', fn)
  }, [])
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="register" element={<Register />} />
        <Route path="register/:id" element={<Register />} />
        <Route path="registrations" element={<Registrations />} />
        <Route path="settings" element={<Settings />} />
        <Route path="print" element={<Print />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
