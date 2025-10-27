import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

const Cart = () => {
  const { cartItems, loading, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart()
  const [updating, setUpdating] = useState(false)

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdating(true)
    try {
      await updateQuantity(itemId, newQuantity)
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setUpdating(true)
    try {
      await removeFromCart(itemId)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="section-container flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h1 className="heading-1 gradient-text mb-4">Your Cart is Empty</h1>
          <p className="text-gray-400 text-lg mb-8">
            Add some products to get started!
          </p>
          <Link to="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Browse Products
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  const total = getCartTotal()
  const itemCount = getCartCount()

  return (
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-1 gradient-text mb-2">Shopping Cart</h1>
        <p className="text-gray-400">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex gap-6">
                {/* Product Image */}
                <Link to={`/products/${item.cocktail_id}`}>
                  <img
                    src={item.cocktail?.image_url || 'https://via.placeholder.com/150'}
                    alt={item.cocktail?.name}
                    className="w-32 h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1">
                  <Link to={`/products/${item.cocktail_id}`}>
                    <h3 className="text-xl font-semibold mb-2 hover:text-accent-primary transition-colors">
                      {item.cocktail?.name}
                    </h3>
                  </Link>

                  {item.cocktail?.category && (
                    <p className="text-accent-primary text-sm mb-3">
                      {item.cocktail.category.name}
                    </p>
                  )}

                  <p className="text-2xl font-bold gradient-text mb-4">
                    ${item.cocktail?.price ? Number(item.cocktail.price).toFixed(2) : '0.00'}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 bg-dark-800 border border-dark-700 rounded hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4 mx-auto" />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.cocktail?.stock || 0)}
                        className="w-8 h-8 bg-dark-800 border border-dark-700 rounded hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4 mx-auto" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRemoveItem(item.id)}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </motion.button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-1">Subtotal</p>
                  <p className="text-xl font-bold">
                    ${((item.cocktail?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 sticky top-24"
          >
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal ({itemCount} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span className="text-accent-primary">Calculated at checkout</span>
              </div>
              <div className="border-t border-dark-700 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="gradient-text">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link to="/checkout">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link to="/products">
              <button className="btn-secondary w-full mt-3">
                Continue Shopping
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Cart
