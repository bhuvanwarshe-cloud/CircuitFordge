// ─── Middleware: Global Error Handler ────────────────────────────────────────
/**
 * Catches any error thrown (or passed via next(err)) in the app.
 * Returns a structured JSON error response.
 */
export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development'

  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.path}:`, err.message)

  const statusCode = err.statusCode || err.status || 500

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(isDev && { stack: err.stack }),
  })
}

/**
 * Catches requests to undefined routes.
 */
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  })
}
