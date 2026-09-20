// Simple localStorage "database" layer for the cadre portal
const KEY = 'ysrcp_cadre_db_v1'

const DEFAULT_SETTINGS = {
  committeeTypes: [
    { id: 'party-core', name: 'Party Core Committee' },
    { id: 'affiliated-wing', name: 'Affiliated Wing' },
  ],
  genders: ['Male', 'Female', 'Other'],
  qualifications: ['Illiterate', 'SSC', 'Intermediate', 'Diploma', 'Graduate', 'Post Graduate', 'Other'],
  professions: ['Farmer', 'Student', 'Employee', 'Business', 'Teacher', 'Labour', 'Unemployed', 'Other'],
  castes: [
    { name: 'Reddy', category: 'OC' }, { name: 'Kamma', category: 'OC' },
    { name: 'Kapu', category: 'BC' }, { name: 'Golla', category: 'BC' },
    { name: 'Mala', category: 'SC' }, { name: 'Madiga', category: 'SC' },
    { name: 'Yanadi', category: 'ST' }, { name: 'Other', category: 'Other' },
  ],
  casteCategories: ['OC', 'BC', 'SC', 'ST', 'Other'],
  mandals: [
    { name: 'Santhyamgulur Mandal', wards: ['Ward-1','Ward-2','Ward-3','Ward-4','Ward-5'] },
  ],
  designations: ['President', 'General Secretary', 'Treasurer', 'Vice President', 'Secretary', 'Member'],
  levels: ['District', 'Mandal', 'Ward'],
  statuses: ['Pending', 'Verified', 'Not Verified'],
}

const DEFAULT_USERS = [
  { email: 'gvryouth@gmail.com', password: 'Gvryouth@2244', name: 'Gvr youth' },
]

function seedRegs() {
  const now = new Date().toISOString()
  return [
    {
      id: 'YSRCP-20260831-1788172673-1903-95',
      committeeType: 'Affiliated Wing', committeeLevel: 'District',
      designation: 'General Secretary', surname: '', name: 'Ramakoteswaro K',
      fatherHusband: 'Koteswar Rao', age: 42, voterId: 'CRV7645345',
      phone: '9848199808', gender: 'Male', qualification: 'Graduate',
      profession: 'Business', caste: 'Kapu', casteCategory: 'BC',
      village: 'Santhyamgulur', district: 'Prakasam', mandal: 'Santhyamgulur Mandal',
      ward: 'Ward-3', status: 'Verified', photo: null,
      createdBy: 'P Vijay Kumar', createdAt: now, updatedAt: now,
    },
    {
      id: 'YSRCP-20260831-1788172844-1903-18',
      committeeType: 'Party Core Committee', committeeLevel: 'District',
      designation: 'Treasurer', surname: '', name: 'Chandra mohan Anna',
      fatherHusband: 'Venkatesh', age: 38, voterId: 'ZZB1896447',
      phone: '9440248954', gender: 'Male', qualification: 'Intermediate',
      profession: 'Farmer', caste: 'Reddy', casteCategory: 'OC',
      village: 'Santhyamgulur', district: 'Prakasam', mandal: 'Santhyamgulur Mandal',
      ward: 'Ward-7', status: 'Pending', photo: null,
      createdBy: 'P Vijay Kumar', createdAt: now, updatedAt: now,
    },
  ]
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* fall through to seed */ }
  const db = { settings: DEFAULT_SETTINGS, users: DEFAULT_USERS, registrations: seedRegs() }
  localStorage.setItem(KEY, JSON.stringify(db))
  return db
}
function save(db) { localStorage.setItem(KEY, JSON.stringify(db)) }
function emit() { window.dispatchEvent(new Event('ysrcp-db-change')) }

export const db = {
  login(email, password) {
    const u = load().users.find(u => u.email === email && u.password === password)
    if (u) sessionStorage.setItem('ysrcp_session', JSON.stringify({ email: u.email, name: u.name }))
    return !!u
  },
  logout() { sessionStorage.removeItem('ysrcp_session') },
  session() {
    const s = sessionStorage.getItem('ysrcp_session')
    return s ? JSON.parse(s) : null
  },
  getSettings() { return load().settings },
  updateSettings(settings) { const d = load(); d.settings = settings; save(d); emit() },
  getRegistrations() { return load().registrations.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)) },
  getRegistration(id) { return load().registrations.find(r => r.id === id) || null },
  addRegistration(data) {
    const d = load()
    const stamp = Date.now()
    const id = `YSRCP-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${stamp}-${Math.floor(1000+Math.random()*9000)}`
    const rec = { ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: db.session()?.name || 'Admin' }
    d.registrations.push(rec); save(d); emit()
    return rec
  },
  updateRegistration(id, data) {
    const d = load()
    const i = d.registrations.findIndex(r => r.id === id)
    if (i >= 0) { d.registrations[i] = { ...d.registrations[i], ...data, updatedAt: new Date().toISOString() }; save(d); emit() }
  },
  deleteRegistration(id) {
    const d = load()
    d.registrations = d.registrations.filter(r => r.id !== id)
    save(d); emit()
  },
  stats() {
    const regs = load().registrations
    const partyCore = regs.filter(r => r.committeeType === 'Party Core Committee').length
    return {
      total: regs.length,
      partyCore,
      affiliated: regs.length - partyCore,
      pct: regs.length ? Math.round((partyCore / regs.length) * 100) : 0,
    }
  },
}
