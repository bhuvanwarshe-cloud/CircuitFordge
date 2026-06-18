/**
 * Frontend service for project operations.
 * All mutations go through the Express backend using the current Supabase session.
 */

import { supabase } from '../lib/supabase'

const API = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

async function apiFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token

  if (!token) {
    throw new Error('Authentication required')
  }

  const isFormData = options.body instanceof FormData
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  let res
  try {
    res = await fetch(`${API}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error('Unable to reach the backend API. Check the API base URL and server.')
  }

  let data = {}
  const rawBody = await res.text()

  if (rawBody) {
    try {
      data = JSON.parse(rawBody)
    } catch (err) {
      console.error('Failed to parse JSON response:', err)
    }
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

export async function submitProject(formData) {
  return apiFetch('/projects', {
    method: 'POST',
    body: JSON.stringify({
      title: formData.title,
      description: formData.description,
      category_name: formData.category,
      semester: formData.semester,
      college_name: formData.college,
      program: formData.program,
      deadline: formData.deadline,
      components: formData.components,
      budget_range: formData.budget,
      notes: formData.notes,
    }),
  })
}

export async function getStudentProjects() {
  return apiFetch('/projects', {
    method: 'GET',
  })
}

export async function getProjectDetails(projectId) {
  return apiFetch(`/projects/${projectId}`, {
    method: 'GET',
  })
}

export async function uploadProjectFile(projectId, file, fileType, label) {
  const form = new FormData()

  form.append('file', file)
  form.append('file_type', fileType)
  form.append('label', label)

  return apiFetch(`/projects/${projectId}/files`, {
    method: 'POST',
    body: form,
  })
}

export async function getSignedFileUrl(bucket, path) {
  return apiFetch('/projects/files/signed-url', {
    method: 'POST',
    body: JSON.stringify({
      bucket,
      path,
    }),
  })
}

export function subscribeToProjectUpdates(projectId, callback) {
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

export function subscribeToProjectStatus(projectId, callback) {
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

export function unsubscribeChannel(channel) {
  if (channel) {
    supabase.removeChannel(channel)
  }
}
