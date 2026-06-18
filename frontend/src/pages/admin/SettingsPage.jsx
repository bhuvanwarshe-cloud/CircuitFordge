import { Settings, Shield, Bell, Database } from 'lucide-react'
import { useAdminAuth } from '../../contexts/AdminAuthContext'

export default function SettingsPage() {
  const { admin } = useAdminAuth()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>Admin Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-4)' }}>
            <Shield size={18} color="var(--rose-400)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>Account</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Email: </span>{admin?.email || '—'}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Role: </span>Administrator</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Auth: </span>Custom JWT</div>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-4)' }}>
            <Bell size={18} color="var(--primary-400)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>Notifications</h3>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Admin notifications are delivered in realtime when students submit projects or receive updates.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-4)' }}>
            <Database size={18} color="var(--cyan-400)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>System</h3>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            CircuitForge admin portal connected to Supabase backend via Express API.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--space-4)' }}>
            <Settings size={18} color="var(--amber-400)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>Portal</h3>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Access admin routes directly via URL. No public navigation links expose this panel.
          </p>
        </div>
      </div>
    </div>
  )
}
