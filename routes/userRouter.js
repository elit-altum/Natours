// Router for handling user routes
const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Create a new router instance
const router = express.Router();

// Routes for authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Route chaining by relative URL i.e. relative to /api/v1/tours
router.route('/').get(userController.getUsers).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser);

// Routes for password reset
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

module.exports = router;
