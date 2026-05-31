/**
 * adminService.js — Admin API calls (all mutations via backend, never direct DB)
 */

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`)
  return data
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export function getAdminStats(token) {
  return apiFetch('/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
}

// ── Projects ──────────────────────────────────────────────────────────────────
export function getAllProjects(token, params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/admin/projects${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function getAdminProject(projectId, token) {
  return apiFetch(`/admin/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function updateProjectStatus(projectId, data, token) {
  return apiFetch(`/admin/projects/${projectId}/status`, {
    method:  'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body:    JSON.stringify(data),
  })
}

export function updateDeliveryStatus(projectId, data, token) {
  return apiFetch(`/admin/projects/${projectId}/delivery`, {
    method:  'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body:    JSON.stringify(data),
  })
}

// ── Upload File (FormData — no Content-Type header override) ──────────────────
export async function uploadProjectFile(projectId, file, fileType, label, token) {
  const form = new FormData()
  form.append('file', file)
  form.append('file_type', fileType)
  form.append('label', label)

  const res = await fetch(`${API}/projects/${projectId}/files`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}` },
    body:    form,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Upload failed')
  return data
}

// ── Notifications ─────────────────────────────────────────────────────────────
export function sendNotification(payload, token) {
  return apiFetch('/admin/notifications', {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}` },
    body:    JSON.stringify(payload),
  })
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
export function getAuditLogs(token, params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/admin/audit-logs${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ── Users ─────────────────────────────────────────────────────────────────────
export function getUsers(token) {
  return apiFetch('/admin/users', { headers: { Authorization: `Bearer ${token}` } })
}
