// Router for handling user routes
const express = require('express');
const userController = require('../controllers/userController');

// Create a new router instance
const router = express.Router();

// Route chaining by relative URL i.e. relative to /api/v1/tours
router.route('/').get(userController.getUsers).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser);

module.exports = router;
