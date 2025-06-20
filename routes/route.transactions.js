// routes/transactions.js
const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/controller.transactions');
const asyncHandler = require('../utils/util.asyncHandler');

// GET /api/transactions
router.get('/getAll', asyncHandler(transactionsController.getAllTransactions));
router.get('/getOne/:id', asyncHandler(transactionsController.getATransaction));

module.exports = router;
