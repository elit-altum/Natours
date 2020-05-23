// Controllers for serving static assets using pug
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');

exports.getOverview = catchAsync(async (req, res) => {
  // 1. Get all tours from DB
  const tours = await Tour.find();

  // 2. Build and render template using this data
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  // 1. Get the tour from the db using its slug
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review user rating',
  });

  // 2. Build and send back the template
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});
