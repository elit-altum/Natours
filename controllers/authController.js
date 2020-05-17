// Authentication controllers
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Generates a JWT
const generateJwt = (id, address) => {
  console.log(process.env.JWT_EXPIRES_IN);
  return jwt.sign({ id, address }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// For signing in new users
exports.signup = catchAsync(async (req, res) => {
  /*
  Only use those properties we want the user to specify. They shouldn't add any properties of
  their own like isAdmin etc. 

  newUser will also have the password field even tho its a secret field as newUser is not a query but a return.
  */
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Issue a JWT after user signs up
  const token = generateJwt(newUser._id, ip);

  // Delete the password field for security
  newUser.password = undefined;

  res.status(201).send({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

// For logging in existing users
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password!', 400);
  }

  // Select password as it is a unselected field
  const user = await User.findOne({ email }).select('+password');

  // Compare user password with the hashed password
  const isMatch = await user.comparePassword(password, user.password);

  // If matching email and passwords aren't found
  if (!user || !isMatch) {
    throw new AppError('Invalid username or password!', 401);
  }

  // Generates JWT for the user
  const token = generateJwt(user._id, ip);

  res.status(200).json({
    status: 'success',
    token,
  });
});

// Middleware for protected routes
exports.protect = catchAsync(async (req, res, next) => {
  let token = '';

  // 1. Verify if authorization token is present and is in right format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extracts the token
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Please login or sign up!', 401);
  }

  // 2. Verify the token signature and payload data

  // jwt.verify uses a callback but we promisify it so it returns a promise instead
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Verify if user still exists in db
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new AppError('This user no longer exists. Try again.', 401);
  }

  // 4. Verify if user changed his password after JWT issue
  if (currentUser.changedPasswordDate(decoded.iat)) {
    throw new AppError(
      'You recently updated your password. Please login again',
      401
    );
  }

  // 5. Verify if IP address is same as token
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip != decoded.address) {
    throw new AppError('This session is not valid. Please login again!');
  }

  // If all checks passed, User is authenticated.
  req.user = currentUser; // Attach user data to request if someone wants to use.
  next();
});
