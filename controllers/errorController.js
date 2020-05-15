// Global error handling middleware for express

// Requires the custom error class
const AppError = require('../utils/appError');

/*
For every individual error, look at its error object and then work around to extract only
the useful info from that data. Some examples are given below: 
*/

// Handling any Mongoose cast errors
const handleCastErrorDB = (err) => {
  // err.path = value you want to typecast to i.e. _id, number etc.
  // err.value = value you sent for typecasting
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handling duplicate field errors
const handleDuplicateFields = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  return new AppError(
    'Duplicate field value: ${value}. Please add another value.',
    400
  );
};

// Handling validation errors in Schema
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data: ${errors.join('. ')}`;

  return new AppError(message, 400);
};

// Sending comprehensive errors for developers in dev environment
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// Sending minimal errors to client in production
const sendErrorProd = (err, res) => {
  // For operational errors - errors we trust
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // For uncaught errors - bugs which we can't rectify
    console.log(err);
    res.status(err.statusCode).json({
      status: 500,
      message: 'Something went very wrong!',
    });
  }
};

//Actual middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // Ends the req-res cycle by returning an error to client
  if (process.env.NODE_ENV == 'development') {
    sendErrorDev(err, res);
  } else {
    // Error copy
    let errorCopy = { ...err };
    // For cast type error
    if (errorCopy.name == 'CastError') {
      errorCopy = handleCastErrorDB(errorCopy);
    }
    if (errorCopy.code == 11000) {
      errorCopy = handleDuplicateFields(errorCopy);
    }
    if (errorCopy.name == 'ValidationError') {
      errorCopy = handleValidationErrorDB(errorCopy);
    }
    sendErrorProd(errorCopy, res);
  }
};
