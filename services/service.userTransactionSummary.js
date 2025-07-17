const pool = require('../db');

module.exports.getAllUserTransactionSummary = async () => {
    const result = await pool.query('SELECT * FROM user_transaction_summary');
    return result.rows;
};

module.exports.getUserTransactionSummaryById = async (id) => {
    const result = await pool.query('SELECT * FROM user_transaction_summary WHERE user_id=$1', [id]);
    return result.rows[0];
}