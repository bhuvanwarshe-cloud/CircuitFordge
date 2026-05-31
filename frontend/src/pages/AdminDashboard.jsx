import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, LayoutDashboard, Users, FileText, Upload, Bell, Package,
  BarChart3, Settings, LogOut, Menu, X, CheckCircle2, Clock,
  Truck, Eye, Edit3, Filter, Search, Download, Plus, TrendingUp,
  AlertCircle, Zap, User, ChevronDown, MoreHorizontal, Loader2
} from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { useAuth } from '../contexts/AuthContext'
import { getAdminStats, getAllProjects, updateProjectStatus } from '../services/adminService'
import { supabase } from '../lib/supabase'
import AdminProjectDetail from '../components/admin/AdminProjectDetail'

/* ── Constants ── */
const statusMap = {
  pending:     { label: 'Pending',     badge: 'badge-amber',   color: 'var(--amber-400)' },
  in_progress: { label: 'In Progress', badge: 'badge-primary', color: 'var(--primary-400)' },
  review:      { label: 'In Review',   badge: 'badge-cyan',    color: 'var(--cyan-400)' },
  delivered:   { label: 'Delivered',   badge: 'badge-emerald', color: 'var(--emerald-400)' },
  approved:    { label: 'Approved',    badge: 'badge-emerald', color: 'var(--emerald-400)' },
  cancelled:   { label: 'Cancelled',   badge: 'badge-rose',    color: 'var(--rose-400)' },
}

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: FileText, label: 'Orders', id: 'orders' },
  { icon: Users, label: 'Students', id: 'students' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: Upload, label: 'File Manager', id: 'files' },
  { icon: Truck, label: 'Delivery', id: 'delivery' },
  { icon: Bell, label: 'Notifications', id: 'notifications' },
  { icon: Settings, label: 'Settings', id: 'settings' },
]

/* ── Admin Sidebar ── */
function AdminSidebar({ active, setActive, open, setOpen, logout, profile }) {
  const navigate = useNavigate()
  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }} className="admin-overlay" />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, var(--primary-600), var(--cyan-500))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>
              Circuit<span className="gradient-text-blue">Forge</span>
            </span>
          </Link>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'none' }} className="admin-close">
            <X size={18} />
          </button>
        </div>

        {/* Admin badge */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="badge badge-rose" style={{ width: '100%', justifyContent: 'center' }}>
            <span className="pulse-dot" />Admin Panel
          </span>
        </div>

        <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto' }}>
          {adminNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-lg)',
                background: active === item.id ? 'rgba(79,70,229,0.12)' : 'transparent',
                border: `1px solid ${active === item.id ? 'var(--border-soft)' : 'transparent'}`,
                color: active === item.id ? 'var(--primary-300)' : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)', fontFamily: 'var(--font-heading)', fontWeight: 500,
                cursor: 'pointer', transition: 'all var(--transition-fast)', textAlign: 'left',
              }}
            >
              <item.icon size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: 'var(--rose-500)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '0.6rem', padding: '0.1rem 0.4rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--rose-500), var(--purple-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{profile?.full_name || 'Admin'}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>CircuitForge Admin</div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </aside>
      <style>{`
        @media (max-width: 1024px) {
          .admin-overlay { display: block !important; }
          .admin-close { display: block !important; }
        }
      `}</style>
    </>
  )
}

