// Builds the express server here
// Entry point express file is conventionally named app.js
const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');

// Initializes the express app
const app = express();

// Add an express middleware to parse the body of requests from JSON to object
app.use(express.json());

// Express middleware for serving static assets
app.use(express.static(`${__dirname}/public`));

// Third party middleware morgan to display request data
app.use(morgan('dev'));

// Custom middleware for attaching current time to requests
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// attach routers to express app
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
