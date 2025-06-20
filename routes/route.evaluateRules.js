// routes/evaluateRules.js
const express = require('express');
const router = express.Router();
const evaluateRulesController = require('../controllers/controller.evaluateRules');

router.get('/:ruleId/:transactionId', evaluateRulesController.dryRunARuleOnATransaction);

module.exports = router;
