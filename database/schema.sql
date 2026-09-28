-- ============================================================
-- PostgreSQL Database Initialization Script
-- Database Name: School_Managment_System
-- Owner User: postgres
-- ============================================================

-- 1. Create Database (Run as superuser 'postgres' in psql / pgAdmin)
-- CREATE DATABASE "School_Managment_System";
-- \c "School_Managment_System";

-- 2. Drop existing tables if re-initializing
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;
DROP TABLE IF EXISTS book_issues CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS student_transport CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS exam_schedules CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS timetable_periods CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Create Core Tables

-- Departments
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    head_of_department VARCHAR(100),
    teacher_count INT DEFAULT 0
);

-- Classes
CREATE TABLE classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    numeric_grade INT NOT NULL,
    capacity INT DEFAULT 40,
    total_students INT DEFAULT 0,
    sections_count INT DEFAULT 0
);

-- Sections
CREATE TABLE sections (
    id VARCHAR(50) PRIMARY KEY,
    class_id VARCHAR(50) REFERENCES classes(id) ON DELETE CASCADE,
    class_name VARCHAR(50) NOT NULL,
    name VARCHAR(10) NOT NULL,
    class_teacher_id VARCHAR(50),
    class_teacher_name VARCHAR(100),
    capacity INT DEFAULT 40,
    current_students INT DEFAULT 0,
    room_number VARCHAR(20)
);

-- Students
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    admission_no VARCHAR(30) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE NOT NULL,
    blood_group VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    class_id VARCHAR(50) REFERENCES classes(id),
    class_name VARCHAR(50),
    section_id VARCHAR(50) REFERENCES sections(id),
    section_name VARCHAR(10),
    roll_no VARCHAR(20),
    academic_year VARCHAR(20),
    admission_date DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Graduated', 'Suspended')),
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(20),
    guardian_relationship VARCHAR(30),
    attendance_percentage DECIMAL(5,2) DEFAULT 100.00,
    fee_status VARCHAR(20) DEFAULT 'Paid' CHECK (fee_status IN ('Paid', 'Pending', 'Overdue'))
);

-- Teachers
CREATE TABLE teachers (
    id VARCHAR(50) PRIMARY KEY,
    employee_no VARCHAR(30) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    department_id VARCHAR(50) REFERENCES departments(id),
    department_name VARCHAR(100),
    designation VARCHAR(50),
    qualification VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    joining_date DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave'))
);

-- Subjects
CREATE TABLE subjects (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('Theory', 'Practical', 'Both')),
    max_marks INT DEFAULT 100,
    pass_marks INT DEFAULT 35
);

-- Attendance Records
CREATE TABLE attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(20),
    class_name VARCHAR(50),
    section_name VARCHAR(10),
    date DATE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('Present', 'Absent', 'Late', 'Leave')),
    remarks TEXT
);

-- Exams
CREATE TABLE exams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) CHECK (status IN ('Upcoming', 'Ongoing', 'Completed')),
    total_marks INT DEFAULT 500
);

-- Exam Results
CREATE TABLE exam_results (
    id VARCHAR(50) PRIMARY KEY,
    exam_id VARCHAR(50) REFERENCES exams(id) ON DELETE CASCADE,
    exam_name VARCHAR(100),
    student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(100),
    roll_no VARCHAR(20),
    class_name VARCHAR(50),
    section_name VARCHAR(10),
    subject_id VARCHAR(50) REFERENCES subjects(id),
    subject_name VARCHAR(100),
    marks_obtained INT NOT NULL,
    max_marks INT DEFAULT 100,
    grade VARCHAR(5),
    status VARCHAR(10) CHECK (status IN ('Pass', 'Fail')),
    remarks TEXT
);

-- Fee Structures
CREATE TABLE fee_structures (
    id VARCHAR(50) PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20),
    fee_type_name VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE
);

-- Payments
CREATE TABLE payments (
    id VARCHAR(50) PRIMARY KEY,
    receipt_no VARCHAR(30) UNIQUE NOT NULL,
    student_id VARCHAR(50) REFERENCES students(id),
    student_name VARCHAR(100),
    class_name VARCHAR(50),
    section_name VARCHAR(10),
    roll_no VARCHAR(20),
    fee_type VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque')),
    transaction_id VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('Paid', 'Partial', 'Refunded')),
    received_by VARCHAR(100)
);

-- Books Catalog
CREATE TABLE books (
    id VARCHAR(50) PRIMARY KEY,
    isbn VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    publisher VARCHAR(100),
    edition VARCHAR(50),
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    shelf_location VARCHAR(50)
);

-- Book Issues
CREATE TABLE book_issues (
    id VARCHAR(50) PRIMARY KEY,
    book_id VARCHAR(50) REFERENCES books(id),
    book_title VARCHAR(200),
    isbn VARCHAR(30),
    student_id VARCHAR(50) REFERENCES students(id),
    student_name VARCHAR(100),
    class_name VARCHAR(50),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) CHECK (status IN ('Issued', 'Returned', 'Overdue', 'Lost'))
);

-- Transport Routes
CREATE TABLE routes (
    id VARCHAR(50) PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    vehicle_no VARCHAR(30),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    monthly_fee DECIMAL(10,2),
    students_count INT DEFAULT 0
);

-- Notices
CREATE TABLE notices (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    published_date DATE NOT NULL,
    expiry_date DATE,
    target_audience VARCHAR(20) CHECK (target_audience IN ('All', 'Teachers', 'Students', 'Parents')),
    status VARCHAR(20) CHECK (status IN ('Published', 'Draft', 'Archived')),
    created_by VARCHAR(100),
    priority VARCHAR(10) CHECK (priority IN ('High', 'Medium', 'Low'))
);

-- User System Accounts
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT', 'LIBRARIAN')),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_date DATE NOT NULL,
    last_login TIMESTAMP
);

-- ============================================================
-- Seed Initial Admin User
-- ============================================================
INSERT INTO users (id, username, email, full_name, role, status, created_date) 
VALUES ('usr-1', 'admin', 'admin@metroacademy.edu', 'Dr. Arthur Pendelton', 'ADMIN', 'Active', CURRENT_DATE)
ON CONFLICT (username) DO NOTHING;
