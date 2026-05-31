import { Router } from 'express'
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  uploadProjectFile,
  getProjectFiles,
  getSignedUrl,
} from '../controllers/projectController.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

// All project routes require authentication
router.use(protect)

// GET  /api/projects  — student sees own; admin sees all (with pagination/filter)
router.get('/', getProjects)

// POST /api/projects  — student submits a new project
router.post('/', createProject)

// GET  /api/projects/:id  — project detail with files, updates, delivery
router.get('/:id', getProject)

// PATCH /api/projects/:id  — admin only field updates
router.patch('/:id', adminOnly, updateProject)

// POST /api/projects/:id/files  — admin uploads report/video/document
router.post('/:id/files', adminOnly, upload.single('file'), uploadProjectFile)

// GET  /api/projects/:id/files  — list files for a project
router.get('/:id/files', getProjectFiles)

// POST /api/files/signed-url  — generate signed download URL (auth required)
router.post('/files/signed-url', getSignedUrl)

export default router
