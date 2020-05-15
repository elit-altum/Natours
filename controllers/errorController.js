// Global error handling middleware for express

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Ends the req-res cycle by returning an error to client
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
