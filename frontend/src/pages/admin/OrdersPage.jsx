import { useState } from 'react'
import { Search, Eye, Edit3, CheckCircle2, XCircle } from 'lucide-react'
import { useAdminData } from '../../contexts/AdminDataContext'
import { updateProjectStatus } from '../../services/adminService'
import { statusMap } from './adminConstants'

export default function OrdersPage() {
  const { projects, setSelectedProject, fetchData } = useAdminData()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  const filtered = (projects || []).filter(o => {
    const matchSearch =
      (o.student?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.project_ref || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  const handleStatusChange = async (e, project, status) => {
    e.stopPropagation()
    setUpdatingId(project.id)
    try {
      await updateProjectStatus(project.id, { status })
      await fetchData()
    } catch (err) {
      console.error('[OrdersPage] status update failed:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>Order Management</h1>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="Search students, projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.4rem', fontSize: 'var(--text-sm)' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['in_progress', 'In Progress'], ['review', 'Review'], ['delivered', 'Delivered']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)', cursor: 'pointer',
              background: filter === val ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filter === val ? 'var(--border-soft)' : 'var(--border-subtle)'}`,
              color: filter === val ? 'var(--primary-300)' : 'var(--text-muted)',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['ID', 'Student', 'Project', 'Progress', 'Status', 'Deadline', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 500, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const s = statusMap[o.status] || { label: o.status, badge: 'badge-primary' }
                return (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedProject(o)}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--primary-400)' }}>{o.project_ref || String(o.id).substring(0, 8)}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{o.student?.full_name || 'Unknown'}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{o.student?.college_name || o.college_name || 'College'}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{o.title}</td>
                    <td style={{ padding: '1rem', minWidth: 100 }}>
                      <div className="progress-bar-track" style={{ height: 4 }}>
                        <div className="progress-bar-fill" style={{ width: `${o.progress || 0}%` }} />
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}><span className={`badge ${s.badge}`}>{s.label}</span></td>
                    <td style={{ padding: '1rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {o.deadline ? new Date(o.deadline).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelectedProject(o) }} title="View"><Eye size={12} /></button>
                        {o.status === 'pending' && (
                          <>
                            <button className="btn btn-primary btn-sm" disabled={updatingId === o.id} onClick={e => handleStatusChange(e, o, 'approved')} title="Accept"><CheckCircle2 size={12} /></button>
                            <button className="btn btn-ghost btn-sm" disabled={updatingId === o.id} onClick={e => handleStatusChange(e, o, 'cancelled')} title="Reject"><XCircle size={12} color="var(--rose-400)" /></button>
                          </>
                        )}
                        <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setSelectedProject(o) }} title="Edit"><Edit3 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders match your search.</div>
        )}
      </div>
    </div>
  )
}
