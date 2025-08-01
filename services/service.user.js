const pool = require('../db'); // adjust this if your pool is elsewhere
const redisHelper = require('../utils/util.RedisHelper');

module.exports.getAllUser = async () => {
    const CACHE_KEY = 'user:byId';

    // Step 1: Try cache first
    const cachedData = await redisHelper.getHashAll(CACHE_KEY);

    if (cachedData) {
        console.log('Returning users from Redis cache');
        return cachedData;
    }


    // Step 2: Fallback to DB if no cache or Redis failed
    const result = await pool.query('SELECT * FROM users');

    // Step 3: Store in Redis for 6 hr (21600 seconds)
    for (const user of result.rows) {
        await redisHelper.setHash(CACHE_KEY, user.id, user, 21600);
    }
    return result.rows;
};

module.exports.getUserById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    return result.rows;
};

module.exports.getUsersByIds = async (ids) => {
    const result = await pool.query('SELECT * FROM users WHERE id=ANY($1)', [ids]);
    return result.rows;
}


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
module.exports.resetRiskScore = async () => {
    const result = await pool.query(
        'UPDATE users SET risk_score = 0 RETURNING *'
    );
    return result.rows;
}
module.exports.flaggedTransactionByUser = async (id) => {
    const result = await pool.query(
        'SELECT * FROM transactions WHERE receiver_id=$1 AND flag is NOT NULL', [id]
    );
    return result.rows;
}