import { Response } from 'express'
import supabaseAdmin from '../services/supabase.js'
import { AuthRequest } from '../middleware/auth.js'

export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, full_name } = req.body

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (error) throw error

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    res.status(400).json({ error: error.message })
  }
}

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    res.json({
      message: 'Login successful',
      session: data.session,
      user: data.user,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    res.status(401).json({ error: 'Invalid credentials' })
  }
}

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email)

    if (error) throw error

    res.json({ message: 'Password reset email sent' })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    res.status(400).json({ error: error.message })
  }
}

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error

    res.json({ data: profile })
  } catch (error: any) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { full_name, avatar_url } = req.body

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ full_name, avatar_url })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    res.json({ data, message: 'Profile updated successfully' })
  } catch (error: any) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: error.message })
  }
}
