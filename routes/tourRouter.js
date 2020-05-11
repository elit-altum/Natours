// Router for handling tour routes
const express = require('express');
const tourController = require('../controllers/tourController');

// Create a new router instance
const router = express.Router();

// Adds a param middleware for checking if id of tour is present or not
// router.param('id', tourController.checkID);

// Route chaining by relative URL i.e. relative to /api/v1/tours
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
