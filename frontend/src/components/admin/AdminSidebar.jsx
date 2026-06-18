import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Cpu, LayoutDashboard, Users, FileText, Upload, Bell, BarChart3,
  Settings, LogOut, X, User, Truck,
} from 'lucide-react'
import { useAdminAuth } from '../../contexts/AdminAuthContext'

const iconMap = {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Upload,
  Truck,
  Bell,
  Settings,
}

const navItems = [
  { icon: 'LayoutDashboard', label: 'Dashboard', path: '/admin' },
  { icon: 'FileText', label: 'Orders', path: '/admin/orders' },
  { icon: 'Users', label: 'Students', path: '/admin/students' },
  { icon: 'BarChart3', label: 'Analytics', path: '/admin/analytics' },
  { icon: 'Upload', label: 'File Manager', path: '/admin/files' },
  { icon: 'Truck', label: 'Delivery', path: '/admin/delivery' },
  { icon: 'Bell', label: 'Notifications', path: '/admin/notifications' },
  { icon: 'Settings', label: 'Settings', path: '/admin/settings' },
]

export default function AdminSidebar({ open, setOpen, unreadCount = 0 }) {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
          className="admin-overlay"
        />
      )}
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

        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="badge badge-rose" style={{ width: '100%', justifyContent: 'center' }}>
            <span className="pulse-dot" />Admin Panel
          </span>
        </div>

        <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto' }}>
          {navItems.map(item => {
            const Icon = iconMap[item.icon]
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-lg)',
                  background: isActive ? 'rgba(79,70,229,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--border-soft)' : 'transparent'}`,
                  color: isActive ? 'var(--primary-300)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)', fontFamily: 'var(--font-heading)', fontWeight: 500,
                  textDecoration: 'none', transition: 'all var(--transition-fast)',
                })}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.path === '/admin/notifications' && unreadCount > 0 && (
                  <span style={{ background: 'var(--rose-500)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '0.6rem', padding: '0.1rem 0.4rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--rose-500), var(--purple-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{admin?.email || 'Admin'}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>CircuitForge Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
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
