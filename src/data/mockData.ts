import { 
  Student, 
  Teacher, 
  ClassEntity, 
  Section, 
  Subject, 
  AttendanceRecord, 
  TimetablePeriod, 
  Exam, 
  ExamSchedule, 
  ExamResult, 
  FeeType, 
  FeeStructure, 
  Payment, 
  Book, 
  BookIssue, 
  Vehicle, 
  Driver, 
  Route, 
  StudentTransport, 
  Notice, 
  Event, 
  AppUser,
  Department
} from '../types';

export const mockDepartments: Department[] = [
  { id: 'dept-1', name: 'Mathematics', code: 'MATH', head_of_department: 'Dr. Robert Vance', teacher_count: 4 },
  { id: 'dept-2', name: 'Science & Physics', code: 'SCI', head_of_department: 'Dr. Eleanor Vance', teacher_count: 5 },
  { id: 'dept-3', name: 'English Literature', code: 'ENG', head_of_department: 'Prof. Mark Taylor', teacher_count: 3 },
  { id: 'dept-4', name: 'Social Studies & History', code: 'SOC', head_of_department: 'Mrs. Sarah Jenkins', teacher_count: 3 },
  { id: 'dept-5', name: 'Computer Science', code: 'CS', head_of_department: 'Mr. Alan Turing', teacher_count: 3 },
  { id: 'dept-6', name: 'Physical Education', code: 'PE', head_of_department: 'Coach Marcus Sterling', teacher_count: 2 },
];

export const mockClasses: ClassEntity[] = [
  { id: 'cls-6', name: 'Class 6', numeric_grade: 6, capacity: 60, total_students: 8, sections_count: 2 },
  { id: 'cls-7', name: 'Class 7', numeric_grade: 7, capacity: 60, total_students: 7, sections_count: 2 },
  { id: 'cls-8', name: 'Class 8', numeric_grade: 8, capacity: 60, total_students: 7, sections_count: 2 },
  { id: 'cls-9', name: 'Class 9', numeric_grade: 9, capacity: 60, total_students: 7, sections_count: 2 },
  { id: 'cls-10', name: 'Class 10', numeric_grade: 10, capacity: 60, total_students: 8, sections_count: 2 },
  { id: 'cls-11', name: 'Class 11', numeric_grade: 11, capacity: 60, total_students: 7, sections_count: 2 },
  { id: 'cls-12', name: 'Class 12', numeric_grade: 12, capacity: 60, total_students: 6, sections_count: 2 },
];

export const mockSections: Section[] = [
  { id: 'sec-6a', class_id: 'cls-6', class_name: 'Class 6', name: 'A', class_teacher_id: 'tch-1', class_teacher_name: 'Dr. Robert Vance', capacity: 30, current_students: 4, room_number: '101' },
  { id: 'sec-6b', class_id: 'cls-6', class_name: 'Class 6', name: 'B', class_teacher_id: 'tch-2', class_teacher_name: 'Dr. Eleanor Vance', capacity: 30, current_students: 4, room_number: '102' },
  { id: 'sec-7a', class_id: 'cls-7', class_name: 'Class 7', name: 'A', class_teacher_id: 'tch-3', class_teacher_name: 'Prof. Mark Taylor', capacity: 30, current_students: 4, room_number: '103' },
  { id: 'sec-7b', class_id: 'cls-7', class_name: 'Class 7', name: 'B', class_teacher_id: 'tch-4', class_teacher_name: 'Mrs. Sarah Jenkins', capacity: 30, current_students: 3, room_number: '104' },
  { id: 'sec-8a', class_id: 'cls-8', class_name: 'Class 8', name: 'A', class_teacher_id: 'tch-5', class_teacher_name: 'Mr. Alan Turing', capacity: 30, current_students: 4, room_number: '201' },
  { id: 'sec-8b', class_id: 'cls-8', class_name: 'Class 8', name: 'B', class_teacher_id: 'tch-6', class_teacher_name: 'Coach Marcus Sterling', capacity: 30, current_students: 3, room_number: '202' },
  { id: 'sec-9a', class_id: 'cls-9', class_name: 'Class 9', name: 'A', class_teacher_id: 'tch-7', class_teacher_name: 'Ms. Clara Higgins', capacity: 30, current_students: 4, room_number: '203' },
  { id: 'sec-9b', class_id: 'cls-9', class_name: 'Class 9', name: 'B', class_teacher_id: 'tch-8', class_teacher_name: 'Mr. David Miller', capacity: 30, current_students: 3, room_number: '204' },
  { id: 'sec-10a', class_id: 'cls-10', class_name: 'Class 10', name: 'A', class_teacher_id: 'tch-9', class_teacher_name: 'Mrs. Hannah Abbott', capacity: 30, current_students: 4, room_number: '301' },
  { id: 'sec-10b', class_id: 'cls-10', class_name: 'Class 10', name: 'B', class_teacher_id: 'tch-10', class_teacher_name: 'Mr. George Harrison', capacity: 30, current_students: 4, room_number: '302' },
  { id: 'sec-11a', class_id: 'cls-11', class_name: 'Class 11', name: 'A', class_teacher_id: 'tch-11', class_teacher_name: 'Ms. Fiona Gallagher', capacity: 30, current_students: 4, room_number: '303' },
  { id: 'sec-11b', class_id: 'cls-11', class_name: 'Class 11', name: 'B', class_teacher_id: 'tch-12', class_teacher_name: 'Dr. Ian Wright', capacity: 30, current_students: 3, room_number: '304' },
  { id: 'sec-12a', class_id: 'cls-12', class_name: 'Class 12', name: 'A', class_teacher_id: 'tch-13', class_teacher_name: 'Mrs. Julia Roberts', capacity: 30, current_students: 3, room_number: '401' },
  { id: 'sec-12b', class_id: 'cls-12', class_name: 'Class 12', name: 'B', class_teacher_id: 'tch-14', class_teacher_name: 'Mr. Kevin Bacon', capacity: 30, current_students: 3, room_number: '402' },
];

