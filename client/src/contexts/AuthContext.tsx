import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, getUserProfile } from '@/services/supabase'
import type { Profile } from '../../../shared/types'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateUserProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          loadProfile(session.user.id, session.user)
        } else {
          setLoading(false)
        }
      })
      .catch((error) => {
        console.error('Error getting session:', error)
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id, session.user)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string, sessionUser?: User | null) => {
    setLoading(true)

    try {
      const profileData = await getUserProfile(userId)
      setProfile(profileData)
    } catch (error: any) {
      console.error('Error loading profile:', error)
      console.error('Error details:', error.message, error.hint)
      const isMissingRow = error?.code === 'PGRST116' || error?.message?.includes('No rows')

      if (isMissingRow && sessionUser) {
        try {
          const { data, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: sessionUser.id,
              email: sessionUser.email ?? '',
              full_name: sessionUser.user_metadata?.full_name ?? sessionUser.email ?? '',
              avatar_url: sessionUser.user_metadata?.avatar_url ?? null,
            })
            .select()
            .single()

          if (insertError) throw insertError
          setProfile(data)
        } catch (insertError) {
          console.error('Error creating profile:', insertError)
          setProfile(null)
        }
      } else {
        // If profile doesn't exist or RLS denies access, set profile to null
        setProfile(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      toast.success('Account created successfully!')

      if (data.user) {
        await loadProfile(data.user.id, data.user)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up')
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Welcome back!')

      if (data.user) {
        await loadProfile(data.user.id, data.user)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setProfile(null)
      setSession(null)
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
      throw error
    }
  }

  const updateUserProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
      throw error
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
