const fs = require('fs');
const csv = require('csv-parser');
const ApiError = require('./util.ApiError');

module.exports = (filePath) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                // Replace empty strings with null
                for (const key in row) {
                    if (row[key] === '') {
                        row[key] = null;
                    }
                }
                rows.push(row);
            })
            .on('end', () => resolve(rows))
            .on('error', (err) => reject(err));
    });
};