export const mockTeachers: Teacher[] = [
  { id: 'tch-1', employee_no: 'EMP-T01', first_name: 'Robert', last_name: 'Vance', full_name: 'Dr. Robert Vance', gender: 'Male', department_id: 'dept-1', department_name: 'Mathematics', designation: 'Head Teacher', qualification: 'Ph.D. Mathematics', phone: '+1 555-0101', email: 'r.vance@school.edu', joining_date: '2018-08-15', status: 'Active', subjects_taught: ['Advanced Mathematics', 'Algebra'], assigned_classes: ['Class 10-A', 'Class 12-A'] },
  { id: 'tch-2', employee_no: 'EMP-T02', first_name: 'Eleanor', last_name: 'Vance', full_name: 'Dr. Eleanor Vance', gender: 'Female', department_id: 'dept-2', department_name: 'Science & Physics', designation: 'Senior Teacher', qualification: 'M.Sc. Physics', phone: '+1 555-0102', email: 'e.vance@school.edu', joining_date: '2019-01-10', status: 'Active', subjects_taught: ['Physics', 'Chemistry'], assigned_classes: ['Class 9-A', 'Class 10-B'] },
  { id: 'tch-3', employee_no: 'EMP-T03', first_name: 'Mark', last_name: 'Taylor', full_name: 'Prof. Mark Taylor', gender: 'Male', department_id: 'dept-3', department_name: 'English Literature', designation: 'Senior Lecturer', qualification: 'M.A. English', phone: '+1 555-0103', email: 'm.taylor@school.edu', joining_date: '2017-09-01', status: 'Active', subjects_taught: ['English Literature', 'Grammar'], assigned_classes: ['Class 7-A', 'Class 11-A'] },
  { id: 'tch-4', employee_no: 'EMP-T04', first_name: 'Sarah', last_name: 'Jenkins', full_name: 'Mrs. Sarah Jenkins', gender: 'Female', department_id: 'dept-4', department_name: 'Social Studies & History', designation: 'Teacher', qualification: 'B.Ed, M.A. History', phone: '+1 555-0104', email: 's.jenkins@school.edu', joining_date: '2020-06-15', status: 'Active', subjects_taught: ['World History', 'Civics'], assigned_classes: ['Class 6-A', 'Class 8-A'] },
  { id: 'tch-5', employee_no: 'EMP-T05', first_name: 'Alan', last_name: 'Turing', full_name: 'Mr. Alan Turing', gender: 'Male', department_id: 'dept-5', department_name: 'Computer Science', designation: 'Head Teacher', qualification: 'M.S. Computer Science', phone: '+1 555-0105', email: 'a.turing@school.edu', joining_date: '2021-03-01', status: 'Active', subjects_taught: ['Computer Science', 'Python Programming'], assigned_classes: ['Class 10-A', 'Class 12-B'] },
  { id: 'tch-6', employee_no: 'EMP-T06', first_name: 'Marcus', last_name: 'Sterling', full_name: 'Coach Marcus Sterling', gender: 'Male', department_id: 'dept-6', department_name: 'Physical Education', designation: 'Sports Director', qualification: 'B.P.Ed', phone: '+1 555-0106', email: 'm.sterling@school.edu', joining_date: '2016-04-12', status: 'Active', subjects_taught: ['Physical Education', 'Sports & Athletics'], assigned_classes: ['Class 8-B', 'Class 11-B'] },
  { id: 'tch-7', employee_no: 'EMP-T07', first_name: 'Clara', last_name: 'Higgins', full_name: 'Ms. Clara Higgins', gender: 'Female', department_id: 'dept-2', department_name: 'Science & Physics', designation: 'Teacher', qualification: 'B.Sc. Biology', phone: '+1 555-0107', email: 'c.higgins@school.edu', joining_date: '2022-08-01', status: 'Active', subjects_taught: ['Biology', 'Environmental Science'], assigned_classes: ['Class 9-B'] },
  { id: 'tch-8', employee_no: 'EMP-T08', first_name: 'David', last_name: 'Miller', full_name: 'Mr. David Miller', gender: 'Male', department_id: 'dept-1', department_name: 'Mathematics', designation: 'Teacher', qualification: 'M.Sc. Mathematics', phone: '+1 555-0108', email: 'd.miller@school.edu', joining_date: '2021-11-15', status: 'Active', subjects_taught: ['Algebra', 'Geometry'], assigned_classes: ['Class 7-B'] },
  { id: 'tch-9', employee_no: 'EMP-T09', first_name: 'Hannah', last_name: 'Abbott', full_name: 'Mrs. Hannah Abbott', gender: 'Female', department_id: 'dept-3', department_name: 'English Literature', designation: 'Teacher', qualification: 'M.A. English', phone: '+1 555-0109', email: 'h.abbott@school.edu', joining_date: '2019-07-20', status: 'Active', subjects_taught: ['English Composition'], assigned_classes: ['Class 10-A'] },
  { id: 'tch-10', employee_no: 'EMP-T10', first_name: 'George', last_name: 'Harrison', full_name: 'Mr. George Harrison', gender: 'Male', department_id: 'dept-4', department_name: 'Social Studies & History', designation: 'Teacher', qualification: 'M.A. Geography', phone: '+1 555-0110', email: 'g.harrison@school.edu', joining_date: '2020-02-10', status: 'Active', subjects_taught: ['Geography', 'Economics'], assigned_classes: ['Class 10-B'] },
  { id: 'tch-11', employee_no: 'EMP-T11', first_name: 'Fiona', last_name: 'Gallagher', full_name: 'Ms. Fiona Gallagher', gender: 'Female', department_id: 'dept-5', department_name: 'Computer Science', designation: 'Assistant Teacher', qualification: 'B.Tech IT', phone: '+1 555-0111', email: 'f.gallagher@school.edu', joining_date: '2023-01-05', status: 'Active', subjects_taught: ['Web Development', 'ICT Skills'], assigned_classes: ['Class 11-A'] },
  { id: 'tch-12', employee_no: 'EMP-T12', first_name: 'Ian', last_name: 'Wright', full_name: 'Dr. Ian Wright', gender: 'Male', department_id: 'dept-2', department_name: 'Science & Physics', designation: 'Senior Lecturer', qualification: 'Ph.D. Chemistry', phone: '+1 555-0112', email: 'i.wright@school.edu', joining_date: '2015-08-10', status: 'Active', subjects_taught: ['Chemistry', 'Organic Chemistry'], assigned_classes: ['Class 11-B'] },
  { id: 'tch-13', employee_no: 'EMP-T13', first_name: 'Julia', last_name: 'Roberts', full_name: 'Mrs. Julia Roberts', gender: 'Female', department_id: 'dept-1', department_name: 'Mathematics', designation: 'Senior Teacher', qualification: 'M.Sc. Mathematics', phone: '+1 555-0113', email: 'j.roberts@school.edu', joining_date: '2017-03-25', status: 'Active', subjects_taught: ['Calculus', 'Statistics'], assigned_classes: ['Class 12-A'] },
  { id: 'tch-14', employee_no: 'EMP-T14', first_name: 'Kevin', last_name: 'Bacon', full_name: 'Mr. Kevin Bacon', gender: 'Male', department_id: 'dept-6', department_name: 'Physical Education', designation: 'Instructor', qualification: 'B.Ed Physical Ed', phone: '+1 555-0114', email: 'k.bacon@school.edu', joining_date: '2022-04-18', status: 'Active', subjects_taught: ['Physical Fitness', 'Yoga'], assigned_classes: ['Class 12-B'] },
  { id: 'tch-15', employee_no: 'EMP-T15', first_name: 'Laura', last_name: 'Palmer', full_name: 'Ms. Laura Palmer', gender: 'Female', department_id: 'dept-3', department_name: 'English Literature', designation: 'Teacher', qualification: 'B.A. English', phone: '+1 555-0115', email: 'l.palmer@school.edu', joining_date: '2023-06-01', status: 'Active', subjects_taught: ['Creative Writing'], assigned_classes: ['Class 6-B'] },
  { id: 'tch-16', employee_no: 'EMP-T16', first_name: 'Nathan', last_name: 'Drake', full_name: 'Mr. Nathan Drake', gender: 'Male', department_id: 'dept-4', department_name: 'Social Studies & History', designation: 'Teacher', qualification: 'M.A. Archeology', phone: '+1 555-0116', email: 'n.drake@school.edu', joining_date: '2021-09-12', status: 'Active', subjects_taught: ['World History'], assigned_classes: ['Class 9-A'] },
  { id: 'tch-17', employee_no: 'EMP-T17', first_name: 'Olivia', last_name: 'Benson', full_name: 'Mrs. Olivia Benson', gender: 'Female', department_id: 'dept-5', department_name: 'Computer Science', designation: 'Teacher', qualification: 'M.C.A.', phone: '+1 555-0117', email: 'o.benson@school.edu', joining_date: '2020-10-05', status: 'On Leave', subjects_taught: ['Data Structures'], assigned_classes: ['Class 11-A'] },
  { id: 'tch-18', employee_no: 'EMP-T18', first_name: 'Peter', last_name: 'Parker', full_name: 'Mr. Peter Parker', gender: 'Male', department_id: 'dept-2', department_name: 'Science & Physics', designation: 'Assistant Teacher', qualification: 'B.Sc. Physics', phone: '+1 555-0118', email: 'p.parker@school.edu', joining_date: '2023-08-15', status: 'Active', subjects_taught: ['Physics Lab'], assigned_classes: ['Class 10-A'] },
  { id: 'tch-19', employee_no: 'EMP-T19', first_name: 'Quinn', last_name: 'Fabray', full_name: 'Ms. Quinn Fabray', gender: 'Female', department_id: 'dept-6', department_name: 'Physical Education', designation: 'Dance & Music Teacher', qualification: 'B.A. Music', phone: '+1 555-0119', email: 'q.fabray@school.edu', joining_date: '2022-09-01', status: 'Active', subjects_taught: ['Arts & Music'], assigned_classes: ['Class 6-A', 'Class 7-A'] },
  { id: 'tch-20', employee_no: 'EMP-T20', first_name: 'Rachel', last_name: 'Green', full_name: 'Mrs. Rachel Green', gender: 'Female', department_id: 'dept-3', department_name: 'English Literature', designation: 'Teacher', qualification: 'M.A. Communications', phone: '+1 555-0120', email: 'r.green@school.edu', joining_date: '2019-11-20', status: 'Inactive', subjects_taught: ['Public Speaking'], assigned_classes: [] }
];

