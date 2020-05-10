// Builds the express server here
// Entry point express file is conventionally named app.js
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

// Initializes the express app
const app = express();

// Add an express middleware to parse the body of requests from JSON to object
app.use(express.json());

// Third party middleware morgan to display request data
app.use(morgan('dev'));

// Custom middleware for attaching current time to requests
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Getting the data first so every request doesn't need to process it. Just return it.
// Currently using static data from files
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// Functions for route handling
const getAllTours = (req, res) => {
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

const getTour = (req, res) => {
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

const createTour = (req, res) => {
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

const updateTour = (req, res) => {
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

const deleteTour = (req, res) => {
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

// Create GET route for getting all tours
app.get('/api/v1/tours', getAllTours);
// Create GET route for getting tour by id
app.get('/api/v1/tours/:id', getTour);
// Create POST route for adding a new tour
app.post('/api/v1/tours', createTour);
// Create PATCH route for updating a route
app.patch('/api/v1/tours/:id', updateTour);
// Create DELETE route for updating a route
app.delete('/api/v1/tours/:id', deleteTour);

// Route chaining by URL

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// Starts the express app on a port
const port = 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
