/**
 * adminService.js — Admin API calls (all mutations via backend, never direct DB)
 *
 * Token is automatically pulled from sessionStorage (set by AdminAuthContext).
 * Do NOT pass token as an argument — apiFetch reads it automatically via getAdminToken().
 */

const API       = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'cf_admin_token'

/** Read the current admin JWT from sessionStorage */
function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

/**
 * Authenticated fetch for admin endpoints.
 * Automatically attaches the admin JWT from sessionStorage.
 * Throws on non-ok responses.
 */
async function apiFetch(path, options = {}) {
  const token = getAdminToken()

  const isFormData = options.body instanceof FormData

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  let res
  try {
    res = await fetch(`${API}${path}`, { ...options, headers })
  } catch {
    throw new Error('Unable to reach the backend API. Is the server running?')
  }

  let data = {}
  const rawBody = await res.text()
  if (rawBody) {
    try {
      data = JSON.parse(rawBody)
    } catch {
      // non-JSON body — leave data as {}
    }
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed: ${res.status}`)
  }

  return data
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export function getAdminStats() {
  return apiFetch('/admin/stats')
}

// ── Projects ──────────────────────────────────────────────────────────────────
export function getAllProjects(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/admin/projects${qs ? `?${qs}` : ''}`)
}

export function getAdminProject(projectId) {
  return apiFetch(`/admin/projects/${projectId}`)
}

export function updateProjectStatus(projectId, data) {
  return apiFetch(`/admin/projects/${projectId}/status`, {
    method: 'PATCH',
    body:   JSON.stringify(data),
  })
}

export function updateDeliveryStatus(projectId, data) {
  return apiFetch(`/admin/projects/${projectId}/delivery`, {
    method: 'PATCH',
    body:   JSON.stringify(data),
  })
}

// ── Upload File (FormData — Content-Type must NOT be set manually) ─────────────
export async function uploadProjectFile(projectId, file, fileType, label) {
  const form = new FormData()
  form.append('file', file)
  form.append('file_type', fileType)
  form.append('label', label)

  return apiFetch(`/projects/${projectId}/files`, {
    method: 'POST',
    body:   form,
  })
}

// ── Notifications ─────────────────────────────────────────────────────────────
export function sendNotification(payload) {
  return apiFetch('/admin/notifications', {
    method: 'POST',
    body:   JSON.stringify(payload),
  })
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
export function getAuditLogs(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/admin/audit-logs${qs ? `?${qs}` : ''}`)
}

// ── Users ─────────────────────────────────────────────────────────────────────
export function getUsers() {
  return apiFetch('/admin/users')
}
