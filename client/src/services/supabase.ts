import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Helper function to get the current session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('getUserProfile failed:', error)
    throw error
  }
}
