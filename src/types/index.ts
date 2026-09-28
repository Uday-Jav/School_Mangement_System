// Comprehensive TypeScript Interfaces matching PostgreSQL Entities

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ACCOUNTANT' | 'LIBRARIAN';

export interface AcademicYear {
  id: string;
  year_code: string; // e.g. "2025-2026"
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head_of_department?: string;
  teacher_count?: number;
}

export interface ClassEntity {
  id: string;
  name: string; // e.g. "Class 10"
  numeric_grade: number;
  capacity: number;
  total_students: number;
  sections_count: number;
}

export interface Section {
  id: string;
  class_id: string;
  class_name: string;
  name: string; // "A", "B", "C"
  class_teacher_id: string;
  class_teacher_name: string;
  capacity: number;
  current_students: number;
  room_number: string;
}

export interface Guardian {
  id: string;
  name: string;
  relationship: string; // "Father", "Mother", "Guardian"
  phone: string;
  email: string;
  occupation: string;
  address: string;
}

export interface Student {
  id: string;
  admission_no: string; // e.g. "ADM-2024-001"
  first_name: string;
  last_name: string;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  blood_group: string;
  phone: string;
  email: string;
  address: string;
  
  // Academic Info
  class_id: string;
  class_name: string;
  section_id: string;
  section_name: string;
  roll_no: string;
  academic_year: string;
  admission_date: string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  
  // Guardian Info
  guardian: Guardian;
  
  // Historical Enrolments
  enrolment_history?: {
    academic_year: string;
    class_name: string;
    section_name: string;
    roll_no: string;
    status: 'Graduated' | 'Promoted' | 'Active';
  }[];

  // Extra tracking info
  attendance_percentage: number;
  fee_status: 'Paid' | 'Pending' | 'Overdue';
  avatar?: string;
}

export interface Teacher {
  id: string;
  employee_no: string; // e.g. "EMP-T01"
  first_name: string;
  last_name: string;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  department_id: string;
  department_name: string;
  designation: string; // "Senior Teacher", "Lecturer", "Head Teacher"
  qualification: string;
  phone: string;
  email: string;
  joining_date: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  subjects_taught: string[]; // subject names
  assigned_classes: string[]; // e.g. ["10-A", "9-B"]
  avatar?: string;
}

export interface Subject {
  id: string;
  code: string; // e.g. "MATH-101"
  name: string;
  type: 'Theory' | 'Practical' | 'Both';
  max_marks: number;
  pass_marks: number;
  assigned_classes: string[];
  assigned_teachers: string[];
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  class_name: string;
  section_name: string;
  date: string;
  academic_year?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  remarks?: string;
}

export interface TimetablePeriod {
  id: string;
  class_id: string;
  section_id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period_number: number; // 1 to 7
  start_time: string;
  end_time: string;
  subject_name: string;
  teacher_name: string;
  room_number: string;
}

export interface SubstituteAssignment {
  id: string;
  original_period_id: string;
  date: string; // the specific date the substitution occurs
  substitute_teacher_name: string;
  substitute_teacher_id: string;
  reason: string;
  status: 'Assigned' | 'Completed' | 'Cancelled';
}

export interface Exam {
  id: string;
  name: string; // "Unit Test 1", "Mid Term Examination", "Final Examination"
  academic_year: string;
  start_date: string;
  end_date: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  total_marks: number;
}

export interface ExamSchedule {
  id: string;
  exam_id: string;
  subject_name: string;
  class_name: string;
  date: string;
  start_time: string;
  end_time: string;
  room_number: string;
  max_marks: number;
  pass_marks: number;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  exam_name: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  class_name: string;
  section_name: string;
  subject_id: string;
  subject_name: string;
  marks_obtained: number;
  max_marks: number;
  grade: string;
  status: 'Pass' | 'Fail' | 'Pending' | 'Exempt';
  grading_state?: 'Scored' | 'Absent' | 'Not Assessed' | 'Exempt';
  remarks?: string;
}

