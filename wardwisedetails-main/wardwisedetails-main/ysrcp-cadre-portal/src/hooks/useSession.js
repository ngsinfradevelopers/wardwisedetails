import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export function useSession() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setUser(data.user || null)
      setLoading(false)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null))
    return () => { mounted = false; subscription.subscription.unsubscribe() }
  }, [])

  return { user, loading, displayName: user?.user_metadata?.full_name || user?.email || 'Admin' }
}
