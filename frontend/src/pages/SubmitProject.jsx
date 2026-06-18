import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, Upload, FileText, Calendar, CheckCircle2,
  ArrowRight, ArrowLeft, Zap, ChevronDown, X, AlertCircle
} from 'lucide-react'
import CircuitBackground from '../components/CircuitBackground'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../contexts/AuthContext'
import { submitProject, uploadProjectFile } from '../services/projectService'

const CATEGORIES = [
  'IoT & Smart Systems', 'Robotics & Automation', 'Embedded Systems',
  'Power Electronics', 'Signal Processing', 'Communication Systems',
  'Medical Electronics', 'Agriculture Tech', 'Industrial Automation', 'Other',
]

const BUDGETS = ['₹2,000 – ₹4,000', '₹4,000 – ₹7,000', '₹7,000 – ₹12,000', '₹12,000+']
const SEMESTERS = ['3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem']

const STEPS = [
  { id: 1, label: 'Project Details' },
  { id: 2, label: 'Requirements' },
  { id: 3, label: 'Upload & Review' },
]

export default function SubmitProject() {
  const navigate = useNavigate()
  const { session, profile } = useAuth()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [projectRef, setProjectRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState([])

  const [form, setForm] = useState({
    title: '', category: '', semester: '', college: '', deadline: '',
    description: '', components: '', budget: '', notes: '', program: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Populate college and program from profile
  useEffect(() => {
    if (profile) {
      setForm(f => ({
        ...f,
        college: f.college || profile.college_name || '',
        program: f.program || profile.program || '',
      }))
    }
  }, [profile])

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    try {
      setError('')
      setLoading(true)

      // Validate all required fields
      if (!form.title || !form.category || !form.semester || !form.college || !form.deadline || !form.description || !form.budget) {
        throw new Error('Please fill in all required fields')
      }

      // Get access token
      const accessToken = session?.access_token
      if (!accessToken) {
        throw new Error('Authentication error. Please log in again.')
      }

      // Submit project to backend
      const response = await submitProject(form, accessToken)
      
      // Upload files if any
      if (files.length > 0 && response.project?.id) {
        for (const file of files) {
          try {
            await uploadProjectFile(
              response.project.id,
              file,
              'abstract',
              file.name,
              accessToken
            )
          } catch (err) {
            console.error('File upload error:', err)
            // Continue with other files if one fails
          }
        }
      }

      // Show success
      setProjectRef(response.project?.project_ref || 'CF-XXXX')
      setSubmitted(true)
      
      // Redirect to dashboard after 5 seconds
      setTimeout(() => navigate('/dashboard'), 5000)
    } catch (err) {
      setError(err.message || 'Failed to submit project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <PageTransition>
        <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <CircuitBackground />
          <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(16,185,129,0.1)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ textAlign: 'center', maxWidth: 480, padding: '2rem', position: 'relative', zIndex: 1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid var(--emerald-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(16,185,129,0.3)' }}
            >
              <CheckCircle2 size={36} color="var(--emerald-400)" />
            </motion.div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-3xl)', marginBottom: '1rem' }}>
              Project Submitted! 🎉
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              Your project <strong style={{ color: 'var(--text-primary)' }}>{form.title}</strong> has been received. Our team will review it within 24 hours.
            </p>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '2rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--emerald-400)' }}>Project Reference</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {projectRef}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <Zap size={16} /> Go to Dashboard
              </Link>
              <Link to="/" className="btn btn-ghost btn-lg">Back to Home</Link>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', position: 'relative', overflow: 'hidden', paddingTop: '5rem', paddingBottom: '3rem' }}>
        <CircuitBackground />
        <div className="glow-orb" style={{ width: 500, height: 400, background: 'rgba(79,70,229,0.1)', top: '-10%', right: '-10%' }} />

        <div className="container" style={{ maxWidth: 740, position: 'relative', zIndex: 1 }}>
          {/* Back link */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '2rem' }}>
            <ArrowLeft size={14} /> Back to home
          </Link>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, var(--primary-600), var(--cyan-500))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={16} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>Circuit<span className="gradient-text-blue">Forge</span></span>
            </Link>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Submit Your Project
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Fill in the details below and we'll get back to you within 24 hours.</p>
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '2.5rem' }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step > s.id ? 'var(--emerald-500)' : step === s.id ? 'var(--primary-600)' : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${step > s.id ? 'var(--emerald-500)' : step === s.id ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                    fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', fontWeight: 700,
                    color: step >= s.id ? '#fff' : 'var(--text-muted)',
                    transition: 'all var(--transition-base)',
                    boxShadow: step === s.id ? 'var(--glow-primary)' : 'none',
                  }}>
                    {step > s.id ? <CheckCircle2 size={14} /> : s.id}
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-heading)', fontWeight: 500, color: step >= s.id ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }} className="step-label">
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, margin: '0 0.75rem', background: step > s.id ? 'var(--emerald-500)' : 'var(--border-subtle)', transition: 'background var(--transition-slow)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div style={{ background: 'rgba(13,18,35,0.88)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', backdropFilter: 'blur(20px)', overflow: 'hidden' }}>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderBottom: '1px solid var(--border-subtle)',
                  padding: '1rem 2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <AlertCircle size={18} color="var(--rose-400)" />
                <span style={{ color: 'var(--rose-300)', fontSize: 'var(--text-sm)' }}>{error}</span>
              </motion.div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                style={{ padding: '2.5rem' }}
              >
                {/* STEP 1 */}
                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-xl)', marginBottom: '0.25rem' }}>Project Details</h2>

                    <div className="input-group">
                      <label className="input-label">Project Title <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                      <input className="input-field" placeholder="e.g. Smart Home Automation using ESP32" value={form.title} onChange={e => set('title', e.target.value)} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="form-grid-2">
                      <div className="input-group">
                        <label className="input-label">Project Category <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                        <select
                          className="input-field"
                          value={form.category}
                          onChange={e => set('category', e.target.value)}
                          required
                          style={{
                            appearance: 'none',
                            cursor: 'pointer',
                            backgroundColor: 'rgba(13,18,35,0.88)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <option value="" style={{ backgroundColor: 'var(--bg-deep)', color: 'var(--text-primary)' }}>Select category</option>
                          {CATEGORIES.map(c => <option key={c} value={c} style={{ backgroundColor: 'var(--bg-deep)', color: 'var(--text-primary)' }}>{c}</option>)}
                        </select>
                      </div>
                      <div className="input-group">
                        <label className="input-label">Current Semester <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                        <select
                          className="input-field"
                          value={form.semester}
                          onChange={e => set('semester', e.target.value)}
                          required
                          style={{
                            appearance: 'none',
                            cursor: 'pointer',
                            backgroundColor: 'rgba(13,18,35,0.88)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <option value="" style={{ backgroundColor: 'var(--bg-deep)', color: 'var(--text-primary)' }}>Select semester</option>
                          {SEMESTERS.map(s => <option key={s} value={s} style={{ backgroundColor: 'var(--bg-deep)', color: 'var(--text-primary)' }}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="form-grid-2">
                      <div className="input-group">
                        <label className="input-label">College / Institute <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                        <input className="input-field" placeholder="VNIT Nagpur" value={form.college} onChange={e => set('college', e.target.value)} required />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Program / Branch</label>
                        <input className="input-field" placeholder="E.g., Electronics Engineering" value={form.program} onChange={e => set('program', e.target.value)} />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Submission Deadline <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="date" className="input-field" style={{ paddingLeft: '2.5rem', colorScheme: 'dark' }} value={form.deadline} onChange={e => set('deadline', e.target.value)} required min={new Date().toISOString().split('T')[0]} />
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => setStep(2)}
                      disabled={!form.title || !form.category || !form.semester || !form.college || !form.deadline}
                      style={{ alignSelf: 'flex-end', paddingLeft: '2rem', paddingRight: '2rem' }}
                    >
                      Next <ArrowRight size={15} />
                    </button>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-xl)', marginBottom: '0.25rem' }}>Project Requirements</h2>

                    <div className="input-group">
                      <label className="input-label">Project Description <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                      <textarea
                        className="input-field textarea-field"
                        placeholder="Describe your project — what it should do, key features, microcontroller preferences, sensors required, etc."
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                        required
                        style={{ minHeight: 140 }}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Specific Components (if any)</label>
                      <input className="input-field" placeholder="e.g. ESP32, DHT22, 16x2 LCD, Relay module, L298N motor driver" value={form.components} onChange={e => set('components', e.target.value)} />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Budget Range <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {BUDGETS.map(b => (
                          <button
                            type="button"
                            key={b}
                            onClick={() => set('budget', b)}
                            style={{
                              padding: '0.65rem',
                              borderRadius: 'var(--radius-lg)',
                              border: `1px solid ${form.budget === b ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                              background: form.budget === b ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.03)',
                              color: form.budget === b ? 'var(--primary-300)' : 'var(--text-secondary)',
                              fontSize: 'var(--text-sm)',
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)',
                            }}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Additional Notes</label>
                      <textarea className="input-field textarea-field" placeholder="Any other requirements, reference papers, special instructions..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ minHeight: 80 }} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back</button>
                      <button
                        className="btn btn-primary"
                        onClick={() => setStep(3)}
                        disabled={!form.description || !form.budget}
                        style={{ paddingLeft: '2rem', paddingRight: '2rem' }}
                      >
                        Next <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-xl)', marginBottom: '0.25rem' }}>Upload & Review</h2>

                    {/* File upload */}
                    <div className="input-group">
                      <label className="input-label">Upload Abstract / Reference Documents</label>
                      <label
                        htmlFor="file-upload"
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: '0.75rem', padding: '2.5rem 1.5rem',
                          border: `2px dashed ${dragOver ? 'var(--cyan-400)' : 'var(--border-medium)'}`,
                          borderRadius: 'var(--radius-xl)',
                          background: dragOver ? 'rgba(0,196,240,0.06)' : 'rgba(79,70,229,0.04)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-base)',
                        }}
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]) }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'rgba(0,196,240,0.1)', border: '1px solid rgba(0,196,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Upload size={20} color="var(--cyan-400)" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '0.25rem' }}>Drop files here or <span style={{ color: 'var(--cyan-300)' }}>browse</span></p>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>PDF, DOCX, ZIP — up to 50MB each</p>
                        </div>
                        <input id="file-upload" type="file" multiple accept=".pdf,.docx,.zip,.doc" onChange={handleFileChange} style={{ display: 'none' }} />
                      </label>

                      {/* File list */}
                      {files.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                          {files.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}>
                              <FileText size={14} color="var(--primary-400)" />
                              <span style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                              <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Summary review */}
                    <div style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', color: 'var(--primary-300)' }}>Submission Summary</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {[
                          { label: 'Project Title', value: form.title },
                          { label: 'Category', value: form.category },
                          { label: 'College', value: form.college },
                          { label: 'Semester', value: form.semester },
                          { label: 'Deadline', value: form.deadline },
                          { label: 'Budget', value: form.budget },
                          { label: 'Files', value: files.length > 0 ? `${files.length} file(s) attached` : 'None' },
                        ].map(r => (
                          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{r.label}</span>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textAlign: 'right' }}>{r.value || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" onClick={() => setStep(2)}><ArrowLeft size={15} /> Back</button>
                      <button className="btn btn-cyan btn-lg" onClick={handleSubmit} disabled={loading} style={{ minWidth: 180, justifyContent: 'center' }}>
                        {loading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%' }} />
                        ) : (
                          <><Zap size={16} /> Submit Project</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .form-grid-2 { grid-template-columns: 1fr !important; }
            .step-label { display: none; }
          }
        `}</style>
      </div>
    </PageTransition>
  )
}
