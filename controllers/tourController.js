// Functions for handling tour routes

// Imports the tour model, it is a reference to entire tours collection
const Tour = require('../models/tourModel');

// A custom class to handle API features like filtering, sorting etc.
const APIFeatures = require('../utils/apiFeatures');

// Custom wrapper fn for route handlers, to use express middleware error handling
// instead of try-catch error handling
const catchAsync = require('../utils/catchAsync');
// Custom error class for handling of errors
const AppError = require('../utils/appError');
// Generic handler functions
const factory = require('./handlerFactory');

// Alias function for top-5-best
// Prefills some query strings before sending it to getAllTours()
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, summary, price, ratingsAverage, difficulty';
  next();
};

// Functions for route handling

// Gets all the tours stored in collection
exports.getAllTours = factory.getAll(Tour);
// Updates a document by id
exports.updateTour = factory.updateOne(Tour);
// Deletes a tour by id
exports.deleteTour = factory.deleteOne(Tour);
// Creates a new tour
exports.createTour = factory.createOne(Tour);
// Gets a tour by the provided Mongo ObjectID
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// Aggregation pipelines to get stats on documents
exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.7 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        avgRatings: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// Aggregation pipeline to show months with highest number of tours in a year
exports.getBusyMonths = catchAsync(async (req, res) => {
  // Converts parameter string to number
  const year = req.params.year * 1;

  const stats = await Tour.aggregate([
    {
      // Destructs all the items in the startDates array and uses each value to create a new document
      // with that value as 'startDates' and rest all values same
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), // Start of the provided year
          $lte: new Date(`${year}-12-31`), // End of the provided year
        },
      },
    },
    {
      $group: {
        /*
            Groups the document by the months
            Creates an tours array, holds names of tours starting that month
            Counter value 'startingTours' for the number of tours every month
          */
        _id: { $month: '$startDates' }, //$month returns the month as a number from a Date object
        tours: {
          $push: '$name',
        },
        startingTours: { $sum: 1 },
      },
    },
    {
      // Adds a field month with value equal to that of _id for descriptive info
      $addFields: {
        month: '$_id',
      },
    },
    {
      // Removes the _id property from result: 0 = remove 1 = keep
      $project: { _id: 0 },
    },
    {
      $sort: {
        // Sorts results in desc order on basis of max tours starting
        startingTours: -1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
