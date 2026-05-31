import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Mail, Lock, Eye, EyeOff, ArrowRight, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'
import CircuitBackground from '../components/CircuitBackground'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [showPass, setShowPass] = useState(false)
  const [form, setForm]         = useState({ email: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Redirect back to the page they tried to access, or /dashboard
  const from = location.state?.from?.pathname || '/dashboard'
  const set  = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err.message?.includes('Invalid login')
          ? 'Invalid email or password. Please try again.'
          : err.message?.includes('Email not confirmed')
          ? 'Please verify your email address first.'
          : err.message || 'Sign in failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
        <CircuitBackground />
        <div className="glow-orb" style={{ width: 500, height: 500, background: 'rgba(79,70,229,0.12)', top: '-10%', left: '-15%' }} />
        <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(0,196,240,0.08)', bottom: '10%', right: '-5%' }} />

        {/* Left panel — branding */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem', position: 'relative', zIndex: 1 }} className="auth-left-panel">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary-600), var(--cyan-500))', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
              Circuit<span className="gradient-text-blue">Forge</span>
            </span>
          </Link>
          <div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem' }}>
                Your project<br /><span className="gradient-text">dashboard awaits.</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['Real-time project progress tracking', 'Download reports & demo videos', 'Chat with your project manager', 'Track hardware delivery status'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan-400)', boxShadow: 'var(--glow-cyan)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>© 2026 CircuitForge · Built for engineers</p>
        </div>

        {/* Right panel — form */}
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', background: 'rgba(13,18,35,0.85)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', padding: '2.5rem', backdropFilter: 'blur(20px)' }}
          >
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome back</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Sign in to your CircuitForge account</p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}
                >
                  <AlertCircle size={15} color="var(--rose-400)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--rose-300)', lineHeight: 1.5 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    className="input-field"
                    placeholder="you@college.edu"
                    style={{ paddingLeft: '2.75rem' }}
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="input-label">Password</label>
                  <Link to="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-400)' }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input-field"
                    placeholder="••••••••"
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                className="btn btn-primary"
                disabled={loading || !form.email || !form.password}
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                ) : (
                  <><Zap size={16} />Sign In<ArrowRight size={14} /></>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>Create account</Link>
            </p>
          </motion.div>
        </div>

        <style>{`@media (max-width: 768px) { .auth-left-panel { display: none !important; } }`}</style>
      </div>
    </PageTransition>
  )
}
