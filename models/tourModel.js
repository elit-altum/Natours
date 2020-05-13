const mongoose = require('mongoose');

// Experimental Mongoose model and schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  duration: {
    type: Number,
    required: [true, 'Tour duration is required'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Tour group size is require'],
  },
  difficulty: {
    type: String,
    trim: true,
    required: [true, 'Group difficulty is required'],
  },
  ratingsAverage: {
    type: Number,
    default: 0,
  },
  ratingsQuantity: {
    type: String,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'Tour summary is required'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: String,
  images: [String],
  startDates: [Date],
});

// Create a model from the schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
