const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Udayhack@localhost:5432/School_Managment_System' });

async function check() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'classes'");
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
