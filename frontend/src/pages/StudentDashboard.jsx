import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, LayoutDashboard, FileText, Upload, Bell, Package, Play,
  LogOut, Menu, X, CheckCircle2, Clock, Truck,
  Download, MessageSquare, Zap, AlertCircle, BarChart3,
  User, Loader2, WifiOff
} from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import {
  getStudentProjects,
  getProjectDetails,
  subscribeToProjectUpdates,
  subscribeToProjectStatus,
  getSignedFileUrl
} from '../services/projectService'
import { subscribeToDeliveryUpdates } from '../services/notificationService'

/* ── Nav Items ── */
const navItems = [
  { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
  { icon: BarChart3, label: 'Project Status', id: 'status' },
  { icon: Upload, label: 'Uploads', id: 'uploads' },
  { icon: Bell, label: 'Notifications', id: 'notifications', badge: 2 },
  { icon: Package, label: 'Delivery', id: 'delivery' },
  { icon: FileText, label: 'Reports', id: 'reports' },
  { icon: MessageSquare, label: 'Support', id: 'support' },
]

/* ── Sidebar ── */
function Sidebar({ active, setActive, open, setOpen, project, profile, unreadCount, logout }) {
  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
          className="sidebar-overlay"
        />
      )}
      <aside className={`sidebar ${open ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, var(--primary-600), var(--cyan-500))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>
              Circuit<span className="gradient-text-blue">Forge</span>
            </span>
          </Link>
          <button className="sidebar-close" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'none' }}>
            <X size={18} />
          </button>
        </div>

        {/* Project badge */}
        {project && (
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-lg)', padding: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--primary-400)', marginBottom: '0.2rem' }}>{project?.project_ref || 'N/A'}</div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', lineHeight: 1.3, marginBottom: '0.5rem' }}>{project?.title || 'No Project'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="progress-bar-track" style={{ flex: 1, height: 4 }}>
                  <div className="progress-bar-fill" style={{ width: `${project?.progress || 0}%` }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--cyan-300)' }}>{project?.progress || 0}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-lg)',
                background: active === item.id ? 'rgba(79,70,229,0.12)' : 'transparent',
                border: `1px solid ${active === item.id ? 'var(--border-soft)' : 'transparent'}`,
                color: active === item.id ? 'var(--primary-300)' : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                position: 'relative',
              }}
              onMouseEnter={e => { if (active !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
              onMouseLeave={e => { if (active !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
            >
              <item.icon size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'notifications' && unreadCount > 0 ? (
                <span style={{ background: 'var(--primary-600)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '0.6rem', padding: '0.1rem 0.4rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{unreadCount}</span>
              ) : item.badge && item.id !== 'notifications' && (
                <span style={{ background: 'var(--primary-600)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '0.6rem', padding: '0.1rem 0.4rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-600), var(--cyan-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{profile?.full_name || 'Student'}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{profile?.college_name || 'College'}</div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </aside>
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-overlay { display: block !important; }
          .sidebar-close { display: block !important; }
        }
      `}</style>
    </>
  )
}

