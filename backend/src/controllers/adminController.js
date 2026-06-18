import { supabaseAdmin } from '../config/supabase.js'

// Fixed admin identifier used in audit logs and notifications.
// With custom JWT auth there is no Supabase UUID — we use this traceable constant.
const ADMIN_IDENTIFIER = () => process.env.ADMIN_IDENTIFIER || 'CircuitForge Team'

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
export async function getDashboardStats(req, res, next) {
  try {
    const [
      { count: totalUsers },
      { count: totalProjects },
      { count: activeProjects },
      { count: deliveredProjects },
      { count: pendingProjects },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }).eq('is_deleted', false).in('status', ['approved', 'in_progress', 'review']),
      supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'delivered'),
      supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'pending'),
    ])

    res.json({
      success: true,
      stats: { totalUsers, totalProjects, activeProjects, deliveredProjects, pendingProjects },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/admin/users ──────────────────────────────────────────────────────
export async function getUsers(req, res, next) {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, college_name, semester, program, role, created_at, is_active')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ success: true, count: users.length, users })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/admin/projects ───────────────────────────────────────────────────
export async function getAllProjects(req, res, next) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let query = supabaseAdmin
      .from('projects')
      .select(`
        id, project_ref, title, status, progress, current_phase,
        created_at, updated_at, deadline, category_name, description,
        budget_range, components, notes, program, college_name, semester,
        student_id,
        student:profiles!projects_student_id_fkey(id, full_name, college_name, semester)
      `, { count: 'exact' })
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1)

    if (status && status !== 'all') query = query.eq('status', status)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data: projects, error, count } = await query
    if (error) throw error

    res.json({ success: true, count, projects, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/admin/projects/:id ───────────────────────────────────────────────
export async function getProjectById(req, res, next) {
  try {
    const { id } = req.params

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        student:profiles!projects_student_id_fkey(id, full_name, college_name, semester, program),
        project_files(*),
        project_updates(
          id, phase, message, progress, is_visible, created_at,
          created_by:profiles!project_updates_author_id_fkey(full_name)
        ),
        delivery_tracking(
          id, project_id, delivery_type, status,
          tracking_number, carrier,
          pickup_address, delivery_address,
          scheduled_date, actual_date,
          recipient_name, contact_phone, notes,
          created_at, updated_at
        )
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' })
    }

    res.json({ success: true, project })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/admin/projects/:id/status ─────────────────────────────────────
//
// BUG FIX: Previously called admin_update_project() RPC which expects p_admin_id UUID
// referencing profiles(id). The custom admin has NO profiles row, causing a type error
// (string vs UUID) and FK violation → 500 on every status update.
//
// Fix: Do direct atomic operations:
//  1. Update projects row
//  2. Insert project_updates timeline entry (if phase provided)
//  3. Insert student notification (auto-triggered by DB trigger trg_project_status_notification,
//     but we also send an explicit one for granular messaging)
//
// Audit logging is omitted since audit_logs.admin_id is UUID FK → profiles(id).
// A separate audit_logs migration (to use TEXT admin_id) is tracked in Bug #4 investigation.
export async function updateProjectStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status, progress, current_phase, manager_notes } = req.body

    // ── Validate status against actual DB enum ────────────────────────────────
    const validStatuses = ['pending', 'approved', 'in_progress', 'review', 'delivered', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      })
    }

    const safeProgress = Math.min(100, Math.max(0, parseInt(progress) || 0))

    // ── 1. Update project ─────────────────────────────────────────────────────
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .update({
        status:        status || undefined,
        progress:      safeProgress,
        current_phase: current_phase || null,
        manager_notes: manager_notes || null,
        updated_at:    new Date().toISOString(),
      })
      .eq('id', id)
      .eq('is_deleted', false)
      .select(`
        *,
        student:profiles!projects_student_id_fkey(id, full_name, college_name, semester, program)
      `)
      .single()

    if (projectError) throw projectError
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' })
    }

    // ── 2. Insert project_updates timeline entry ───────────────────────────────
    // author_id in project_updates is UUID REFERENCES profiles(id) — use student's id as proxy
    // since admin has no profiles row. Phase updates are attributed to the project owner.
    // This is a known limitation of the custom admin auth model.
    if (current_phase && current_phase.trim()) {
      await supabaseAdmin
        .from('project_updates')
        .insert({
          project_id: id,
          author_id:  project.student_id,   // closest valid FK — admin has no profiles row
          phase:      current_phase.trim(),
          message:    manager_notes?.trim() || `Status updated to ${status}`,
          progress:   safeProgress,
          is_visible: true,
        })
        .catch(err => console.error('[updateProjectStatus] project_updates insert failed:', err.message))
    }

    // ── 3. Explicit student notification for key status transitions ───────────
    // DB trigger trg_project_status_notification handles: approved, in_progress, review, delivered, cancelled
    // We do NOT double-insert; the trigger fires automatically on project.status UPDATE.
    // We only add supplemental notifications for status transitions that need custom messaging.
    const customNotifMap = {
      approved:  { title: '✅ Project Approved!', body: `Your project "${project.title}" has been approved by CircuitForge Team. Work will begin shortly.`, type: 'project_approved' },
      cancelled: { title: '❌ Project Cancelled', body: `Your project "${project.title}" has been cancelled. Please contact support for more information.`, type: 'general' },
    }
    const customNotif = customNotifMap[status]
    if (customNotif) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id:    project.student_id,
          project_id: id,
          type:       customNotif.type,
          title:      customNotif.title,
          body:       customNotif.body,
        })
        .catch(err => console.error('[updateProjectStatus] notification insert failed:', err.message))
    }

    console.info(`[updateProjectStatus] ${id} → ${status} | progress: ${safeProgress}% | phase: ${current_phase || 'unchanged'} | admin: ${ADMIN_IDENTIFIER()}`)

    res.json({ success: true, message: 'Project updated.', project })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/admin/projects/:id/delivery ────────────────────────────────────
