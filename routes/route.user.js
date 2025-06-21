// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/controller.user');
const asyncHandler = require('../utils/util.asyncHandler');

// GET /api/users
router.get('/getAll', asyncHandler(userController.getAllUsers));
router.get('/getOne/:id', asyncHandler(userController.getUserById));
router.get('/getMul', asyncHandler(userController.getUsersByIds));
// POST /api/users
router.post('/create', asyncHandler(userController.createUser));
// PUT /api/users/:id
router.put('/update/:id', asyncHandler(userController.updateUser));
// PATCH /api/users/:id
router.patch('/update/:id/update-balance', asyncHandler(userController.updateUserBalance));
// DELETE /api/users/:id
router.delete('/delete/:id', asyncHandler(userController.deleteUser));
module.exports = router;
