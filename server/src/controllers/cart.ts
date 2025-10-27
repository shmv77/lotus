import { Response } from 'express'
import { validationResult } from 'express-validator'
import supabaseAdmin from '../services/supabase.js'
import { AuthRequest } from '../middleware/auth.js'

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const { data: cartItems, error } = await supabaseAdmin
      .from('cart_items')
      .select('*, cocktail:cocktails(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ data: cartItems })
  } catch (error: any) {
    console.error('Get cart error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const userId = req.user!.id
    const { cocktail_id, quantity } = req.body

    // Check if item already in cart
    const { data: existing } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('cocktail_id', cocktail_id)
      .single()

    if (existing) {
      // Update quantity
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select('*, cocktail:cocktails(*)')
        .single()

      if (error) throw error

      res.json({ data, message: 'Cart updated' })
      return
    }

    // Add new item
    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .insert({ user_id: userId, cocktail_id, quantity })
      .select('*, cocktail:cocktails(*)')
      .single()

    if (error) throw error

    res.status(201).json({ data, message: 'Added to cart' })
  } catch (error: any) {
    console.error('Add to cart error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { itemId } = req.params
    const { quantity } = req.body

    if (quantity < 1) {
      res.status(400).json({ error: 'Quantity must be at least 1' })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select('*, cocktail:cocktails(*)')
      .single()

    if (error) throw error

    res.json({ data, message: 'Cart item updated' })
  } catch (error: any) {
    console.error('Update cart item error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { itemId } = req.params

    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId)

    if (error) throw error

    res.json({ message: 'Item removed from cart' })
  } catch (error: any) {
    console.error('Remove from cart error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (error) throw error

    res.json({ message: 'Cart cleared' })
  } catch (error: any) {
    console.error('Clear cart error:', error)
    res.status(500).json({ error: error.message })
  }
}
