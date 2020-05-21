// Returns generic handler functions for common routes

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// 1. For deleting a document from a model
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      throw new AppError('No document found with this id!', 404);
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

// 2. For updating a document from a model
exports.updateOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      throw new AppError('No document found with this id!', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// 3. For getting all documents in a model
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // * Specific for reviews *
    // If user specifies a tour id, gets reviews for that tour only else brings all reviews for all tours
    let filter = {};
    if (req.params.tourId) {
      filter.id = req.params.tourId;
    }

    // 1. Query features of sorting, filtering etc based on query strings
    const features = new APIFeatures(Model.find(), req.query)
      .sort()
      .filter()
      .fieldsLimit()
      .paginate();

    // 2. Awaits the query so it returns the filtered, sorted etc. documents as a JS array of objects
    const doc = await features.query;

    // 3. Sends response to client
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

// 4. For creating a document on the Model
exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);

    // Sends success if document is created successfully
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// 5. Gets a particular document using populate
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res) => {
    // Finds an individual tour by MongoID and populates its reviews field
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query.populate(populateOptions);
    }

    const doc = await query;

    if (!doc) {
      // As AppError extends Error(), this is similar to throw new Error()
      throw new AppError('No document found with this id!', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
