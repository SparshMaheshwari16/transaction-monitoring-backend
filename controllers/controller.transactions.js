const pool = require('../db'); // Adjust the path to your db connection

exports.getAllTransactions = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions');

        res.status(200).json(result.rows);

        // res.send('Fetched transactions successfully');
    } catch (err) {
        console.error('PostgreSQL query error:', err.message);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};
exports.getATransaction = async (req, res) => {
    const transactionId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [transactionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.status(200).json(result.rows[0]);

        // res.send('Fetched transactions successfully');
    } catch (err) {
        console.error('PostgreSQL query error:', err.message);
        res.status(500).json({ error: 'Failed to fetch transaction by id' });
    }
};
