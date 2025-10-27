import { Router } from 'express'
import * as paymentsController from '../controllers/payments.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/intent', authMiddleware, paymentsController.createPaymentIntent)
router.post('/create-payment-intent', authMiddleware, paymentsController.createPaymentIntent) // Legacy route
router.post('/webhook', paymentsController.handleWebhook)

export default router
