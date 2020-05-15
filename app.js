// Builds the express server here
// Entry point express file is conventionally named app.js

const express = require('express');
const morgan = require('morgan');

// Custom class for making more descriptive errors
const AppError = require('./utils/appError');
// Controller/middleware for handling errors
const errorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');

// Initializes the express app
const app = express();

// Add an express middleware to parse the body of requests from JSON to object
app.use(express.json());

// Express middleware for serving static assets
app.use(express.static(`${__dirname}/public`));

// Third party middleware morgan to display request data (only if development mode)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Custom middleware for attaching current time to requests
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// attach routers to express app
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 404 handling for any other routes
app.all('*', (req, res, next) => {
  // Create an error object and send it to error handle midware via next()
  const err = new AppError('This path does not exist on this server!', 404);
  next(err);
});

// Global error handling middleware
app.use(errorHandler);

module.exports = app;
