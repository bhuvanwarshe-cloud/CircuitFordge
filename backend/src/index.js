import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Load env vars
dotenv.config()

// Route imports
import authRoutes         from './routes/auth.js'
import projectRoutes      from './routes/projects.js'
import adminAuthRoutes    from './routes/adminAuthRoutes.js'
import adminRoutes        from './routes/admin.js'
import notificationRoutes from './routes/notifications.js'

// Error handlers
import { errorHandler, notFound } from './middleware/errorHandler.js'

// ── Setup ─────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const app  = express()
const PORT = process.env.PORT || 5000

// ── Security & parsing middleware ─────────────────────────────────────────────
app.use(helmet())

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g., curl, Postman) or known origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  methods:     ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// HTTP logger (disable in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Global rate limiter — 100 req / 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, message: 'Too many requests. Please try again later.' },
}))

// Stricter auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
})

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'CircuitForge API',
    version: '1.0.0',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  })
})

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authLimiter, authRoutes)
app.use('/api/projects',      projectRoutes)
// Admin auth (login/logout/me) — mounted FIRST, before protected admin routes
app.use('/api/admin',         adminAuthRoutes)
// Protected admin routes — internal requireAdmin middleware guards all
app.use('/api/admin',         adminRoutes)
app.use('/api/notifications', notificationRoutes)

// ── 404 & Error handlers ──────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start server ──────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n⚡ CircuitForge API running`)
  console.log(`   → http://localhost:${PORT}/api/health`)
  console.log(`   → Environment: ${process.env.NODE_ENV || 'development'}\n`)
})

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. CircuitForge API is likely already running.`)
    console.error(`Check http://localhost:${PORT}/api/health or stop the other process before starting a new one.`)
    process.exit(1)
  }

  throw err
})

export default app
