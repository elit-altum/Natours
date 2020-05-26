// Model for the user schema

const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email!'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Please have atleast 8 characters in password!'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide the confirmed password'],
    validate: {
      validator: function (val) {
        // This only runs on .create()/ .save() and not update.
        return this.password === val;
      },
      message: 'The passwords do not match!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Document middleware for password hashing before save
userSchema.pre('save', async function (next) {
  // Check if password has been modified or not (while updating)
  if (!this.isModified('password')) {
    return next(); // if not modified, leave it as is.
  }

  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);

  // Remove the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Document middleware for setting passwordChangedAt field only when password is updated by user
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    // Do not set the field if password was not changed or document is being created for first time
    return next();
  }

  // In some cases, JWT is issued after setting this field due to computational delay.
  // So we set a delay time so the JWT isn't deemed invalid

  const time = Date.now() - 5000; // 3s delay
  this.passwordChangedAt = time;
  next();
});

// Instance method for password comparison
userSchema.methods.comparePassword = async function (
  candidatePassword,
  hashedPassword
) {
  // Checks if the provided password is same as hashed password
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

// Instance method to check if password has changed after JWT issue
userSchema.methods.changedPasswordDate = function (JWTIssue) {
  let changeTimestamp = 0;
  if (this.passwordChangedAt) {
    // convert changed at date to timestamp
    changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    // Returns TRUE if JWT is not valid i.e. password was changed after JWT issue
    return changeTimestamp > JWTIssue;
  }

  return false;
};

// Instance method to generate password reset token and its expiry date
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // a random 32 byte string

  // Hash the 32 byte string
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000; // current date + 10 minutes

  // Returns generate unhashed token
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
