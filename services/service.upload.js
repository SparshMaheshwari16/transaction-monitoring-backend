const fs = require('fs');
const parseCsv = require('../utils/util.parseCsv');
const pool = require('../db');

exports.processCsvFile = async (filePath) => {

    const rows = await parseCsv(filePath);
    fs.unlinkSync(filePath);

    if (rows.length === 0) {
        return { success: false, error: 'CSV is empty' };
    }

    const columns = Object.keys(rows[0]);
    const values = rows.map(row => columns.map(col => row[col]));

    const paramPlaceholders = values.map(
        (_, i) =>
            `(${columns.map((__, j) => `$${i * columns.length + j + 1}`).join(', ')})`
    );

    const flatValues = values.flat();
    const query = `
            INSERT INTO transactions (${columns.join(', ')})
            VALUES ${paramPlaceholders.join(',\n')}
        `;

    await pool.query(query, flatValues);
    return { success: true, insertedCount: rows.length };

};
