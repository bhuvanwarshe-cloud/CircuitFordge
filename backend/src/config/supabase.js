/**
 * supabase.js — Backend Supabase client initialization
 *
 * Two clients:
 *   supabase      — Anon key, respects RLS (not used by backend directly)
 *   supabaseAdmin — Service role key, bypasses RLS (all server-side ops)
 *
 * Environment variables required in backend/.env:
 *   SUPABASE_URL             — https://xxxx.supabase.co
 *   SUPABASE_ANON_KEY        — eyJ... (anon/public key)
 *   SUPABASE_SERVICE_ROLE_KEY — eyJ... (service_role key — NEVER expose to frontend)
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl      = process.env.SUPABASE_URL
const supabaseAnonKey  = process.env.SUPABASE_ANON_KEY

// Support both naming conventions to handle .env inconsistencies
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY

// ── Startup validation — fail fast with clear error messages ─────────────────
if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL is missing from backend .env')
  process.exit(1)
}

if (!supabaseAnonKey) {
  console.error('❌ SUPABASE_ANON_KEY is missing from backend .env')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing from backend .env')
  console.error('   Add: SUPABASE_SERVICE_ROLE_KEY=eyJ... to backend/.env')
  process.exit(1)
}

// ── Public client — for non-admin operations (rarely used server-side) ───────
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Admin client — bypasses RLS, used for all server-side operations ─────────
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

console.log(`✅ Supabase initialized → ${supabaseUrl}`)
