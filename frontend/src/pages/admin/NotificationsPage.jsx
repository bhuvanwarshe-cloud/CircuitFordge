import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdminNotificationsContext } from '../../contexts/AdminNotificationsContext'
import { useAdminData } from '../../contexts/AdminDataContext'

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useAdminNotificationsContext()
  const { setSelectedProject } = useAdminData()
  const navigate = useNavigate()

  const handleSelect = (n) => {
    if (!n.is_read) markAsRead(n.id)
    if (n.project_id) {
      setSelectedProject({ id: n.project_id })
      navigate('/admin/orders')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', marginBottom: '0.3rem' }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Stay updated on new projects and messages.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-secondary btn-sm" style={{ gap: '0.5rem' }}>
            <CheckCircle2 size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>You have no notifications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence>
              {notifications.map((n, idx) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: idx < notifications.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    background: n.is_read ? 'transparent' : 'rgba(79,70,229,0.05)',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? 'transparent' : 'var(--primary-400)', marginTop: '0.4rem' }} />
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleSelect(n)}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: n.is_read ? 500 : 700 }}>{n.title}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{n.body}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!n.is_read && (
                      <button onClick={e => { e.stopPropagation(); markAsRead(n.id) }} className="btn btn-ghost btn-sm" title="Mark read">
                        <CheckCircle2 size={14} color="var(--primary-400)" />
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); removeNotification(n.id) }} className="btn btn-ghost btn-sm" title="Delete">
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
