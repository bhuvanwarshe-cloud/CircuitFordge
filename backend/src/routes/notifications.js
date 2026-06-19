import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

router.use(protect)

// GET /api/notifications — get current user's notifications
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { data: notifications, error, count } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1)

    if (error) throw error
    res.json({ success: true, count, notifications })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/notifications/read-all — mark all as read (must be before /:id/read)
router.patch('/read-all', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false)
      .eq('is_deleted', false)

    if (error) throw error
    res.json({ success: true, message: 'All notifications marked as read.' })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/notifications/:id/read — mark single as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .eq('is_deleted', false)
      .select()
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ success: false, message: 'Notification not found.' })
    }

    res.json({ success: true, notification: data })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/notifications/:id — soft delete
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) throw error
    res.json({ success: true, message: 'Notification deleted.' })
  } catch (err) {
    next(err)
  }
})

export default router
