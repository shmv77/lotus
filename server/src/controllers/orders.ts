import { Response } from 'express'
import { validationResult } from 'express-validator'
import supabaseAdmin from '../services/supabase.js'
import { AuthRequest } from '../middleware/auth.js'

export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ data: orders })
  } catch (error: any) {
    console.error('Get user orders error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { id } = req.params

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    if (!order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    res.json({ data: order })
  } catch (error: any) {
    console.error('Get order error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const userId = req.user!.id
    const { shipping_address, city, postal_code, country, phone, notes } = req.body

    // Get cart items
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart_items')
      .select('*, cocktail:cocktails(*)')
      .eq('user_id', userId)

    if (cartError) throw cartError

    if (!cartItems || cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' })
      return
    }

    // Calculate total
    const total_amount = cartItems.reduce(
      (sum, item) => sum + item.cocktail.price * item.quantity,
      0
    )

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        total_amount,
        shipping_address,
        city,
        postal_code,
        country,
        phone,
        notes,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      cocktail_id: item.cocktail_id,
      cocktail_name: item.cocktail.name,
      cocktail_price: item.cocktail.price,
      quantity: item.quantity,
      subtotal: item.cocktail.price * item.quantity,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Clear cart
    await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    // Fetch complete order with items
    const { data: completeOrder } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', order.id)
      .single()

    res.status(201).json({
      data: completeOrder,
      message: 'Order created successfully',
    })
  } catch (error: any) {
    console.error('Create order error:', error)
    res.status(500).json({ error: error.message })
  }
}
