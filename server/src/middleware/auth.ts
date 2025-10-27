import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role?: string
  }
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      res.status(401).json({ error: 'No token provided' })
      return
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }

    // Get user profile for role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    req.user = {
      id: user.id,
      email: user.email!,
      role: profile?.role || 'user',
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admin only.' })
    return
  }

  next()
}
