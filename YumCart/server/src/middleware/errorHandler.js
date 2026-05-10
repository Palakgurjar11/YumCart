import mongoose from 'mongoose';

/** Central Express error middleware — standardized JSON responses */
export function errorHandler(err, req, res, next) {
  console.error('[Error]', err?.message || err);

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate field value' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

/** Async route wrapper — forwards rejections to errorHandler */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
