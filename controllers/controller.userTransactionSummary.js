const pool = require('../db'); // Adjust the path to your db connection
const { subDays } = require('date-fns');
const userTransactionSummaryService = require('../services/service.userTransactionSummary');
const ApiError = require('../utils/util.ApiError');

exports.getAllUserTransactionSummary = async (req, res) => {
    const result = await userTransactionSummaryService.getAll();

    if (!result || result.length === 0) {
        throw new ApiError(404, 'No data found');
    }
    res.status(200).json({
        success: true,
        message: 'Fetched all result successfully',
        data: result
    });
}
exports.getUserTransactionSummaryById = async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        throw new ApiError(400, 'User ID is required');
    }

    const result = await userTransactionSummaryService.getById(userId);
    if (!result) {
        return res.status(404).json({ error: 'User id not found' });
    }


    res.status(200).json({
        success: true,
        message: 'Fetched by user id successfully',
        data: result
    });
};

const getPeriods = () => {
    return process.env.SUMMARY_PERIODS
        ? process.env.SUMMARY_PERIODS.split(',').map(Number)
        : [15, 30, 60, 90];
};

exports.updateUserTransactionSummary = async (req, res) => {
    const periods = getPeriods();
    const now = new Date();


    for (const days of periods) {
        const sinceDate = subDays(now, days).toISOString();

        // Get aggregates for all users for this period
        const { rows } = await pool.query(`
                SELECT 
                    receiver_id AS user_id,
                    COUNT(*) AS txn_count,
                    COALESCE(SUM(amount), 0) AS total_sum,
                    COALESCE(AVG(amount), 0) AS avg_amount
                FROM transactions
                WHERE transaction_time >= $1
                GROUP BY receiver_id
            `, [sinceDate]);

        // Update user_transaction_summary table
        for (const row of rows) {
            const { user_id, txn_count, total_sum, avg_amount } = row;

            await pool.query(`
                    UPDATE user_transaction_summary
                    SET 
                        sum_${days}d = $1,
                        avg_${days}d = $2,
                        trans_count_${days}d = $3,
                        last_updated = CURRENT_TIMESTAMP
                    WHERE user_id = $4
                `, [total_sum, avg_amount, txn_count, user_id]);
        }
    }

    res.json({ message: 'User transaction summary updated successfully.' });

    // console.error('Error updating transaction summary:', error);
    // res.status(500).json({ message: 'Internal server error', error: error.message });

};