const pool = require('../db'); // adjust this if your pool is elsewhere

module.exports.getAllTransactions = async () => {
    const result = await pool.query('SELECT * FROM transactions');
    return result.rows;
};

module.exports.getTransactionById = async (id) => {
    const result = await pool.query('SELECT * FROM transactions WHERE id=$1', [id]);
    return result.rows[0];
};

module.exports.getTransactionsByIds = async (ids) => {
    const result = await pool.query('SELECT * FROM transactions WHERE id=ANY($1)', [ids]);
    return result.rows;
}

