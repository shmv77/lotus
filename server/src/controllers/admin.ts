import { Response } from 'express'
import { validationResult } from 'express-validator'
import supabaseAdmin from '../services/supabase.js'
import { AuthRequest } from '../middleware/auth.js'

// Product Management
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const productData = req.body

    const { data, error } = await supabaseAdmin
      .from('cocktails')
      .insert(productData)
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ data, message: 'Product created successfully' })
  } catch (error: any) {
    console.error('Create product error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabaseAdmin
      .from('cocktails')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ data, message: 'Product updated successfully' })
  } catch (error: any) {
    console.error('Update product error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('cocktails')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Product deleted successfully' })
  } catch (error: any) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Order Management
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit

    const { data: orders, error, count } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*), user:profiles(email, full_name)', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      data: orders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Get all orders error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ data, message: 'Order status updated' })
  } catch (error: any) {
    console.error('Update order status error:', error)
    res.status(500).json({ error: error.message })
  }
}

// User Management
export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ data: users })
  } catch (error: any) {
    console.error('Get all users error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ data, message: 'User role updated' })
  } catch (error: any) {
    console.error('Update user role error:', error)
    res.status(500).json({ error: error.message })
  }
}

// Analytics
export const getAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get total revenue
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid')

    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0

    // Get total orders
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })

    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get total products
    const { count: totalProducts } = await supabaseAdmin
      .from('cocktails')
      .select('*', { count: 'exact', head: true })

    // Get recent orders
    const { data: recentOrders } = await supabaseAdmin
      .from('orders')
      .select('*, user:profiles(email, full_name)')
      .order('created_at', { ascending: false })
      .limit(10)

    res.json({
      totalRevenue,
      totalOrders: totalOrders || 0,
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      recentOrders: recentOrders || [],
    })
  } catch (error: any) {
    console.error('Get analytics error:', error)
    res.status(500).json({ error: error.message })
  }
}
