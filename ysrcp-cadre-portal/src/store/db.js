import { supabase } from '../lib/supabase.js'

const SETTINGS_KEY = 'ysrcp_cadre_settings_v1'
const DEFAULT_SETTINGS = {
  committeeTypes: [{ id: 'party-core', name: 'Party Core Committee' }, { id: 'affiliated-wing', name: 'Affiliated Wing' }],
  genders: ['Male', 'Female', 'Other'],
  qualifications: ['Illiterate', 'SSC', 'Intermediate', 'Diploma', 'Graduate', 'Post Graduate', 'Other'],
  professions: ['Farmer', 'Student', 'Employee', 'Business', 'Teacher', 'Labour', 'Unemployed', 'Other'],
  castes: [{ name: 'Reddy', category: 'OC' }, { name: 'Kamma', category: 'OC' }, { name: 'Kapu', category: 'BC' }, { name: 'Golla', category: 'BC' }, { name: 'Mala', category: 'SC' }, { name: 'Madiga', category: 'SC' }, { name: 'Yanadi', category: 'ST' }, { name: 'Other', category: 'Other' }],
  casteCategories: ['OC', 'BC', 'SC', 'ST', 'Other'],
  mandals: [{ name: 'Santhyamgulur Mandal', wards: ['Ward-1', 'Ward-2', 'Ward-3', 'Ward-4', 'Ward-5'] }],
  designations: ['President', 'General Secretary', 'Treasurer', 'Vice President', 'Secretary', 'Member'],
  levels: ['District', 'Mandal', 'Ward'],
  statuses: ['Pending', 'Verified', 'Not Verified'],
}

function emit() { window.dispatchEvent(new Event('ysrcp-db-change')) }

function fromRow(row) {
  return { ...row, id: row.ref_code || row.id, name: row.full_name, fatherHusband: row.father_husband, committeeType: row.committee_type, committeeLevel: row.committee_level, voterId: row.voter_id, casteCategory: row.caste_category, ward: row.label || `Ward-${row.ward_no}`, createdBy: row.created_by_name || row.created_by, createdAt: row.created_at, updatedAt: row.updated_at }
}

function toRow(data, user) {
  return { full_name: data.name, surname: data.surname || null, father_husband: data.fatherHusband, age: Number(data.age) || null, voter_id: data.voterId || null, phone: data.phone, gender: data.gender || null, qualification: data.qualification || null, profession: data.profession || null, caste: data.caste || null, caste_category: data.casteCategory || null, sub_caste: data.subCaste || null, committee_type: data.committeeType, committee_level: data.committeeLevel, designation: data.designation, status: data.status || 'Pending', village: data.village || 'Santhyamguluru', district: data.district || 'Prakasam', mandal: data.mandal || '', ward_no: Number.parseInt(String(data.ward).replace(/\D/g, ''), 10), photo: data.photo || null, created_by: user?.id || null, created_by_name: user?.user_metadata?.full_name || user?.email || null }
}

function getSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || DEFAULT_SETTINGS } catch { return DEFAULT_SETTINGS }
}

export const db = {
  async login(email, password) { const { error } = await supabase.auth.signInWithPassword({ email, password }); return { ok: !error, error: error?.message || '' } },
  async logout() { await supabase.auth.signOut() },
  async session() { const { data } = await supabase.auth.getSession(); return data.session?.user || null },
  getSettings,
  updateSettings(value) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(value)); emit() },
  async fetchWards() {
    const { data, error } = await supabase.from('wards').select('id, ward_no, label, mandal, active').eq('active', true).order('ward_no')
    if (error) throw error
    return data || []
  },
  async fetchAllWards() {
    const { data, error } = await supabase.from('wards').select('id, ward_no, label, mandal, active').order('ward_no')
    if (error) throw error
    return data || []
  },
  async updateWard(id, changes) {
    const { error } = await supabase.from('wards').update(changes).eq('id', id)
    if (error) throw error
    emit()
  },
  async addWard(ward) {
    const { data, error } = await supabase.from('wards').insert(ward).select().single()
    if (error) throw error
    emit()
    return data
  },
  async fetchCastes() {
    const { data, error } = await supabase.from('castes').select('id, name, category, sort_order').order('sort_order').order('name')
    if (error) throw error
    return data || []
  },
  async fetchSubCastes(casteId) {
    let query = supabase.from('sub_castes').select('id, caste_id, name, sort_order').order('sort_order').order('name')
    if (casteId) query = query.eq('caste_id', casteId)
    const { data, error } = await query
    if (error) throw error
    return data || []
  },
  async addCaste(caste) {
    const { data, error } = await supabase.from('castes').insert(caste).select().single()
    if (error) throw error
    emit()
    return data
  },
  async addSubCaste(subCaste) {
    const { data, error } = await supabase.from('sub_castes').insert(subCaste).select().single()
    if (error) throw error
    emit()
    return data
  },
  async getRegistrations() { const { data, error } = await supabase.from('cadre').select('*').order('created_at', { ascending: false }); if (error) throw error; return (data || []).map(fromRow) },
  async getRegistration(id) { const { data, error } = await supabase.from('cadre').select('*').eq('ref_code', id).maybeSingle(); if (error) throw error; return data ? fromRow(data) : null },
  async addRegistration(data) { const user = await db.session(); const refCode = `YSRCP-${Date.now()}`; const { data: row, error } = await supabase.from('cadre').insert({ ...toRow(data, user), ref_code: refCode }).select().single(); if (error) throw error; emit(); return fromRow(row) },
  async updateRegistration(id, data) { const { error } = await supabase.from('cadre').update(toRow(data, await db.session())).eq('ref_code', id); if (error) throw error; emit() },
  async deleteRegistration(id) { const { error } = await supabase.from('cadre').delete().eq('ref_code', id); if (error) throw error; emit() },
  async stats() { const registrations = await db.getRegistrations(); const partyCore = registrations.filter(r => r.committeeType === 'Party Core Committee').length; return { total: registrations.length, partyCore, affiliated: registrations.length - partyCore, pct: registrations.length ? Math.round((partyCore / registrations.length) * 100) : 0 } },
}
