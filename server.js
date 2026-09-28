import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 8080;

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Udayhack',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'School_Managment_System',
});

// Test Database Connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ [PostgreSQL Error]: Failed to connect to School_Managment_System database:', err.stack);
  } else {
    console.log('✅ [PostgreSQL Connected]: Successfully connected to database "School_Managment_System" as user "postgres"!');
    release();
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/v1/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'UP', database: 'Connected', timestamp: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'DOWN', error: error.message });
  }
});

// -------------------------------------------------------------
// STUDENTS REST ENDPOINTS
// -------------------------------------------------------------
app.get('/api/v1/students', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM students ORDER BY admission_no ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/students', async (req, res) => {
  try {
    const s = req.body;
    const id = s.id || `std-${Date.now()}`;
    const query = `
      INSERT INTO students (id, admission_no, first_name, last_name, full_name, gender, dob, blood_group, phone, email, address, class_id, class_name, section_id, section_name, roll_no, academic_year, admission_date, status, guardian_name, guardian_phone, guardian_relationship, attendance_percentage, fee_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *;
    `;
    const values = [
      id,
      s.admission_no || `ADM-2026-${Math.floor(100 + Math.random() * 900)}`,
      s.first_name || 'Student',
      s.last_name || 'User',
      s.full_name || `${s.first_name} ${s.last_name}`,
      s.gender || 'Male',
      s.dob || '2012-01-01',
      s.blood_group || 'O+',
      s.phone || '',
      s.email || '',
      s.address || '',
      s.class_id || 'cls-1',
      s.class_name || 'Class 10',
      s.section_id || 'sec-1',
      s.section_name || 'A',
      s.roll_no || '101',
      s.academic_year || '2025-2026',
      s.admission_date || new Date().toISOString().split('T')[0],
      s.status || 'Active',
      s.guardian?.name || s.guardian_name || 'Parent Name',
      s.guardian?.phone || s.guardian_phone || '',
      s.guardian?.relationship || s.guardian_relationship || 'Father',
      s.attendance_percentage || 100,
      s.fee_status || 'Paid',
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/v1/students/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE id = $1', [req.params.id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// TEACHERS REST ENDPOINTS
// -------------------------------------------------------------
app.get('/api/v1/teachers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM teachers ORDER BY full_name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/teachers', async (req, res) => {
  try {
    const t = req.body;
    const id = t.id || `tch-${Date.now()}`;
    const query = `
      INSERT INTO teachers (id, employee_no, first_name, last_name, full_name, gender, department_id, department_name, designation, qualification, phone, email, joining_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;
    const values = [
      id,
      t.employee_no || `EMP-T${Math.floor(10 + Math.random() * 90)}`,
      t.first_name || 'Faculty',
      t.last_name || 'Member',
      t.full_name || `${t.first_name} ${t.last_name}`,
      t.gender || 'Male',
      t.department_id || 'dept-1',
      t.department_name || 'Science',
      t.designation || 'Senior Teacher',
      t.qualification || 'M.Sc, B.Ed',
      t.phone || '',
      t.email || `teacher_${Date.now()}@school.edu`,
      t.joining_date || new Date().toISOString().split('T')[0],
      t.status || 'Active',
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// CLASSES & SECTIONS REST ENDPOINTS
// -------------------------------------------------------------
app.get('/api/v1/classes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM classes ORDER BY numeric_grade ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// SUBJECTS REST ENDPOINTS
// -------------------------------------------------------------
app.get('/api/v1/subjects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM subjects ORDER BY code ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ATTENDANCE REST ENDPOINTS
// -------------------------------------------------------------
app.get('/api/v1/attendance', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM attendance_records ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// PAYMENTS REST ENDPOINTS
// -------------------------------------------------------------
app.get('/api/v1/payments', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM payments ORDER BY payment_date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/payments', async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || `pay-${Date.now()}`;
    const query = `
      INSERT INTO payments (id, receipt_no, student_id, student_name, class_name, section_name, roll_no, fee_type, amount, payment_date, payment_method, transaction_id, status, received_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;
    const values = [
      id,
      p.receipt_no || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      p.student_id || 'std-1',
      p.student_name || 'Student',
      p.class_name || 'Class 10',
      p.section_name || 'A',
      p.roll_no || '101',
      p.fee_type || 'Tuition Fee',
      p.amount || 1000,
      p.payment_date || new Date().toISOString().split('T')[0],
      p.payment_method || 'UPI',
      p.transaction_id || `TXN${Date.now()}`,
      p.status || 'Paid',
      p.received_by || 'Accounts Desk',
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// NOTICES REST ENDPOINTS
// -------------------------------------------------------------
app.get('/api/v1/notices', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM notices ORDER BY published_date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// USERS REST ENDPOINTS
// -------------------------------------------------------------
app.get('/api/v1/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY created_date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server listening on port 8080
app.listen(PORT, () => {
  console.log(`🚀 [Backend Server Running]: REST API live on http://localhost:${PORT}/api/v1`);
  console.log(`📊 PostgreSQL Database: School_Managment_System (User: postgres)`);
});
