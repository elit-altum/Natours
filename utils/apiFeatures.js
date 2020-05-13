/*
A generic class for implementing API features of 
  -filtering
  -sorting
  -pagination
  -projection (field limits)

on any mongoose query.

NOTE:
Every method here returns 'this' i.e an instance of the class so these methods can be chained 
with one another.

Accepts 
  1. Mongoose query [this.query]
  2. Request query object for getting query strings (req.query) [queryString]

Returns : An APIFeature object with:
  1. query :- The manipulated query of documents 
  2. queryString :- The same req.query object provided (un-manipulated)

*/

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Create a copy object of req.query
    const filterObj = { ...this.queryString };

    // 1a. Filtering
    // Delete the keys not concerned with filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete filterObj[el]);

    // 1b. Advanced filtering
    // Modify the filter object to include $ sign before query selectors
    // We can't use $ directly in query strings as spl. characters in URL's shouldn't be allowed
    let filterString = JSON.stringify(filterObj);

    // Replace every selector -> $selector using regexp
    filterString = filterString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    // Query is an object returned by Mongoose which when awaited, returns the data from db
    this.query.find(JSON.parse(filterString));
    return this;
  }

  sort() {
    // 2. Sorting
    if (this.queryString.sort) {
      // Combine the queries using spaces from ','
      const sortQuery = this.queryString.sort.split(',').join(' ');

      // First sort by the property provided, if not found or two equal documents, put latest first
      const sortBy = `${sortQuery} -createdAt`;
      this.query.sort(sortBy);
    } else {
      this.query.sort('-createdAt');
    }

    return this;
  }

  fieldsLimit() {
    // 3. Projecting - Including only specified values in response
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4. Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;

    this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
