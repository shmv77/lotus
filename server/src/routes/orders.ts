import { Router } from 'express'
import * as ordersController from '../controllers/orders.js'
import { authMiddleware } from '../middleware/auth.js'
import { createOrderValidation } from '../middleware/validation.js'

const router = Router()

// All order routes require authentication
router.use(authMiddleware)

router.get('/', ordersController.getUserOrders)
router.get('/:id', ordersController.getOrderById)
router.post('/', createOrderValidation, ordersController.createOrder)

export default router
