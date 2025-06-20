// routes/rules.js
const express = require('express');
const router = express.Router();
const rulesController = require('../controllers/controller.rules');
const asyncHandler = require('../utils/util.asyncHandler');
// GET /api/rules
router.get('/getAll', asyncHandler(rulesController.getAllRules));
router.get('/getOne/:id', asyncHandler(rulesController.getARule));
// POST /api/rules
router.post('/create', asyncHandler(rulesController.createRule));
// DELETE /api/rules/:id
router.delete('/delete/:id', asyncHandler(rulesController.deleteRule));
// PUT /api/rules/:id
router.put('/update/:id', asyncHandler(rulesController.updateRule));
// PATCH /api/rules/:id
router.patch('/update/:id/toggle-active', asyncHandler(rulesController.toggleActiveRule));
module.exports = router;
