const { ca } = require('date-fns/locale');
const pool = require('../db');
const redisHelper = require('../utils/util.RedisHelper');

module.exports.getAllUserTransactionSummary = async () => {
    const cached = await redisHelper.getHashAll('user:summary');

    if (cached) {
        console.log('Returning all user transaction summaries from Redis cache');
        return cached
    }
    const result = await pool.query('SELECT * FROM user_transaction_summary');

    // Store in Redis hash
    for (const row of result.rows) {
        await redisHelper.setHash('user:summary', row.user_id, row, 21600);
    }
    return result.rows;
};

module.exports.getUserTransactionSummaryById = async (id) => {
    const cached = await redisHelper.getHashField('user:summary', id);

    if (cached) {
        console.log(`Returning a user transaction summaries from Redis cache`);
        return cached;
    }
    const result = await pool.query('SELECT * FROM user_transaction_summary WHERE user_id=$1', [id]);

    const data = result.rows[0];
    if (data) {
        await redisHelper.setHash('user:summary', data.user_id, data, 21600);
    }
    return data;
}