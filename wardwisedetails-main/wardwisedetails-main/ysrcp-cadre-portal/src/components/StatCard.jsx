import React from 'react'
export default function StatCard({ label, value, tone }) {
  return (
    <div className={`statcard ${tone || ''}`}>
      <small>{label}</small>
      <strong>{Number(value).toLocaleString('en-IN')}</strong>
    </div>
  )
}
