// Functions for handling review routes

const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// Gets all reviews
exports.getAllReviews = factory.getAll(Review);
// Deletes review by its id
exports.deleteReview = factory.deleteOne(Review);
// Updates review by its id
exports.updateReview = factory.updateOne(Review);

// Creates a new review
exports.createReview = catchAsync(async (req, res, next) => {
  req.body.user = req.body.user || req.user.id;
  req.body.tour = req.body.tour || req.params.tourId;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
