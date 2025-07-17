const express = require('express');
const router = express.Router();
const userTransactionSummaryController = require('../controllers/controller.userTransactionSummary');
const asyncHandler = require('../utils/util.asyncHandler');

// router.get('/', userTransactionSummaryController.test);
router.get('/',  asyncHandler(userTransactionSummaryController.getAllUserTransactionSummary));
router.get('/:id',  asyncHandler(userTransactionSummaryController.getUserTransactionSummaryById));



module.exports = router;
