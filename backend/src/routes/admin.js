/**
 * admin.js — Protected admin API routes
 *
 * All routes require a valid admin JWT (issued by POST /api/admin/login).
 * Uses the custom requireAdmin middleware — NOT Supabase auth.
 *
 * Mounted at: /api/admin
 */

import { Router } from 'express'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { upload } from '../middleware/upload.js'
import {
  getDashboardStats,
  getUsers,
  getAllProjects,
  getProjectById,
  updateProjectStatus,
  updateDeliveryStatus,
  sendNotification,
  getAuditLogs,
} from '../controllers/adminController.js'
import { uploadProjectFile } from '../controllers/projectController.js'

const router = Router()

// ── All routes below require a valid admin JWT ────────────────────────────────
router.use(requireAdmin)

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/stats', getDashboardStats)

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', getUsers)

// ── Projects ──────────────────────────────────────────────────────────────────
router.get('/projects',                        getAllProjects)
router.get('/projects/:id',                    getProjectById)
router.patch('/projects/:id/status',           updateProjectStatus)
router.patch('/projects/:id/delivery',         updateDeliveryStatus)
// Admin file upload — uses requireAdmin JWT (not Supabase protect)
router.post('/projects/:id/files', upload.single('file'), uploadProjectFile)

// ── Notifications ─────────────────────────────────────────────────────────────
router.post('/notifications', sendNotification)

// ── Audit Logs ────────────────────────────────────────────────────────────────
router.get('/audit-logs', getAuditLogs)

export default router
