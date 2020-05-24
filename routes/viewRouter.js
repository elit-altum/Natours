// Router for serving static assets from pug
const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

// Render pug templates

router.get('/me', authController.protect, viewController.getAccount);

// Checks if the requesting user is logged in or not
router.use(authController.isLoggedIn);

// Routes for pug
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.login);
router.get('/', viewController.getOverview);

module.exports = router;
