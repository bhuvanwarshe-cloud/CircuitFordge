import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ShieldAlert, Lock, Mail, AlertTriangle, Terminal } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { verifyAdminAccess } from '../../services/authService'

// ── Scanline overlay effect ───────────────────────────────────────────────────
function ScanlineOverlay() {
  return (
    <div className="tw" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {/* Moving scanline */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.15), transparent)',
        animation: 'scanMove 8s linear infinite',
      }} />
      {/* Static scanlines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
        pointerEvents: 'none',
      }} />
      <style>{`
        @keyframes scanMove {
          0%   { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  )
}

// ── Animated circuit grid background ─────────────────────────────────────────
function AdminBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Deep dark base */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% -10%, rgba(127,10,10,0.12) 0%, transparent 60%)' }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(239,68,68,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(239,68,68,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)', borderRadius: '0 0 100% 0' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 300, height: 300, background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)', borderRadius: '100% 0 0 0' }} />

      {/* Subtle glow orbs */}
      <div style={{ position: 'absolute', top: '30%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(127,10,10,0.08)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(234,88,12,0.06)', filter: 'blur(60px)' }} />
    </div>
  )
}

// ── Typing text effect ────────────────────────────────────────────────────────
function TypingText({ text, className = '', speed = 60 }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, ++i))
      if (i >= text.length) clearInterval(iv)
    }, speed)
    return () => clearInterval(iv)
  }, [text, speed])
  return (
    <span className={className}>
      {displayed}
      <span style={{ animation: 'blink 1s step-end infinite', color: '#ef4444', marginLeft: 2 }}>█</span>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </span>
  )
}

