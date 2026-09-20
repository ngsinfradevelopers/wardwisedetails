import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://c--199c2ac2-1ae2-4880-8634-4b2f3e47b2f0-prod.lovable.cloud'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_WlUkbu1KmJZUfECvfFn3TA_hueEtHeT'

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Add them to .env.local.')
}

export const supabase = createClient(url, key)
