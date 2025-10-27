import { Router } from 'express'
import * as productsController from '../controllers/products.js'
import { paginationValidation } from '../middleware/validation.js'

const router = Router()

// Public routes
router.get('/', paginationValidation, productsController.getAllProducts)
router.get('/categories', productsController.getAllCategories)
router.get('/search', productsController.searchProducts)
router.get('/category/:categoryId', productsController.getProductsByCategory)
router.get('/:id', productsController.getProductById)

export default router