export interface ReportCard {
  student: Student;
  exam_name: string;
  academic_year: string;
  subject_results: {
    subject_name: string;
    marks_obtained: number | null;
    max_marks: number;
    grade: string;
    remarks: string;
  }[];
  total_obtained: number;
  total_max: number;
  percentage: number;
  grade: string;
  status: 'PASSED' | 'FAILED' | 'PASSED WITH HONORS' | 'PROVISIONAL';
  rank: number;
  is_provisional?: boolean;
}

export interface FeeType {
  id: string;
  name: string; // "Tuition Fee", "Transport Fee", "Library Fee", "Exam Fee", "Lab Fee"
  code: string;
  description: string;
}

export interface FeeStructure {
  id: string;
  class_name: string;
  academic_year: string;
  fee_type_name: string;
  amount: number;
  due_date: string;
}

export interface Payment {
  id: string;
  receipt_no: string; // "REC-2025-089"
  student_id: string;
  student_name: string;
  class_name: string;
  section_name: string;
  roll_no: string;
  fee_type: string;
  amount: number;
  payment_date: string;
  payment_method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque';
  transaction_id: string;
  invoice_id?: string;
  allocation?: string; // what the payment was allocated to
  status: 'Paid' | 'Partial' | 'Refunded';
  received_by: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  publisher: string;
  edition: string;
  shelf_location: string;
  total_copies?: number;
  available_copies?: number;
  is_archived?: boolean;
}

export interface BookCopy {
  id: string;
  book_id: string;
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  status: 'Available' | 'Issued' | 'Lost' | 'Archived';
}

export interface BookIssue {
  id: string;
  copy_id: string;
  book_id: string;
  book_title: string;
  isbn?: string;
  student_id: string;
  student_name: string;
  class_name: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  fine_amount: number;
  status: 'Issued' | 'Returned' | 'Overdue' | 'Lost';
}

export interface Vehicle {
  id: string;
  vehicle_number: string; // e.g. "BUS-01 (KA-01-E-1234)"
  type: 'Bus' | 'Mini Bus' | 'Van';
  capacity: number;
  driver_name: string;
  driver_phone: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

export interface Driver {
  id: string;
  employee_no: string;
  name: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface Route {
  id: string;
  route_name: string; // e.g. "Route 1 - North Campus"
  start_point?: string;
  end_point?: string;
  stops_count?: number;
  assigned_vehicle?: string;
  vehicle_no?: string;
  driver_name?: string;
  driver_phone?: string;
  monthly_fee: number;
  assigned_students_count?: number;
  students_count?: number;
  stops?: string[];
}

export type TransportRoute = Route;

export interface StudentTransport {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  route_name: string;
  vehicle_number: string;
  pickup_point: string;
  start_date: string;
  monthly_fee: number;
  status: 'Active' | 'Suspended';
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  published_date: string;
  expiry_date: string;
  target_audience: 'All' | 'Teachers' | 'Students' | 'Parents';
  status: 'Published' | 'Draft' | 'Archived';
  created_by: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'Sports' | 'Cultural' | 'Academic' | 'Competition' | 'Function' | 'Other';
  date: string;
  venue: string;
  organizer: string;
  participant_count: number;
  participants: string[]; // Student names
  target_audience?: 'All' | 'Teachers' | 'Students' | 'Parents';
  status?: 'Scheduled' | 'Cancelled';
}

export interface ParentLink {
  student_id: string;
  relationship: string;
}

export interface AppUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  created_date: string;
  last_login?: string;
  avatar?: string;
  linked_profile_id?: string;
  parent_links?: ParentLink[];
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface AdmissionApplication {
  id: string;
  applicant_name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  class_applied: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  previous_school?: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Enrolled' | 'Rejected';
  application_date: string;
  documents: { name: string; size: string; type: string }[];
}
