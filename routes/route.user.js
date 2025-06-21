// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/controller.user');
const asyncHandler = require('../utils/util.asyncHandler');

// GET /api/users
router.get('/', asyncHandler(userController.getAllUsers));
router.get('/:id', asyncHandler(userController.getUserById));
router.post('/query-by-ids', asyncHandler(userController.getUsersByIds));
// POST /api/users
router.post('/', asyncHandler(userController.createUser));
// PUT /api/users/:id
router.put('/:id', asyncHandler(userController.updateUser));
// PATCH /api/users/:id
router.patch('/:id/balance', asyncHandler(userController.updateUserBalance));
// DELETE /api/users/:id
router.delete('/:id', asyncHandler(userController.deleteUser));
module.exports = router;
