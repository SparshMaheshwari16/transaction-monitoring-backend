// const { createClient } = require('@supabase/supabase-js');

// // Validate environment variables
// const SUPABASE_URL = process.env.SUPABASE_URL;
// const SUPABASE_KEY = process.env.SUPABASE_KEY;

// if (!SUPABASE_URL || !SUPABASE_KEY) {
//   console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment variables.');
//   process.exit(1); // Stop the app if credentials are missing
// }

// // Create the client
// let supabase;

// try {
//   supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
//   console.log('Supabase client initialized');
// } catch (err) {
//   console.error('Failed to initialize Supabase client:', err.message);
//   process.exit(1); // Exit the app on failure
// }

// module.exports = supabase;


const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required by Supabase
  },
});

// Optional: Test the connection immediately
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
    release();
  }
});

module.exports = pool;
