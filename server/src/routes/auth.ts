import { Router } from 'express'
import * as authController from '../controllers/auth.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Public routes
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/forgot-password', authController.forgotPassword)

// Protected routes
router.get('/me', authMiddleware, authController.getProfile)
router.put('/profile', authMiddleware, authController.updateProfile)

export default router
