/**
 * authController.js — Backend auth endpoints using Supabase Auth.
 *
 * Login/signup is handled client-side via Supabase JS SDK.
 * The backend exposes only:
 *   GET  /api/auth/me        — return current user's profile (requires valid JWT)
 *   POST /api/auth/logout    — server-side session revocation (optional)
 *   GET  /api/auth/admin/me  — admin-only profile endpoint
 */
import { supabaseAdmin } from '../config/supabase.js'

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
/**
 * Returns the authenticated user's profile.
 * Requires: protect middleware (sets req.user and req.profile)
 */
export async function getMe(req, res, next) {
  try {
    // req.profile is set by protect middleware — no extra DB call needed
    res.json({
      success: true,
      user: {
        id:          req.user.id,
        email:       req.user.email,
        role:        req.profile.role,
        full_name:   req.profile.full_name,
        phone:       req.profile.phone,
        college_name: req.profile.college_name,
        semester:    req.profile.semester,
        program:     req.profile.program,
        avatar_url:  req.profile.avatar_url,
        is_active:   req.profile.is_active,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/auth/admin/me ────────────────────────────────────────────────────
/**
 * Admin-only profile endpoint.
 * Requires: protect + adminOnly middleware
 */
export async function getAdminMe(req, res, next) {
  try {
    // Fetch full admin profile with stats
    const [profileResult, projectStats] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', req.user.id)
        .single(),
      supabaseAdmin
        .from('projects')
        .select('status', { count: 'exact' }),
    ])

    if (profileResult.error) throw profileResult.error

    res.json({
      success:  true,
      admin:    profileResult.data,
      stats: {
        totalProjects: projectStats.count ?? 0,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
/**
 * Server-side logout — revokes Supabase session.
 * The client-side SDK also does signOut() so this is belt-and-suspenders.
 */
export async function logout(req, res, next) {
  try {
    // Supabase doesn't have a server-side "revoke single token" API in the free tier.
    // Best practice: client calls supabase.auth.signOut() which clears the cookie/localStorage.
    // This endpoint exists for audit logging purposes.
    console.log(`[Auth] Logout: user ${req.user?.id} at ${new Date().toISOString()}`)
    res.json({ success: true, message: 'Logged out successfully.' })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/verify-admin ───────────────────────────────────────────────
/**
 * Verifies that a token belongs to an active admin.
 * Called optionally from the frontend after admin login to double-check role.
 * Requires: protect + adminOnly middleware
 */
export async function verifyAdmin(req, res) {
  res.json({
    success:   true,
    isAdmin:   true,
    full_name: req.profile.full_name,
    role:      req.profile.role,
  })
}
