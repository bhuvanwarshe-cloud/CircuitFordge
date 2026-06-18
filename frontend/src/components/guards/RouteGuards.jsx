/**
 * RouteGuards.jsx — Route protection components
 *
 * RequireAuth    — uses Supabase AuthContext (students only, UNCHANGED)
 * RequireAdmin   — uses AdminAuthContext (custom JWT, separate system)
 * RedirectIfAuthenticated — checks both contexts for smart redirects
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth }      from '../../contexts/AuthContext'
import { useAdminAuth } from '../../contexts/AdminAuthContext'

// ── RequireAuth ───────────────────────────────────────────────────────────────
/**
 * Requires Supabase student authentication.
 * Redirects unauthenticated students to /login.
 * UNCHANGED — still uses Supabase AuthContext.
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

// ── RequireAdmin ──────────────────────────────────────────────────────────────
/**
 * Requires custom admin JWT authentication.
 * Unauthenticated → /admin/login
 * Authenticated   → render children
 *
 * Uses AdminAuthContext — completely separate from student Supabase auth.
 */
export function RequireAdmin({ children }) {
  const { isAdminAuthenticated, adminLoading } = useAdminAuth()
  const location = useLocation()

  if (adminLoading) return <AuthLoadingScreen dark />

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}

// ── RedirectIfAuthenticated ───────────────────────────────────────────────────
/**
 * Redirects already-logged-in users away from auth pages.
 *   Admin (custom JWT)    → /admin
 *   Student (Supabase)    → /dashboard
 *
 * Checks admin auth first, then student auth.
 */
export function RedirectIfAuthenticated({ children, adminRedirect = '/admin' }) {
  const { isAuthenticated, loading: studentLoading }              = useAuth()
  const { isAdminAuthenticated, adminLoading }                    = useAdminAuth()

  // Wait until both auth systems have resolved
  if (studentLoading || adminLoading) return <AuthLoadingScreen />

  if (isAdminAuthenticated) {
    return <Navigate to={adminRedirect} replace />
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// ── Loading Screen ─────────────────────────────────────────────────────────────
function AuthLoadingScreen({ dark = false }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: dark ? '#080a0f' : 'var(--bg-void)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 36, height: 36,
          border: `3px solid ${dark ? 'rgba(239,68,68,0.2)' : 'rgba(79,70,229,0.2)'}`,
          borderTopColor: dark ? '#ef4444' : '#6d64f0',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: '0.75rem', color: dark ? 'rgba(239,68,68,0.6)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {dark ? 'AUTHENTICATING...' : 'Loading...'}
        </span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Unauthorized Page ──────────────────────────────────────────────────────────
function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1.5rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '4rem' }}>🚫</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>
        Access Denied
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
        You don't have permission to access this area. This incident has been logged.
      </p>
      <a href="/dashboard" style={{
        padding: '0.65rem 1.5rem',
        background: 'rgba(79,70,229,0.15)',
        border: '1px solid rgba(79,70,229,0.3)',
        borderRadius: '0.75rem',
        color: 'var(--primary-300)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 600,
        fontSize: '0.875rem',
      }}>
        ← Back to Dashboard
      </a>
    </div>
  )
}
