// services/rulesService.js
const pool = require('../db'); // adjust this if your pool is elsewhere

module.exports.getAllRules = async () => {
    const result = await pool.query('SELECT * FROM rules');
    return result.rows;
};

module.exports.getRuleById = async (id) => {
    const result = await pool.query('SELECT * FROM rules WHERE id = $1', [id]);
    return result.rows[0]; // return first row or undefined if not found
};

module.exports.createRule = async (name, condition, flag_level, risk_increment) => {
    const result = await pool.query(
        'INSERT INTO rules (name, condition, flag_level, risk_increment) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, condition, flag_level, risk_increment]
    );

    return result.rows[0]; // newly created rule
};

module.exports.deleteRule = async (id) => {
    const result = await pool.query('DELETE FROM rules WHERE id = $1 RETURNING *', [id]);
    return result.rows[0]; // return deleted rule or undefined if not found
};

module.exports.updateRule = async (id, name, condition, flag_level, risk_increment) => {
    const result = await pool.query(
        'UPDATE rules SET name = $1, condition = $2, flag_level = $3, risk_increment = $4 WHERE id = $5 RETURNING *',
        [name, condition, flag_level, risk_increment, id]
    );

    return result.rows[0]; // updated rule or undefined if not found
}
module.exports.toggleActiveRule = async (id) => {
    const result = await pool.query('UPDATE rules SET is_active = NOT is_active WHERE id = $1 RETURNING *', [id]);
    return result.rows[0]; // toggled rule or undefined if not found
};