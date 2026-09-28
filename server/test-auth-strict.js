const { Pool } = require('pg');
require('dotenv').config();

async function runTests() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:Udayhack@localhost:5432/School_Managment_System' });
  
  const login = async (role) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  };

  const request = async (method, table, token, body = null, id = '') => {
    const options = {
      method,
      headers: { 'Authorization': `Bearer ${token}` }
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const url = `http://localhost:5000/api/${table}${id ? `/${id}` : ''}`;
    const res = await fetch(url, options);
    return { status: res.status, data: await res.json().catch(() => null) };
  };

  console.log("=== STRICT RBAC TESTS ===");

  const teacher = await login('TEACHER');
  const student = await login('STUDENT');
  
  // Create isolated test data
  const testIds = {
    myStudent: 'test-std-mine',
    otherStudent: 'test-std-other',
    myAtt: 'test-att-mine',
    otherAtt: 'test-att-other',
    myRes: 'test-res-mine',
    otherRes: 'test-res-other',
    myClass: 'test-cls',
    mySec: 'test-sec',
    mySub: 'test-sub',
    otherSub: 'test-sub-other'
  };

  try {
    console.log("Setting up test records...");
    
    // Setup sections and students
    await pool.query(`INSERT INTO classes (id, name, numeric_grade) VALUES ($1, 'Test Class', 1) ON CONFLICT DO NOTHING`, [testIds.myClass]);
    await pool.query(`INSERT INTO sections (id, class_id, class_name, name, class_teacher_id) VALUES ($1, $2, 'Test Class', 'A', $3) ON CONFLICT DO NOTHING`, [testIds.mySec, testIds.myClass, teacher.linkedTeacherId]);
    await pool.query(`INSERT INTO sections (id, class_id, class_name, name, class_teacher_id) VALUES ('sec-unknown', $1, 'Test Class', 'B', 'tch-999') ON CONFLICT DO NOTHING`, [testIds.myClass]);
    
    // Students
    await pool.query(`INSERT INTO students (id, admission_no, first_name, last_name, full_name, dob, class_id, section_id) VALUES ($1, 'A1', 'My', 'Student', 'My Student', '2010-01-01', $2, $3) ON CONFLICT DO NOTHING`, [testIds.myStudent, testIds.myClass, testIds.mySec]);
    await pool.query(`INSERT INTO students (id, admission_no, first_name, last_name, full_name, dob, class_id, section_id) VALUES ($1, 'A2', 'Other', 'Student', 'Other Student', '2010-01-01', $2, 'sec-unknown') ON CONFLICT DO NOTHING`, [testIds.otherStudent, testIds.myClass]);
    
    
    // Teaching assignment for mySub
    await pool.query(`INSERT INTO teaching_assignments (id, teacher_id, class_id, section_id, subject_id) VALUES ('test-ta-1', $1, $2, $3, $4) ON CONFLICT DO NOTHING`, [teacher.linkedTeacherId, testIds.myClass, testIds.mySec, testIds.mySub]);
    
    // Attendance
    await pool.query(`INSERT INTO attendance_records (id, student_id, student_name, date, status) VALUES ($1, $3, 'A', '2023-01-01', 'Present'), ($2, $4, 'B', '2023-01-01', 'Present') ON CONFLICT DO NOTHING`, [testIds.myAtt, testIds.otherAtt, testIds.myStudent, testIds.otherStudent]);
    
    // Subjects
    await pool.query(`INSERT INTO subjects (id, name, code) VALUES ($1, 'Test Sub', 'TS1'), ($2, 'Other Sub', 'TS2') ON CONFLICT DO NOTHING`, [testIds.mySub, testIds.otherSub]);

    // Results (myRes uses mySub which teacher teaches, otherRes uses otherSub which teacher doesn't teach but for myStudent!)
    await pool.query(`INSERT INTO exam_results (id, student_id, subject_id, marks_obtained) VALUES ($1, $3, $4, 90), ($2, $3, $5, 80) ON CONFLICT DO NOTHING`, [testIds.myRes, testIds.otherRes, testIds.myStudent, testIds.mySub, testIds.otherSub]);

    // Test 1: Teacher unauthorized update (another student's attendance)
    const spoofPut = await request('PUT', 'attendance_records', teacher.token, { status: 'Absent' }, testIds.otherAtt);
    console.log('1. Teacher cannot modify unassigned student attendance:', spoofPut.status === 403 ? 'PASS' : 'FAIL', spoofPut.status);

    // Test 2: Teacher unauthorized delete
    const deleteUnassigned = await request('DELETE', 'attendance_records', teacher.token, null, testIds.otherAtt);
    console.log('2. Teacher cannot delete unassigned student attendance:', deleteUnassigned.status === 403 ? 'PASS' : 'FAIL', deleteUnassigned.status);

    // Test 3: Teacher grading unauthorized subject (even for assigned student)
    const gradeUnauth = await request('PUT', 'exam_results', teacher.token, { marks_obtained: 100 }, testIds.otherRes);
    console.log('3. Teacher cannot grade unauthorized subject:', gradeUnauth.status === 403 ? 'PASS' : 'FAIL', gradeUnauth.status);

    // Test 4: Teacher grading authorized subject
    const gradeAuth = await request('PUT', 'exam_results', teacher.token, { marks_obtained: 100 }, testIds.myRes);
    console.log('4. Teacher CAN grade authorized subject:', gradeAuth.status === 200 ? 'PASS' : 'FAIL', gradeAuth.status);

    // Test 5: Check data integrity (unauthorized left unchanged)
    const resCheck = await pool.query(`SELECT marks_obtained FROM exam_results WHERE id = $1`, [testIds.otherRes]);
    console.log('5. Rejected requests left data unchanged:', resCheck.rows[0].marks_obtained === 80 ? 'PASS' : 'FAIL');

    // Test 6: Student detail route protection
    // Since we don't have a GET /api/:table/:id route exactly, we can check if it exists or use PUT
    // Actually, I'll add a detail route to the server if needed, or test a PUT
    const studentPut = await request('PUT', 'students', student.token, { first_name: 'Hacked' }, testIds.otherStudent);
    console.log('6. Student cannot modify another student:', studentPut.status === 403 ? 'PASS' : 'FAIL', studentPut.status);

  } catch(e) {
    console.error("Test error:", e);
  } finally {
    console.log("Cleaning up test records...");
    await pool.query(`DELETE FROM exam_results WHERE id IN ($1, $2)`, [testIds.myRes, testIds.otherRes]);
    await pool.query(`DELETE FROM attendance_records WHERE id IN ($1, $2)`, [testIds.myAtt, testIds.otherAtt]);
    await pool.query(`DELETE FROM teaching_assignments WHERE id = 'test-ta-1'`);
    await pool.query(`DELETE FROM students WHERE id IN ($1, $2)`, [testIds.myStudent, testIds.otherStudent]);
    await pool.query(`DELETE FROM sections WHERE id = $1`, [testIds.mySec]);
    await pool.query(`DELETE FROM classes WHERE id = $1`, [testIds.myClass]);
    await pool.end();
  }
}

runTests().catch(console.error);
