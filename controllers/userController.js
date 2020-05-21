// Functions for handling user routes
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

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

// Gets all the users on db
exports.getUsers = factory.getAll(User);
// Gets a particular user from db
exports.getUser = factory.getOne(User);
// For updating a user data by the admin
exports.updateUser = factory.updateOne(User);
// For actually deleting a user from db (admin action only)
exports.deleteUser = factory.deleteOne(User);

// Redirect to /signup page
exports.createUser = (req, res) => {
  res.status(400).json({
    status: 'error',
    error: 'Please use /signup instead!',
  });
};

// For getting info of current user
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// For updating a user's un-sensitive data (not password) by the user itself
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
  // For un-sensitive data we use .update()
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

// For deleting a user by the user itself (marking as unactive)
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
