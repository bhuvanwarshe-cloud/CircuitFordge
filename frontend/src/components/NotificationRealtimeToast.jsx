import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'

export default function NotificationRealtimeToast({ notification, onDismiss }) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          style={{
            position: 'fixed', top: 80, right: 24, zIndex: 'var(--z-toast)',
            width: 320, padding: '1rem 1.25rem',
            background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
          }}
        >
          <Bell size={16} color="var(--primary-400)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.25rem' }}>{notification.title}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{notification.body}</p>
          </div>
          <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
