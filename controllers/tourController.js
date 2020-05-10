// Functions for handling tour routes

const fs = require('fs');

// Getting the data first so every request doesn't need to process it. Just return it.
// Currently using static data from files
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// Param middleware for checking if id of tour is present or not
exports.checkID = (req, res, next, val) => {
  // returns error if id of tour is not present
  if (val * 1 > tours.length - 1) {
    return res.status(404).json({
      status: 'failure',
      error: 'invalid ID. Tour not found.',
    });
  }
  // else continue the req-res cycle
  next();
};

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
    results: tours.length,
    requestedAt: req.requestTime,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  if (req.body) {
    const newTour = {
      id: tours[tours.length - 1].id + 1,
      ...req.body,
    };

    tours.push(newTour);

    // Adds the new tours array to the file
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
        res.status(201).json({
          status: 'success',
          data: {
            tour: newTour,
          },
        });
      }
    );
  } else {
    res.status(400).json({
      status: 'Failure',
      error: 'Bad request no data found for tour creation.',
    });
  }
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