/* ── Overview panel ── */
function OverviewPanel({ project, profile, notifications }) {
  const deadline = project?.deadline_date || project?.deadline
  const daysLeft = deadline ? Math.ceil((new Date(deadline) - new Date()) / 86400000) : null
  const timeline = project?.project_updates || []
  const activePhase = project?.current_phase || 'N/A'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Welcome */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.3rem' }}>
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Your project is progressing well. Here's a quick overview.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {[
          { label: 'Progress', value: `${project?.progress || 0}%`, sub: 'Overall completion', color: 'var(--primary-400)', icon: BarChart3 },
          { label: 'Days to Deadline', value: daysLeft !== null ? daysLeft : 'N/A', sub: deadline ? `Due ${deadline}` : 'No deadline set', color: daysLeft !== null && daysLeft < 20 ? 'var(--amber-400)' : 'var(--emerald-400)', icon: Clock },
          { label: 'Current Phase', value: activePhase, sub: 'Active milestone', color: 'var(--cyan-400)', icon: Zap },
          { label: 'Project Ref', value: project?.project_ref || 'N/A', sub: 'Reference number', color: 'var(--purple-400)', icon: FileText },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <s.icon size={14} color={s.color} />
            </div>
            <div style={{ fontSize: String(s.value).length > 10 ? 'var(--text-sm)' : 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-heading)', color: s.color, marginBottom: '0.25rem' }}>{s.value}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Project progress timeline */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 'var(--space-5)', fontSize: 'var(--text-base)' }}>Project Updates</h3>
        {timeline.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No updates yet. Check back soon.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {timeline.slice(0, 5).map((update, i) => (
              <div key={update.id || i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? 'rgba(79,70,229,0.15)' : 'rgba(16,185,129,0.15)',
                  border: `1.5px solid ${i === 0 ? 'var(--primary-500)' : 'var(--emerald-500)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i === 0 ? (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-400)' }} />
                  ) : <CheckCircle2 size={12} color="var(--emerald-400)" />}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: i === 0 ? 'var(--primary-300)' : 'var(--text-primary)', fontWeight: i === 0 ? 600 : 400 }}>
                    {update.message || update.phase || 'Update'}
                    {i === 0 && <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.6rem' }}>Latest</span>}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {update.created_at ? new Date(update.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Overall progress bar */}
        <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Overall Progress</span>
            <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--cyan-300)' }}>{project?.progress || 0}%</span>
          </div>
          <div className="progress-bar-track">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${project?.progress || 0}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Two-col bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="dash-bottom-grid">
        {/* Recent notifications */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>Recent Notifications</h3>
          {(notifications || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>No notifications yet.</p>
          ) : (notifications || []).slice(0, 3).map(n => (
            <div key={n.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.type === 'success' ? 'var(--emerald-400)' : 'var(--primary-400)', marginTop: '0.35rem', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: n.is_read ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: n.is_read ? 400 : 500 }}>{n.body || n.text}</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {n.created_at ? new Date(n.created_at).toLocaleDateString() : n.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { icon: Download, label: 'Download Project Report', color: 'var(--primary-400)', disabled: true, note: 'Ready soon' },
              { icon: Play, label: 'Watch Demo Video', color: 'var(--emerald-400)', disabled: true, note: 'Ready soon' },
              { icon: MessageSquare, label: 'Message Project Manager', color: 'var(--cyan-400)', disabled: false, note: '' },
              { icon: Truck, label: 'Schedule Pickup', color: 'var(--amber-400)', disabled: true, note: 'After delivery' },
            ].map(a => (
              <button
                key={a.label}
                disabled={a.disabled}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  color: a.disabled ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontSize: 'var(--text-xs)', fontFamily: 'var(--font-heading)',
                  cursor: a.disabled ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-fast)',
                  opacity: a.disabled ? 0.5 : 1,
                  textAlign: 'left',
                }}
              >
                <a.icon size={14} color={a.color} />
                <span style={{ flex: 1 }}>{a.label}</span>
                {a.note && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.note}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .dash-bottom-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Reports panel ── */
function ReportsPanel({ project }) {
  const files = project?.project_files || []
  const { session } = useAuth()
  const download = async (path, bucket) => {
    try {
      const res = await getSignedFileUrl(bucket, path, session?.access_token)
      window.open(res.signedUrl, '_blank')
    } catch (e) {
      alert('Download failed')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>Reports & Media</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
        {[
          { icon: FileText, title: 'Project Report PDF', file_type: 'report_pdf', desc: 'Full technical documentation, circuit diagrams, code listings, and BOM.', color: 'var(--primary-400)' },
          { icon: Play, title: 'Demonstration Video', file_type: 'demo_video', desc: 'Professional video showcasing working hardware with narration.', color: 'var(--emerald-400)' },
          { icon: FileText, title: 'Viva Q&A Sheet', file_type: 'viva', desc: 'Curated set of expected viva questions with model answers.', color: 'var(--purple-400)' },
          { icon: Download, title: 'Source Code Archive', file_type: 'source_code', desc: 'All firmware and software source files with comments.', color: 'var(--cyan-400)' },
        ].map(r => {
          const found = files.find(f => f.file_type === r.file_type || (r.file_type === 'viva' && f.file_type === 'other' && f.label?.includes('Viva')))
          const status = found ? 'ready' : 'pending'
          return (
            <div key={r.title} className="card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: `${r.color}15`, border: `1px solid ${r.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <r.icon size={20} color={r.color} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '0.4rem' }}>{r.title}</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>{r.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {status === 'ready' ? <span className="badge badge-emerald">Ready</span> : <span className="badge badge-amber">Preparing</span>}
                  <button
                    disabled={status !== 'ready'}
                    onClick={() => found && download(found.storage_path, found.bucket_name)}
                    className="btn btn-ghost btn-sm"
                    style={{ opacity: status === 'ready' ? 1 : 0.4, cursor: status === 'ready' ? 'pointer' : 'not-allowed', fontSize: 'var(--text-xs)' }}
                  >
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <AlertCircle size={18} color="var(--amber-400)" />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          All files will be uploaded and available for download <strong style={{ color: 'var(--text-primary)' }}>10 days before your deadline</strong>.
        </p>
      </div>
    </div>
  )
}

/* ── Notifications panel ── */
function NotificationsPanel({ notifications, markAsRead }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>Notifications</h1>
      {(notifications || []).length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <Bell size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {(notifications || []).map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className="card"
              style={{
                padding: 'var(--space-4) var(--space-5)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start',
                borderLeft: `3px solid ${n.is_read ? 'var(--border-subtle)' : 'var(--primary-500)'}`,
                cursor: n.is_read ? 'default' : 'pointer'
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(79,70,229,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={16} color="var(--primary-400)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: n.is_read ? 400 : 600, color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)', marginBottom: '0.25rem' }}>{n.title || n.body}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{n.body}</p>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                </span>
              </div>
              {!n.is_read && <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>New</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Delivery panel ── */
function DeliveryPanel({ project }) {
  const tracking = project?.delivery_tracking || {}
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>Delivery & Pickup</h1>
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={22} color="var(--amber-400)" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Hardware Delivery Status</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {tracking.status ? `Current Status: ${tracking.status}` : 'Hardware is still in development — delivery options will appear here once ready.'}
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          {[
            { label: 'Pickup Location', value: tracking.pickup_location || 'CircuitForge Office, Nagpur', icon: Package },
            { label: 'Estimated Ready Date', value: tracking.estimated_date || 'TBD', icon: Clock },
            { label: 'Delivery Available', value: 'Within Nagpur City', icon: Truck },
            { label: 'Contact', value: '+91 98765 43210', icon: MessageSquare },
          ].map(d => (
            <div key={d.label} style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: '0.3rem', fontFamily: 'var(--font-mono)' }}>{d.label}</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Support panel ── */
function SupportPanel({ project }) {
  const [msg, setMsg] = useState('')
  const [messages, setMessages] = useState([
    { from: 'manager', text: 'Welcome! Feel free to ask any questions about your project.', time: 'Today' },
  ])
  const send = () => {
    if (!msg.trim()) return
    setMessages(m => [...m, { from: 'student', text: msg, time: 'Just now' }])
    setMsg('')
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', height: '100%' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>Chat Support</h1>
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-600), var(--cyan-500))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{project?.users?.name || 'Project Manager'}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald-400)', display: 'inline-block' }} />Online</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 320 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.from === 'student' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '0.6rem 0.9rem',
                borderRadius: m.from === 'student' ? 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                background: m.from === 'student' ? 'linear-gradient(135deg, var(--primary-600), var(--primary-500))' : 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-subtle)',
              }}>
                <p style={{ fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>{m.text}</p>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem' }}>
          <input
            className="input-field"
            placeholder="Type a message..."
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            style={{ flex: 1, padding: '0.6rem 1rem', fontSize: 'var(--text-xs)' }}
          />
          <button className="btn btn-primary btn-sm" onClick={send}><Zap size={14} /></button>
        </div>
      </div>
    </div>
  )
}

/* ── MAIN DASHBOARD ── */
export default function StudentDashboard() {
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { session, profile, getAccessToken, signOut } = useAuth()
  const navigate = useNavigate()

  const [activeProject, setActiveProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [realtimeStatus, setRealtimeStatus] = useState('connecting')

  const { notifications, unreadCount, markAsRead, loading: notifLoading } = useNotifications()

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const token = getAccessToken()
      if (!token) return
      const res = await getStudentProjects(token)
      if (res.projects && res.projects.length > 0) {
        const details = await getProjectDetails(res.projects[0].id, token)
        setActiveProject(details.project)
      } else {
        setActiveProject(null)
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Realtime subscriptions
  useEffect(() => {
    if (!activeProject?.id) return

    setRealtimeStatus('connected')
    let updatesSub, statusSub, deliverySub

    const setupSubs = async () => {
      updatesSub = await subscribeToProjectUpdates(activeProject.id, (update) => {
        setActiveProject(prev => prev ? { ...prev, project_updates: [update, ...(prev.project_updates || [])] } : prev)
      })
      statusSub = await subscribeToProjectStatus(activeProject.id, (updatedProj) => {
        setActiveProject(prev => prev ? { ...prev, ...updatedProj } : prev)
      })
      deliverySub = await subscribeToDeliveryUpdates(activeProject.id, (event) => {
        setActiveProject(prev => prev ? { ...prev, delivery_tracking: event.delivery } : prev)
      })
    }

    setupSubs().catch(() => setRealtimeStatus('offline'))

    return () => {
      if (updatesSub) updatesSub.unsubscribe()
      if (statusSub) statusSub.unsubscribe()
      if (deliverySub) deliverySub.unsubscribe()
    }
  }, [activeProject?.id])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading || notifLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader2 size={32} color="var(--primary-500)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>LOADING DASHBOARD...</span>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!activeProject) {
    return (
      <div className="dashboard-layout">
        <Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} profile={profile} logout={handleLogout} />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <LayoutDashboard size={24} color="var(--primary-400)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Active Projects</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>You haven't submitted any projects yet.</p>
            <Link to="/submit-project" className="btn btn-primary" style={{ justifyContent: 'center' }}>Submit a Project</Link>
          </div>
        </main>
      </div>
    )
  }

  const panels = {
    overview: <OverviewPanel project={activeProject} profile={profile} notifications={notifications} />,
    status: <OverviewPanel project={activeProject} profile={profile} notifications={notifications} />,
    uploads: <ReportsPanel project={activeProject} />,
    notifications: <NotificationsPanel notifications={notifications} markAsRead={markAsRead} />,
    delivery: <DeliveryPanel project={activeProject} />,
    reports: <ReportsPanel project={activeProject} />,
    support: <SupportPanel project={activeProject} />,
  }

  return (
    <PageTransition>
      <div className="dashboard-layout">
        <Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} project={activeProject} profile={profile} unreadCount={unreadCount} logout={handleLogout} />
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'rgba(8,13,26,0.92)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 var(--space-6)', height: 60,
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <button onClick={() => setSidebarOpen(v => !v)} className="sidebar-toggle" style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.35rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'none' }}>
              <Menu size={18} />
            </button>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                student dashboard / <span style={{ color: 'var(--primary-400)' }}>{active}</span>
              </span>
            </div>
            {realtimeStatus === 'connected' ? (
              <div className="badge badge-emerald"><span className="pulse-dot" />Live Updates</div>
            ) : realtimeStatus === 'offline' ? (
              <div className="badge badge-amber"><WifiOff size={12} /> Offline</div>
            ) : null}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: 'var(--space-6) var(--space-8)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {panels[active]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-toggle { display: flex !important; }
        }
        @media (max-width: 768px) {
          .main-content > div:last-child { padding: var(--space-4) !important; }
        }
      `}</style>
    </PageTransition>
  )
}
