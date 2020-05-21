// Script file for importing dev JSON data from tours-simple.json to MongoDB
require('dotenv').config({
  path: './config.env',
});

const fs = require('fs');
const mongoose = require('mongoose');

const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

const toursFilePath = `${__dirname}/tours.json`;
const reviewsFilePath = `${__dirname}/reviews.json`;
const usersFilePath = `${__dirname}/users.json`;

const tours = JSON.parse(fs.readFileSync(toursFilePath, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(reviewsFilePath, 'utf-8'));
const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

// Connect to MongoDB
const dbPath = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

if (process.argv[3] === '--local') {
  mongoose
    .connect(process.env.DATABASE_LOCAL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log('Connected to local db successfully!');
    })
    .catch((err) => {
      console.log('Failed to connect to local db: ', err);
    });
} else {
  mongoose
    .connect(dbPath, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => {
      console.log('Connection successful!');
    })
    .catch((err) => {
      console.log(err);
    });
}

// Add the files to the collection
const addFiles = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Added data successfully!');
  } catch (err) {
    console.log('Failed to add data : ', err);
  }

  // End the program control after completing the process
  process.exit();
};

// Delete all files from the collection
const deleteFiles = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('Deleted successfully!');
  } catch (err) {
    console.log('Process failed!');
  }

  process.exit();
};

if (process.argv[2] === '--import') {
  addFiles();
} else if (process.argv[2] === '--delete') {
  deleteFiles();
}
