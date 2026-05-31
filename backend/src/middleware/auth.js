/**
 * auth.js — Supabase JWT authentication middleware
 *
 * Exports:
 *   protect     — verifies JWT, attaches req.user + req.profile
 *   adminOnly   — requires role = 'admin' (use AFTER protect)
 *   studentOnly — requires role = 'student' (use AFTER protect)
 *   verifyAuth  — alias for protect (backward compat)
 */

import { supabaseAdmin } from '../config/supabase.js'

// ── protect ───────────────────────────────────────────────────────────────────
// Verifies the Supabase JWT from the Authorization: Bearer <token> header.
// On success, attaches req.user (auth.users row) and req.profile (profiles row).
export async function protect(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token missing.',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verify JWT with Supabase — no manual decoding, Supabase handles rotation
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      console.error('[protect] token invalid:', error?.message)
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session.',
      })
    }

    // Fetch profile row (contains role, is_active)
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role, full_name, is_active')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) {
      console.error('[protect] profile fetch error:', profileErr?.message)
      return res.status(401).json({
        success: false,
        message: 'User profile not found.',
      })
    }

    if (!profile.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended. Contact support.',
      })
    }

    // Attach to request for downstream middleware + controllers
    req.user    = user
    req.profile = profile
    next()
  } catch (err) {
    console.error('[protect] unexpected error:', err.message)
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    })
  }
}

// ── adminOnly ─────────────────────────────────────────────────────────────────
// Restricts route to users with role = 'admin'. Must run AFTER protect.
export function adminOnly(req, res, next) {
  if (req.profile?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden — Admin access required.',
    })
  }
  next()
}

// ── studentOnly ───────────────────────────────────────────────────────────────
// Restricts route to users with role = 'student'. Must run AFTER protect.
export function studentOnly(req, res, next) {
  if (req.profile?.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden — Student access only.',
    })
  }
  next()
}

// ── verifyAuth ────────────────────────────────────────────────────────────────
// Alias for protect — keeps compatibility with any code referencing verifyAuth.
export const verifyAuth = protect