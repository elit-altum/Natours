// Custom class for handling errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode || 500;

    // Attaches error status based on status codes
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // To check if an error is operational or not
    this.isOperational = true;

    // Limits the stack trace so the problem is shown on the file it is made in not here
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
