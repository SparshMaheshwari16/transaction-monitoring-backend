// routes/evaluateRules.js
const express = require('express');
const router = express.Router();
const behavioralVariableController = require('../controllers/controller.behavioralVariable');
const asyncHandler = require('../utils/util.asyncHandler');

router.get('/', asyncHandler(behavioralVariableController.getAll));
router.get('/update', asyncHandler(behavioralVariableController.updateAllActiveVariables));

router.get('/test', asyncHandler(behavioralVariableController.test));

module.exports = router;
