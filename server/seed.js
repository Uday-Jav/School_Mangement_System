const { Pool } = require('pg');
require('dotenv').config();
const mockData = require('../src/data/mockData.js');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function seed() {
  try {
    for (const key of Object.keys(mockData)) {
      if (key.startsWith('mock') && Array.isArray(mockData[key])) {
        let tableName = key.replace('mock', '');
        // Convert PascalCase to snake_case table name
        tableName = tableName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).substring(1);
        
        // Special case mappings if needed
        if (tableName === 'classes') tableName = 'classes';
        if (tableName === 'students') tableName = 'students';

        const dataArray = mockData[key];
        if (dataArray.length === 0) continue;

        console.log(`Seeding table: ${tableName} with ${dataArray.length} records...`);

        // Check if table exists
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = $1
          );
        `, [tableName]);

        if (!tableCheck.rows[0].exists) {
          console.warn(`Table ${tableName} does not exist, skipping...`);
          continue;
        }

        const colCheck = await pool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = $1
        `, [tableName]);
        
        const validColumns = colCheck.rows.map(r => r.column_name);

        for (const item of dataArray) {
          // Filter out fields that don't exist in the database table
          const keys = Object.keys(item).filter(k => validColumns.includes(k));
          const values = keys.map(k => item[k]);
          
          if (keys.length === 0) continue;

          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
          
          try {
            await pool.query(sql, values);
          } catch (e) {
             if (!e.message.includes('duplicate key')) {
                console.error(`Error inserting into ${tableName}:`, e.message);
             }
          }
        }
        console.log(`Finished seeding ${tableName}.`);
      }
    }
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    pool.end();
  }
}

seed();
