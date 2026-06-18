import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '../config/supabase.js'

// ── POST /api/projects ────────────────────────────────────────────────────────
export async function createProject(req, res, next) {
  try {
    const {
      title, category_name, semester, college_name, deadline,
      description, components, budget_range, notes, program,
    } = req.body

    if (!title || !deadline || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, deadline, description',
      })
    }

    const projectRef = `CF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert({
        project_ref:   projectRef,
        student_id:    req.user.id,
        title,
        category_name: category_name || null,
        semester:      semester || null,
        college_name:  college_name || null,
        deadline:      deadline,
        description,
        components:    components || null,
        budget_range:  budget_range || null,
        notes:         notes || null,
        program:       program || null,
        status:        'pending',
        progress:      0,
      })
      .select()
      .single()

    if (projectError) throw projectError

    // Notify all active admins
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .eq('is_active', true)

    if (admins?.length > 0) {
      const adminNotifications = admins.map(admin => ({
        user_id:    admin.id,
        project_id: project.id,
        type:       'project_submitted',
        title:      `New Submission: ${title}`,
        body:       `${req.profile?.full_name || 'A student'} submitted "${title}" — Deadline: ${new Date(deadline).toLocaleDateString()}`,
        sent_by:    req.user.id,
      }))
      await supabaseAdmin.from('notifications').insert(adminNotifications).catch(console.error)
    }

    res.status(201).json({ success: true, message: 'Project submitted successfully.', project })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/projects ─────────────────────────────────────────────────────────
export async function getProjects(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let query = supabaseAdmin
      .from('projects')
      .select(`
        id, project_ref, title, status, progress, current_phase,
        created_at, updated_at, deadline, category_name,
        student:profiles!projects_student_id_fkey(full_name, college_name)
      `, { count: 'exact' })
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1)

    if (req.profile?.role !== 'admin') {
      query = query.eq('student_id', req.user.id)
    }

    const { data: projects, error, count } = await query
    if (error) throw error

    res.json({ success: true, count, projects })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/projects/:id ─────────────────────────────────────────────────────
export async function getProject(req, res, next) {
  try {
    const { id } = req.params

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        student:profiles!projects_student_id_fkey(id, full_name, college_name, semester, program),
        project_files(id, file_type, label, storage_path, bucket_name, mime_type, size_bytes, created_at),
        project_updates(
          id,
          message,
          phase,
          created_at,
          created_by:profiles!project_updates_author_id_fkey(full_name)
        ),
        delivery_tracking(
          id,
          status,
          pickup_location:pickup_address,
          estimated_date:scheduled_date,
          delivery_type,
          tracking_number,
          notes
        )
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' })
    }

    // Students can only see their own projects
    if (req.profile?.role !== 'admin' && project.student_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' })
    }

    res.json({ success: true, project })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/projects/:id ───────────────────────────────────────────────────
export async function updateProject(req, res, next) {
  try {
    const { id } = req.params
    const updates = req.body

    const allowed = ['status', 'progress', 'current_phase', 'manager_notes', 'delivery_date', 'delivery_type']
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    )

    if (Object.keys(safeUpdates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' })
    }

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, message: 'Project updated.', project })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/projects/:id/files ──────────────────────────────────────────────
export async function uploadProjectFile(req, res, next) {
  try {
    const { id } = req.params
    const { file_type, label } = req.body

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' })
    }

    // Determine bucket per storage convention
    const bucketMap = {
      abstract:       'project-abstracts',
      demo_video:     'demo-videos',
      delivery_image: 'delivery-images',
      circuit_diagram: 'circuit-diagrams',
    }
    const bucket_name = bucketMap[file_type] || 'project-documents'
    const storage_path = `${id}/${Date.now()}_${req.file.originalname}`

    const { data: fileRecord, error } = await supabaseAdmin
      .from('project_files')
      .insert({
        project_id:    id,
        file_type:     file_type || 'other',
        label:         label || req.file.originalname,
        original_name: req.file.originalname,
        storage_path,
        bucket_name,
        mime_type:     req.file.mimetype,
        size_bytes:    req.file.size,
        uploaded_by:   req.user.id,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ success: true, message: 'File uploaded.', file: fileRecord })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/projects/:id/files ───────────────────────────────────────────────
export async function getProjectFiles(req, res, next) {
  try {
    const { id } = req.params
    const { data: files, error } = await supabaseAdmin
      .from('project_files')
      .select('*')
      .eq('project_id', id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ success: true, files })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/files/signed-url ────────────────────────────────────────────────
export async function getSignedUrl(req, res, next) {
  try {
    const { bucket, path: filePath } = req.body
    if (!bucket || !filePath) {
      return res.status(400).json({ success: false, message: 'bucket and path are required.' })
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(filePath, 600) // 10 minutes

    if (error) throw error
    res.json({ success: true, signedUrl: data.signedUrl })
  } catch (err) {
    next(err)
  }
}
