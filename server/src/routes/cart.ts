import { Router } from 'express'
import * as cartController from '../controllers/cart.js'
import { authMiddleware } from '../middleware/auth.js'
import { addToCartValidation } from '../middleware/validation.js'

const router = Router()

// All cart routes require authentication
router.use(authMiddleware)

router.get('/', cartController.getCart)
router.post('/items', addToCartValidation, cartController.addToCart)
router.put('/items/:itemId', cartController.updateCartItem)
router.delete('/items/:itemId', cartController.removeFromCart)
router.delete('/', cartController.clearCart)

export default router
