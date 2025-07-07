const pool = require('../db');

module.exports.getAll = async () => {
    const result = await pool.query('SELECT * FROM user_transaction_summary');
    return result.rows;
};

module.exports.getById = async (id) => {
    const result = await pool.query('SELECT * FROM user_transaction_summary WHERE user_id=$1', [id]);
    return result.rows[0];
}