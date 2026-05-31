import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Requires authenticated session.
 * Redirects unauthenticated users to /login.
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

/**
 * Requires admin role.
 * Students who reach this route are shown an Unauthorized page.
 * Unauthenticated users go to /admin/login.
 */
export function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen dark />

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <UnauthorizedPage />
  }

  return children
}

/**
 * Redirects already-logged-in users away from auth pages.
 * Admin → /admin
 * Student → /dashboard
 */
export function RedirectIfAuthenticated({ children, adminRedirect = '/admin' }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <AuthLoadingScreen />
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? adminRedirect : '/dashboard'} replace />
  }
  return children
}

// ── Loading Screen ────────────────────────────────────────────────────────────
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

// ── Unauthorized Page ─────────────────────────────────────────────────────────
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
