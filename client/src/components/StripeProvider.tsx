import React from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
let stripePromise: Promise<Stripe | null> | null = null

if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey)
}

interface StripeProviderProps {
  children: React.ReactNode
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  // If no Stripe key is configured, render children without Stripe
  if (!stripePromise) {
    console.warn('Stripe publishable key not configured')
    return <>{children}</>
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}

export const isStripeConfigured = () => !!stripePublishableKey