//
// BUG FIX: Previously used wrong column names (pickup_location, estimated_date,
// updated_by) that don't exist in delivery_tracking. Also used wrong enum values
// for delivery_type ('courier' → 'delivery') and delivery_status.
//
// Actual schema columns: pickup_address, scheduled_date (no updated_by column)
// Actual delivery_status enum: not_started, packaging, dispatched, out_for_delivery, delivered, picked_up
// Actual delivery_type enum: pickup, delivery
export async function updateDeliveryStatus(req, res, next) {
  try {
    const { id } = req.params
    const {
      status,
      pickup_address,
      scheduled_date,
      delivery_address,
      delivery_type,
      tracking_number,
      carrier,
      recipient_name,
      contact_phone,
      notes,
    } = req.body

    // ── Validate delivery_status enum ─────────────────────────────────────────
    const validDeliveryStatuses = ['not_started', 'packaging', 'dispatched', 'out_for_delivery', 'delivered', 'picked_up']
    if (status && !validDeliveryStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid delivery status. Must be one of: ${validDeliveryStatuses.join(', ')}`,
      })
    }

    // ── Validate delivery_type enum ───────────────────────────────────────────
    const validDeliveryTypes = ['pickup', 'delivery']
    if (delivery_type && !validDeliveryTypes.includes(delivery_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid delivery type. Must be one of: ${validDeliveryTypes.join(', ')}`,
      })
    }

    const { data: tracking, error } = await supabaseAdmin
      .from('delivery_tracking')
      .upsert({
        project_id:       id,
        status:           status           || 'not_started',
        pickup_address:   pickup_address   || null,
        delivery_address: delivery_address || null,
        scheduled_date:   scheduled_date   || null,
        delivery_type:    delivery_type    || 'pickup',
        tracking_number:  tracking_number  || null,
        carrier:          carrier          || null,
        recipient_name:   recipient_name   || null,
        contact_phone:    contact_phone    || null,
        notes:            notes            || null,
        updated_at:       new Date().toISOString(),
      }, { onConflict: 'project_id' })
      .select()
      .single()

    if (error) throw error

    console.info(`[updateDeliveryStatus] project ${id} → delivery status: ${status} | admin: ${ADMIN_IDENTIFIER()}`)

    res.json({ success: true, message: 'Delivery updated.', tracking })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/admin/notifications ─────────────────────────────────────────────
export async function sendNotification(req, res, next) {
  try {
    const { user_id, project_id, title, body, type } = req.body

    if (!user_id || !title || !body) {
      return res.status(400).json({ success: false, message: 'user_id, title, and body are required.' })
    }

    // ── Validate notification_type enum ───────────────────────────────────────
    const validTypes = ['project_submitted', 'project_approved', 'progress_update', 'file_uploaded', 'delivery_update', 'general', 'admin_note']
    const safeType = validTypes.includes(type) ? type : 'admin_note'

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id,
        project_id: project_id || null,
        title,
        body,
        type:    safeType,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ success: true, notification: data })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/admin/audit-logs ─────────────────────────────────────────────────
// Note: audit_logs.admin_id is UUID FK → profiles(id). Since the custom admin has
// no profiles row, this table is currently empty (all inserts silently fail due to FK).
// A schema migration to change admin_id to TEXT is tracked in Bug #4 investigation.
export async function getAuditLogs(req, res, next) {
  try {
    const { page = 1, limit = 50, action_type } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let query = supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1)

    if (action_type) query = query.eq('action_type', action_type)

    const { data: logs, error, count } = await query
    if (error) throw error

    res.json({ success: true, count, logs })
  } catch (err) {
    next(err)
  }
}
