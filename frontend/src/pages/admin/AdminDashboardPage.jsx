import { FileText, Users, CheckCircle2, Zap } from 'lucide-react'
import { useAdminData } from '../../contexts/AdminDataContext'
import { statusMap } from './adminConstants'

export default function AdminDashboardPage() {
  const { stats, projects, setSelectedProject } = useAdminData()

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
                const s = statusMap[o.status] || { label: o.status, badge: 'badge-primary' }
                return (
                  <tr key={o.id} onClick={() => setSelectedProject(o)} style={{ background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--primary-400)' }}>{o.project_ref || String(o.id).substring(0, 8)}</td>
                    <td style={{ padding: '0.75rem', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{o.student?.full_name || 'Unknown'}</td>
                    <td style={{ padding: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: 180 }}>{o.title}</td>
                    <td style={{ padding: '0.75rem', minWidth: 100 }}>
                      <div className="progress-bar-track" style={{ height: 4 }}>
                        <div className="progress-bar-fill" style={{ width: `${o.progress || 0}%` }} />
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}><span className={`badge ${s.badge}`}>{s.label}</span></td>
                    <td style={{ padding: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {o.deadline ? new Date(o.deadline).toLocaleDateString() : '—'}
                    </td>
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
