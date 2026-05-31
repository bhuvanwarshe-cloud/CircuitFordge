import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Store files on disk (swap for Supabase Storage in production)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname)
    const name = `${uuidv4()}${ext}`
    cb(null, name)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.docx', '.doc', '.zip', '.mp4', '.png', '.jpg', '.jpeg']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${ext} not allowed. Allowed: ${allowed.join(', ')}`))
  }
}

const MAX_MB = Number(process.env.MAX_FILE_SIZE_MB) || 50

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_MB * 1024 * 1024 },
})
