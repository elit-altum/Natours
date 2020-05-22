// Mongoose model for storing user reviews on a tour

const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please provide a review message!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must be for a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must be by a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Query middleware to populate the user and tour fields with corresponding documents from id
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  // Not populating the tour as this data will already be present on the page where the review will be at.

  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  next();
});

// 1. CREATING UNIQUE USER:TOUR INDEX FOR EVERY REVIEW SO EVERY USER CAN ONLY POST 1 REVIEW PER TOUR
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// 2. CREATING SUMMARY OF REVIEWS ON EVERY TOUR

// Static method to calculate avgRating and no of ratings for a tour
reviewSchema.statics.calcAverageRating = async function (tourID) {
  // 'this' here refers to the schema Model i.e. Review

  // Aggregating review documents for finding average
  const stats = await this.aggregate([
    {
      $match: { tour: tourID },
    },
    {
      $group: {
        _id: '$tour',
        avgRatings: { $avg: '$rating' },
        nRatings: { $sum: 1 },
      },
    },
  ]);

  if (stats) {
    // Attach the calculated stats to the Tour document
    await Tour.findByIdAndUpdate(tourID, {
      ratingsAverage: stats[0].avgRatings,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    // Create some default values
    await Tour.findByIdAndUpdate(tourID, {
      ratingsAverage: 4.7,
      ratingsQuantity: 0,
    });
  }
};

// Document middleware to call calcAverageRating after saving a review
reviewSchema.post('save', function (doc) {
  // 'this.constructor' refers to the document model i.e. Review
  this.constructor.calcAverageRating(doc.tour);
});

// Document middlewares to call calcAverageRating on delete and updation of reviews
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Get a query doc
  const doc = await this.findOne();

  // Attach the query doc to the actual query. We would have to use this to get the tour's id
  // as the real query would have been deleted in the 'post' middleware in case of deletion of review.
  this.r = doc;
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // Get the doc attached before to query.
  const doc = this.r;

  // Use this doc's id to call calcAverageRating with the updated/remaining reviews
  doc.constructor.calcAverageRating(doc.tour);
});

// 3. CREATING REVIEW MODEL

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
