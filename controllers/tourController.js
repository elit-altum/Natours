// Functions for handling tour routes
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

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
exports.getAllTours = async (req, res) => {
  // . Response to client
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .sort()
      .filter()
      .fieldsLimit()
      .paginate();

    // Awaits the query so it returns the filtered/sorted etc documents as a JS array of objects
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err,
    });
  }
};

// Gets a tour by the provided Mongo ObjectID
exports.getTour = async (req, res) => {
  try {
    // Finds an individual tour by MongoID
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: 'Invalid ID',
    });
  }
};

// Creates a new tour
exports.createTour = async (req, res) => {
  // Using try-catch for async-await error handling
  try {
    const tour = await Tour.create(req.body);

    // Sends success if document is created successfully
    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    // Sends a message of failure if any mongoose validation fails
    res.status(400).json({
      status: 'failure',
      message: 'Invalid data!',
    });
  }
};

// Updates a document by id
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (tour) {
      return res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    }

    res.status(404).send({
      status: 'failure',
      message: 'ID Not found',
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: 'Invalid updates',
    });
  }
};

// Deletes a tour by id
exports.deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);

    if (deletedTour) {
      return res.status(204).json({
        status: 'success',
        data: {
          tour: deletedTour,
        },
      });
    }

    res.status(404).send({
      status: 'failure',
      message: 'ID Not found',
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: 'Invalid ID format!',
      err,
    });
  }
};

// Aggregation pipelines to get stats on documents
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      error: err,
    });
  }
};

// Aggregation pipeline to show months with highest number of tours in a year
exports.getBusyMonths = async (req, res) => {
  // Converts parameter string to number
  const year = req.params.year * 1;
  try {
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
          // Sorts results in desc order on basis of most tours starting
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
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      error: err,
    });
  }
};
