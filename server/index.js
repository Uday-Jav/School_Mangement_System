const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = 'super_secret_dev_key';

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query('SELECT NOW()', async (err, res) => {
  if (err) console.error('Database connection failed:', err.message);
  else {
    console.log('Connected to PostgreSQL Database successfully at:', res.rows[0].now);
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS teaching_assignments (
          id VARCHAR(50) PRIMARY KEY,
          teacher_id VARCHAR(50),
          class_id VARCHAR(50),
          section_id VARCHAR(50),
          subject_id VARCHAR(50)
        );
      `);
    } catch(e) {
      console.error('Migration failed:', e.message);
    }
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { role } = req.body; 
  try {
    let userResult = await pool.query('SELECT * FROM users WHERE role = $1 LIMIT 1', [role]);
    if (userResult.rows.length === 0) return res.status(401).json({ error: 'No user found for this role' });
    const user = userResult.rows[0];

    let linkedStudentId = null, linkedTeacherId = null;
    if (role === 'STUDENT') {
      const s = await pool.query('SELECT id FROM students WHERE email = $1', [user.email]);
      if (s.rows.length > 0) linkedStudentId = s.rows[0].id;
    } else if (role === 'TEACHER') {
      const t = await pool.query('SELECT id FROM teachers WHERE email = $1', [user.email]);
      if (t.rows.length > 0) linkedTeacherId = t.rows[0].id;
    }

    const token = jwt.sign({
      userId: user.id, role: user.role, email: user.email, linkedStudentId, linkedTeacherId
    }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user, linkedStudentId, linkedTeacherId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized: No token' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) { res.status(401).json({ error: 'Unauthorized: Invalid token' }); }
};

app.get('/api/status', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ connected: true }); }
  catch (err) { res.status(500).json({ connected: false, error: err.message }); }
});

const sanitizeTable = (table) => {
  const allowed = ['users', 'students', 'teachers', 'parents', 'classes', 'sections', 'subjects', 'attendance_records', 'exam_results', 'timetable', 'notices', 'events', 'fees', 'payments', 'fee_structures', 'books', 'book_issues', 'transport_routes'];
  if (!allowed.includes(table)) throw new Error('Invalid or unsupported table name');
  return table;
};

app.get('/api/:table', requireAuth, async (req, res) => {
  try {
    const table = sanitizeTable(req.params.table);
    const { role, linkedStudentId, linkedTeacherId } = req.user;
    let query = `SELECT * FROM ${table}`;
    let params = [];

    if (role === 'ADMIN') { /* all */ } 
    else if (role === 'STUDENT') {
      if (!linkedStudentId) return res.status(403).json({ error: 'Not linked to student' });
      if (table === 'students') { query += ` WHERE id = $1`; params.push(linkedStudentId); }
      else if (['attendance_records', 'exam_results', 'payments', 'book_issues'].includes(table)) {
        query += ` WHERE student_id = $1`; params.push(linkedStudentId);
      } else if (table === 'timetable') {
        const s = await pool.query('SELECT class_id, section_id FROM students WHERE id = $1', [linkedStudentId]);
        if (s.rows.length > 0) { query += ` WHERE class_id = $1 AND section_id = $2`; params.push(s.rows[0].class_id, s.rows[0].section_id); }
        else query += ` WHERE 1=0`;
      } else if (table === 'notices') { }
      else return res.status(403).json({ error: 'Forbidden' });
    } else if (role === 'TEACHER') {
      if (!linkedTeacherId) return res.status(403).json({ error: 'Not linked to teacher' });
      if (table === 'students') {
        query += ` WHERE section_id IN (SELECT id FROM sections WHERE class_teacher_id = $1)`; params.push(linkedTeacherId);
      } else if (['attendance_records', 'exam_results'].includes(table)) {
        query += ` WHERE student_id IN (SELECT id FROM students WHERE section_id IN (SELECT id FROM sections WHERE class_teacher_id = $1))`; params.push(linkedTeacherId);
      } else if (table === 'teachers') { query += ` WHERE id = $1`; params.push(linkedTeacherId); }
      else if (table === 'timetable') { query += ` WHERE teacher_id = $1`; params.push(linkedTeacherId); }
      else if (table === 'sections') { query += ` WHERE class_teacher_id = $1`; params.push(linkedTeacherId); }
      else if (table === 'notices') { }
      else return res.status(403).json({ error: 'Forbidden' });
    } else if (!['PARENT', 'ACCOUNTANT', 'LIBRARIAN'].includes(role)) return res.status(403).json({ error: 'Role unrecognized' });

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const canAccessRecord = async (table, recordId, user) => {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'TEACHER') {
    if (!['attendance_records', 'exam_results'].includes(table)) return false;
    
    const recordQuery = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [recordId]);
    if (recordQuery.rows.length === 0) return false;
    const studentId = recordQuery.rows[0].student_id;
    
    // For attendance, class teacher is enough
    if (table === 'attendance_records') {
      const checkQuery = `
        SELECT id FROM students 
        WHERE id = $1 AND section_id IN (SELECT id FROM sections WHERE class_teacher_id = $2)
      `;
      const check = await pool.query(checkQuery, [studentId, user.linkedTeacherId]);
      return check.rows.length > 0;
    }
    
    // For exam_results, check specific teaching assignment (subject/class/section)
    if (table === 'exam_results') {
      const subjectId = recordQuery.rows[0].subject_id;
      const studentQuery = await pool.query(`SELECT class_id, section_id FROM students WHERE id = $1`, [studentId]);
      if (studentQuery.rows.length === 0) return false;
      
      const teachingQuery = await pool.query(`
        SELECT 1 FROM teaching_assignments 
        WHERE teacher_id = $1 AND class_id = $2 AND section_id = $3 AND subject_id = $4
      `, [user.linkedTeacherId, studentQuery.rows[0].class_id, studentQuery.rows[0].section_id, subjectId]);
      
      return teachingQuery.rows.length > 0;
    }
  }
  if (user.role === 'ACCOUNTANT' && ['payments', 'fee_structures'].includes(table)) return true;
  if (user.role === 'LIBRARIAN' && ['books', 'book_issues'].includes(table)) return true;
  return false;
};

// Generic POST
app.post('/api/:table', requireAuth, async (req, res) => {
  try {
    const table = sanitizeTable(req.params.table);
    const user = req.user;
    
    // Auth Check for Creation
    if (user.role === 'STUDENT') return res.status(403).json({ error: 'Forbidden' });
    
    if (user.role === 'TEACHER') {
      if (!['attendance_records', 'exam_results'].includes(table)) return res.status(403).json({ error: 'Forbidden' });
      if (!req.body.student_id) return res.status(403).json({ error: 'student_id required' });
      
      const check = await pool.query(`SELECT id FROM students WHERE id = $1 AND section_id IN (SELECT id FROM sections WHERE class_teacher_id = $2)`, [req.body.student_id, user.linkedTeacherId]);
      if (check.rows.length === 0) return res.status(403).json({ error: 'Forbidden: Cannot create record for unassigned student' });
    } else if (user.role !== 'ADMIN' && !(user.role === 'ACCOUNTANT' && ['payments', 'fee_structures'].includes(table)) && !(user.role === 'LIBRARIAN' && ['books', 'book_issues'].includes(table))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const keys = Object.keys(req.body).filter(k => k !== 'id'); 
    const values = keys.map(k => req.body[k]);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generic PUT
app.put('/api/:table/:id', requireAuth, async (req, res) => {
  try {
    const table = sanitizeTable(req.params.table);
    const id = req.params.id;
    const user = req.user;
    
    if (!(await canAccessRecord(table, id, user))) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions to modify record' });
    }
    
    const keys = Object.keys(req.body);
    
    // Prevent unauthorized reassignment of protected fields
    if (user.role === 'TEACHER') {
      if (keys.includes('student_id') || keys.includes('class_id') || keys.includes('section_id') || keys.includes('subject_id')) {
        return res.status(403).json({ error: 'Forbidden: Cannot reassign ownership fields' });
      }
    }
    
    const values = keys.map(k => req.body[k]);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    values.push(id);
    
    const query = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generic DELETE
app.delete('/api/:table/:id', requireAuth, async (req, res) => {
  try {
    const table = sanitizeTable(req.params.table);
    const id = req.params.id;
    
    if (!(await canAccessRecord(table, id, req.user))) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions to delete record' });
    }
    
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
