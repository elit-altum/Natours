// Use dotenv to parse config variables
const dotenv = require('dotenv');
dotenv.config({
  path: './config.env',
});

const mongoose = require('mongoose');
const app = require('./app');

// Replace the password in the srv connection string provided by Mongo
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

// Connect to the MongoDB host using Mongoose
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected successfully!');
  });

// Starts the express app on a port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
