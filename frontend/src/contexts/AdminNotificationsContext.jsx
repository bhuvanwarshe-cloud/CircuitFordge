import { createContext, useContext } from 'react'
import { useAdminNotifications } from '../hooks/useAdminNotifications'

const AdminNotificationsContext = createContext(null)

export function AdminNotificationsProvider({ children }) {
  const value = useAdminNotifications()
  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  )
}

export function useAdminNotificationsContext() {
  const ctx = useContext(AdminNotificationsContext)
  if (!ctx) throw new Error('useAdminNotificationsContext must be used within AdminNotificationsProvider')
  return ctx
}
