const pool = require('../db'); // Adjust the path to your db connection
const transactionService = require('../services/service.transaction');
const ApiError = require('../utils/util.ApiError');

exports.getAllTransactions = async (req, res) => {

    const result = await transactionService.getAllTransactions();
    if (!result || result.length === 0) {
        throw new ApiError(404, 'No transactions found');
    }
    res.status(200).json({
        success: true,
        message: 'Fetched all transactions successfully',
        data: result
    });

    // res.send('Fetched transactions successfully');

    // console.error('PostgreSQL query error:', err.message);
    // res.status(500).json({ error: 'Failed to fetch transactions' });

};
exports.getTransactionById = async (req, res) => {
    const transactionId = req.params.id;

    if (!transactionId) {
        throw new ApiError(400, 'Transaction ID is required');
    }
    const result = await transactionService.getTransactionById(transactionId);
    if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({
        success: true,
        message: 'Fetched a transactions by id successfully',
        data: result
    });


    // res.send('Fetched transactions successfully');

    // console.error('PostgreSQL query error:', err.message);
    // res.status(500).json({ error: 'Failed to fetch transaction by id' });

};

exports.getTransactionsByIds = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Request body is required');
    }
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, 'A non-empty array of Transaction IDs is required');
    }

    const transactions = await transactionService.getTransactionsByIds(ids);

    const foundIds = transactions.map(transaction => transaction.id);
    const missingIds = ids.filter(id => !foundIds.includes(id));

    if (!transactions || transactions.length === 0) {
        throw new ApiError(404, 'No transactions found for the provided IDs');
    }
    res.status(200).json({
        success: true,
        message: 'Fetched transactions successfully',
        data: transactions,
        missingIds: missingIds.length > 0 ? missingIds : undefined
    });
};

exports.resetFlagStatus = async (req, res) => {
    const result = await transactionService.resetFlagStatus();

    if (!result) {
        throw new ApiError(404, 'No transactions founds');
    }

    res.status(200).json({
        success: true,
        message: 'Updated the flag and flagged_by_rule to NULL for all transactions successfully',
        data: result
    });
};

exports.resetFlagStatusByIds = async (req, res) => {
    console.log('here55');
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Request body is required');
    }
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, 'A non-empty array of Transaction IDs is required');
    }

    const transactions = await transactionService.resetFlagStatusByIds(ids);

    const foundIds = transactions.map(transaction => transaction.id);
    const missingIds = ids.filter(id => !foundIds.includes(id));

    if (!transactions || transactions.length === 0) {
        throw new ApiError(404, 'No transactions found for the provided IDs');
    }
    res.status(200).json({
        success: true,
        message: 'Updated the flag and flagged_by_rule to NULL for transactions successfully',
        data: transactions,
        missingIds: missingIds.length > 0 ? missingIds : undefined
    });
};


