import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getAdminStats, getAllProjects } from '../services/adminService'
import { supabase } from '../lib/supabase'

const AdminDataContext = createContext(null)

export function AdminDataProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [statsRes, projRes] = await Promise.all([
        getAdminStats(),
        getAllProjects({ limit: 100 }),
      ])
      setStats(statsRes.stats)
      setProjects(projRes.projects || [])
      setSelectedProject(prev => {
        if (!prev) return null
        const updated = (projRes.projects || []).find(p => p.id === prev.id)
        return updated || prev
      })
    } catch (err) {
      console.error('[AdminData] Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const sub = supabase.channel('admin_all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchData()
      })
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [fetchData])

  return (
    <AdminDataContext.Provider value={{
      projects,
      stats,
      loading,
      selectedProject,
      setSelectedProject,
      fetchData,
    }}>
      {children}
    </AdminDataContext.Provider>
  )
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext)
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider')
  return ctx
}
