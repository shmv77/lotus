import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

// Import routes
import productsRouter from './routes/products.js'
import authRouter from './routes/auth.js'
import cartRouter from './routes/cart.js'
import ordersRouter from './routes/orders.js'
import paymentsRouter from './routes/payments.js'
import adminRouter from './routes/admin.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', limiter)

// Routes
app.use('/api/products', productsRouter)
app.use('/api/auth', authRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/admin', adminRouter)

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
