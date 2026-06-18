import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useAdminData } from '../../contexts/AdminDataContext'
import { statusMap } from './adminConstants'

export default function AnalyticsPage() {
  const { stats, projects } = useAdminData()

  const statusBreakdown = useMemo(() => {
    const counts = {}
    ;(projects || []).forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      ...(statusMap[status] || { label: status, color: 'var(--primary-400)' }),
    }))
  }, [projects])

  const collegeBreakdown = useMemo(() => {
    const counts = {}
    ;(projects || []).forEach(p => {
      const college = p.student?.college_name || p.college_name || 'Unknown'
      counts[college] = (counts[college] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([college, orders]) => ({ college, orders }))
  }, [projects])

  const monthlyBreakdown = useMemo(() => {
    const counts = {}
    ;(projects || []).forEach(p => {
      if (!p.created_at) return
      const d = new Date(p.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, count]) => {
        const [year, month] = key.split('-')
        const label = new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'short' })
        return { label, count }
      })
  }, [projects])

  const maxMonthly = Math.max(...monthlyBreakdown.map(m => m.count), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {[
          { label: 'Total Projects', value: stats?.totalProjects || 0 },
          { label: 'Pending', value: stats?.pendingProjects || 0 },
          { label: 'Active', value: stats?.activeProjects || 0 },
          { label: 'Delivered', value: stats?.deliveredProjects || 0 },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--cyan-300)' }}>{s.value}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }} className="analytics-grid">
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>Projects per Month</h3>
          {monthlyBreakdown.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No project data yet.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 140 }}>
              {monthlyBreakdown.map((m, i) => (
                <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.count / maxMonthly) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    style={{ width: '100%', background: 'linear-gradient(180deg, var(--cyan-400), var(--primary-600))', borderRadius: '4px 4px 0 0', minHeight: 4 }}
                  />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>Status Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {statusBreakdown.map(s => {
              const total = stats?.totalProjects || 1
              const pct = (s.count / total) * 100
              return (
                <div key={s.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{s.label || s.status}</span>
                    <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: s.color }}>{s.count}</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: 6 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} style={{ height: '100%', borderRadius: 'var(--radius-full)', background: s.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {collegeBreakdown.length > 0 && (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>Top Colleges</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
            {collegeBreakdown.map(c => (
              <div key={c.college} style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--cyan-300)' }}>{c.orders}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.college}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@media (max-width: 640px) { .analytics-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
