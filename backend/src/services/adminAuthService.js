/**
 * adminAuthService.js — Custom admin authentication logic
 *
 * Completely separate from Supabase Auth.
 * Credentials live ONLY in environment variables on the backend.
 *
 * Exports:
 *   validateAdminCredentials(email, password) → { email } | throws
 *   signAdminToken(email)                     → JWT string
 *   verifyAdminToken(token)                   → decoded payload | throws
 */

import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'

// ── Config ─────────────────────────────────────────────────────────────────────
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL
const ADMIN_HASH     = process.env.ADMIN_PASSWORD_HASH
const JWT_SECRET     = process.env.ADMIN_JWT_SECRET
const JWT_EXPIRES_IN = process.env.ADMIN_SESSION_EXPIRES || '7d'

// ── Guard: fail fast if env vars not configured ────────────────────────────────
function assertEnvConfigured() {
  if (!ADMIN_EMAIL || !ADMIN_HASH || !JWT_SECRET) {
    throw new Error(
      '[adminAuthService] ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and ADMIN_JWT_SECRET must be set in .env'
    )
  }
}

// ── validateAdminCredentials ───────────────────────────────────────────────────
/**
 * Validates admin credentials against environment-stored bcrypt hash.
 * @param {string} email
 * @param {string} password  — plaintext from request body
 * @returns {{ email: string }}
 * @throws {Error} on invalid credentials (generic message, no leaking)
 */
export async function validateAdminCredentials(email, password) {
  assertEnvConfigured()

  // Normalise for comparison
  const normalisedEmail = email?.trim().toLowerCase()

  // Always run bcrypt compare even on email mismatch to prevent timing attacks
  const hashToCompare  = ADMIN_HASH
  const passwordMatch  = await bcrypt.compare(password || '', hashToCompare)
  const emailMatch     = normalisedEmail === ADMIN_EMAIL.toLowerCase()

  if (!emailMatch || !passwordMatch) {
    throw new Error('Invalid credentials.')
  }

  return { email: ADMIN_EMAIL }
}

// ── signAdminToken ─────────────────────────────────────────────────────────────
/**
 * Issues a signed JWT with role=admin.
 * @param {string} email
 * @returns {string} — signed JWT
 */
export function signAdminToken(email) {
  assertEnvConfigured()

  return jwt.sign(
    {
      role:  'admin',
      email: email,
      iss:   'circuitforge-admin',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// ── verifyAdminToken ───────────────────────────────────────────────────────────
/**
 * Verifies and decodes an admin JWT.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {Error} on invalid/expired token
 */
export function verifyAdminToken(token) {
  assertEnvConfigured()
  // jwt.verify throws JsonWebTokenError / TokenExpiredError on failure
  return jwt.verify(token, JWT_SECRET)
}
