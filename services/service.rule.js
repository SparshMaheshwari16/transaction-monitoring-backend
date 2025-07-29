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
    // Try cache
    // let activeRules = await redisHelper.getCache('rules:active');
    let activeRules = await redisHelper.getHashAll('rules:active:byId');

    if (activeRules) {
        console.log('Returning all active rules from Redis cache');
        return activeRules;
    }
    const result = await pool.query('SELECT * FROM rules WHERE is_active=true');
    activeRules = result.rows

    // Store in Redis for 6 hr

    // await redisHelper.setCache('rules:active', activeRules, 21600);
    for (const rule of result.rows) {
        await redisHelper.setHash('rules:active:byId', rule.id, rule, 21600);
    }

    return activeRules;
};
module.exports.getAllInactiveRules = async () => {
    const result = await pool.query('SELECT * FROM rules WHERE is_active=false');
    return result.rows;
};
module.exports.getRuleById = async (id) => {
    // Try cache 
    const rule = await redisHelper.getHashField('rules:byId', id);

    if (rule) {
        console.log('Returning rule by id from Redis cache');
        return rule;
    }

    const result = await pool.query('SELECT * FROM rules WHERE id = $1', [id]);

    const dbRule = result.rows[0];
    // Cache the result if found
    if (dbRule) {
        await redisHelper.setHash('rules:byId', dbRule.id, dbRule, 21600);
    }
    return dbRule; // return first row or undefined if not found
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

    const updatedRule = result.rows[0];

    // Update rules:byId Hash
    await redisHelper.setHash('rules:byId', id, updatedRule, 21600);

    // Update active rules hash
    if (updatedRule.is_active) {
        // Add or update in active rules hash
        await redisHelper.setHash('rules:active:byId', id, updatedRule, 21600);
    } else {
        // Remove from active rules hash
        await redisHelper.deleteHashField('rules:active:byId', id);
    }

    return result.rows[0]; // toggled rule or undefined if not found
};