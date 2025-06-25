// routes/transactions.js
const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/controller.transactions');
const asyncHandler = require('../utils/util.asyncHandler');

// GET /api/transactions
router.get('/', asyncHandler(transactionsController.getAllTransactions));
router.get('/unevaluated', asyncHandler(transactionsController.getUnevaluatedTransactions));
router.get('/evaluated', asyncHandler(transactionsController.getEvaluatedTransactions));
router.get('/:id', asyncHandler(transactionsController.getTransactionById));
router.post('/query-by-ids', asyncHandler(transactionsController.getTransactionsByIds));
router.patch('/reset-flag', asyncHandler(transactionsController.resetFlagStatus));
router.patch('/reset-flag-by-ids', asyncHandler(transactionsController.resetFlagStatusByIds));

module.exports = router;
