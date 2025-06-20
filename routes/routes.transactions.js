// routes/transactions.js
const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/controller.transactions');

// GET /api/transactions
router.get('/getAll', transactionsController.getAllTransactions);
router.get('/getOne/:id', transactionsController.getATransaction);

module.exports = router;
