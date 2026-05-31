import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Cpu } from 'lucide-react'
import CircuitBackground from '../components/CircuitBackground'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '2rem' }}>
        <CircuitBackground />
        <div className="glow-orb" style={{ width: 500, height: 500, background: 'rgba(79,70,229,0.1)', top: '-15%', right: '-10%' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary-600), var(--cyan-500))', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={20} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                Circuit<span className="gradient-text-blue">Forge</span>
              </span>
            </Link>
          </div>

          <div style={{ background: 'rgba(13,18,35,0.88)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', padding: '2.5rem', backdropFilter: 'blur(20px)' }}>
            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Icon */}
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-xl)', background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <Mail size={24} color="var(--primary-400)" />
                  </div>

                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Reset Password
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                    Enter your email and we'll send you a secure link to reset your password.
                  </p>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
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
                          id="forgot-email"
                          type="email"
                          autoComplete="username"
                          className="input-field"
                          placeholder="you@college.edu"
                          style={{ paddingLeft: '2.75rem' }}
                          value={email}
                          onChange={e => { setEmail(e.target.value); setError('') }}
                          required
                        />
                      </div>
                    </div>

                    <button
                      id="forgot-submit"
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || !email}
                      style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                    >
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                      ) : (
                        <><Send size={15} />Send Reset Link</>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid var(--emerald-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}
                  >
                    <CheckCircle2 size={30} color="var(--emerald-400)" />
                  </motion.div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: '0.75rem' }}>Check your email</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                    We've sent a password reset link to<br />
                    <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: '1.5rem' }}>
                    Didn't receive it? Check your spam folder or{' '}
                    <button onClick={() => setSent(false)} style={{ background: 'none', border: 'none', color: 'var(--primary-400)', cursor: 'pointer', fontSize: 'inherit', fontWeight: 600, padding: 0 }}>
                      try again
                    </button>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to login */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginTop: '1.5rem', textAlign: 'center' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
