// Functions for handling tour routes
const multer = require('multer');
const sharp = require('sharp');

// Imports the tour model, it is a reference to entire tours collection
const Tour = require('../models/tourModel');

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

// Multer for processing tour image uploads
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  }

  cb(new AppError('Please provide images only!', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// For allowing 1 cover image from imageCover and 3 tour images from images
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// Image processing
exports.resizeTourImages = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1. For image cover

  // attach image name to body for update via factory fn.
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2. For images
  req.body.images = [];

  const imagePromises = req.files.images.map(async (file, index) => {
    let fileName = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${fileName}`);

    req.body.images.push(fileName);
  });

  // await imagePromises
  await Promise.all(imagePromises);

  next();
};

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

// For getting all tours within a radius
// route: /tours-within/233/center/28.7041,77.1025/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    throw new AppError('Please add coordinates in form of lat,lng.', 400);
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  // Geo-spatial queries
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// For getting distance from all the tours
exports.getTourDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  // for miles conversion
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    throw new AppError('Please add coordinates in form of lat,lng.', 400);
  }

  // Aggregation pipeline for tours and distances
  const stats = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        // distance is provided in metres
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
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
