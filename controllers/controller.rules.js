const pool = require('../db'); // Adjust the path to your db connection

exports.getAllRules = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM rules');

        res.status(200).json(result.rows);

        // res.send('Fetched rules successfully');
    } catch (err) {
        console.error('PostgreSQL query error:', err.message);
        res.status(500).json({ error: 'Failed to fetch rules' });
    }
};
exports.getARule = async (req, res) => {
    const ruleId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM rules WHERE id = $1', [ruleId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rule not found' });
        }

        res.status(200).json(result.rows[0]);

        // res.send('Fetched rules successfully');
    } catch (err) {
        console.error('PostgreSQL query error:', err.message);
        res.status(500).json({ error: 'Failed to fetch rule by rule' });
    }
};
