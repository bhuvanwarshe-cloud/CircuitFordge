/**
 * useNotifications.js — Hook for managing notifications
 * Fetches via backend API (auth-required), syncs via Supabase realtime
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  subscribeToNotifications,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../services/notificationService'

export function useNotifications() {
  const { user, session } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const subRef = useRef(null)

  const token = session?.access_token

  // Fetch notifications via backend API
  const fetchNotifications = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const res = await getUserNotifications(token, 50)
      const notifs = res.notifications || []
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.is_read).length)
    } catch (err) {
      console.error('[useNotifications] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  // Initial load
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Realtime subscription — append new notifications as they arrive
  useEffect(() => {
    if (!user?.id) return

    const sub = subscribeToNotifications(user.id, (newNotif) => {
      setNotifications(prev => [newNotif, ...prev])
      setUnreadCount(prev => prev + 1)
    })
    subRef.current = sub

    return () => {
      if (subRef.current) {
        subRef.current.unsubscribe()
        subRef.current = null
      }
    }
  }, [user?.id])

  // Optimistic mark-as-read (UI updates instantly, then syncs to backend)
  const markAsRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    try {
      await markNotificationRead(id, token)
    } catch (err) {
      console.error('[useNotifications] markAsRead error:', err)
      // Revert on failure
      fetchNotifications()
    }
  }, [token, fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
    try {
      await markAllNotificationsRead(token)
    } catch (err) {
      console.error('[useNotifications] markAllAsRead error:', err)
      fetchNotifications()
    }
  }, [token, fetchNotifications])

  const removeNotification = useCallback(async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    try {
      await deleteNotification(id, token)
    } catch (err) {
      console.error('[useNotifications] delete error:', err)
      fetchNotifications()
    }
  }, [token, fetchNotifications])

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
