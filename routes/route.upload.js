const express = require('express');
const router = express.Router();
const upload = require('../middlewares/middleware.upload');
const uploadController = require('../controllers/controller.upload');
const asyncHandler = require('../utils/util.asyncHandler');

router.post('/transaction', upload.single('csvFile'), asyncHandler(uploadController.uploadTransactions));

module.exports = router;
