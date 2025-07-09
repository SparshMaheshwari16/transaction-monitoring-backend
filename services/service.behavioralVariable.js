const pool = require('../db'); // adjust this if your pool is elsewhere

module.exports.getAll = async () => {
    const result = await pool.query('SELECT * FROM behavioral_variables_definitions');
    return result.rows;
};