/* ── Admin Dashboard Panel ── */
function AdminDashboardPanel({ stats, projects, onSelectProject }) {
  const statCards = [
    { label: 'Total Orders', value: stats?.totalProjects || 0, change: 'All time', color: 'var(--primary-400)', icon: FileText },
    { label: 'Active', value: stats?.activeProjects || 0, change: 'In Progress', color: 'var(--cyan-400)', icon: Zap },
    { label: 'Delivered', value: stats?.deliveredProjects || 0, change: 'Completed', color: 'var(--emerald-400)', icon: CheckCircle2 },
    { label: 'Total Users', value: stats?.totalUsers || 0, change: 'Students', color: 'var(--amber-400)', icon: Users },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', marginBottom: '0.3rem' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Manage projects, track progress, and update students.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{s.label}</span>
              <s.icon size={14} color={s.color} />
            </div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, fontFamily: 'var(--font-heading)', color: s.color, marginBottom: '0.25rem' }}>{s.value}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Recent orders table preview */}
      <div className="card" style={{ padding: 'var(--space-5)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)' }}>Recent Orders</h3>
          <span className="badge badge-primary">{(projects || []).length} total</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.35rem' }}>
            <thead>
              <tr>
                {['Project ID', 'Student', 'Project', 'Progress', 'Status', 'Deadline'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(projects || []).slice(0, 5).map(o => {
                const s = statusMap[o.status] || { label: o.status, badge: 'badge-primary', color: 'var(--primary-400)' }
                return (
                  <tr key={o.id} onClick={() => onSelectProject && onSelectProject(o)} style={{ background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                    <td style={{ padding: '0.75rem', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--primary-400)' }}>{o.project_ref || String(o.id).substring(0,8)}</td>
                    <td style={{ padding: '0.75rem', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{o.student?.full_name || 'Unknown'}</td>
                    <td style={{ padding: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: 180 }}>{o.title}</td>
                    <td style={{ padding: '0.75rem', minWidth: 100 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="progress-bar-track" style={{ flex: 1, height: 4 }}>
                          <div className="progress-bar-fill" style={{ width: `${o.progress || 0}%` }} />
                        </div>
                        <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: 28 }}>{o.progress || 0}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}><span className={`badge ${s.badge}`}>{s.label}</span></td>
                    <td style={{ padding: '0.75rem', borderRadius: '0 var(--radius-md) var(--radius-md) 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{new Date(o.deadline).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ── Orders Panel ── */
function OrdersPanel({ projects, onSelectProject }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = (projects || []).filter(o => {
    const matchSearch = (o.student?.full_name || '').toLowerCase().includes(search.toLowerCase()) || (o.title || '').toLowerCase().includes(search.toLowerCase()) || (o.project_ref || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>Order Management</h1>
        <button className="btn btn-primary btn-sm"><Plus size={14} /> New Project</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="Search students, projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.4rem', fontSize: 'var(--text-sm)' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[['all', 'All'], ['pending', 'Pending'], ['in_progress', 'In Progress'], ['review', 'Review'], ['delivered', 'Delivered']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all var(--transition-fast)',
              background: filter === val ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filter === val ? 'var(--border-soft)' : 'var(--border-subtle)'}`,
              color: filter === val ? 'var(--primary-300)' : 'var(--text-muted)',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['ID', 'Student / College', 'Project', 'Progress', 'Status', 'Deadline', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const s = statusMap[o.status] || { label: o.status, badge: 'badge-primary', color: 'var(--primary-400)' }
                return (
                  <tr
                    key={o.id}
                    onClick={() => onSelectProject && onSelectProject(o)}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer', transition: 'background var(--transition-fast)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--primary-400)', whiteSpace: 'nowrap' }}>{o.project_ref || String(o.id).substring(0,8)}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{o.student?.full_name || 'Unknown'}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{o.student?.college_name || 'College'} · {o.student?.semester || 'Sem'}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 180 }}>{o.title}</td>
                    <td style={{ padding: '1rem', minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="progress-bar-track" style={{ flex: 1, height: 4 }}>
                          <div className="progress-bar-fill" style={{ width: `${o.progress || 0}%` }} />
                        </div>
                        <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: 28 }}>{o.progress || 0}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}><span className={`badge ${s.badge}`}><span className="pulse-dot" />{s.label}</span></td>
                    <td style={{ padding: '1rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{new Date(o.deadline).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '0.3rem 0.6rem' }}><Eye size={12} /></button>
                        <button className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.6rem' }}><Edit3 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            No orders match your search.
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Analytics Panel ── */
function AnalyticsPanel({ stats, projects }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const values = [4, 7, 5, 12, 9, 15]
  const maxVal = Math.max(...values)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }} className="analytics-grid">
        {/* Bar chart */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>Orders per Month (2026)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 140 }}>
            {months.map((m, i) => (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(values[i] / maxVal) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  style={{
                    width: '100%', background: 'linear-gradient(180deg, var(--cyan-400), var(--primary-600))',
                    borderRadius: '4px 4px 0 0', minHeight: 4,
                    boxShadow: '0 0 8px rgba(0,196,240,0.3)',
                  }}
                />
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status distribution */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>Status Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { label: 'Delivered', count: stats?.deliveredProjects || 0, color: 'var(--emerald-400)' },
              { label: 'Active', count: stats?.activeProjects || 0, color: 'var(--cyan-400)' },
            ].map(s => {
              const total = stats?.totalProjects || 1;
              const pct = (s.count / total) * 100;
              return (
              <div key={s.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: s.color }}>{s.count}</span>
                </div>
                <div className="progress-bar-track" style={{ height: 6 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 'var(--radius-full)', background: s.color, boxShadow: `0 0 6px ${s.color}60` }}
                  />
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>

      {/* Top colleges */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>Top Colleges</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
          {[
            { college: 'VNIT', orders: 45 },
            { college: 'RCOEM', orders: 38 },
            { college: 'PCE', orders: 32 },
            { college: 'YCCE', orders: 29 },
            { college: 'GHRCE', orders: 24 },
            { college: 'Symbiosis', orders: 18 },
          ].map(c => (
            <div key={c.college} style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--cyan-300)', marginBottom: '0.2rem' }}>{c.orders}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.college}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .analytics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

/* ── File Manager Panel ── */
function FileManagerPanel({ projects }) {
  const [uploading, setUploading] = useState(false)
  const [pct, setPct] = useState(0)
  const simulateUpload = () => {
    setUploading(true); setPct(0)
    const iv = setInterval(() => setPct(p => { if (p >= 100) { clearInterval(iv); setUploading(false); return 100 } return p + 5 }), 120)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>File Manager</h1>
      {/* Upload zone */}
      <div
        style={{
          border: '2px dashed var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-10)',
          textAlign: 'center',
          background: 'rgba(79,70,229,0.04)',
          cursor: 'pointer',
          transition: 'all var(--transition-base)',
        }}
        onClick={simulateUpload}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.background = 'rgba(0,196,240,0.06)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.background = 'rgba(79,70,229,0.04)' }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-lg)', background: 'rgba(79,70,229,0.12)', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Upload size={22} color="var(--primary-400)" />
        </div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.5rem' }}>Drop files or click to upload</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Project reports (PDF), demo videos (MP4), source code (ZIP)</p>
        {uploading && (
          <div style={{ marginTop: '1.5rem', maxWidth: 300, margin: '1.5rem auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Uploading...</span>
              <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--cyan-300)' }}>{pct}%</span>
            </div>
            <div className="progress-bar-track">
              <motion.div className="progress-bar-fill" animate={{ width: `${pct}%` }} transition={{ duration: 0.1 }} />
            </div>
          </div>
        )}
      </div>

      {/* Existing files */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>Project Files</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {[
            { name: 'CF-0342-Report.pdf', project: 'CF-2026-0342', size: '4.2 MB', uploaded: 'Pending', type: 'PDF' },
            { name: 'CF-0341-Report.pdf', project: 'CF-2026-0341', size: '3.8 MB', uploaded: 'Today', type: 'PDF' },
            { name: 'CF-0341-Demo.mp4', project: 'CF-2026-0341', size: '124 MB', uploaded: 'Today', type: 'Video' },
            { name: 'CF-0340-SourceCode.zip', project: 'CF-2026-0340', size: '8.1 MB', uploaded: 'Jun 1', type: 'ZIP' },
          ].map(f => (
            <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: f.type === 'PDF' ? 'rgba(244,63,94,0.12)' : f.type === 'Video' ? 'rgba(16,185,129,0.12)' : 'rgba(79,70,229,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={16} color={f.type === 'PDF' ? 'var(--rose-400)' : f.type === 'Video' ? 'var(--emerald-400)' : 'var(--primary-400)'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{f.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{f.project} · {f.size}</div>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{f.uploaded}</div>
              <button className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }}><Download size={12} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── MAIN ADMIN ── */
export default function AdminDashboard() {
  const [active, setActive] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { session, profile, getAccessToken, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = getAccessToken()
      if (!token) return
      
      const [statsRes, projRes] = await Promise.all([
        getAdminStats(token),
        getAllProjects(token)
      ])
      
      setStats(statsRes.stats)
      setProjects(projRes.projects)
      
      if (selectedProject) {
        const updatedSelected = projRes.projects.find(p => p.id === selectedProject.id)
        if (updatedSelected) setSelectedProject(updatedSelected)
      }
    } catch (err) {
      console.error('Failed to load admin data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Admin global subscriptions
  useEffect(() => {
    const sub = supabase.channel('admin_all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchData() // Simple refetch on any project change for admin
      })
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const panels = {
    dashboard: <AdminDashboardPanel stats={stats} projects={projects} onSelectProject={setSelectedProject} />,
    orders: <OrdersPanel projects={projects} onSelectProject={setSelectedProject} />,
    students: <OrdersPanel projects={projects} onSelectProject={setSelectedProject} />,
    analytics: <AnalyticsPanel stats={stats} projects={projects} />,
    files: <FileManagerPanel projects={projects} />,
    delivery: <OrdersPanel projects={projects} onSelectProject={setSelectedProject} />,
    notifications: <AdminDashboardPanel stats={stats} projects={projects} onSelectProject={setSelectedProject} />,
    settings: <AdminDashboardPanel stats={stats} projects={projects} onSelectProject={setSelectedProject} />,
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader2 size={32} color="var(--primary-500)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>LOADING ADMIN PORTAL...</span>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="dashboard-layout">
        <AdminSidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} logout={handleLogout} profile={profile} />
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,13,26,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)', padding: '0 var(--space-6)', height: 60, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSidebarOpen(v => !v)} className="admin-toggle" style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.35rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'none' }}>
              <Menu size={18} />
            </button>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                admin / <span style={{ color: 'var(--rose-400)' }}>{active}</span>
              </span>
            </div>
            <div className="badge badge-rose"><span className="pulse-dot" />Admin Mode</div>
          </div>
          <div style={{ flex: 1, padding: 'var(--space-6) var(--space-8)' }}>
            <AnimatePresence mode="wait">
              {selectedProject ? (
                <motion.div key="project-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <AdminProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} onUpdate={fetchData} />
                </motion.div>
              ) : (
                <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  {panels[active]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .admin-toggle { display: flex !important; }
        }
      `}</style>
    </PageTransition>
  )
}
