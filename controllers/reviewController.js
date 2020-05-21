// Functions for handling review routes

const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Gets all reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
  // If user specifies a tour id, gets reviews for that tour only else brings all reviews for all tours
  let filter = {};
  if (req.params.tourId) {
    filter.id = req.params.tourId;
  }

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

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
