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
    // Get initial session with reduced timeout
    const initializeAuth = async () => {
      try {
        // Reduce timeout to 3 seconds for faster UX
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Session loading timeout')), 3000)
        )

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as Awaited<typeof sessionPromise>

        // Handle session errors (invalid/expired tokens)
        if (error) {
          console.error('Session error:', error)
          // Clear invalid session from localStorage
          await supabase.auth.signOut()
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)

        // Set loading to false immediately so UI renders
        setLoading(false)

        // Load profile in background (non-blocking)
        if (session?.user) {
          loadProfile(session.user.id, session.user).catch(error => {
            console.error('Background profile load failed:', error)
          })
        }
      } catch (error: any) {
        console.error('Error getting session:', error)

        // Check if it's an auth error and clear invalid session
        if (error?.message?.includes('session') || error?.message?.includes('token')) {
          try {
            await supabase.auth.signOut()
          } catch (signOutError) {
            console.error('Error clearing session:', signOutError)
          }
        }

        // If session restoration fails/times out, continue without auth
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)

        // Handle session errors
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully')
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        }

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (session?.user) {
          // Load profile in background (non-blocking)
          loadProfile(session.user.id, session.user).catch(error => {
            console.error('Background profile load failed:', error)
          })
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string, sessionUser?: User | null) => {
    try {
      // Reduce timeout to 5 seconds for faster response
      const profileData = await Promise.race([
        getUserProfile(userId),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Profile loading timeout')), 5000)
        )
      ])
      setProfile(profileData)
    } catch (error: any) {
      console.error('Error loading profile:', error)
      const isMissingRow = error?.code === 'PGRST116' || error?.message?.includes('No rows')
      const isTimeout = error?.message?.includes('timeout')

      if (isTimeout) {
        console.warn('Profile loading timed out, continuing with null profile')
        setProfile(null)
      } else if (isMissingRow && sessionUser) {
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
      // Profile will be loaded by onAuthStateChange
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
      // Profile will be loaded by onAuthStateChange
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success('Signed out successfully')
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error(error.message || 'Failed to sign out')
    } finally {
      setUser(null)
      setProfile(null)
      setSession(null)
      setLoading(false)
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
