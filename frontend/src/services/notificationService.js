/**
 * notificationService.js — Notification operations + realtime subscriptions
 */

import { supabase } from '../lib/supabase'

const API = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`)
  return data
}

// ── Get user notifications via backend ───────────────────────────────────────
export function getUserNotifications(token, limit = 50) {
  return apiFetch(`/notifications?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ── Mark single notification read ────────────────────────────────────────────
export function markNotificationRead(id, token) {
  return apiFetch(`/notifications/${id}/read`, {
    method:  'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ── Mark all notifications read ──────────────────────────────────────────────
export function markAllNotificationsRead(token) {
  return apiFetch('/notifications/read-all', {
    method:  'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ── Soft-delete a notification ───────────────────────────────────────────────
export function deleteNotification(id, token) {
  return apiFetch(`/notifications/${id}`, {
    method:  'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ── Realtime: Subscribe to incoming notifications for a user ─────────────────
export function subscribeToNotifications(userId, callback) {
  if (!userId) return null
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      payload => callback(payload.new)
    )
    .subscribe()
}

// ── Realtime: Subscribe to delivery updates for a project ────────────────────
export function subscribeToDeliveryUpdates(projectId, callback) {
  return supabase
    .channel(`delivery:${projectId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'delivery_tracking', filter: `project_id=eq.${projectId}` },
      payload => callback({ type: 'delivery_update', delivery: payload.new })
    )
    .subscribe()
}

// ── Realtime: Admin subscribes to all new project submissions ────────────────
export function subscribeToAdminNotifications(callback) {
  return supabase
    .channel('admin_new_submissions')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'type=eq.project_submitted' },
      payload => callback(payload.new)
    )
    .subscribe()
}
