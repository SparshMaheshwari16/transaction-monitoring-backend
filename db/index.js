const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required by Supabase
  },
});

// Handle idle client disconnection errors
pool.on('error', (err) => {
  console.error('PG Pool error:', err.message || err);
  console.log(`From db/index.js`);
});

// Optional: Test the connection immediately
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
    console.log('*-*-*-*-*-*-*-*-*-*-');
    release();
  }
});

module.exports = pool;
