import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Loader2 } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminProjectDetail from '../../components/admin/AdminProjectDetail'
import { AdminDataProvider, useAdminData } from '../../contexts/AdminDataContext'
import { AdminNotificationsProvider, useAdminNotificationsContext } from '../../contexts/AdminNotificationsContext'

function AdminLayoutInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { loading, selectedProject, setSelectedProject, fetchData } = useAdminData()
  const { unreadCount } = useAdminNotificationsContext()
  const location = useLocation()
  const section = location.pathname.split('/').pop() || 'dashboard'

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
        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} unreadCount={unreadCount} />
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,13,26,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)', padding: '0 var(--space-6)', height: 60, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSidebarOpen(v => !v)} className="admin-toggle" style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.35rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'none' }}>
              <Menu size={18} />
            </button>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                admin / <span style={{ color: 'var(--rose-400)' }}>{section}</span>
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
                <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <Outlet />
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

export default function AdminLayout() {
  return (
    <AdminDataProvider>
      <AdminNotificationsProvider>
        <AdminLayoutInner />
      </AdminNotificationsProvider>
    </AdminDataProvider>
  )
}
