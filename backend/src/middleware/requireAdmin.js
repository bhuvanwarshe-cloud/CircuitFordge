/**
 * requireAdmin.js — Custom JWT middleware for admin-only routes
 *
 * Completely separate from the Supabase auth middleware (auth.js).
 * Reads Bearer token → verifies with ADMIN_JWT_SECRET → checks role === 'admin'.
 *
 * On success: attaches req.admin = { email, role } and calls next().
 * On failure: returns 403 { success: false, message: 'Unauthorized' }
 */

import { verifyAdminToken } from '../services/adminAuthService.js'

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization

  // ── No token provided ────────────────────────────────────────────────────────
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized',
    })
  }

  const token = authHeader.split(' ')[1]

  if (!token || token.trim() === '') {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized',
    })
  }

  try {
    // ── Verify JWT with ADMIN_JWT_SECRET ──────────────────────────────────────
    const decoded = verifyAdminToken(token)

    // ── Enforce role claim ───────────────────────────────────────────────────
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      })
    }

    // ── Attach admin identity to request ────────────────────────────────────
    req.admin = {
      email: decoded.email,
      role:  decoded.role,
    }

    next()
  } catch (err) {
    // TokenExpiredError, JsonWebTokenError, etc. — all map to 403
    console.warn('[requireAdmin] token verification failed:', err.message)
    return res.status(403).json({
      success: false,
      message: 'Unauthorized',
    })
  }
}
