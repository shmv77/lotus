import { body, param, query, ValidationChain } from 'express-validator'

// Product validation
export const createProductValidation: ValidationChain[] = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').isUUID().withMessage('Valid category ID is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('image_url').optional().isURL().withMessage('Must be a valid URL'),
]

export const updateProductValidation: ValidationChain[] = [
  param('id').isUUID().withMessage('Valid product ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
]

// Cart validation
export const addToCartValidation: ValidationChain[] = [
  body('cocktail_id').isUUID().withMessage('Valid cocktail ID is required'),
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),
]

// Order validation
export const createOrderValidation: ValidationChain[] = [
  body('shipping_address').trim().notEmpty().withMessage('Shipping address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('postal_code').trim().notEmpty().withMessage('Postal code is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
]

// Pagination validation
export const paginationValidation: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
]
