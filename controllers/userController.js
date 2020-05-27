// Functions for handling user routes
const multer = require('multer');
const sharp = require('sharp');
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

// Multer for creating middleware for uploading user images directly in file
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];

//     // req.user is attached by protect route
//     // for only unique names: user-(user.id)-(timestamp).(extension)
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// Multer for creating a memory buffer to process image before saving
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload images only!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 1000000, // 1MB only
  },
});

exports.uploadUserPhoto = upload.single('photo');

// Resizing user image using sharp
exports.resizeUserImage = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Multer will store a buffer/encoded version of image on req.file.buffer
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

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

  // If user has updated his image
  if (req.file) {
    updateObj.photo = req.file.filename;
  }

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
