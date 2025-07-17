// services/rulesService.js
const pool = require('../db'); // adjust this if your pool is elsewhere
const redisHelper = require('../utils/util.RedisHelper');

module.exports.getAllRules = async () => {
    // Try cache first
    const allRules = await redisHelper.getHashAll('rules:byId');

    if (allRules) {
        console.log('Returning rules from Redis cache');
        return allRules;
    }

    // Fallback to DB if no cache or Redis failed

    const result = await pool.query('SELECT * FROM rules');

    // Store in Redis for 6 hr
    for (const rule of result.rows) {
        await redisHelper.setHash('rules:byId', rule.id, rule, 21600);
    }
    return result.rows;
};
module.exports.getAllActiveRules = async () => {
    const result = await pool.query('SELECT * FROM rules WHERE is_active=true');
    return result.rows;
};
module.exports.getAllInactiveRules = async () => {
    const result = await pool.query('SELECT * FROM rules WHERE is_active=false');
    return result.rows;
};
module.exports.getRuleById = async (id) => {
    const result = await pool.query('SELECT * FROM rules WHERE id = $1', [id]);
    return result.rows[0]; // return first row or undefined if not found
};
module.exports.getRulesByIds = async (ids) => {
    const result = await pool.query('SELECT * FROM rules WHERE id=ANY($1)', [ids]);
    return result.rows;
}
module.exports.createRule = async (name, condition, flag_level, risk_increment) => {
    const result = await pool.query(
        'INSERT INTO rules (name, condition, flag_level, risk_increment) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, condition, flag_level, risk_increment]
    );

    const newRule = result.rows[0];

    // Update Redis cache
    if (newRule) {
        await redisHelper.setHash('rules:byId', newRule.id, newRule, 21600);
    }

    return newRule; // newly created rule
};

module.exports.deleteRule = async (id) => {
    const result = await pool.query('DELETE FROM rules WHERE id = $1 RETURNING *', [id]);

    const deletedRule = result.rows[0];

    if (deletedRule) {
        // Only remove the specific field from the Redis hash
        await redisHelper.deleteHashField('rules:byId', id.toString());
    }

    return deletedRule; // return deleted rule or undefined if not found
};

module.exports.updateRule = async (id, name, condition, flag_level, risk_increment) => {
    const result = await pool.query(
        'UPDATE rules SET name = $1, condition = $2, flag_level = $3, risk_increment = $4 WHERE id = $5 RETURNING *',
        [name, condition, flag_level, risk_increment, id]
    );

    const updatedRule = result.rows[0];

    if (updatedRule) {
        // Update only the specific field in the hash
        await redisHelper.setHash('rules:byId', updatedRule.id, updatedRule, 21600);
    }

    return updatedRule; // updated rule or undefined if not found
}
module.exports.toggleActiveRule = async (id) => {
    const result = await pool.query('UPDATE rules SET is_active = NOT is_active WHERE id = $1 RETURNING *', [id]);
    return result.rows[0]; // toggled rule or undefined if not found
};