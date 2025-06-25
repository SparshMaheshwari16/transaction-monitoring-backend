// routes/evaluateRules.js
const express = require('express');
const router = express.Router();
const evaluateRulesController = require('../controllers/controller.evaluateRules');

router.get('/:ruleId/:transactionId', evaluateRulesController.dryRunARuleOnATransaction);
router.post('/', evaluateRulesController.evaluateRules);
router.post('/2', evaluateRulesController.evaluateRules2);

module.exports = router;
