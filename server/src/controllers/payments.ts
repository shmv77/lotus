import { Request, Response } from 'express'
import Stripe from 'stripe'
import supabaseAdmin from '../services/supabase.js'
import { AuthRequest } from '../middleware/auth.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export const createPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { order_id } = req.body

    // Get order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('user_id', userId)
      .single()

    if (orderError) throw orderError

    if (!order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    if (order.payment_status === 'paid') {
      res.status(400).json({ error: 'Order already paid' })
      return
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total_amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        order_id: order.id,
        user_id: userId,
      },
    })

    // Update order with payment intent ID
    await supabaseAdmin
      .from('orders')
      .update({ payment_intent_id: paymentIntent.id })
      .eq('id', order_id)

    res.json({
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: order.total_amount,
      }
    })
  } catch (error: any) {
    console.error('Create payment intent error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata.order_id

      // Update order status
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
        })
        .eq('id', orderId)

      console.log(`Payment succeeded for order ${orderId}`)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata.order_id

      // Update order status
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', orderId)

      console.log(`Payment failed for order ${orderId}`)
      break
    }

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
}
