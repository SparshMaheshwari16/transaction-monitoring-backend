// routes/healthCheck.js
const express = require('express');
const router = express.Router();
const healthCheckController = require('../controllers/controller.healthCheck');
const asyncHandler = require('../utils/util.asyncHandler');

router.get('/', asyncHandler(healthCheckController.allHealthCheck));
router.get('/db-health', asyncHandler(healthCheckController.dbHealthCheck));
router.get('/redis-health', asyncHandler(healthCheckController.redisHealthCheck));

module.exports = router;
