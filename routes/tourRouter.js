// Router for handling tour routes
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

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
router.route('/busy-months/:year').get(tourController.getBusyMonths);

// Route chaining by relative URL i.e. relative to /api/v1/tours
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
