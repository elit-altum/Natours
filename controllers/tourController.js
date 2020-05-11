// Functions for handling tour routes
const Tour = require('../models/tourModel');

// Functions for route handling

// Gets all the tours stored in collection
exports.getAllTours = async (req, res) => {
  try {
    // Returns all documents in tour collection as a JS array of objects
    const tours = await Tour.find();

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
