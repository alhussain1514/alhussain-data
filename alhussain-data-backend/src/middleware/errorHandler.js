export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` })
}

export const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error:', err.message)

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    return res.status(409).json({ message: `${field} is already in use.` })
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: messages.join('. ') })
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' })
  }

  const status = err.statusCode || 500
  res.status(status).json({
    message: err.message || 'Something went wrong on our end.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
