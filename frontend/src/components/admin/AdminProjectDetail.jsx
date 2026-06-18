import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, CheckCircle2, Clock, Upload, FileText, Zap, Send,
  Edit3, Save, X, Truck, Package, Loader2, AlertCircle
} from 'lucide-react'
import { updateProjectStatus, updateDeliveryStatus, sendNotification, uploadProjectFile } from '../../services/adminService'

const STATUS_FLOW = [
  { value: 'pending',   label: 'Pending',     color: 'var(--amber-400)' },
  { value: 'approved',  label: 'Approved',    color: 'var(--cyan-400)' },
  { value: 'in_progress', label: 'In Progress', color: 'var(--primary-400)' },
  { value: 'review',   label: 'In Review',   color: 'var(--purple-400)' },
  { value: 'delivered', label: 'Delivered',   color: 'var(--emerald-400)' },
  { value: 'cancelled', label: 'Cancelled',   color: 'var(--red-400)' },
]

// Actual delivery_status enum: not_started, packaging, dispatched, out_for_delivery, delivered, picked_up
// Actual delivery_type enum: pickup, delivery
const DELIVERY_FLOW = [
  { value: 'not_started',       label: 'Not Started' },
  { value: 'packaging',         label: 'Packaging' },
  { value: 'dispatched',        label: 'Dispatched' },
  { value: 'out_for_delivery',  label: 'Out for Delivery' },
  { value: 'delivered',         label: 'Delivered' },
  { value: 'picked_up',         label: 'Picked Up' },
]

