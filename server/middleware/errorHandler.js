/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error(`❌ [Error] ${err.message}`)
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack)
  }

  // Determine status code
  const statusCode = err.statusCode || 500

  // Send error response
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler
