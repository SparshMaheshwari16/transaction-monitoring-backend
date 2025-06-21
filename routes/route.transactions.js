// routes/transactions.js
const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/controller.transactions');
const asyncHandler = require('../utils/util.asyncHandler');

// GET /api/transactions
router.get('/', asyncHandler(transactionsController.getAllTransactions));
router.get('/:id', asyncHandler(transactionsController.getATransaction));
router.post('/query-by-ids', asyncHandler(transactionsController.getTransactionsByIds));

module.exports = router;
