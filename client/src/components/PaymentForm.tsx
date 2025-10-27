import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

interface PaymentFormProps {
  clientSecret: string
  onSuccess: () => void
  onError: (error: string) => void
  disabled?: boolean
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  onSuccess,
  onError,
  disabled = false
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (disabled) {
      return
    }

    setProcessing(true)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (error) {
        throw new Error(error.message || 'Payment failed')
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!')
        onSuccess()
      } else {
        throw new Error('Payment was not successful')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Payment failed')
      onError(error.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
        backgroundColor: '#1f1f2e',
      },
      invalid: {
        color: '#e94560',
        iconColor: '#e94560',
      },
    },
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-accent-primary" />
        <h2 className="text-2xl font-semibold">Payment Information</h2>
      </div>

      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-2">
          Card Details
        </label>
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={!stripe || processing || disabled}
        whileHover={{ scale: disabled || processing ? 1 : 1.02 }}
        whileTap={{ scale: disabled || processing ? 1 : 0.98 }}
        className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </motion.button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your payment is secure and encrypted
      </p>
    </motion.form>
  )
}
