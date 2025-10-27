import { Router } from 'express'
import * as adminController from '../controllers/admin.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'
import { createProductValidation, updateProductValidation } from '../middleware/validation.js'

const router = Router()

// All admin routes require authentication and admin role
router.use(authMiddleware)
router.use(adminMiddleware)

// Product management
router.post('/products', createProductValidation, adminController.createProduct)
router.put('/products/:id', updateProductValidation, adminController.updateProduct)
router.delete('/products/:id', adminController.deleteProduct)

// Order management
router.get('/orders', adminController.getAllOrders)
router.put('/orders/:id/status', adminController.updateOrderStatus)

// User management
router.get('/users', adminController.getAllUsers)
router.put('/users/:id/role', adminController.updateUserRole)

// Analytics
router.get('/analytics', adminController.getAnalytics)

export default router
