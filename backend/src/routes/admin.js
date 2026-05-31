import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
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

const router = Router()

// ── All admin routes require auth + admin role ────────────────────────────────
router.use(protect, adminOnly)

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/stats', getDashboardStats)

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', getUsers)

// ── Projects ──────────────────────────────────────────────────────────────────
router.get('/projects',              getAllProjects)
router.get('/projects/:id',          getProjectById)
router.patch('/projects/:id/status', updateProjectStatus)
router.patch('/projects/:id/delivery', updateDeliveryStatus)

// ── Notifications ─────────────────────────────────────────────────────────────
router.post('/notifications', sendNotification)

// ── Audit Logs ────────────────────────────────────────────────────────────────
router.get('/audit-logs', getAuditLogs)

export default router
