function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]))
}

function memberRow(record) {
  return `<tr><td>${escapeHtml(record.name)} ${escapeHtml(record.surname)}</td><td>${escapeHtml(record.ward)}</td><td>${escapeHtml(record.committeeType)}</td><td>${escapeHtml(record.designation)}</td><td>${escapeHtml(record.phone)}</td><td>${escapeHtml(record.status)}</td></tr>`
}

function documentHtml(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;color:#1f2937;padding:28px}h1{color:#1e3a8a}h2{margin-top:24px;color:#1e3a8a}table{border-collapse:collapse;width:100%;margin-top:12px}th,td{border:1px solid #d1d5db;padding:8px;text-align:left;font-size:12px}th{background:#eff6ff}.meta{color:#6b7280;margin-bottom:20px}@media print{body{padding:0}}</style></head><body>${body}</body></html>`
}

export function buildCadrePdf(records, title = 'Cadre Registration Report') {
  const grouped = records.reduce((groups, record) => {
    const key = record.ward || 'Unassigned'
    groups[key] ||= []
    groups[key].push(record)
    return groups
  }, {})
  const sections = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([ward, wardRecords]) => `<h2>${escapeHtml(ward)} (${wardRecords.length})</h2><table><thead><tr><th>Name</th><th>Ward</th><th>Committee</th><th>Designation</th><th>Phone</th><th>Status</th></tr></thead><tbody>${wardRecords.map(memberRow).join('')}</tbody></table>`).join('')
  return documentHtml(title, `<h1>${escapeHtml(title)}</h1><p class="meta">Total records: ${records.length} · Generated: ${new Date().toLocaleString('en-IN')}</p>${sections || '<p>No records found.</p>'}`)
}

export function buildMemberPdf(record) {
  const fields = [['Name', `${record.name || ''} ${record.surname || ''}`], ['Father / Husband', record.fatherHusband], ['Age', record.age], ['Phone', record.phone], ['Voter ID', record.voterId], ['Gender', record.gender], ['Qualification', record.qualification], ['Profession', record.profession], ['Caste', `${record.caste || ''} ${record.subCaste || ''}`], ['Committee', record.committeeType], ['Designation', record.designation], ['Ward', record.ward], ['Mandal', record.mandal], ['Status', record.status]]
  return documentHtml('Cadre Member Sheet', `<h1>Cadre Member Sheet</h1><p class="meta">Reference: ${escapeHtml(record.id)}</p><table>${fields.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('')}</table>`)
}
