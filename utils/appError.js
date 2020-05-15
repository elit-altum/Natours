// Custom class for handling errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;

    // Attaches error status based on status codes
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Limits the stack trace so the problem is shown on the file it is made in not here
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
