import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle2, X } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const ref = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '50%',
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative'
        }}
      >
        <Bell size={16} color="var(--text-secondary)" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            background: 'var(--rose-500)', color: '#fff',
            fontSize: '10px', fontWeight: 'bold',
            borderRadius: '50%', width: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', right: 0, top: 44,
              width: 320, background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              zIndex: 100, overflow: 'hidden'
            }}
          >
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>Notifications</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>
            </div>
            
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {notifications?.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                  No new notifications
                </div>
              ) : (
                notifications?.slice(0, 5).map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => { if (!n.is_read) markAsRead(n.id) }}
                    style={{ 
                      padding: '1rem', borderBottom: '1px solid var(--border-subtle)', 
                      display: 'flex', gap: '0.75rem', cursor: n.is_read ? 'default' : 'pointer',
                      background: n.is_read ? 'transparent' : 'rgba(79,70,229,0.05)'
                    }}
                  >
                    <div style={{ marginTop: '0.1rem', flexShrink: 0 }}>
                      {n.type === 'success' || n.type === 'project_approved' ? <CheckCircle2 size={16} color="var(--emerald-400)" /> : <Bell size={16} color="var(--primary-400)" />}
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', fontWeight: n.is_read ? 400 : 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{n.title}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{n.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications?.length > 0 && (
              <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
                <a href="/dashboard" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-400)', fontWeight: 600, textDecoration: 'none' }}>View All</a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
