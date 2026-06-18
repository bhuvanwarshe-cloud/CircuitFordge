/**
 * useAdminNotifications.js — Hook for managing admin notifications
 * 
 * Uses the Supabase client directly to fetch and subscribe to notifications
 * for the admin. This works because AdminAuthContext sets the admin's Supabase
 * session, giving them a valid auth.uid() and role='admin'.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { supabase } from '../lib/supabase'

export function useAdminNotifications() {
  const { admin } = useAdminAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const subRef = useRef(null)

  const adminId = admin?.id

  // Fetch notifications via Supabase client directly
  const fetchNotifications = useCallback(async () => {
    if (!adminId) return
    try {
      setLoading(true)
      const { data: notifs, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', adminId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(notifs || [])
      setUnreadCount((notifs || []).filter(n => !n.is_read).length)
    } catch (err) {
      console.error('[useAdminNotifications] fetch error:', err.message)
    } finally {
      setLoading(false)
    }
  }, [adminId])

  // Initial load
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Realtime subscription — append new notifications as they arrive
  useEffect(() => {
    if (!adminId) return

    const sub = supabase
      .channel(`admin_notifications:${adminId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${adminId}` },
        payload => {
          setNotifications(prev => {
            if (prev.some(n => n.id === payload.new.id)) return prev
            return [payload.new, ...prev]
          })
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()
    
    subRef.current = sub

    return () => {
      if (subRef.current) {
        supabase.removeChannel(subRef.current)
        subRef.current = null
      }
    }
  }, [adminId])

  // Optimistic mark-as-read (UI updates instantly, then syncs to backend)
  const markAsRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', adminId)
      
      if (error) throw error
    } catch (err) {
      console.error('[useAdminNotifications] markAsRead error:', err.message)
      // Revert on failure
      fetchNotifications()
    }
  }, [adminId, fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', adminId)
        .eq('is_read', false)

      if (error) throw error
    } catch (err) {
      console.error('[useAdminNotifications] markAllAsRead error:', err.message)
      fetchNotifications()
    }
  }, [adminId, fetchNotifications])

  const removeNotification = useCallback(async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', adminId)

      if (error) throw error
    } catch (err) {
      console.error('[useAdminNotifications] delete error:', err.message)
      fetchNotifications()
    }
  }, [adminId, fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refresh: fetchNotifications,
  }
}
