import { createClient } from '@supabase/supabase-js'

const envUrl = import.meta.env.VITE_SUPABASE_URL
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'twyzqcziynovswqakyco'
const fallbackUrl = `https://${projectId}.supabase.co`
const url = envUrl && !envUrl.includes('lovable.cloud') ? envUrl : fallbackUrl
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_WlUkbu1KmJZUfECvfFn3TA_hueEtHeT'

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Add them to .env.local.')
}

export const supabase = createClient(url, key)
