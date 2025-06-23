// routes/rules.js
const express = require('express');
const router = express.Router();
const rulesController = require('../controllers/controller.rules');
const asyncHandler = require('../utils/util.asyncHandler');
// GET /api/rules
router.get('/', asyncHandler(rulesController.getAllRules));
router.get('/active', asyncHandler(rulesController.getAllActiveRules));
router.get('/inactive', asyncHandler(rulesController.getAllInactiveRules));
router.get('/:id', asyncHandler(rulesController.getRuleById));
// POST /api/rules
router.post('/query-by-ids', asyncHandler(rulesController.getRulesByIds));
router.post('/', asyncHandler(rulesController.createRule));
// DELETE /api/rules/:id
router.delete('/:id', asyncHandler(rulesController.deleteRule));
// PUT /api/rules/:id
router.put('/:id', asyncHandler(rulesController.updateRule));
// PATCH /api/rules/:id
router.patch('/:id/toggle-active', asyncHandler(rulesController.toggleActiveRule));
module.exports = router;
