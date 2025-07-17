// routes/evaluateRules.js
const express = require('express');
const router = express.Router();
const behavioralVariableController = require('../controllers/controller.behavioralVariable');
const asyncHandler = require('../utils/util.asyncHandler');

router.get('/', asyncHandler(behavioralVariableController.getAllBehavioralVariablel));
router.get('/update', asyncHandler(behavioralVariableController.updateAllActiveVariables));

module.exports = router;
