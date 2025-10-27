import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/services/supabase'
import { useAuth } from './AuthContext'
import type { CartItem, Cocktail } from '../../../shared/types'
import toast from 'react-hot-toast'

interface CartContextType {
  cartItems: CartItem[]
  loading: boolean
  addToCart: (cocktail: Cocktail, quantity: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  getCartTotal: () => number
  getCartCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadCart()
    } else {
      setCartItems([])
    }
  }, [user])

  const loadCart = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, cocktail:cocktails(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCartItems(data || [])
    } catch (error: any) {
      console.error('Error loading cart:', error)
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (cocktail: Cocktail, quantity: number) => {
    if (!user) {
      toast.error('Please sign in to add items to cart')
      return
    }

    try {
      // Check if item already in cart
      const existingItem = cartItems.find(item => item.cocktail_id === cocktail.id)

      if (existingItem) {
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + quantity)
      } else {
        // Add new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            cocktail_id: cocktail.id,
            quantity,
          })
          .select('*, cocktail:cocktails(*)')
          .single()

        if (error) throw error

        setCartItems(prev => [data, ...prev])
        toast.success(`${cocktail.name} added to cart`)
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return

    try {
      if (quantity < 1) {
        await removeFromCart(itemId)
        return
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id)
        .select('*, cocktail:cocktails(*)')
        .single()

      if (error) throw error

      setCartItems(prev =>
        prev.map(item => (item.id === itemId ? data : item))
      )
    } catch (error: any) {
      console.error('Error updating cart:', error)
      toast.error('Failed to update cart')
    }
  }

  const removeFromCart = async (itemId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id)

      if (error) throw error

      setCartItems(prev => prev.filter(item => item.id !== itemId))
      toast.success('Item removed from cart')
    } catch (error: any) {
      console.error('Error removing from cart:', error)
      toast.error('Failed to remove item')
    }
  }

  const clearCart = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setCartItems([])
      toast.success('Cart cleared')
    } catch (error: any) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.cocktail?.price || 0) * item.quantity,
      0
    )
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
