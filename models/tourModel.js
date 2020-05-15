const mongoose = require('mongoose');
const slugify = require('slugify');

// Experimental Mongoose model and schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    },
    slug: String,
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
      validate: {
        validator: function (val) {
          return val >= 0 && val <= 5;
        },
        message: 'Rating cannot be greater than 5',
      },
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
    secret: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: String,
    images: [String],
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populating and creating the virtual property
tourSchema.virtual('weekDuration').get(function () {
  return this.duration / 7;
});

// Document middleware before document save
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});

// Query middleware for removing secret tours from any find() query
tourSchema.pre(/^find/, function (next) {
  // 'this' is the query on which find() is operated on
  // we manipulate 'this' to remove those docs having secret: true
  this.find({ secret: { $ne: true } });
  next();
});

// Aggregation middleware for removing secret tours from every pipeline
tourSchema.pre('aggregate', function (next) {
  // this.pipeline() returns the corresponding pipeline as an array
  // Adds a $match stage to the start of the pipeline for removing secret tours
  this.pipeline().unshift({
    $match: { secret: { $ne: true } },
  });
  next();
});
// Create a model from the schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
