export const statusMap = {
  pending:     { label: 'Pending',     badge: 'badge-amber',   color: 'var(--amber-400)' },
  in_progress: { label: 'In Progress', badge: 'badge-primary', color: 'var(--primary-400)' },
  review:      { label: 'In Review',   badge: 'badge-cyan',    color: 'var(--cyan-400)' },
  delivered:   { label: 'Delivered',   badge: 'badge-emerald', color: 'var(--emerald-400)' },
  approved:    { label: 'Approved',    badge: 'badge-emerald', color: 'var(--emerald-400)' },
  cancelled:   { label: 'Cancelled',   badge: 'badge-rose',    color: 'var(--rose-400)' },
}

export const adminNavItems = [
  { icon: 'LayoutDashboard', label: 'Dashboard', path: '/admin', id: 'dashboard' },
  { icon: 'FileText', label: 'Orders', path: '/admin/orders', id: 'orders' },
  { icon: 'Users', label: 'Students', path: '/admin/students', id: 'students' },
  { icon: 'BarChart3', label: 'Analytics', path: '/admin/analytics', id: 'analytics' },
  { icon: 'Upload', label: 'File Manager', path: '/admin/files', id: 'files' },
  { icon: 'Truck', label: 'Delivery', path: '/admin/delivery', id: 'delivery' },
  { icon: 'Bell', label: 'Notifications', path: '/admin/notifications', id: 'notifications' },
  { icon: 'Settings', label: 'Settings', path: '/admin/settings', id: 'settings' },
]
