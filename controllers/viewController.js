// Controllers for serving static assets using pug
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');

exports.getOverview = catchAsync(async (req, res) => {
  // 1. Get all tours from DB
  const tours = Tour.find();

  // 2. Build and render template using this data
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
  });
};
