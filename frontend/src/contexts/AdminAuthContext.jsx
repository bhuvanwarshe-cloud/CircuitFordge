/**
 * AdminAuthContext.jsx — Custom admin authentication context
 *
 * Dual-session model:
 *   1. Custom JWT  → stored in sessionStorage as 'cf_admin_token'
 *                    Used to authenticate all backend API requests.
 *   2. Supabase session → set via supabase.auth.setSession() after login.
 *                    Gives the frontend Supabase client an authenticated identity
 *                    so auth.uid() resolves to the admin UUID, is_admin() returns
 *                    true, and all realtime postgres_changes subscriptions work.
 *
 * Session lifecycle:
 *   - Login:   custom JWT stored → supabase.auth.setSession() called
 *   - Refresh: custom JWT verified with backend → supabase session auto-refreshed
 *              by Supabase client (persistSession:true in lib/supabase.js)
 *   - Logout:  custom JWT cleared → supabase.auth.signOut() called
 *
 * Exposes:
 *   admin               — { email, role } | null
 *   isAdminAuthenticated — boolean
 *   adminLoading        — boolean (true during initial session restore)
 *   login(email, pw)    — validates credentials, stores tokens, activates realtime
 *   logout()            — clears all tokens, redirects to /admin/login
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { adminLogin as apiLogin, adminLogout as apiLogout, getAdminMe } from '../services/adminAuthService'

// ── Storage key ────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'cf_admin_token'

// ── Token helpers — sessionStorage only (cleared on browser close) ─────────────
export const getAdminToken   = ()      => sessionStorage.getItem(TOKEN_KEY)
export const setAdminToken   = (token) => sessionStorage.setItem(TOKEN_KEY, token)
export const clearAdminToken = ()      => sessionStorage.removeItem(TOKEN_KEY)

// ── Context ────────────────────────────────────────────────────────────────────
const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin,        setAdmin]        = useState(null)   // { email, role }
  const [adminLoading, setAdminLoading] = useState(true)   // true until session restore done

  // ── Supabase session activation ───────────────────────────────────────────
  // Activates the admin's Supabase identity so realtime subscriptions work.
  // supabase_session = { access_token, refresh_token, expires_at }
  const activateSupabaseSession = useCallback(async (supabaseSession) => {
    if (!supabaseSession?.access_token || !supabaseSession?.refresh_token) return

    const { error } = await supabase.auth.setSession({
      access_token:  supabaseSession.access_token,
      refresh_token: supabaseSession.refresh_token,
    })

    if (error) {
      console.warn('[AdminAuthContext] supabase.auth.setSession failed:', error.message)
    } else {
      console.info('[AdminAuthContext] Supabase admin session activated — realtime ready ✅')
    }
  }, [])

  // ── Session restore on mount ──────────────────────────────────────────────
  // 1. Custom JWT: verify with backend via GET /api/admin/me
  // 2. Supabase session: Supabase client auto-restores it from localStorage
  //    (persistSession:true + storageKey:'circuitforge_session' in lib/supabase.js)
  //    No extra work needed — if it was set before, it's already active.
  useEffect(() => {
    const token = getAdminToken()

    if (!token) {
      setAdminLoading(false)
      return
    }

    // Verify custom JWT with backend
    getAdminMe(token)
      .then(data => {
        if (data?.admin) {
          setAdmin(data.admin)
          // Supabase session is auto-restored by the Supabase client from localStorage.
          // Check if we have a live session; if not, the user will need to re-login
          // for realtime to work (this handles the edge case of localStorage being cleared).
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
              console.warn('[AdminAuthContext] Supabase session not found in localStorage — realtime inactive until re-login.')
            } else {
              console.info('[AdminAuthContext] Supabase session restored from localStorage ✅')
            }
          })
        } else {
          clearAdminToken()
          setAdmin(null)
        }
      })
      .catch(() => {
        clearAdminToken()
        setAdmin(null)
      })
      .finally(() => setAdminLoading(false))
  }, [])

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    // apiLogin now returns { token, admin, supabase_session }
    const data = await apiLogin(email, password)

    // 1. Store custom JWT
    setAdminToken(data.token)
    setAdmin(data.admin)

    // 2. Activate Supabase session for realtime
    if (data.supabase_session) {
      await activateSupabaseSession(data.supabase_session)
    } else {
      console.warn('[AdminAuthContext] No Supabase session returned from login — realtime will be inactive. Run scripts/setup-admin-supabase-user.js on the backend.')
    }

    return data
  }, [activateSupabaseSession])

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const token = getAdminToken()

    // 1. Best-effort backend logout call
    if (token) {
      apiLogout(token).catch(() => {})
    }

    // 2. Clear custom JWT
    clearAdminToken()
    setAdmin(null)

    // 3. Sign out of Supabase — clears the session from localStorage
    //    This stops realtime subscriptions and prevents the old session
    //    from being used if a student logs in on the same browser.
    await supabase.auth.signOut().catch(() => {})

    // Navigate to admin login
    window.location.replace('/admin/login')
  }, [])

  // ── Derived state ─────────────────────────────────────────────────────────
  const isAdminAuthenticated = !!admin

  return (
    <AdminAuthContext.Provider value={{
      admin,
      isAdminAuthenticated,
      adminLoading,
      login,
      logout,
    }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return ctx
}
