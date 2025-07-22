// routes/evaluateRules.js
const express = require('express');
const router = express.Router();
const evaluateRulesController = require('../controllers/controller.evaluateRules');
const asyncHandler = require('../utils/util.asyncHandler');

router.get('/:ruleId/:transactionId', asyncHandler(evaluateRulesController.dryRunARuleOnATransaction));
router.post('/', asyncHandler(evaluateRulesController.evaluateRules));
router.post('/2', asyncHandler(evaluateRulesController.evaluateRules2));
router.post('/2.1', asyncHandler(evaluateRulesController.evaluateRules21));
router.post('/2.2', asyncHandler(evaluateRulesController.evaluateRules22));
router.post('/2.3', asyncHandler(evaluateRulesController.evaluateRules23));
router.post('/3', asyncHandler(evaluateRulesController.evaluateRules3));

module.exports = router;
