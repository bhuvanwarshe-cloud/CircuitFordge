import { supabaseAdmin } from '../config/supabase.js'

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
      .select('id, full_name, email, college_name, semester, program, role, created_at, is_active')
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
        created_at, updated_at, deadline, category_name,
        student:profiles!projects_student_id_fkey(id, full_name, email, college_name, semester)
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
        student:profiles!projects_student_id_fkey(id, full_name, email, college_name, semester, program),
        project_files(*),
        project_updates(*, created_by:profiles(full_name)),
        delivery_tracking(*)
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error || !project) {
      return res.status(404).json({ success: false, message: 'Project not found.' })
    }

    res.json({ success: true, project })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/admin/projects/:id/status ─────────────────────────────────────
export async function updateProjectStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status, progress, current_phase, manager_notes } = req.body

    const { data: project, error } = await supabaseAdmin
      .rpc('admin_update_project', {
        p_project_id:    id,
        p_admin_id:      req.user.id,
        p_status:        status,
        p_progress:      parseInt(progress) || 0,
        p_phase:         current_phase || '',
        p_manager_notes: manager_notes || '',
      })

    if (error) throw error

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      admin_id:      req.user.id,
      action_type:   'project.status_changed',
      target_type:   'project',
      target_id:     id,
      metadata:      { status, progress, current_phase },
    }).catch(console.error)

    res.json({ success: true, message: 'Project updated.', project })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/admin/projects/:id/delivery ────────────────────────────────────
export async function updateDeliveryStatus(req, res, next) {
  try {
    const { id } = req.params
    const {
      status, pickup_location, estimated_date,
      delivery_type, tracking_number, notes
    } = req.body

    // Upsert delivery_tracking record
    const { data: tracking, error } = await supabaseAdmin
      .from('delivery_tracking')
      .upsert({
        project_id:       id,
        status:           status || 'pending',
        pickup_location:  pickup_location || '',
        estimated_date:   estimated_date || null,
        delivery_type:    delivery_type || 'pickup',
        tracking_number:  tracking_number || null,
        notes:            notes || '',
        updated_by:       req.user.id,
        updated_at:       new Date().toISOString(),
      }, { onConflict: 'project_id' })
      .select()
      .single()

    if (error) throw error

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      admin_id:    req.user.id,
      action_type: 'delivery.updated',
      target_type: 'project',
      target_id:   id,
      metadata:    { status, delivery_type },
    }).catch(console.error)

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

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id,
        project_id: project_id || null,
        title,
        body,
        type:    type || 'admin_note',
        sent_by: req.user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      admin_id:    req.user.id,
      action_type: 'notification.created',
      target_type: 'user',
      target_id:   user_id,
      metadata:    { title, type },
    }).catch(console.error)

    res.status(201).json({ success: true, notification: data })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/admin/audit-logs ─────────────────────────────────────────────────
export async function getAuditLogs(req, res, next) {
  try {
    const { page = 1, limit = 50, action_type } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let query = supabaseAdmin
      .from('audit_logs')
      .select('*, admin:profiles!audit_logs_admin_id_fkey(full_name)', { count: 'exact' })
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
