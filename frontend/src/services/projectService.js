/**
 * projectService.js — Frontend service for all project operations
 * All mutations go through the Express backend
 * Uses Supabase session automatically
 */

import { supabase } from '../lib/supabase'

const API =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

// ─────────────────────────────────────────────────────────────
// Helper: Authenticated API Fetch
// ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {

  // Get latest Supabase session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token

  if (!token) {
    throw new Error('Authentication required')
  }

  // Detect FormData uploads
  const isFormData =
    options.body instanceof FormData

  // Build headers safely
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  }

  // DO NOT manually set content-type for FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
  })

  let data = {}

  try {
    data = await res.json()
  } catch (err) {
    console.error('Failed to parse JSON response:', err)
  }

  if (!res.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `Request failed: ${res.status}`
    )
  }

  return data
}

// ─────────────────────────────────────────────────────────────
// Submit Project
// ─────────────────────────────────────────────────────────────
export async function submitProject(formData) {

  return apiFetch('/projects', {
    method: 'POST',

    body: JSON.stringify({
      title: formData.title,
      description: formData.description,

      category_name:
        formData.category,

      semester:
        formData.semester,

      college_name:
        formData.college,

      program:
        formData.program,

      deadline:
        formData.deadline,

      components:
        formData.components,

      budget_range:
        formData.budget,

      notes:
        formData.notes,
    }),
  })
}

// ─────────────────────────────────────────────────────────────
// Get Student Projects
// ─────────────────────────────────────────────────────────────
export async function getStudentProjects() {

  return apiFetch('/projects', {
    method: 'GET',
  })
}

// ─────────────────────────────────────────────────────────────
// Get Single Project Details
// ─────────────────────────────────────────────────────────────
export async function getProjectDetails(projectId) {

  return apiFetch(`/projects/${projectId}`, {
    method: 'GET',
  })
}

// ─────────────────────────────────────────────────────────────
// Upload Project File
// ─────────────────────────────────────────────────────────────
export async function uploadProjectFile(
  projectId,
  file,
  fileType,
  label
) {

  const form = new FormData()

  form.append('file', file)
  form.append('file_type', fileType)
  form.append('label', label)

  return apiFetch(
    `/projects/${projectId}/files`,
    {
      method: 'POST',
      body: form,
    }
  )
}

// ─────────────────────────────────────────────────────────────
// Get Signed File URL
// ─────────────────────────────────────────────────────────────
export async function getSignedFileUrl(
  bucket,
  path
) {

  return apiFetch(
    '/projects/files/signed-url',
    {
      method: 'POST',

      body: JSON.stringify({
        bucket,
        path,
      }),
    }
  )
}

// ─────────────────────────────────────────────────────────────
// Realtime: Project Timeline Updates
// ─────────────────────────────────────────────────────────────
export function subscribeToProjectUpdates(
  projectId,
  callback
) {

  const channel = supabase
    .channel(`project_updates:${projectId}`)

    .on(
      'postgres_changes',

      {
        event: 'INSERT',
        schema: 'public',
        table: 'project_updates',
        filter: `project_id=eq.${projectId}`,
      },

      payload => {
        callback(payload.new)
      }
    )

    .subscribe()

  return channel
}

// ─────────────────────────────────────────────────────────────
// Realtime: Project Status Updates
// ─────────────────────────────────────────────────────────────
export function subscribeToProjectStatus(
  projectId,
  callback
) {

  const channel = supabase
    .channel(`project_status:${projectId}`)

    .on(
      'postgres_changes',

      {
        event: 'UPDATE',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`,
      },

      payload => {
        callback(payload.new)
      }
    )

    .subscribe()

  return channel
}

// ─────────────────────────────────────────────────────────────
// Cleanup Helper
// Prevent memory leaks / duplicate subscriptions
// ─────────────────────────────────────────────────────────────
export function unsubscribeChannel(channel) {

  if (channel) {
    supabase.removeChannel(channel)
  }
}