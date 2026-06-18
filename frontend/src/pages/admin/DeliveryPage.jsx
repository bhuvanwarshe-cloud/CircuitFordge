import { Truck, Package } from 'lucide-react'
import { useAdminData } from '../../contexts/AdminDataContext'
import { statusMap } from './adminConstants'

export default function DeliveryPage() {
  const { projects, setSelectedProject } = useAdminData()

  const deliveryProjects = (projects || []).filter(p =>
    ['approved', 'in_progress', 'review', 'delivered'].includes(p.status)
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>Delivery Tracking</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
        Select a project to manage delivery status, tracking, and pickup details.
      </p>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Project', 'Student', 'Status', 'Phase', 'Action'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deliveryProjects.map((p, i) => {
              const s = statusMap[p.status] || { label: p.status, badge: 'badge-primary' }
              return (
                <tr key={p.id} style={{ borderBottom: i < deliveryProjects.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }} onClick={() => setSelectedProject(p)}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{p.title}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.project_ref || p.id.substring(0, 8)}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: 'var(--text-sm)' }}>{p.student?.full_name || 'Unknown'}</td>
                  <td style={{ padding: '1rem' }}><span className={`badge ${s.badge}`}>{s.label}</span></td>
                  <td style={{ padding: '1rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{p.current_phase || '—'}</td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); setSelectedProject(p) }}>
                      <Truck size={12} /> Manage
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {deliveryProjects.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No projects ready for delivery tracking yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
