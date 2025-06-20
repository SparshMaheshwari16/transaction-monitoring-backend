const pool = require('../db'); // adjust this if your pool is elsewhere

module.exports.getAllUser = async () => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
};

module.exports.getAUser = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    return result.rows;
};
module.exports.createUser = async (name, balance) => {
    const result = await pool.query(
        'INSERT INTO users (name, balance) VALUES ($1, $2) RETURNING *',
        [name, balance]
    );
    return result.rows[0];
}
module.exports.deleteUser = async (id) => {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};
module.exports.updateUser = async (id, name, balance) => {
    const result = await pool.query(
        'UPDATE users SET name = $1, balance = $2 WHERE id = $3 RETURNING *',
        [name, balance, id]
    );
    return result.rows[0];
}
module.exports.updateUserBalance = async (id, balance) => {
    const result = await pool.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING *',
        [balance, id]
    );
    return result.rows[0];
}
