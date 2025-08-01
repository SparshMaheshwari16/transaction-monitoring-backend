const userService = require('../services/service.user');
const ApiError = require('../utils/util.ApiError');

exports.getAllUsers = async (req, res) => {
    const users = await userService.getAllUser();
    if (!users || users.length === 0) {
        throw new ApiError(404, 'No users found');
    }
    res.status(200).json({
        success: true,
        message: 'Fetched all users successfully',
        data: users
    });
};
exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        throw new ApiError(404, 'No user found via id');
    }
    const result = await userService.getUserById(userId);
    if (!result || result.length === 0) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
        success: true,
        message: 'Fetched a user by ID successfully',
        data: result
    });
};

exports.getUsersByIds = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Request body is required');
    }
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, 'A non-empty array of User IDs is required');
    }

    const users = await userService.getUsersByIds(ids);

    const foundIds = users.map(user => user.id);
    const missingIds = ids.filter(id => !foundIds.includes(id));

    if (!users || users.length === 0) {
        throw new ApiError(404, `No user's found for the provided IDs`);
    }
    res.status(200).json({
        success: true,
        message: 'Fetched transactions successfully',
        data: users,
        missingIds: missingIds.length > 0 ? missingIds : undefined
    });
}


exports.createUser = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(404, 'Request body is required');
    }
    const { name, balance } = req.body;

    if (!name || !balance) {
        throw new ApiError(400, 'Missing required fields');
    }
    const result = await userService.createUser(name, balance);
    if (!result) {
        throw new ApiError(500, 'Failed to create user');
    }

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result
    });
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        throw new ApiError(404, 'User ID is required');
    }
    const result = await userService.deleteUser(userId);
    if (!result || result.length === 0) {
        throw new ApiError(404, 'User not found');
    }
    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: result
    });

};

exports.updateUser = async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        throw new ApiError(404, 'User ID is required');
    }
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(404, 'Request body is required');
    }
    const { name, balance } = req.body;

    if (!name || !balance) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await userService.updateUser(userId, name, balance);

    if (!result || result.length === 0) {
        throw new ApiError(404, 'User not found');
    }
    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: result
    });
};

exports.updateUserBalance = async (req, res) => {
    const userId = req.params.id;
    const { balance } = req.body;
    if (!userId) {
        throw new ApiError(404, 'User ID is required');
    }
    if (balance === undefined) {
        throw new ApiError(400, 'Missing required fields');
    }
    if (typeof balance !== 'number' || balance < 0) {
        throw new ApiError(400, 'Balance must be a non-negative number');
    }
    const result = await userService.updateUserBalance(userId, balance);
    if (!result) {
        throw new ApiError(404, 'User not found');
    }
    res.status(200).json({
        success: true,
        message: 'User balance updated successfully',
        data: result
    });
};

exports.resetRiskScore = async (req, res) => {

    const result = await userService.resetRiskScore();
    if (!result) {
        throw new ApiError(404, 'User not found');
    }
    res.status(200).json({
        success: true,
        message: 'All Users risk score=0 updated successfully',
        data: result
    });
};

exports.flaggedTransactionByUser = async (req, res) => {
    const id = req.params.id;
    const result = await userService.flaggedTransactionByUser(id);
    if (!result) {
        throw new ApiError(404, 'No flagged transaction found');
    }
    res.status(200).json({
        success: true,
        message: 'All transaction fetched',
        data: result
    });
};