export const mockSubjects: Subject[] = [
  { id: 'sub-1', code: 'MATH-101', name: 'Mathematics', type: 'Theory', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'], assigned_teachers: ['Dr. Robert Vance', 'Mr. David Miller'] },
  { id: 'sub-2', code: 'PHY-101', name: 'Physics', type: 'Both', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'], assigned_teachers: ['Dr. Eleanor Vance', 'Mr. Peter Parker'] },
  { id: 'sub-3', code: 'CHEM-101', name: 'Chemistry', type: 'Both', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'], assigned_teachers: ['Dr. Ian Wright'] },
  { id: 'sub-4', code: 'BIO-101', name: 'Biology', type: 'Both', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'], assigned_teachers: ['Ms. Clara Higgins'] },
  { id: 'sub-5', code: 'ENG-101', name: 'English Literature', type: 'Theory', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'], assigned_teachers: ['Prof. Mark Taylor', 'Mrs. Hannah Abbott'] },
  { id: 'sub-6', code: 'HIST-101', name: 'World History', type: 'Theory', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9'], assigned_teachers: ['Mrs. Sarah Jenkins', 'Mr. Nathan Drake'] },
  { id: 'sub-7', code: 'GEO-101', name: 'Geography', type: 'Theory', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 6', 'Class 7', 'Class 8', 'Class 10'], assigned_teachers: ['Mr. George Harrison'] },
  { id: 'sub-8', code: 'CS-101', name: 'Computer Science', type: 'Both', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'], assigned_teachers: ['Mr. Alan Turing', 'Ms. Fiona Gallagher'] },
  { id: 'sub-9', code: 'CIV-101', name: 'Civics & Governance', type: 'Theory', max_marks: 50, pass_marks: 18, assigned_classes: ['Class 6', 'Class 7', 'Class 8'], assigned_teachers: ['Mrs. Sarah Jenkins'] },
  { id: 'sub-10', code: 'ECO-101', name: 'Economics', type: 'Theory', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 10', 'Class 11', 'Class 12'], assigned_teachers: ['Mr. George Harrison'] },
  { id: 'sub-11', code: 'PE-101', name: 'Physical Education', type: 'Practical', max_marks: 50, pass_marks: 18, assigned_classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'], assigned_teachers: ['Coach Marcus Sterling', 'Mr. Kevin Bacon'] },
  { id: 'sub-12', code: 'ART-101', name: 'Arts & Music', type: 'Practical', max_marks: 50, pass_marks: 18, assigned_classes: ['Class 6', 'Class 7'], assigned_teachers: ['Ms. Quinn Fabray'] },
  { id: 'sub-13', code: 'ALG-201', name: 'Advanced Algebra', type: 'Theory', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 11', 'Class 12'], assigned_teachers: ['Dr. Robert Vance'] },
  { id: 'sub-14', code: 'CALC-201', name: 'Calculus & Vectors', type: 'Theory', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 12'], assigned_teachers: ['Mrs. Julia Roberts'] },
  { id: 'sub-15', code: 'EV-101', name: 'Environmental Science', type: 'Theory', max_marks: 50, pass_marks: 18, assigned_classes: ['Class 6', 'Class 7', 'Class 8'], assigned_teachers: ['Ms. Clara Higgins'] },
  { id: 'sub-16', code: 'WEB-201', name: 'Web Development', type: 'Practical', max_marks: 100, pass_marks: 35, assigned_classes: ['Class 11', 'Class 12'], assigned_teachers: ['Ms. Fiona Gallagher'] },
  { id: 'sub-17', code: 'CW-101', name: 'Creative Writing', type: 'Theory', max_marks: 50, pass_marks: 18, assigned_classes: ['Class 6', 'Class 7'], assigned_teachers: ['Ms. Laura Palmer'] }
];

// Generate 50 Realistic Students
const firstNames = [
  'Alexander', 'Beatrix', 'Charlie', 'Diana', 'Ethan', 'Freya', 'Gabriel', 'Hannah', 
  'Isaac', 'Jasmine', 'Kevin', 'Lily', 'Mason', 'Nora', 'Oliver', 'Penelope', 
  'Quentin', 'Rose', 'Samuel', 'Tara', 'Ulysses', 'Victoria', 'William', 'Ximena', 
  'Yusuf', 'Zoe', 'Aiden', 'Bella', 'Caleb', 'Daisy', 'Eli', 'Faith', 'Gavin', 
  'Hazel', 'Ian', 'Julia', 'Kai', 'Luna', 'Miles', 'Nina', 'Owen', 'Piper', 
  'Riley', 'Sophia', 'Tristan', 'Uma', 'Victor', 'Willa', 'Xavier', 'Yara'
];

const lastNames = [
  'Anderson', 'Baker', 'Carter', 'Davis', 'Evans', 'Foster', 'Graham', 'Hayes', 
  'Ibrahim', 'Jackson', 'King', 'Lopez', 'Morgan', 'Nelson', 'O\'Connor', 'Patel', 
  'Quinn', 'Reed', 'Smith', 'Taylor', 'Underwood', 'Vargas', 'Walker', 'Xavier', 
  'Young', 'Zhang', 'Abbott', 'Bennett', 'Cooper', 'Dixon', 'Edwards', 'Fisher', 
  'Gibson', 'Howard', 'Ingram', 'Jones', 'Kelly', 'Lewis', 'Marshall', 'Newman', 
  'Owens', 'Perez', 'Richards', 'Stewart', 'Turner', 'Vance', 'White', 'Yates'
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const classAssignments = [
  { class_id: 'cls-6', class_name: 'Class 6', section_id: 'sec-6a', section_name: 'A' },
  { class_id: 'cls-6', class_name: 'Class 6', section_id: 'sec-6b', section_name: 'B' },
  { class_id: 'cls-7', class_name: 'Class 7', section_id: 'sec-7a', section_name: 'A' },
  { class_id: 'cls-7', class_name: 'Class 7', section_id: 'sec-7b', section_name: 'B' },
  { class_id: 'cls-8', class_name: 'Class 8', section_id: 'sec-8a', section_name: 'A' },
  { class_id: 'cls-8', class_name: 'Class 8', section_id: 'sec-8b', section_name: 'B' },
  { class_id: 'cls-9', class_name: 'Class 9', section_id: 'sec-9a', section_name: 'A' },
  { class_id: 'cls-9', class_name: 'Class 9', section_id: 'sec-9b', section_name: 'B' },
  { class_id: 'cls-10', class_name: 'Class 10', section_id: 'sec-10a', section_name: 'A' },
  { class_id: 'cls-10', class_name: 'Class 10', section_id: 'sec-10b', section_name: 'B' },
  { class_id: 'cls-11', class_name: 'Class 11', section_id: 'sec-11a', section_name: 'A' },
  { class_id: 'cls-11', class_name: 'Class 11', section_id: 'sec-11b', section_name: 'B' },
  { class_id: 'cls-12', class_name: 'Class 12', section_id: 'sec-12a', section_name: 'A' },
  { class_id: 'cls-12', class_name: 'Class 12', section_id: 'sec-12b', section_name: 'B' },
];

const sectionCounts: Record<string, number> = {};

export const mockStudents: Student[] = Array.from({ length: 50 }).map((_, index) => {
  const fName = firstNames[index % firstNames.length];
  const lName = lastNames[index % lastNames.length];
  const gender = index % 2 === 0 ? 'Male' : 'Female';
  const clsAss = classAssignments[index % classAssignments.length];
  
  const sectionKey = `${clsAss.class_id}-${clsAss.section_id}`;
  if (!sectionCounts[sectionKey]) sectionCounts[sectionKey] = 0;
  sectionCounts[sectionKey]++;
  
  const rollNo = `${sectionCounts[sectionKey]}`;
  const admNo = `ADM-2024-${String(index + 1).padStart(3, '0')}`;
  
  const lowAttendanceIndices = [4, 12, 23, 37, 44];
  const isLowAttendance = lowAttendanceIndices.includes(index);
  const attendance_percentage = isLowAttendance ? Math.floor(58 + (index * 3) % 15) : Math.floor(82 + (index * 5) % 18);
  
  const feeStatusOptions: ('Paid' | 'Pending' | 'Overdue')[] = ['Paid', 'Paid', 'Pending', 'Overdue', 'Paid'];
  const fee_status = feeStatusOptions[index % feeStatusOptions.length];

  return {
    id: `std-${index + 1}`,
    admission_no: admNo,
    first_name: fName,
    last_name: lName,
    full_name: `${fName} ${lName}`,
    gender,
    dob: `201${(index % 5) + 0}-0${(index % 8) + 1}-15`,
    blood_group: bloodGroups[index % bloodGroups.length],
    phone: `+1 555-02${String(index + 10).padStart(2, '0')}`,
    email: `${fName.toLowerCase()}.${lName.toLowerCase()}@student.school.edu`,
    address: `${100 + index} Oakwood Avenue, Suite ${(index % 12) + 1}, Metro City`,
    class_id: clsAss.class_id,
    class_name: clsAss.class_name,
    section_id: clsAss.section_id,
    section_name: clsAss.section_name,
    roll_no: rollNo,
    academic_year: '2025-2026',
    admission_date: '2024-08-01',
    status: index === 48 ? 'Inactive' : 'Active',
    attendance_percentage,
    fee_status,
    guardian: {
      id: `grd-${index + 1}`,
      name: `${lastNames[(index + 5) % lastNames.length]} ${lName}`,
      relationship: index % 3 === 0 ? 'Mother' : 'Father',
      phone: `+1 555-09${String(index + 10).padStart(2, '0')}`,
      email: `guardian.${lName.toLowerCase()}@gmail.com`,
      occupation: ['Software Engineer', 'Doctor', 'Business Owner', 'Architect', 'Teacher', 'Lawyer'][index % 6],
      address: `${100 + index} Oakwood Avenue, Suite ${(index % 12) + 1}, Metro City`,
    }
  };
});

// Realistic Attendance Data for Class 10-A
export const mockAttendanceRecords: AttendanceRecord[] = mockStudents
  .filter(s => s.class_name === 'Class 10' && s.section_name === 'A')
  .map((student, idx) => ({
    id: `att-${idx + 1}`,
    student_id: student.id,
    student_name: student.full_name,
    roll_no: student.roll_no,
    class_name: student.class_name,
    section_name: student.section_name,
    date: '2026-08-31',
    status: idx === 1 ? 'Absent' : idx === 2 ? 'Late' : idx === 3 ? 'Leave' : 'Present',
    remarks: idx === 1 ? 'Medical Illness' : idx === 2 ? 'Traffic Delay' : idx === 3 ? 'Family Event' : 'On Time'
  }));

// Weekly Timetable Grid Data
export const mockTimetable: TimetablePeriod[] = [
  // Monday
  { id: 'tt-1', class_id: 'cls-10', section_id: 'sec-10a', day: 'Monday', period_number: 1, start_time: '08:30 AM', end_time: '09:20 AM', subject_name: 'Mathematics', teacher_name: 'Dr. Robert Vance', room_number: '301' },
  { id: 'tt-2', class_id: 'cls-10', section_id: 'sec-10a', day: 'Monday', period_number: 2, start_time: '09:20 AM', end_time: '10:10 AM', subject_name: 'Physics', teacher_name: 'Dr. Eleanor Vance', room_number: '301' },
  { id: 'tt-3', class_id: 'cls-10', section_id: 'sec-10a', day: 'Monday', period_number: 3, start_time: '10:20 AM', end_time: '11:10 AM', subject_name: 'English Literature', teacher_name: 'Mrs. Hannah Abbott', room_number: '301' },
  { id: 'tt-4', class_id: 'cls-10', section_id: 'sec-10a', day: 'Monday', period_number: 4, start_time: '11:10 AM', end_time: '12:00 PM', subject_name: 'Chemistry', teacher_name: 'Dr. Ian Wright', room_number: 'Lab 2' },
  { id: 'tt-5', class_id: 'cls-10', section_id: 'sec-10a', day: 'Monday', period_number: 5, start_time: '12:40 PM', end_time: '01:30 PM', subject_name: 'Computer Science', teacher_name: 'Mr. Alan Turing', room_number: 'CS Lab 1' },
  { id: 'tt-6', class_id: 'cls-10', section_id: 'sec-10a', day: 'Monday', period_number: 6, start_time: '01:30 PM', end_time: '02:20 PM', subject_name: 'World History', teacher_name: 'Mr. Nathan Drake', room_number: '301' },
  { id: 'tt-7', class_id: 'cls-10', section_id: 'sec-10a', day: 'Monday', period_number: 7, start_time: '02:20 PM', end_time: '03:10 PM', subject_name: 'Physical Education', teacher_name: 'Coach Marcus Sterling', room_number: 'Ground' },

  // Tuesday
  { id: 'tt-8', class_id: 'cls-10', section_id: 'sec-10a', day: 'Tuesday', period_number: 1, start_time: '08:30 AM', end_time: '09:20 AM', subject_name: 'English Literature', teacher_name: 'Mrs. Hannah Abbott', room_number: '301' },
  { id: 'tt-9', class_id: 'cls-10', section_id: 'sec-10a', day: 'Tuesday', period_number: 2, start_time: '09:20 AM', end_time: '10:10 AM', subject_name: 'Mathematics', teacher_name: 'Dr. Robert Vance', room_number: '301' },
  { id: 'tt-10', class_id: 'cls-10', section_id: 'sec-10a', day: 'Tuesday', period_number: 3, start_time: '10:20 AM', end_time: '11:10 AM', subject_name: 'Biology', teacher_name: 'Ms. Clara Higgins', room_number: '301' },
  { id: 'tt-11', class_id: 'cls-10', section_id: 'sec-10a', day: 'Tuesday', period_number: 4, start_time: '11:10 AM', end_time: '12:00 PM', subject_name: 'Computer Science', teacher_name: 'Mr. Alan Turing', room_number: 'CS Lab 1' },
  { id: 'tt-12', class_id: 'cls-10', section_id: 'sec-10a', day: 'Tuesday', period_number: 5, start_time: '12:40 PM', end_time: '01:30 PM', subject_name: 'Physics Lab', teacher_name: 'Mr. Peter Parker', room_number: 'Physics Lab' },
  { id: 'tt-13', class_id: 'cls-10', section_id: 'sec-10a', day: 'Tuesday', period_number: 6, start_time: '01:30 PM', end_time: '02:20 PM', subject_name: 'Geography', teacher_name: 'Mr. George Harrison', room_number: '301' },
  { id: 'tt-14', class_id: 'cls-10', section_id: 'sec-10a', day: 'Tuesday', period_number: 7, start_time: '02:20 PM', end_time: '03:10 PM', subject_name: 'Library & Reading', teacher_name: 'Mrs. Hannah Abbott', room_number: 'Library' },

  // Wednesday
  { id: 'tt-15', class_id: 'cls-10', section_id: 'sec-10a', day: 'Wednesday', period_number: 1, start_time: '08:30 AM', end_time: '09:20 AM', subject_name: 'Physics', teacher_name: 'Dr. Eleanor Vance', room_number: '301' },
  { id: 'tt-16', class_id: 'cls-10', section_id: 'sec-10a', day: 'Wednesday', period_number: 2, start_time: '09:20 AM', end_time: '10:10 AM', subject_name: 'Mathematics', teacher_name: 'Dr. Robert Vance', room_number: '301' },
  { id: 'tt-17', class_id: 'cls-10', section_id: 'sec-10a', day: 'Wednesday', period_number: 3, start_time: '10:20 AM', end_time: '11:10 AM', subject_name: 'Chemistry', teacher_name: 'Dr. Ian Wright', room_number: '301' },
  { id: 'tt-18', class_id: 'cls-10', section_id: 'sec-10a', day: 'Wednesday', period_number: 4, start_time: '11:10 AM', end_time: '12:00 PM', subject_name: 'Economics', teacher_name: 'Mr. George Harrison', room_number: '301' },
  { id: 'tt-19', class_id: 'cls-10', section_id: 'sec-10a', day: 'Wednesday', period_number: 5, start_time: '12:40 PM', end_time: '01:30 PM', subject_name: 'English Literature', teacher_name: 'Mrs. Hannah Abbott', room_number: '301' },
  { id: 'tt-20', class_id: 'cls-10', section_id: 'sec-10a', day: 'Wednesday', period_number: 6, start_time: '01:30 PM', end_time: '02:20 PM', subject_name: 'Physical Education', teacher_name: 'Coach Marcus Sterling', room_number: 'Ground' },
  { id: 'tt-21', class_id: 'cls-10', section_id: 'sec-10a', day: 'Wednesday', period_number: 7, start_time: '02:20 PM', end_time: '03:10 PM', subject_name: 'Club Activities', teacher_name: 'Ms. Quinn Fabray', room_number: 'Auditorium' },

  // Thursday
  { id: 'tt-22', class_id: 'cls-10', section_id: 'sec-10a', day: 'Thursday', period_number: 1, start_time: '08:30 AM', end_time: '09:20 AM', subject_name: 'Mathematics', teacher_name: 'Dr. Robert Vance', room_number: '301' },
  { id: 'tt-23', class_id: 'cls-10', section_id: 'sec-10a', day: 'Thursday', period_number: 2, start_time: '09:20 AM', end_time: '10:10 AM', subject_name: 'Computer Science', teacher_name: 'Mr. Alan Turing', room_number: 'CS Lab 1' },
  { id: 'tt-24', class_id: 'cls-10', section_id: 'sec-10a', day: 'Thursday', period_number: 3, start_time: '10:20 AM', end_time: '11:10 AM', subject_name: 'Biology Lab', teacher_name: 'Ms. Clara Higgins', room_number: 'Bio Lab' },
  { id: 'tt-25', class_id: 'cls-10', section_id: 'sec-10a', day: 'Thursday', period_number: 4, start_time: '11:10 AM', end_time: '12:00 PM', subject_name: 'World History', teacher_name: 'Mr. Nathan Drake', room_number: '301' },
  { id: 'tt-26', class_id: 'cls-10', section_id: 'sec-10a', day: 'Thursday', period_number: 5, start_time: '12:40 PM', end_time: '01:30 PM', subject_name: 'English Literature', teacher_name: 'Mrs. Hannah Abbott', room_number: '301' },
  { id: 'tt-27', class_id: 'cls-10', section_id: 'sec-10a', day: 'Thursday', period_number: 6, start_time: '01:30 PM', end_time: '02:20 PM', subject_name: 'Physics', teacher_name: 'Dr. Eleanor Vance', room_number: '301' },
  { id: 'tt-28', class_id: 'cls-10', section_id: 'sec-10a', day: 'Thursday', period_number: 7, start_time: '02:20 PM', end_time: '03:10 PM', subject_name: 'Value Education', teacher_name: 'Mrs. Sarah Jenkins', room_number: '301' },

  // Friday
  { id: 'tt-29', class_id: 'cls-10', section_id: 'sec-10a', day: 'Friday', period_number: 1, start_time: '08:30 AM', end_time: '09:20 AM', subject_name: 'Chemistry Lab', teacher_name: 'Dr. Ian Wright', room_number: 'Chem Lab' },
  { id: 'tt-30', class_id: 'cls-10', section_id: 'sec-10a', day: 'Friday', period_number: 2, start_time: '09:20 AM', end_time: '10:10 AM', subject_name: 'Mathematics', teacher_name: 'Dr. Robert Vance', room_number: '301' },
  { id: 'tt-31', class_id: 'cls-10', section_id: 'sec-10a', day: 'Friday', period_number: 3, start_time: '10:20 AM', end_time: '11:10 AM', subject_name: 'Geography', teacher_name: 'Mr. George Harrison', room_number: '301' },
  { id: 'tt-32', class_id: 'cls-10', section_id: 'sec-10a', day: 'Friday', period_number: 4, start_time: '11:10 AM', end_time: '12:00 PM', subject_name: 'English Literature', teacher_name: 'Mrs. Hannah Abbott', room_number: '301' },
  { id: 'tt-33', class_id: 'cls-10', section_id: 'sec-10a', day: 'Friday', period_number: 5, start_time: '12:40 PM', end_time: '01:30 PM', subject_name: 'Economics', teacher_name: 'Mr. George Harrison', room_number: '301' },
  { id: 'tt-34', class_id: 'cls-10', section_id: 'sec-10a', day: 'Friday', period_number: 6, start_time: '01:30 PM', end_time: '02:20 PM', subject_name: 'Computer Science', teacher_name: 'Mr. Alan Turing', room_number: 'CS Lab 1' },
  { id: 'tt-35', class_id: 'cls-10', section_id: 'sec-10a', day: 'Friday', period_number: 7, start_time: '02:20 PM', end_time: '03:10 PM', subject_name: 'Sports & Games', teacher_name: 'Coach Marcus Sterling', room_number: 'Ground' },

  // Saturday
  { id: 'tt-36', class_id: 'cls-10', section_id: 'sec-10a', day: 'Saturday', period_number: 1, start_time: '08:30 AM', end_time: '09:20 AM', subject_name: 'Weekly Quiz & Test', teacher_name: 'Dr. Robert Vance', room_number: '301' },
  { id: 'tt-37', class_id: 'cls-10', section_id: 'sec-10a', day: 'Saturday', period_number: 2, start_time: '09:20 AM', end_time: '10:10 AM', subject_name: 'Arts & Creative Writing', teacher_name: 'Ms. Laura Palmer', room_number: 'Art Room' },
  { id: 'tt-38', class_id: 'cls-10', section_id: 'sec-10a', day: 'Saturday', period_number: 3, start_time: '10:20 AM', end_time: '11:10 AM', subject_name: 'Moral Science', teacher_name: 'Mrs. Sarah Jenkins', room_number: '301' },
  { id: 'tt-39', class_id: 'cls-10', section_id: 'sec-10a', day: 'Saturday', period_number: 4, start_time: '11:10 AM', end_time: '12:00 PM', subject_name: 'Counseling & Mentorship', teacher_name: 'Mrs. Hannah Abbott', room_number: '301' },
];

export const mockExams: Exam[] = [
  { id: 'ex-1', name: 'Unit Test 1', academic_year: '2025-2026', start_date: '2026-05-10', end_date: '2026-05-18', status: 'Completed', total_marks: 50 },
  { id: 'ex-2', name: 'Mid Term Examination', academic_year: '2025-2026', start_date: '2026-09-15', end_date: '2026-09-28', status: 'Upcoming', total_marks: 100 },
  { id: 'ex-3', name: 'Final Examination', academic_year: '2025-2026', start_date: '2027-03-01', end_date: '2027-03-20', status: 'Upcoming', total_marks: 100 },
];

export const mockExamSchedules: ExamSchedule[] = [
  { id: 'exs-1', exam_id: 'ex-2', subject_name: 'Mathematics', class_name: 'Class 10', date: '2026-09-15', start_time: '09:00 AM', end_time: '12:00 PM', room_number: 'Hall A', max_marks: 100, pass_marks: 35 },
  { id: 'exs-2', exam_id: 'ex-2', subject_name: 'Physics', class_name: 'Class 10', date: '2026-09-17', start_time: '09:00 AM', end_time: '12:00 PM', room_number: 'Hall A', max_marks: 100, pass_marks: 35 },
  { id: 'exs-3', exam_id: 'ex-2', subject_name: 'Chemistry', class_name: 'Class 10', date: '2026-09-19', start_time: '09:00 AM', end_time: '12:00 PM', room_number: 'Hall B', max_marks: 100, pass_marks: 35 },
  { id: 'exs-4', exam_id: 'ex-2', subject_name: 'English Literature', class_name: 'Class 10', date: '2026-09-22', start_time: '09:00 AM', end_time: '12:00 PM', room_number: 'Hall A', max_marks: 100, pass_marks: 35 },
  { id: 'exs-5', exam_id: 'ex-2', subject_name: 'Computer Science', class_name: 'Class 10', date: '2026-09-25', start_time: '09:00 AM', end_time: '12:00 PM', room_number: 'CS Lab 1', max_marks: 100, pass_marks: 35 },
];

export const mockExamResults: ExamResult[] = mockStudents
  .filter(s => s.class_name === 'Class 10' && s.section_name === 'A')
  .flatMap((student, stdIdx) => [
    {
      id: `res-${stdIdx + 1}-1`,
      exam_id: 'ex-1',
      exam_name: 'Unit Test 1',
      student_id: student.id,
      student_name: student.full_name,
      roll_no: student.roll_no,
      class_name: student.class_name,
      section_name: student.section_name,
      subject_id: 'sub-1',
      subject_name: 'Mathematics',
      marks_obtained: Math.floor(38 + (stdIdx * 3.5) % 12),
      max_marks: 50,
      grade: stdIdx === 3 ? 'C+' : 'A',
      status: 'Pass',
      remarks: 'Excellent logical reasoning'
    },
    {
      id: `res-${stdIdx + 1}-2`,
      exam_id: 'ex-1',
      exam_name: 'Unit Test 1',
      student_id: student.id,
      student_name: student.full_name,
      roll_no: student.roll_no,
      class_name: student.class_name,
      section_name: student.section_name,
      subject_id: 'sub-2',
      subject_name: 'Physics',
      marks_obtained: Math.floor(35 + (stdIdx * 4) % 14),
      max_marks: 50,
      grade: 'A',
      status: 'Pass',
      remarks: 'Strong grasp of concepts'
    },
    {
      id: `res-${stdIdx + 1}-3`,
      exam_id: 'ex-1',
      exam_name: 'Unit Test 1',
      student_id: student.id,
      student_name: student.full_name,
      roll_no: student.roll_no,
      class_name: student.class_name,
      section_name: student.section_name,
      subject_id: 'sub-5',
      subject_name: 'English Literature',
      marks_obtained: Math.floor(40 + (stdIdx * 2) % 10),
      max_marks: 50,
      grade: 'A+',
      status: 'Pass',
      remarks: 'Very expressive writing'
    }
  ]);

export const mockFeeTypes: FeeType[] = [
  { id: 'ft-1', name: 'Tuition Fee', code: 'TUIT', description: 'Quarterly academic tuition fee' },
  { id: 'ft-2', name: 'Transport Fee', code: 'TRAN', description: 'Monthly bus & transportation fee' },
  { id: 'ft-3', name: 'Library Fee', code: 'LIB', description: 'Annual book access and digital catalog fee' },
  { id: 'ft-4', name: 'Exam Fee', code: 'EXAM', description: 'Semester examination & paper processing' },
  { id: 'ft-5', name: 'Laboratory Fee', code: 'LAB', description: 'Science lab equipment and computer maintenance' },
];

export const mockFeeStructures: FeeStructure[] = [
  { id: 'fs-1', class_name: 'Class 10', academic_year: '2025-2026', fee_type_name: 'Tuition Fee', amount: 1200, due_date: '2026-09-10' },
  { id: 'fs-2', class_name: 'Class 10', academic_year: '2025-2026', fee_type_name: 'Laboratory Fee', amount: 350, due_date: '2026-09-10' },
  { id: 'fs-3', class_name: 'Class 10', academic_year: '2025-2026', fee_type_name: 'Exam Fee', amount: 200, due_date: '2026-09-15' },
  { id: 'fs-4', class_name: 'Class 10', academic_year: '2025-2026', fee_type_name: 'Library Fee', amount: 150, due_date: '2026-09-30' },
  { id: 'fs-5', class_name: 'Class 12', academic_year: '2025-2026', fee_type_name: 'Tuition Fee', amount: 1500, due_date: '2026-09-10' },
];

export const mockPayments: Payment[] = [
  { id: 'pay-1', receipt_no: 'REC-2026-001', student_id: 'std-1', student_name: 'Alexander Anderson', class_name: 'Class 6', section_name: 'A', roll_no: '1', fee_type: 'Tuition Fee', amount: 1200, payment_date: '2026-08-15', payment_method: 'UPI', transaction_id: 'UPI9834298103', status: 'Paid', received_by: 'Accountant Mark' },
  { id: 'pay-2', receipt_no: 'REC-2026-002', student_id: 'std-2', student_name: 'Beatrix Baker', class_name: 'Class 6', section_name: 'B', roll_no: '2', fee_type: 'Tuition Fee', amount: 1200, payment_date: '2026-08-18', payment_method: 'Card', transaction_id: 'TXN448102948', status: 'Paid', received_by: 'Accountant Mark' },
  { id: 'pay-3', receipt_no: 'REC-2026-003', student_id: 'std-9', student_name: 'Isaac Ibrahim', class_name: 'Class 10', section_name: 'A', roll_no: '1', fee_type: 'Tuition Fee', amount: 1200, payment_date: '2026-08-20', payment_method: 'Bank Transfer', transaction_id: 'NEFT8840192', status: 'Paid', received_by: 'Accountant Mark' },
  { id: 'pay-4', receipt_no: 'REC-2026-004', student_id: 'std-10', student_name: 'Jasmine Jackson', class_name: 'Class 10', section_name: 'B', roll_no: '2', fee_type: 'Laboratory Fee', amount: 350, payment_date: '2026-08-22', payment_method: 'Cash', transaction_id: 'CASH-99120', status: 'Paid', received_by: 'Accountant Mark' },
  { id: 'pay-5', receipt_no: 'REC-2026-005', student_id: 'std-3', student_name: 'Charlie Carter', class_name: 'Class 7', section_name: 'A', roll_no: '3', fee_type: 'Transport Fee', amount: 180, payment_date: '2026-08-25', payment_method: 'UPI', transaction_id: 'UPI771029410', status: 'Paid', received_by: 'Accountant Mark' },
];

export const mockBooks: Book[] = [
  { id: 'bk-1', isbn: '978-0131103627', title: 'The C Programming Language', author: 'Brian Kernighan, Dennis Ritchie', category: 'Computer Science', publisher: 'Prentice Hall', edition: '2nd Edition', total_copies: 15, available_copies: 11, shelf_location: 'Rack CS-01' },
  { id: 'bk-2', isbn: '978-0321573513', title: 'Algorithms & Data Structures', author: 'Robert Sedgewick', category: 'Computer Science', publisher: 'Addison-Wesley', edition: '4th Edition', total_copies: 20, available_copies: 14, shelf_location: 'Rack CS-02' },
  { id: 'bk-3', isbn: '978-0134093413', title: 'University Physics with Modern Physics', author: 'Hugh Young, Roger Freedman', category: 'Physics', publisher: 'Pearson', edition: '14th Edition', total_copies: 25, available_copies: 18, shelf_location: 'Rack SCI-04' },
  { id: 'bk-4', isbn: '978-0078021558', title: 'Calculus: Early Transcendentals', author: 'James Stewart', category: 'Mathematics', publisher: 'Cengage', edition: '8th Edition', total_copies: 30, available_copies: 22, shelf_location: 'Rack MATH-03' },
  { id: 'bk-5', isbn: '978-0061120084', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Literature', publisher: 'Harper Perennial', edition: '50th Anniv', total_copies: 40, available_copies: 31, shelf_location: 'Rack LIT-09' },
  { id: 'bk-6', isbn: '978-0451524935', title: '1984', author: 'George Orwell', category: 'Literature', publisher: 'Signet Classic', edition: 'Reissue', total_copies: 35, available_copies: 26, shelf_location: 'Rack LIT-10' },
  { id: 'bk-7', isbn: '978-0307269980', title: 'A Short History of Nearly Everything', author: 'Bill Bryson', category: 'Science', publisher: 'Doubleday', edition: '1st Edition', total_copies: 18, available_copies: 15, shelf_location: 'Rack SCI-01' }
];

export const mockBookIssues: BookIssue[] = [
  { id: 'iss-1', copy_id: 'cpy-1', book_id: 'bk-1', book_title: 'The C Programming Language', isbn: '978-0131103627', student_id: 'std-9', student_name: 'Isaac Ibrahim', class_name: 'Class 10', issue_date: '2026-08-10', due_date: '2026-08-24', fine_amount: 5, status: 'Overdue' },
  { id: 'iss-2', copy_id: 'cpy-2', book_id: 'bk-3', book_title: 'University Physics with Modern Physics', isbn: '978-0134093413', student_id: 'std-10', student_name: 'Jasmine Jackson', class_name: 'Class 10', issue_date: '2026-08-20', due_date: '2026-09-03', fine_amount: 0, status: 'Issued' },
  { id: 'iss-3', copy_id: 'cpy-3', book_id: 'bk-5', book_title: 'To Kill a Mockingbird', isbn: '978-0061120084', student_id: 'std-1', student_name: 'Alexander Anderson', class_name: 'Class 6', issue_date: '2026-08-01', due_date: '2026-08-15', return_date: '2026-08-14', fine_amount: 0, status: 'Returned' },
];

export const mockVehicles: Vehicle[] = [
  { id: 'veh-1', vehicle_number: 'BUS-01 (KA-01-E-1001)', type: 'Bus', capacity: 45, driver_name: 'Tom Hanks', driver_phone: '+1 555-0801', status: 'Active' },
  { id: 'veh-2', vehicle_number: 'BUS-02 (KA-01-E-1002)', type: 'Bus', capacity: 45, driver_name: 'Morgan Freeman', driver_phone: '+1 555-0802', status: 'Active' },
  { id: 'veh-3', vehicle_number: 'VAN-01 (KA-01-E-2001)', type: 'Van', capacity: 18, driver_name: 'Harrison Ford', driver_phone: '+1 555-0803', status: 'Active' },
  { id: 'veh-4', vehicle_number: 'BUS-03 (KA-01-E-1003)', type: 'Bus', capacity: 45, driver_name: 'Samuel L. Jackson', driver_phone: '+1 555-0804', status: 'Maintenance' },
];

export const mockDrivers: Driver[] = [
  { id: 'drv-1', employee_no: 'EMP-D01', name: 'Tom Hanks', phone: '+1 555-0801', license_number: 'DL-99481029', license_expiry: '2028-11-30', status: 'Active' },
  { id: 'drv-2', employee_no: 'EMP-D02', name: 'Morgan Freeman', phone: '+1 555-0802', license_number: 'DL-88401928', license_expiry: '2027-06-15', status: 'Active' },
  { id: 'drv-3', employee_no: 'EMP-D03', name: 'Harrison Ford', phone: '+1 555-0803', license_number: 'DL-77391827', license_expiry: '2029-01-20', status: 'Active' },
  { id: 'drv-4', employee_no: 'EMP-D04', name: 'Samuel L. Jackson', phone: '+1 555-0804', license_number: 'DL-66281726', license_expiry: '2026-12-10', status: 'On Leave' },
];

export const mockRoutes: Route[] = [
  { id: 'rt-1', route_name: 'Route 1 - North Suburbs & Metro', start_point: 'North Terminal', end_point: 'School Main Gate', stops_count: 8, assigned_vehicle: 'BUS-01 (KA-01-E-1001)', monthly_fee: 180, assigned_students_count: 32 },
  { id: 'rt-2', route_name: 'Route 2 - East Heights Express', start_point: 'East Heights Mall', end_point: 'School Main Gate', stops_count: 6, assigned_vehicle: 'BUS-02 (KA-01-E-1002)', monthly_fee: 200, assigned_students_count: 28 },
  { id: 'rt-3', route_name: 'Route 3 - Westside Shuttle', start_point: 'Westside Circle', end_point: 'School Main Gate', stops_count: 5, assigned_vehicle: 'VAN-01 (KA-01-E-2001)', monthly_fee: 160, assigned_students_count: 14 },
];

export const mockStudentTransports: StudentTransport[] = [
  { id: 'st-1', student_id: 'std-1', student_name: 'Alexander Anderson', class_name: 'Class 6', route_name: 'Route 1 - North Suburbs & Metro', vehicle_number: 'BUS-01', pickup_point: 'North Stop 3', start_date: '2024-08-01', monthly_fee: 180, status: 'Active' },
  { id: 'st-2', student_id: 'std-9', student_name: 'Isaac Ibrahim', class_name: 'Class 10', route_name: 'Route 2 - East Heights Express', vehicle_number: 'BUS-02', pickup_point: 'East Stop 2', start_date: '2024-08-01', monthly_fee: 200, status: 'Active' },
  { id: 'st-3', student_id: 'std-3', student_name: 'Charlie Carter', class_name: 'Class 7', route_name: 'Route 3 - Westside Shuttle', vehicle_number: 'VAN-01', pickup_point: 'West Circle 1', start_date: '2024-08-01', monthly_fee: 160, status: 'Active' },
];

export const mockNotices: Notice[] = [
  { id: 'not-1', title: 'Mid-Term Examination Schedule Released for Academic Year 2025-26', content: 'The detailed timetable for Mid-Term Exams starting September 15th has been published. All students are advised to check their classroom notice boards.', published_date: '2026-08-25', expiry_date: '2026-09-30', target_audience: 'All', status: 'Published', created_by: 'Principal Office', priority: 'High' },
  { id: 'not-2', title: 'Annual Sports Day Registration Open', content: 'Students interested in participating in track & field events, basketball, and football must submit their entry forms to Coach Sterling by Friday.', published_date: '2026-08-28', expiry_date: '2026-09-10', target_audience: 'Students', status: 'Published', created_by: 'Sports Department', priority: 'Medium' },
  { id: 'not-3', title: 'Faculty & Teacher Staff Meeting on Curriculum Review', content: 'All department heads and teaching staff are requested to assemble in Conference Room B on Wednesday at 3:30 PM for quarterly review.', published_date: '2026-08-29', expiry_date: '2026-09-02', target_audience: 'Teachers', status: 'Published', created_by: 'Academic Dean', priority: 'High' },
  { id: 'not-4', title: 'Parent-Teacher Conference (PTC) Notice', content: 'Parent-Teacher interaction for Class 10 and Class 12 will take place on Saturday, Sept 5th between 9:00 AM and 1:00 PM.', published_date: '2026-08-30', expiry_date: '2026-09-06', target_audience: 'Parents', status: 'Published', created_by: 'Administration', priority: 'High' },
];

export const mockEvents: Event[] = [
  { id: 'evt-1', title: 'Annual Inter-School Science Fair 2026', description: 'Showcase of innovative STEM models, robotics, and environmental science projects.', event_type: 'Academic', date: '2026-09-12', venue: 'Main Auditorium & Exhibition Hall', organizer: 'Science Department', participant_count: 42, participants: ['Isaac Ibrahim', 'Jasmine Jackson', 'Alexander Anderson', 'Beatrix Baker'] },
  { id: 'evt-2', title: 'Autumn Cultural Gala & Music Fest', description: 'Stage performances including orchestra, choir, traditional drama, and modern dance.', event_type: 'Cultural', date: '2026-10-05', venue: 'Open Air Amphitheatre', organizer: 'Arts & Cultural Committee', participant_count: 65, participants: ['Charlie Carter', 'Diana Davis', 'Freya Foster'] },
  { id: 'evt-3', title: 'Inter-House Basketball Championship', description: 'Annual tournament between Red Tigers, Blue Eagles, Green Falcons, and Gold Lions.', event_type: 'Sports', date: '2026-10-18', venue: 'School Sports Complex', organizer: 'Physical Education Dept', participant_count: 32, participants: ['Kevin King', 'Mason Morgan', 'Oliver Owens'] },
];

export const mockUsers: AppUser[] = [
  { id: 'usr-1', username: 'admin.principal', email: 'principal@school.edu', full_name: 'Dr. Arthur Pendelton', role: 'ADMIN', status: 'Active', created_date: '2024-01-01', last_login: '2026-08-31 08:30 AM' },
  { id: 'usr-2', username: 'teacher.robert', email: 'r.vance@school.edu', full_name: 'Dr. Robert Vance', role: 'TEACHER', status: 'Active', created_date: '2024-01-15', last_login: '2026-08-31 09:10 AM' },
  { id: 'usr-3', username: 'student.isaac', email: 'isaac.ibrahim@student.school.edu', full_name: 'Isaac Ibrahim', role: 'STUDENT', status: 'Active', created_date: '2024-08-01', last_login: '2026-08-30 04:15 PM' },
  { id: 'usr-4', username: 'acc.mark', email: 'mark.accounts@school.edu', full_name: 'Mark Sterling (Accountant)', role: 'ACCOUNTANT', status: 'Active', created_date: '2024-02-01', last_login: '2026-08-31 10:00 AM' },
  { id: 'usr-5', username: 'lib.elena', email: 'elena.library@school.edu', full_name: 'Elena Rostova (Librarian)', role: 'LIBRARIAN', status: 'Active', created_date: '2024-03-10', last_login: '2026-08-30 02:45 PM' },
];
