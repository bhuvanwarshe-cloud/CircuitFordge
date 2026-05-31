import { Router } from 'express'
import { getMe, getAdminMe, logout, verifyAdmin } from '../controllers/authController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// GET  /api/auth/me            — authenticated user's own profile
router.get('/me', protect, getMe)

// POST /api/auth/logout        — server-side audit log logout
router.post('/logout', protect, logout)

// GET  /api/auth/admin/me      — admin dashboard profile (admin only)
router.get('/admin/me', protect, adminOnly, getAdminMe)

// GET  /api/auth/verify-admin  — verify JWT belongs to an active admin
router.get('/verify-admin', protect, adminOnly, verifyAdmin)

export default router
