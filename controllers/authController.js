// Authentication controllers
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Generates a JWT
const generateJwt = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
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

  // Issue a JWT after user signs up
  const token = generateJwt(newUser._id);

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
    throw new AppError('Invalid username or password!', 400);
  }

  // Generates JWT for the user
  const token = generateJwt(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
