// routes/evaluateRules.js
const express = require('express');
const router = express.Router();
const behaVarController = require('../controllers/controller.behavioralVariable');
const asyncHandler = require('../utils/util.asyncHandler');

router.get('/', asyncHandler(behaVarController.test));

module.exports = router;
