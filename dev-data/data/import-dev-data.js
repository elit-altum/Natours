// Script file for importing dev JSON data from tours-simple.json to MongoDB
require('dotenv').config({
  path: './config.env',
});

const fs = require('fs');
const mongoose = require('mongoose');

const Tour = require('../../models/tourModel');

const filePath = `${__dirname}/tours.json`;

const tours = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

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
    const res = await Tour.create(tours);
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
    const res = await Tour.deleteMany();
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
