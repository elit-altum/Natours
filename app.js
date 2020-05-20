// Builds the express server here
// Entry point express file is conventionally named app.js

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Custom class for making more descriptive errors
const AppError = require('./utils/appError');
// Controller/middleware for handling errors
const errorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');

// Initializes the express app
const app = express();

// 1. GLOBAL MIDDLEWARES

// Helmet for setting security HTTP headers
app.use(helmet());

// For use of IP with Heroku, ngnix etc.
app.set('trust proxy', 1);

// Middleware for rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Please try again after an hour.',
});
app.use('/api', limiter);

// Morgan to display request data (only in development mode)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Custom middleware for attaching current time and user ip to requests
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  req.userIp = ip;

  next();
});

// Express middleware to parse body of requests from JSON to object
app.use(express.json());

// Middleware for NoSQL injection sanitization
app.use(mongoSanitize());

// Middleware for XSS sanitizing
app.use(xss());

// Middleware for preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

// Express middleware for serving static assets
app.use(express.static(`${__dirname}/public`));

// 2. ATTACHING ROUTES

// attach routers to express app
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// 404 handling for any other routes
app.all('*', (req, res, next) => {
  // Create an error object and send it to error handle midware via next()
  const err = new AppError('This path does not exist on this server!', 404);
  next(err);
});

// 3. ERROR HANDLING MIDDLEWARE

// Global error handling middleware
app.use(errorHandler);

module.exports = app;
