// Functions for handling tour routes

// Checks if body of the request has name and price members for updation
exports.checkBody = (req, res, next) => {
  if (req.body.name && req.body.price) {
    return next();
  }

  res.status(400).json({
    status: 'error',
    error: 'Please add name and price',
  });
};

// Functions for route handling
exports.getAllTours = (req, res) => {
  // return the previous data in JSend format
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
  });
};

exports.getTour = (req, res) => {
  res.status(200).json({
    status: 'success',
  });
};

exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success',
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Updated successfully',
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    message: 'Updated successfully',
  });
};
