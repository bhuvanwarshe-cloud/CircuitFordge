/**
 * adminAuthRoutes.js — Admin authentication endpoints
 *
 * POST /api/admin/login   → no auth required, rate-limited (5 / 15 min)
 * POST /api/admin/logout  → requires valid admin JWT
 * GET  /api/admin/me      → requires valid admin JWT
 *
 * These routes are mounted BEFORE the general admin routes so that
 * login can be reached without a token.
 */

import { Router }     from 'express'
import rateLimit      from 'express-rate-limit'
import { requireAdmin }       from '../middleware/requireAdmin.js'
import { adminLogin, adminLogout, adminMe } from '../controllers/adminAuthController.js'

const router = Router()

// ── Admin login rate limiter: 5 attempts / 15 minutes per IP ──────────────────
const adminLoginLimiter = rateLimit({
  windowMs:   15 * 60 * 1000,   // 15 minutes
  max:        5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  // Skip successful requests so only failures count toward the limit
  skipSuccessfulRequests: false,
})

// ── Public: login ─────────────────────────────────────────────────────────────
router.post('/login',  adminLoginLimiter, adminLogin)

// ── Protected: logout + me ───────────────────────────────────────────────────
router.post('/logout', requireAdmin, adminLogout)
router.get('/me',      requireAdmin, adminMe)

export default router
