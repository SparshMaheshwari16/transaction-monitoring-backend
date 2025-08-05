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

module.exports.getUnevaluatedTransactions = async () => {
    const result = await pool.query('SELECT * FROM transactions WHERE flag IS NULL AND flagged_by_rule IS NULL');
    return result.rows;
}

module.exports.getEvaluatedTransactions = async () => {
    const result = await pool.query('SELECT * FROM transactions WHERE flag IS NOT NULL AND flagged_by_rule IS NOT NULL');
    return result.rows;
}

module.exports.resetFlagStatus = async () => {
    const result = await pool.query('UPDATE transactions SET flag=NULL , flagged_by_rule=NULL RETURNING *')
    return result.rows;
}

module.exports.resetFlagStatusByIds = async (ids) => {
    const result = await pool.query('UPDATE transactions SET flag=NULL , flagged_by_rule=NULL WHERE id=ANY($1) RETURNING *', [ids])
    return result.rows;
}

module.exports.deleteAllTrasactions = async () => {
    const result = await pool.query('DELETE FROM transactions RETURNING *')
    return result.rows;
}


