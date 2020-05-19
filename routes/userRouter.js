// Router for handling user routes
const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Create a new router instance
const router = express.Router();

// Routes for authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Routes for password reset
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

// Deleting a user
router
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);

// Route chaining by relative URL i.e. relative to /api/v1/tours
router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getUsers
  )
  .post(userController.createUser);

// Route chaining for updating personal info
router
  .route('/updateMe')
  .patch(authController.protect, userController.updateMe);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser);

module.exports = router;
