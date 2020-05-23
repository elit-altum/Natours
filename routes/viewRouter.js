// Router for serving static assets from pug
const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

// Render pug templates

router.get('/', viewController.getOverview);
router.get('/tour', viewController.getTour);

module.exports = router;