export default function AdminProjectDetail({ project: initialProject, onBack, onUpdate }) {
  const [project, setProject] = useState(initialProject)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState(null)

  // Status form state
  const [status, setStatus] = useState(project?.status || 'pending')
  const [progress, setProgress] = useState(project?.progress || 0)
  const [phase, setPhase] = useState(project?.current_phase || '')
  const [notes, setNotes] = useState(project?.manager_notes || '')

  // Delivery state — column names match actual delivery_tracking table schema
  const [deliveryStatus, setDeliveryStatus] = useState(project?.delivery_tracking?.[0]?.status || 'not_started')
  const [pickupLocation, setPickupLocation] = useState(project?.delivery_tracking?.[0]?.pickup_address || '')
  const [estimatedDate, setEstimatedDate] = useState(project?.delivery_tracking?.[0]?.scheduled_date || '')
  const [deliveryType, setDeliveryType] = useState(project?.delivery_tracking?.[0]?.delivery_type || 'pickup')

  // File upload state
  const [file, setFile] = useState(null)
  const [fileType, setFileType] = useState('report_pdf')
  const [fileLabel, setFileLabel] = useState('')

  // Notification state
  const [notifTitle, setNotifTitle] = useState('')
  const [notifBody, setNotifBody] = useState('')

  useEffect(() => {
    if (initialProject) {
      setProject(initialProject)
      setStatus(initialProject.status || 'pending')
      setProgress(initialProject.progress || 0)
      setPhase(initialProject.current_phase || '')
      setNotes(initialProject.manager_notes || '')
      const dt = initialProject.delivery_tracking?.[0]
      if (dt) {
        setDeliveryStatus(dt.status || 'not_started')
        setPickupLocation(dt.pickup_address || '')
        setEstimatedDate(dt.scheduled_date || '')
        setDeliveryType(dt.delivery_type || 'pickup')
      }
    }
  }, [initialProject])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveStatus = async () => {
    try {
      setLoading(true)
      await updateProjectStatus(project.id, { status, progress: parseInt(progress), current_phase: phase, manager_notes: notes })
      setEditing(false)
      showToast('Project status updated!')
      if (onUpdate) onUpdate()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDelivery = async () => {
    try {
      setLoading(true)
      await updateDeliveryStatus(project.id, {
        status:          deliveryStatus,
        pickup_address:  pickupLocation,
        scheduled_date:  estimatedDate || null,
        delivery_type:   deliveryType,
      })
      showToast('Delivery status updated!')
      if (onUpdate) onUpdate()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    try {
      setLoading(true)
      await uploadProjectFile(project.id, file, fileType, fileLabel || file.name)
      setFile(null)
      setFileLabel('')
      showToast('File uploaded successfully!')
      if (onUpdate) onUpdate()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async (e) => {
    e.preventDefault()
    if (!notifTitle || !notifBody) return
    try {
      setLoading(true)
      await sendNotification({
        user_id:    project.student_id,
        project_id: project.id,
        title:      notifTitle,
        body:       notifBody,
        type:       'admin_note',
      })
      setNotifTitle('')
      setNotifBody('')
      showToast('Notification sent!')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!project) return null

  const currentStatusDef = STATUS_FLOW.find(s => s.value === project.status) || STATUS_FLOW[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
            padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)',
            background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
            border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
            color: toast.type === 'error' ? '#f87171' : 'var(--emerald-400)',
            fontSize: 'var(--text-sm)', fontWeight: 600, backdropFilter: 'blur(8px)',
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} /> : <CheckCircle2 size={14} style={{ display: 'inline', marginRight: 6 }} />}
          {toast.msg}
        </motion.div>
      )}

      {/* Back button + header */}
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={14} /> Back to Projects
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-400)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>{project.project_ref}</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', marginBottom: '0.25rem' }}>{project.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            {project.student?.full_name} — {project.student?.college_name} · {project.student?.semester}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', background: `${currentStatusDef.color}20`, border: `1px solid ${currentStatusDef.color}40`, color: currentStatusDef.color, fontSize: 'var(--text-xs)', fontWeight: 700 }}>
            {currentStatusDef.label}
          </span>
          {!editing ? (
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}><Edit3 size={14} /> Edit</button>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} disabled={loading}><X size={14} /> Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSaveStatus} disabled={loading}>
                {loading ? <Loader2 size={14} className="spin" /> : <Save size={14} />} Save
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }} className="admin-detail-grid">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Status form */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>Project Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Status</label>
                {editing ? (
                  <select className="input-field" value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
                    {STATUS_FLOW.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                ) : <div style={{ fontWeight: 600, color: currentStatusDef.color }}>{currentStatusDef.label}</div>}
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Progress ({progress}%)</label>
                {editing ? (
                  <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary-500)' }} />
                ) : (
                  <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${project.progress}%` }} /></div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Current Phase</label>
                {editing ? (
                  <input type="text" className="input-field" value={phase} onChange={e => setPhase(e.target.value)} placeholder="e.g., PCB Fabrication" style={{ width: '100%' }} />
                ) : <div style={{ fontWeight: 500 }}>{project.current_phase || 'Not set'}</div>}
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Internal Notes (Admin only)</label>
                {editing ? (
                  <textarea className="input-field" value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', minHeight: 80 }} />
                ) : <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{project.manager_notes || 'No notes.'}</div>}
              </div>
            </div>
          </div>

          {/* Delivery status */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)' }}><Truck size={14} style={{ display: 'inline', marginRight: 6 }} />Delivery Tracking</h3>
              <button className="btn btn-primary btn-sm" onClick={handleSaveDelivery} disabled={loading}>
                {loading ? <Loader2 size={12} className="spin" /> : <Save size={12} />} Update
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Delivery Status</label>
                <select className="input-field" value={deliveryStatus} onChange={e => setDeliveryStatus(e.target.value)} style={{ width: '100%' }}>
                  {DELIVERY_FLOW.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Delivery Type</label>
                <select className="input-field" value={deliveryType} onChange={e => setDeliveryType(e.target.value)} style={{ width: '100%' }}>
                  <option value="pickup">Pickup at Office</option>
                  <option value="delivery">Courier Delivery</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Pickup / Delivery Location</label>
                <input type="text" className="input-field" value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} placeholder="CircuitForge Office, Nagpur" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Estimated Date</label>
                <input type="date" className="input-field" value={estimatedDate} onChange={e => setEstimatedDate(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* File Upload */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}><Upload size={14} style={{ display: 'inline', marginRight: 6 }} />Upload File</h3>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <select className="input-field" value={fileType} onChange={e => setFileType(e.target.value)}>
                <option value="report_pdf">Report PDF</option>
                <option value="demo_video">Demo Video</option>
                <option value="circuit_diagram">Circuit Diagram</option>
                <option value="source_code">Source Code (ZIP)</option>
                <option value="delivery_image">Delivery Image</option>
                <option value="other">Other</option>
              </select>
              <input type="text" className="input-field" placeholder="File label (e.g., Final Report v2)" value={fileLabel} onChange={e => setFileLabel(e.target.value)} />
              <input type="file" className="input-field" onChange={e => setFile(e.target.files[0])} />
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !file} style={{ justifyContent: 'center' }}>
                {loading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />} Upload
              </button>
            </form>
            {/* Uploaded files list */}
            {project.project_files?.length > 0 && (
              <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>UPLOADED FILES</div>
                {project.project_files.map(f => (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={12} color="var(--primary-400)" />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>{f.label}</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{f.file_type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Send Notification */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}><Send size={14} style={{ display: 'inline', marginRight: 6 }} />Send Notification</h3>
            <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" className="input-field" placeholder="Notification title" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} required />
              <textarea className="input-field" placeholder="Message body..." value={notifBody} onChange={e => setNotifBody(e.target.value)} required style={{ minHeight: 80 }} />
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !notifTitle || !notifBody} style={{ justifyContent: 'center' }}>
                {loading ? <Loader2 size={14} className="spin" /> : <Send size={14} />} Send
              </button>
            </form>
          </div>

          {/* Project Info */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>Project Details</h3>
            {[
              { label: 'Description', value: project.description },
              { label: 'Category', value: project.category_name || 'N/A' },
              { label: 'Budget Range', value: project.budget_range || 'N/A' },
              { label: 'Deadline', value: project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A' },
              { label: 'Submitted', value: project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A' },
            ].map(d => (
              <div key={d.label} style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{d.label}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', lineHeight: 1.6 }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-detail-grid { grid-template-columns: 1fr !important; }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