// ── Main Admin Login Component ────────────────────────────────────────────────
export default function AdminLogin() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { signIn, signOut, isAdmin, isAuthenticated, loading: authLoading } = useAuth()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [attempts,setAttempts]= useState(0)
  const [locked,  setLocked]  = useState(false)
  const [lockTime,setLockTime]= useState(0)
  const timerRef = useRef(null)

  // Redirect if already admin
  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      const from = location.state?.from?.pathname || '/admin'
      navigate(from, { replace: true })
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate, location])

  // Lockout countdown
  useEffect(() => {
    if (locked && lockTime > 0) {
      timerRef.current = setInterval(() => {
        setLockTime(t => {
          if (t <= 1) {
            setLocked(false)
            setAttempts(0)
            setError('')
            clearInterval(timerRef.current)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [locked, lockTime])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (locked) return

    setLoading(true)
    setError('')

    try {
      // Step 1: Authenticate with Supabase
      const { user } = await signIn(form.email.trim().toLowerCase(), form.password)

      // Step 2: Verify admin role from DB (frontend guard — backend enforces separately)
      try {
        await verifyAdminAccess(user.id)
        // ✅ Admin verified — useEffect will handle redirect
      } catch (roleErr) {
        // ❌ Valid Supabase user but NOT an admin — sign them out immediately
        await signOut()
        setError(roleErr.message || 'Access denied. Admin privileges required.')
        setAttempts(a => a + 1)
      }

    } catch (err) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= 5) {
        setLocked(true)
        setLockTime(30)
        setError('Too many failed attempts. Account locked for 30 seconds.')
      } else {
        setError(
          err.message?.includes('Invalid login')
            ? `Invalid credentials. ${5 - newAttempts} attempt${5 - newAttempts !== 1 ? 's' : ''} remaining.`
            : err.message || 'Authentication failed. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Role check after login: only admins proceed ───────────────────────────
  // (handled by useEffect + RequireAdmin in router)

  return (
    <div className="tw" style={{
      minHeight: '100vh',
      background: '#080a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      <AdminBackground />
      <ScanlineOverlay />

      {/* ── Left panel — classified branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="admin-left-panel"
        style={{
          flex: 1,
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2,
          maxWidth: 520,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #7f1d1d, #dc2626)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(220,38,38,0.4)',
          }}>
            <ShieldAlert size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Circuit<span style={{ background: 'linear-gradient(90deg, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Forge</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: 'rgba(239,68,68,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 1 }}>
              Admin Control Center
            </div>
          </div>
        </div>

        {/* Headline */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem',
            color: 'rgba(239,68,68,0.8)', letterSpacing: '0.12em', textTransform: 'uppercase',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            padding: '0.3rem 0.8rem', borderRadius: 999, marginBottom: '1.5rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulseDot 2s ease infinite', display: 'inline-block' }} />
            RESTRICTED ACCESS
          </div>

          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#f1f5f9',
            marginBottom: '1.25rem',
          }}>
            Secure Admin<br />
            <span style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Control Panel
            </span>
          </h1>

          <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 380, marginBottom: '2rem' }}>
            This is a private administration interface. Unauthorized access attempts are monitored and logged.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Manage project submissions and status',
              'Upload reports and demonstration videos',
              'Monitor student dashboards in realtime',
              'Control delivery and pickup scheduling',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Terminal size={12} color="rgba(239,68,68,0.7)" />
                <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: 'rgba(148,163,184,0.3)', letterSpacing: '0.08em' }}>
          CIRCUITFORGE ADMIN v1.0 · ALL ACTIVITY LOGGED
        </div>
      </motion.div>

      {/* ── Vertical divider ── */}
      <div className="admin-divider" style={{
        width: 1,
        alignSelf: 'stretch',
        background: 'linear-gradient(180deg, transparent, rgba(239,68,68,0.2), transparent)',
        position: 'relative', zIndex: 2, margin: '3rem 0',
      }} />

      {/* ── Right panel — login form ── */}
      <div style={{
        width: '100%', maxWidth: 440,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', position: 'relative', zIndex: 2,
      }}>
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ width: '100%' }}
        >
          {/* Card */}
          <div style={{
            background: 'rgba(13,16,23,0.92)',
            border: '1px solid rgba(239,68,68,0.18)',
            borderRadius: 20,
            padding: '2.5rem',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 0 40px rgba(0,0,0,0.6), 0 0 80px rgba(239,68,68,0.04)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Card corner accent */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 80, height: 80,
              background: 'linear-gradient(225deg, rgba(239,68,68,0.12), transparent)',
              borderRadius: '0 20px 0 80px',
            }} />

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Lock size={14} color="#ef4444" />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'rgba(239,68,68,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Secure Authentication
                </span>
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
                Admin Sign In
              </h2>
              <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.8rem' }}>
                Authorized personnel only
              </p>
            </div>

            {/* Error alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 10,
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                  }}
                >
                  <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: '0.8rem', color: '#fca5a5', lineHeight: 1.5 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lockout bar */}
            {locked && (
              <div style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10,
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'rgba(239,68,68,0.8)', marginBottom: '0.4rem' }}>
                  ACCESS LOCKED — {lockTime}s
                </div>
                <div style={{ height: 4, background: 'rgba(239,68,68,0.15)', borderRadius: 999, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: `${(lockTime / 30) * 100}%` }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #ef4444, #f97316)', borderRadius: 999 }}
                  />
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(148,163,184,0.8)', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.03em' }}>
                  Admin Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(239,68,68,0.5)' }} />
                  <input
                    type="email"
                    autoComplete="username"
                    placeholder="admin@circuitforge.in"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    disabled={locked || loading}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)'}`,
                      borderRadius: 10,
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', sans-serif",
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(239,68,68,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(148,163,184,0.8)', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.03em' }}>
                  Admin Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(239,68,68,0.5)' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    disabled={locked || loading}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)'}`,
                      borderRadius: 10,
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', sans-serif",
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(239,68,68,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)'; e.target.style.boxShadow = 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', padding: 0 }}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading || locked || !form.email || !form.password}
                whileHover={!loading && !locked ? { scale: 1.01 } : {}}
                whileTap={!loading && !locked ? { scale: 0.99 } : {}}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: locked
                    ? 'rgba(239,68,68,0.1)'
                    : 'linear-gradient(135deg, #dc2626, #ef4444)',
                  border: `1px solid ${locked ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.5)'}`,
                  borderRadius: 10,
                  color: locked ? 'rgba(239,68,68,0.4)' : '#fff',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: locked || loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: locked ? 'none' : '0 0 20px rgba(239,68,68,0.3)',
                  transition: 'all 0.25s',
                  marginTop: '0.25rem',
                }}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }}
                    />
                    Authenticating...
                  </>
                ) : locked ? (
                  `Locked (${lockTime}s)`
                ) : (
                  <>
                    <ShieldAlert size={15} />
                    Authenticate
                  </>
                )}
              </motion.button>
            </form>

            {/* Security footer */}
            <div style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <AlertTriangle size={11} color="rgba(239,68,68,0.5)" />
              <p style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 }}>
                All login attempts are logged with IP address and timestamp.
              </p>
            </div>

            {/* Attempt counter */}
            {attempts > 0 && !locked && (
              <div style={{
                marginTop: '0.75rem',
                textAlign: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                color: `rgba(239,68,68,${0.3 + attempts * 0.15})`,
              }}>
                FAILED ATTEMPTS: {attempts}/5
              </div>
            )}
          </div>

          {/* Back link — subtle, no obvious navigation */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a
              href="/"
              style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.25)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'rgba(148,163,184,0.5)'}
              onMouseLeave={e => e.target.style.color = 'rgba(148,163,184,0.25)'}
            >
              ← Return to public site
            </a>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }
        @media (max-width: 768px) {
          .admin-left-panel { display: none !important; }
          .admin-divider     { display: none !important; }
        }
      `}</style>
    </div>
  )
}
