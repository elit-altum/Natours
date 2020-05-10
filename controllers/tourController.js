// Functions for handling tour routes

const fs = require('fs');

// Getting the data first so every request doesn't need to process it. Just return it.
// Currently using static data from files
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

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
  const id = req.params.id * 1; // clever way to convert string to number

  if (id > tours.length - 1) {
    return res.status(404).json({
      status: 'failure',
      error: 'invalid ID. Tour not found.',
    });
  }

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
  const id = req.params.id * 1;
  if (id > tours.length - 1) {
    return res.status(404).json({
      status: 'failure',
      error: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Updated successfully',
  });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length - 1) {
    return res.status(404).json({
      status: 'failure',
      error: 'Invalid ID',
    });
  }

  res.status(204).json({
    status: 'success',
    message: 'Updated successfully',
  });
};
