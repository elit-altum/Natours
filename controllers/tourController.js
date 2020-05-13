// Functions for handling tour routes
const Tour = require('../models/tourModel');

// Functions for route handling

// Gets all the tours stored in collection
exports.getAllTours = async (req, res) => {
  // . Response to client
  try {
    // Create a new object for filtering tours.
    const filterObj = { ...req.query };

    // BUILDING QUERY

    // 1a. Filtering
    // Delete the keys not concerned with filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete filterObj[el]);

    // 1b. Advanced filtering
    // Modify the filter object to include $ sign before query selectors
    // We can't use $ direct in query strings as spl characters in URL's shouldn't be promoted
    let filterString = JSON.stringify(filterObj);

    // Replace every selector -> $selector using regexp
    filterString = filterString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    // Query is an object returned by Mongoose which when awaited, returns the data from db
    let query = Tour.find(JSON.parse(filterString));

    // 2. Sorting
    if (req.query.sort) {
      // First sort by the property provided, if not found or two equal documents, put latest first
      const sortBy = `${req.query.sort} -createdAt`;
      query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3. Projecting - Including only specified values in response
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4. Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 50;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      // Gets total number of documents in the collection (not query)
      const totalNumberOfTours = await Tour.countDocuments();

      // If we skip more than all documents present, we return an error
      if (skip >= totalNumberOfTours) {
        throw new Error('This page has no documents!');
      }
    }

    // Returns all matching documents in tour collection as a JS array of objects
    // Gets data to send back to client
    const tours = await query;

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

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
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

    res.status(204).json({
      status: 'success',
      data: {
        tour: deletedTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: 'Invalid ID!',
      err,
    });
  }
};
