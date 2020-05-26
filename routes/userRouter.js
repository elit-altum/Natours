// Router for handling user routes
const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Create a new router instance
const router = express.Router();

// Routes for authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.protect, authController.logout);

// Routes for password reset
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

/*
All routes herein have to be protected. As middlewares follow the stack of calling we add the protect
controller here. So every future route is protected. 
*/
router.use(authController.protect);

// Update a logged in user password at his request
router.patch('/updatePassword', authController.updatePassword);
// Deleting a user
router.route('/deleteMe').delete(userController.deleteMe);
// Route chaining for updating personal info
router
  .route('/updateMe')
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserImage,
    userController.updateMe
  );
// Get user data of logged in user
router.route('/me').get(userController.getMe);

/* 
All routes herein can only be used by the admin.
*/

router.use(authController.restrictTo('admin'));

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// Route chaining by relative URL i.e. relative to /api/v1/tours
router.route('/').get(userController.getUsers).post(userController.createUser);

module.exports = router;
