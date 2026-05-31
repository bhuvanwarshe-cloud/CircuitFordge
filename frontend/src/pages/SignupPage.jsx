import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Zap, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react'
import CircuitBackground from '../components/CircuitBackground'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../contexts/AuthContext'
import { studentSignUp } from '../services/authService'

const SEMESTERS = ['3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem']
const PROGRAMS  = ['B.Tech Electronics', 'B.Tech E&TC', 'Diploma Electronics', 'Diploma E&TC', 'B.Tech EEE', 'Other']

export default function SignupPage() {
  const navigate      = useNavigate()
  const [step, setStep]     = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    college: '', semester: '', program: '',
  })
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const validateStep1 = () => {
    if (!form.name.trim())       return 'Please enter your full name.'
    if (!form.email.trim())      return 'Please enter your email.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    return null
  }

  const handleStep1 = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.college.trim()) { setError('Please enter your college name.'); return }
    if (!form.semester)       { setError('Please select your semester.'); return }
    if (!form.program)        { setError('Please select your program.'); return }

    setLoading(true)
    setError('')
    try {
      await studentSignUp({
        email:    form.email,
        password: form.password,
        fullName: form.name,
        college:  form.college,
        semester: form.semester,
        program:  form.program,
        phone:    form.phone,
      })
      setSuccess(true)
    } catch (err) {
      setError(
        err.message?.includes('already registered')
          ? 'An account with this email already exists. Try signing in.'
          : err.message?.includes('Password')
          ? 'Password is too weak. Use at least 8 characters.'
          : err.message || 'Sign up failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────
  if (success) {
    return (
      <PageTransition>
        <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '2rem' }}>
          <CircuitBackground />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            style={{ textAlign: 'center', maxWidth: 440, position: 'relative', zIndex: 1, background: 'rgba(13,18,35,0.88)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-2xl)', padding: '3rem 2rem', backdropFilter: 'blur(20px)' }}
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
              style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid var(--emerald-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(16,185,129,0.25)' }}
            >
              <CheckCircle2 size={30} color="var(--emerald-400)" />
            </motion.div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.75rem' }}>Account Created! 🎉</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              We've sent a confirmation email to <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong>.<br />
              Please verify your email to activate your account.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              <Zap size={15} /> Go to Sign In
            </Link>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '5rem 1.5rem 2rem' }}>
        <CircuitBackground />
        <div className="glow-orb" style={{ width: 600, height: 400, background: 'rgba(79,70,229,0.1)', top: '-5%', right: '-10%' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}
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

          {/* Card */}
          <div style={{ background: 'rgba(13,18,35,0.88)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', padding: '2.5rem', backdropFilter: 'blur(20px)' }}>
            {/* Step progress */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              {[1, 2].map(s => (
                <div key={s} style={{ flex: 1, height: 3, borderRadius: 'var(--radius-full)', background: step >= s ? 'linear-gradient(90deg, var(--primary-500), var(--cyan-400))' : 'var(--border-subtle)', transition: 'background var(--transition-slow)', boxShadow: step >= s ? 'var(--glow-cyan)' : 'none' }} />
              ))}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.4rem' }}>
              {step === 1 ? 'Create your account' : 'Academic details'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '1.8rem' }}>
              {step === 1 ? 'Step 1 of 2 — Personal information' : 'Step 2 of 2 — College & program details'}
            </p>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}
                >
                  <AlertCircle size={15} color="var(--rose-400)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--rose-300)', lineHeight: 1.5 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
                  >
                    <div className="input-group">
                      <label className="input-label">Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input id="signup-name" className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="Arjun Patel" value={form.name} onChange={e => set('name', e.target.value)} required />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input id="signup-email" type="email" autoComplete="username" className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="you@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Phone Number</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input id="signup-phone" type="tel" className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input id="signup-password" type={showPass ? 'text' : 'password'} autoComplete="new-password" className="input-field" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} placeholder="8+ characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} />
                        <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {/* Password strength hint */}
                      {form.password.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.25rem' }}>
                          {[1,2,3,4].map(i => (
                            <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: form.password.length >= i * 3 ? i <= 2 ? '#f97316' : '#10b981' : 'var(--border-subtle)', transition: 'background 0.3s' }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }} onClick={handleStep1}>
                      Continue <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
                  >
                    <div className="input-group">
                      <label className="input-label">College / Institute Name</label>
                      <div style={{ position: 'relative' }}>
                        <GraduationCap size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input id="signup-college" className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="VNIT Nagpur" value={form.college} onChange={e => set('college', e.target.value)} required />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Program</label>
                      <select id="signup-program" className="input-field" value={form.program} onChange={e => set('program', e.target.value)} required style={{ appearance: 'none', cursor: 'pointer' }}>
                        <option value="">Select your program</option>
                        {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Current Semester</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {SEMESTERS.map(s => (
                          <button type="button" key={s} onClick={() => set('semester', s)} style={{
                            padding: '0.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all var(--transition-fast)',
                            border: `1px solid ${form.semester === s ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                            background: form.semester === s ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.03)',
                            color: form.semester === s ? 'var(--primary-300)' : 'var(--text-secondary)',
                            fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)',
                          }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setStep(1); setError('') }}>
                        Back
                      </button>
                      <button id="signup-submit" type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '0.85rem' }} disabled={loading}>
                        {loading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                        ) : (
                          <><Zap size={16} />Create Account</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
