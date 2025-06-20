// routes/rules.js
const express = require('express');
const router = express.Router();
const rulesController = require('../controllers/controller.rules');

// GET /api/rules
router.get('/getAll', rulesController.getAllRules);
router.get('/getOne/:id', rulesController.getARule);

module.exports = router;
