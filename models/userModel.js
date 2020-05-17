// Model for the user schema
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
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'guide'],
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
    return changeTimestamp < JWTIssue;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
