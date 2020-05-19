// Functions for handling user routes
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Sanitiser to filter only allowed fields from req object
const filterObject = (obj, ...allowedFields) => {
  let newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.getUsers = (req, res) => {
  res.status(500).json({
    status: 'failure',
    error: 'This route is under maintenance',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'failure',
    error: 'This route is under maintenance',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'failure',
    error: 'This route is under maintenance',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'failure',
    error: 'This route is under maintenance',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Deny access if user tries to update his password
  if (req.body.password || req.body.passwordConfirm) {
    throw new AppError(
      'This route is not for password updates. Please use /updatePassword.',
      400
    );
  }

  // 2. Filter out only those fields which we want user to update
  const updateObj = filterObject(req.body, 'name', 'email');

  // 3. Update the user
  // For un-sensitive data we can use .update()
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
