/**
 * authService.js — Abstraction layer over Supabase auth + profiles table.
 *
 * Use these functions in auth pages instead of calling supabase directly.
 * This makes it easy to swap the auth provider later, and keeps pages clean.
 */
import { supabase } from '../lib/supabase'

// ── Student Sign Up ────────────────────────────────────────────────────────────
/**
 * Creates a new student account.
 * The `handle_new_user` DB trigger auto-creates the profiles row.
 */
export async function studentSignUp({ email, password, fullName, college, semester, program, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name:    fullName,
        college_name: college,
        semester,
        program,
        phone,
        role:         'student',   // trigger reads this to set role
      },
    },
  })
  if (error) throw error

  // Profile is created automatically by DB trigger on_auth_user_created.
  // We also do an explicit upsert to capture extra fields the trigger can't handle.
  if (data.user) {
    try {
      // Give the trigger a moment to complete (optional but recommended)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id:          data.user.id,
        full_name:   fullName,
        phone:       phone   || null,
        college_name: college || null,
        semester:    semester || null,
        program:     program  || null,
        role:        'student',
      }, { onConflict: 'id' })
      
      if (upsertError) {
        console.warn('Profile upsert warning (signup may still succeed):', upsertError)
      }
    } catch (err) {
      console.warn('Profile creation error (signup may still succeed):', err)
    }
  }

  return data
}

// ── Student / Admin Sign In ────────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) throw error
  return data
}

// ── Sign Out ───────────────────────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ── Fetch Profile ─────────────────────────────────────────────────────────────
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone, college_name, semester, program, avatar_url, is_active')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

// ── Password Reset ────────────────────────────────────────────────────────────
export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/reset-password` }
  )
  if (error) throw error
}

// ── Update Password ────────────────────────────────────────────────────────────
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

// ── Verify Admin ──────────────────────────────────────────────────────────────
/**
 * After login, call this to check if the authenticated user is an active admin.
 * Returns the profile if admin, throws an Error if not.
 * This is the FRONTEND check — RLS + backend middleware provide server-side enforcement.
 */
export async function verifyAdminAccess(userId) {
  const profile = await fetchProfile(userId)

  if (!profile.is_active) {
    throw new Error('Your account has been suspended. Contact support.')
  }
  if (profile.role !== 'admin') {
    throw new Error('Access denied. This area requires admin privileges.')
  }

  return profile
}

// ── Get Session ────────────────────────────────────────────────────────────────
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// ── API Helper: attach auth token to backend fetch calls ──────────────────────
/**
 * Returns the Authorization header value for Express API calls.
 * Usage: fetch('/api/projects', { headers: await getAuthHeader() })
 */
export async function getAuthHeader() {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${session.access_token}` }
}
