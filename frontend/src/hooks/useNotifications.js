/**
 * useNotifications.js — Hook for managing notifications
 * Fetches via backend API (auth-required), syncs via Supabase realtime
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
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
  const [realtimeToast, setRealtimeToast] = useState(null)
  const subRef = useRef(null)
  const toastTimerRef = useRef(null)

  const token = session?.access_token

  const showRealtimeToast = useCallback((notif) => {
    setRealtimeToast(notif)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setRealtimeToast(null), 4000)
  }, [])

  const mergeNotifications = useCallback((incoming) => {
    const list = incoming || []
    const seen = new Set()
    return list.filter(n => {
      if (!n?.id || seen.has(n.id)) return false
      seen.add(n.id)
      return true
    })
  }, [])

  // Fetch notifications via backend API — never triggers popups
  const fetchNotifications = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const res = await getUserNotifications(token, 50)
      const notifs = mergeNotifications(res.notifications || [])
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.is_read).length)
    } catch (err) {
      console.error('[useNotifications] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [token, mergeNotifications])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Realtime subscription — append new notifications + toast ONLY here
  useEffect(() => {
    if (!user?.id) return

    const sub = subscribeToNotifications(user.id, (newNotif) => {
      let added = false
      setNotifications(prev => {
        if (prev.some(n => n.id === newNotif.id)) return prev
        added = true
        return [newNotif, ...prev]
      })

      if (added) {
        setUnreadCount(prev => prev + 1)
        showRealtimeToast(newNotif)
      }
    })
    subRef.current = sub

    return () => {
      if (subRef.current) {
        supabase.removeChannel(subRef.current)
        subRef.current = null
      }
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [user?.id, showRealtimeToast])

  const markAsRead = useCallback(async (id) => {
    let wasUnread = false
    setNotifications(prev => prev.map(n => {
      if (n.id !== id) return n
      wasUnread = !n.is_read
      return { ...n, is_read: true }
    }))
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    try {
      await markNotificationRead(id, token)
    } catch (err) {
      console.error('[useNotifications] markAsRead error:', err)
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

  const dismissRealtimeToast = useCallback(() => {
    setRealtimeToast(null)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    realtimeToast,
    dismissRealtimeToast,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refresh: fetchNotifications,
  }
}
