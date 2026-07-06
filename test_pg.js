require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query('SELECT * FROM WardenDirectoryCards');
    console.log('Success:', res.rows);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    pool.end();
  }
}

run();
