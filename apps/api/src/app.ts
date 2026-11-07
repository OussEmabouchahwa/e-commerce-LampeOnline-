import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import path from 'path'

import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import wishlistRoutes from './routes/wishlist'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/orders'
import analyticsRoutes from './routes/analytics'
import userRoutes from './routes/users'
import { errorHandler } from './middleware/errorHandler'

const app = express()

const CLIENT_URL = process.env['CLIENT_URL'] ?? 'http://localhost:5173'

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

app.use(cookieParser())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts, please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
})
const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many checkout attempts, please slow down.' } },
})

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', checkoutLimiter, orderRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/users', userRoutes)

app.get('/api/health', (_req, res) => { res.json({ ok: true, env: process.env['NODE_ENV'] }) })

app.use(errorHandler)

export { app }
