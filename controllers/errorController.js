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

// Handling JWT errors for invalid tokens
const handleJWTError = () => {
  return new AppError('Invalid session. Please login again!', 401);
};

// Handling JWt error for expired token
const handleJWTExpire = () => {
  return new AppError('Your session has expired. Please login again!', 401);
};

// Sending comprehensive errors for developers in dev environment
const sendErrorDev = (err, req, res) => {
  // A. If error occurs through API means like using Postman
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    // B. If error occurs while using website
    res.status(err.statusCode).render('error', {
      title: err.status,
      msg: err.message,
    });
  }
};

// Sending minimal errors to client in production
const sendErrorProd = (err, req, res) => {
  // A. FOR THE API
  if (req.originalUrl.startsWith('/api')) {
    // For operational errors - errors we trust
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // For uncaught errors - bugs which we can't rectify don't send complete sensitive info
    return res.status(err.statusCode).json({
      status: 500,
      message: 'Something went very wrong!',
    });
  } else {
    // B. FOR THE WEBSITE
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: err.status,
        msg: err.message,
      });
    }
    // For uncaught errors - bugs which we can't rectify don't send complete sensitive info
    return res.status(err.statusCode).render('error', {
      title: err.status,
      msg: 'Please try again later.',
    });
  }
};

//Actual middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Ends the req-res cycle by returning an error to client
  if (process.env.NODE_ENV == 'development') {
    sendErrorDev(err, req, res);
  } else {
    // Error copy
    let errorCopy = { ...err };

    // For different types of error
    if (errorCopy.name == 'CastError') {
      errorCopy = handleCastErrorDB(errorCopy);
    } else if (errorCopy.code == 11000) {
      errorCopy = handleDuplicateFields(errorCopy);
    } else if (errorCopy.name == 'ValidationError') {
      errorCopy = handleValidationErrorDB(errorCopy);
    } else if (errorCopy.name == 'JsonWebTokenError') {
      errorCopy = handleJWTError();
    } else if (errorCopy.name == 'TokenExpiredError') {
      errorCopy = handleJWTExpire();
    } else {
      // every other error which we don't catch explicitly
      return sendErrorProd(err, req, res);
    }
    sendErrorProd(errorCopy, req, res);
  }
};
