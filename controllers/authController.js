// Authentication controllers

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// Generates a JWT
const generateJwt = (user, address, res) => {
  // 1. Creates a JWT
  const token = jwt.sign({ id: user._id, address }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // 2. Creates a cookie for the JWT
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV == 'production') {
    cookieOptions.secure = true;
  }

  // 3. Send the cookie to client as well as server response
  res.cookie('jwt', token, cookieOptions);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// 1. FOR SIGNING IN NEW USERS
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
  generateJwt(newUser, ip, res);
});

// 2. FOR LOGGING IN EXISTING USERS
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password!', 400);
  }

  // Select password as it is a unselected field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid username or password!', 401);
  }

  // Compare user password with the hashed password
  const isMatch = await user.comparePassword(password, user.password);

  // If matching email and passwords aren't found
  if (!isMatch) {
    throw new AppError('Invalid username or password!', 401);
  }

  // Generates and sends JWT to the user
  generateJwt(user, req.userIp, res);
});

// 3. FOR LOGGING USERS OUT
exports.logout = (req, res, next) => {
  // 1. Send a manipulated cookie of a short duration to replace the existing jwt
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
  });

  res.status(200).json({
    status: 'success',
  });
};

// 4. MIDDLEWARE FOR PROTECTED ROUTES: USER AUTHENTICATION
exports.protect = catchAsync(async (req, res, next) => {
  let token = '';

  // 1. Verify if authorization token is present and is in right format
  if (
    // If present in req header (usually by postman)
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extracts the token
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    // If present as cookies (sent by a browser)

    token = req.cookies.jwt;
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
  if (req.userIp != decoded.address) {
    throw new AppError('This session is not valid. Please login again!');
  }

  // If all checks passed, User is authenticated.
  req.user = currentUser; // Attach user data to request if someone wants to use.
  next();
});

// 5. MIDDLEWARE TO CHECK IF A USER IS LOGGED IN OR NOT
//   We don't need catchAsync as we do not want to send any errors just check if logged in or not.
exports.isLoggedIn = async (req, res, next) => {
  // 1. Verify if authorization token is present and is in right format
  if (req.cookies.jwt) {
    try {
      // If present as cookies (sent by a browser)
      token = req.cookies.jwt;

      // We don't throw an error, as we are just checking if logged in or not
      // 2. Verify the token signature and payload data

      // jwt.verify uses a callback but we promisify it so it returns a promise instead
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      // 3. Verify if user still exists in db
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 4. Verify if user changed his password after JWT issue
      if (currentUser.changedPasswordDate(decoded.iat)) {
        return next();
      }

      // 5. Verify if IP address is same as token
      if (req.userIp != decoded.address) {
        return next();
      }

      // If all checks passed, User is authenticated.
      res.locals.user = currentUser; // Attach user data as a local on pug template.
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

// 6. FUNCTION FOR PROTECTING ROUTES: USER AUTHORIZATION
exports.restrictTo = (...roles) => {
  // Returns a middleware fn to check if a user role matches or not
  return (req, res, next) => {
    // req.user is attached by the authentication midware
    if (!roles.includes(req.user.role)) {
      // if role doesn't match send Forbidden Error
      throw new AppError(
        'You do not have permission to perform this action',
        403
      );
    }

    next();
  };
};

// 7. FUNCTION FOR GENERATING A PASSWORD RESET REQUEST
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Check if user is in db through his email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new AppError('No user found with that email!', 404);
  }

  // 2. Generate a reset token
  const resetToken = user.generatePasswordResetToken();

  // This method updates some DB values as well so we need to update it
  await user.save({ validateBeforeSave: false });

  // 3. Send email to the client with password reset link
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm 
  to: ${resetUrl} \n You can ignore this email safely if you made no such requests.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset (expires in 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: `Password reset instructions have been sent to: ${user.email}`,
    });
  } catch (err) {
    // If failure to send reset email remove the fields for reset
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save({ validateBeforeSave: false });
    throw new AppError('Unable to send reset email. Please try again later!');
  }
});

// 8. FOR RESETTING USER PASSWORD
exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.token;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); // Hash the provided token

  // 1. Find the user based on token provided and check if it has expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('This token is invalid or has expired!', 400);
  }

  // 2. Update the password, passwordChangedAt field for this user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;

  await user.save(); // Mongoose validators will check if password == passwordConfirm

  // 3. Log in the user, send back a JWT
  generateJwt(user, req.userIp, res);
});

// 9. CHANGING USER PASSWORD ON HIS REQUEST
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get POSTed user
  const user = await User.findById(req.user._id).select('+password');

  // 2. Check if current password is correct
  if (!user.comparePassword(req.body.oldPassword, user.password)) {
    throw new AppError('This is the wrong password. Permission denied.', 400);
  }

  // 3. Update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;

  await user.save(); // always use save() as update() does not run validators!

  // 4. Send is new JWT for login
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Generates JWT for the user
  generateJwt(user, req.userIp, res);
});
