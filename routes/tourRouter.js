// Router for handling tour routes
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const reviewRouter = require('../routes/reviewRouter');

// Create a new router instance
const router = express.Router();

// Adds a param middleware for checking if id of tour is present or not
// router.param('id', tourController.checkID);

// Add a middleware for alias path i.e. a GET tour path with pre-filled query-strings for easy access
// An alias for 5 top-rated tours
router
  .route('/top-5-best')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/busy-months/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getBusyMonths
  );

// Route for getting all tours within a radius (geo-spatial data)
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

// Route for getting distances to all the tours from specified location
router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getTourDistances);

// Route chaining by relative URL i.e. relative to /api/v1/tours
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// Nested routes for reviews of a particular tour
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
