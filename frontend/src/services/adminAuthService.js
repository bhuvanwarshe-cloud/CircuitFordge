/**
 * adminAuthService.js — Admin authentication API calls
 *
 * Calls the custom backend admin auth endpoints.
 * NEVER touches Supabase. NEVER reads VITE_ env vars for credentials.
 *
 * Exports:
 *   adminLogin(email, password) → POST /api/admin/login
 *   adminLogout(token)          → POST /api/admin/logout
 *   getAdminMe(token)           → GET  /api/admin/me
 */

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── Internal fetch helper ──────────────────────────────────────────────────────
async function adminFetch(path, options = {}) {
  let res
  try {
    res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })
  } catch (networkErr) {
    throw new Error('Cannot reach the server. Check your connection.')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    // Use the server's message if available, otherwise generic
    throw new Error(data.message || 'Authentication failed.')
  }

  return data
}

// ── POST /api/admin/login ──────────────────────────────────────────────────────
/**
 * @param {string} email
 * @param {string} password
 * @returns {{ success: true, token: string, admin: { email: string } }}
 * @throws {Error} on invalid credentials or network error
 */
export async function adminLogin(email, password) {
  return adminFetch('/admin/login', {
    method: 'POST',
    body: JSON.stringify({
      email:    email.trim().toLowerCase(),
      password,
    }),
  })
}

// ── POST /api/admin/logout ─────────────────────────────────────────────────────
/**
 * @param {string} token — current admin JWT
 * @returns {{ success: true }}
 */
export async function adminLogout(token) {
  return adminFetch('/admin/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ── GET /api/admin/me ──────────────────────────────────────────────────────────
/**
 * Verifies the token and returns admin identity.
 * Used on mount to restore session.
 * @param {string} token
 * @returns {{ success: true, admin: { email: string, role: string } }}
 */
export async function getAdminMe(token) {
  return adminFetch('/admin/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
