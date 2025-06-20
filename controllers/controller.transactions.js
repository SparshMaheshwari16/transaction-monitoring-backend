const pool = require('../db'); // Adjust the path to your db connection
const transactionService = require('../services/service.transaction');

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
exports.getATransaction = async (req, res) => {
    const transactionId = req.params.id;

    if (!transactionId) {
        throw new ApiError(400, 'Transaction ID is required');
    }
    const result = await transactionService.getATransactions(transactionId);
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
