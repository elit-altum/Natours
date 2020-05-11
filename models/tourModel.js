const mongoose = require('mongoose');

// Experimental Mongoose model and schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: [true, 'Name is already in use.'],
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  rating: {
    type: Number,
    default: 0,
  },
});

// Create a model from the schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
