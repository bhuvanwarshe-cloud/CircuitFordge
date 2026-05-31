import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)     // Supabase auth.users row
  const [profile, setProfile] = useState(null)     // public.profiles row (has role)
  const [session, setSession] = useState(null)     // full session (access_token etc.)
  const [loading, setLoading] = useState(true)     // true until first auth check done

  // ── Fetch profile from DB ─────────────────────────────────
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) { setProfile(null); return }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, phone, college_name, college_id, semester, program, avatar_url, is_active')
        .eq('id', authUser.id)
        .single()
      if (error) throw error
      if (!data.is_active) {
        // Suspended accounts — sign out immediately
        await supabase.auth.signOut()
        setProfile(null)
        return
      }
      setProfile(data)
    } catch (err) {
      console.error('[AuthContext] fetchProfile:', err.message)
      setProfile(null)
    }
  }, [])

  // ── Bootstrap: restore session on mount ──────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      fetchProfile(s?.user ?? null).finally(() => setLoading(false))
    })

    // Live auth state listener (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        fetchProfile(s?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // ── Auth actions ──────────────────────────────────────────

  /** Student / Admin login */
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) throw error
    return data
  }

  /** Student signup — metadata.full_name passed to handle_new_user trigger */
  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { ...metadata, role: 'student' },
      },
    })
    if (error) throw error
    return data
  }

  /** Sign out — clears session + state */
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  /** Send password reset email */
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )
    if (error) throw error
  }

  /** Update password (after following reset link) */
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  /** Force-refresh profile data */
  const refreshProfile = useCallback(() => fetchProfile(user), [fetchProfile, user])

  // ── Derived state ─────────────────────────────────────────
  const isAdmin         = profile?.role === 'admin'
  const isStudent       = profile?.role === 'student'
  const isAuthenticated = !!user

  /** Access token for backend API Authorization header */
  const getAccessToken = () => session?.access_token ?? null

  return (
    <AuthContext.Provider value={{
      // State
      user, profile, session, loading,
      // Booleans
      isAdmin, isStudent, isAuthenticated,
      // Actions
      signIn, signUp, signOut,
      resetPassword, updatePassword,
      refreshProfile,
      // Utilities
      getAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

