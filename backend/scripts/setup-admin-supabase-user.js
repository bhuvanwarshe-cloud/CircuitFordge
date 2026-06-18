/**
 * setup-admin-supabase-user.js
 *
 * ONE-TIME setup script: Creates the admin Supabase auth user + profiles row.
 *
 * Run from the backend directory:
 *   node scripts/setup-admin-supabase-user.js
 *
 * After running:
 *   1. Copy the ADMIN_SUPABASE_UID printed below into backend/.env
 *   2. The script also stores ADMIN_SUPABASE_PASSWORD in .env automatically.
 *
 * This gives the admin a proper Supabase identity so:
 *   - auth.uid() resolves to the admin's UUID
 *   - is_admin() returns true (profiles.role = 'admin')
 *   - RLS policies let realtime events flow for admin subscriptions
 *   - AdminDashboard can call supabase.auth.setSession() after custom JWT login
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync } from 'fs'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const SUPABASE_URL       = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
const ADMIN_EMAIL        = process.env.ADMIN_EMAIL

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env')
  process.exit(1)
}
if (!ADMIN_EMAIL) {
  console.error('❌ ADMIN_EMAIL must be set in backend/.env')
  process.exit(1)
}

// Create service-role admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  console.log('\n🔧 CircuitForge — Admin Supabase User Setup')
  console.log('='.repeat(50))
  console.log(`Admin email: ${ADMIN_EMAIL}`)
  console.log(`Supabase URL: ${SUPABASE_URL}\n`)

  // ── Check if admin auth user already exists ───────────────────────────────
  const { data: { users: existingUsers }, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
  if (listErr) {
    console.error('❌ Failed to list users:', listErr.message)
    process.exit(1)
  }

  const existingAdminUser = existingUsers?.find(u => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase())

  let adminUserId

  if (existingAdminUser) {
    console.log(`✅ Supabase auth user already exists: ${existingAdminUser.id}`)
    adminUserId = existingAdminUser.id
  } else {
    // Generate a secure random password for the Supabase auth user
    // This password is stored in .env — admin never types it; it's used server-side
    const supabaseAdminPassword = crypto.randomBytes(32).toString('base64url')

    console.log('Creating Supabase auth user...')
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email:            ADMIN_EMAIL,
      password:         supabaseAdminPassword,
      email_confirm:    true,              // skip email confirmation
      user_metadata:    {
        full_name: 'CircuitForge Admin',
        role:      'admin',
      },
    })

    if (createErr) {
      console.error('❌ Failed to create Supabase auth user:', createErr.message)
      process.exit(1)
    }

    adminUserId = newUser.user.id
    console.log(`✅ Supabase auth user created: ${adminUserId}`)

    // ── Patch .env with ADMIN_SUPABASE_PASSWORD ─────────────────────────────
    const envPath = path.join(__dirname, '..', '.env')
    let envContent = readFileSync(envPath, 'utf8')

    if (envContent.includes('ADMIN_SUPABASE_PASSWORD=')) {
      envContent = envContent.replace(
        /ADMIN_SUPABASE_PASSWORD=.*/,
        `ADMIN_SUPABASE_PASSWORD=${supabaseAdminPassword}`
      )
    } else {
      envContent += `\n# Supabase auth password for admin realtime session (server-side use ONLY)\nADMIN_SUPABASE_PASSWORD=${supabaseAdminPassword}\n`
    }
    writeFileSync(envPath, envContent, 'utf8')
    console.log(`✅ ADMIN_SUPABASE_PASSWORD written to backend/.env`)
  }

  // ── Upsert profiles row ───────────────────────────────────────────────────
  console.log('\nUpserting profiles row...')
  const { error: profileErr } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id:        adminUserId,
        full_name: 'CircuitForge Admin',
        role:      'admin',
        is_active: true,
      },
      { onConflict: 'id' }
    )

  if (profileErr) {
    console.error('❌ Failed to upsert profile:', profileErr.message)
    process.exit(1)
  }

  console.log(`✅ profiles row upserted (id=${adminUserId}, role=admin)`)

  // ── Patch .env with ADMIN_SUPABASE_UID ───────────────────────────────────
  const envPath = path.join(__dirname, '..', '.env')
  let envContent = readFileSync(envPath, 'utf8')

  if (envContent.includes('ADMIN_SUPABASE_UID=')) {
    envContent = envContent.replace(
      /ADMIN_SUPABASE_UID=.*/,
      `ADMIN_SUPABASE_UID=${adminUserId}`
    )
  } else {
    envContent += `\n# Supabase UUID for the admin profiles row (used by is_admin() RLS check)\nADMIN_SUPABASE_UID=${adminUserId}\n`
  }
  writeFileSync(envPath, envContent, 'utf8')

  // ── Verify RLS ────────────────────────────────────────────────────────────
  console.log('\nVerifying is_admin() resolution...')
  const { data: profile, error: checkErr } = await supabaseAdmin
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', adminUserId)
    .single()

  if (checkErr || !profile) {
    console.error('❌ Profile verification failed:', checkErr?.message)
    process.exit(1)
  }

  console.log(`✅ Profile verified:`)
  console.log(`   id      = ${profile.id}`)
  console.log(`   role    = ${profile.role}`)
  console.log(`   active  = ${profile.is_active}`)

  if (profile.role !== 'admin') {
    console.error('❌ Profile role is not "admin"! Check the upsert.')
    process.exit(1)
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Setup complete!')
  console.log('\n📋 Summary:')
  console.log(`   ADMIN_SUPABASE_UID=${adminUserId}`)
  console.log(`   ADMIN_SUPABASE_PASSWORD written to backend/.env`)
  console.log('\n▶️  Restart the backend server to apply .env changes.')
  console.log('▶️  auth.uid() will now resolve correctly for the admin.')
  console.log('▶️  is_admin() will return true.')
  console.log('▶️  All realtime subscriptions will work.\n')
}

run().catch(err => {
  console.error('\n❌ Unexpected error:', err)
  process.exit(1)
})
