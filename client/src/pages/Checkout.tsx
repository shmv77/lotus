import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { StripeProvider, isStripeConfigured } from '@/components/StripeProvider'
import { PaymentForm } from '@/components/PaymentForm'
import toast from 'react-hot-toast'

const Checkout = () => {
  const navigate = useNavigate()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    shipping_address: '',
    city: '',
    postal_code: '',
    country: '',
    phone: '',
    notes: '',
  })

  const total = getCartTotal()
  const stripeConfigured = isStripeConfigured()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    // Validate form
    if (!formData.shipping_address || !formData.city || !formData.postal_code || !formData.country || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!stripeConfigured) {
      toast.error('Payment processing is not configured')
      return
    }

    setLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const token = localStorage.getItem('supabase.auth.token')

      // Create order
      const orderResponse = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!orderResponse.ok) {
        const error = await orderResponse.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const orderData = await orderResponse.json()
      const newOrderId = orderData.data.id

      // Create payment intent
      const paymentResponse = await fetch(`${API_URL}/api/payments/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: newOrderId }),
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent')
      }

      const paymentData = await paymentResponse.json()
      setClientSecret(paymentData.data.clientSecret)
      setOrderId(newOrderId)
      toast.success('Order created! Please complete payment.')
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Failed to complete checkout')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      await clearCart()
      toast.success('Order placed successfully!')
      navigate('/profile')
    } catch (error) {
      console.error('Error after payment:', error)
      toast.error('Payment succeeded but there was an error. Please check your profile.')
      navigate('/profile')
    }
  }

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`)
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
            Add some products before checking out
          </p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Browse Products
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-1 gradient-text mb-2">Checkout</h1>
        <p className="text-gray-400">Complete your purchase</p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-accent-primary" />
                <h2 className="text-2xl font-semibold">Shipping Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    required
                    className="input-field w-full"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="input-field w-full"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      required
                      className="input-field w-full"
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="input-field w-full"
                      placeholder="United States"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="input-field w-full"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="input-field w-full"
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Information */}
            {clientSecret ? (
              <StripeProvider>
                <PaymentForm
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  disabled={loading}
                />
              </StripeProvider>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 text-center">
                  <p className="text-gray-400 mb-2">
                    {stripeConfigured
                      ? 'Complete shipping information to proceed to payment'
                      : 'Payment processing not configured'}
                  </p>
                  {!stripeConfigured && (
                    <p className="text-sm text-gray-500">
                      Configure VITE_STRIPE_PUBLISHABLE_KEY in .env to enable payment processing
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 sticky top-24"
            >
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.cocktail?.image_url || 'https://via.placeholder.com/60'}
                      alt={item.cocktail?.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.cocktail?.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold gradient-text">
                        ${((item.cocktail?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dark-700 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="gradient-text">${total.toFixed(2)}</span>
                </div>
              </div>

              {!clientSecret && (
                <motion.button
                  type="submit"
                  disabled={loading || !stripeConfigured}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Create Order'}
                </motion.button>
              )}

              {clientSecret && (
                <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-300">
                    Complete payment above to finalize your order
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout
