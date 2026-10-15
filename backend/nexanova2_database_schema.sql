-- ====================================================================
-- NEXANOVA2 DATABASE SCHEMA
-- Complete database setup with all tables
-- Created: January 21, 2026
-- ====================================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS nexanova2;
USE nexanova2;

-- ====================================================================
-- 1. USER TABLE (Base table for all user types)
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STUDENT', 'TRAINER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ====================================================================
-- 2. SUBJECT TABLE
-- ====================================================================
-- CREATE TABLE IF NOT EXISTS subjects (
    -- id BIGINT AUTO_INCREMENT PRIMARY KEY,
    -- name VARCHAR(255) NOT NULL UNIQUE,
    -- description VARCHAR(500),
    -- subject_code VARCHAR(255) UNIQUE,
    -- department VARCHAR(255),
    -- credit_hours INT,
    -- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- INDEX idx_name (name),
    -- INDEX idx_code (subject_code)
-- );

-- ====================================================================
-- 3. TRAINER TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS trainers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    emp_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(255),
    qualification VARCHAR(255),
    experience_years INT,
    course_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_emp_id (emp_id),
    INDEX idx_course (course_id)
);

-- ====================================================================
-- 4. COURSE TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) UNIQUE,
    description TEXT,
    credits INT,
    trainer_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_code (code),
    INDEX idx_trainer (trainer_id)
);

-- ====================================================================
-- 5. MODULE TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS modules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    module_code VARCHAR(255) UNIQUE,
    course_id BIGINT NOT NULL,
    duration_hours INT,
    status VARCHAR(50),
    sequence_number INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_code (module_code)
);

-- ====================================================================
-- 6. SCHEDULE TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    week_start DATE NOT NULL,
    day_of_week VARCHAR(20),
    slot VARCHAR(50),
    trainer_id BIGINT,
    course_id BIGINT,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    INDEX idx_week (week_start),
    INDEX idx_status (status),
    INDEX idx_trainer (trainer_id)
);

-- ====================================================================
-- 7. ENROLLMENT TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    status ENUM('ENROLLED', 'COMPLETED', 'DROPPED') DEFAULT 'ENROLLED',
    enrolled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id),
    INDEX idx_student (student_id),
    INDEX idx_course (course_id),
    INDEX idx_status (status)
);

-- ====================================================================
-- 8. PASSWORD_RESET TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS password_reset (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reset_token VARCHAR(255) NOT NULL UNIQUE,
    expiry_time DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (reset_token),
    INDEX idx_user (user_id),
    INDEX idx_used (used)
);

-- ====================================================================
-- DATABASE INITIALIZATION COMPLETE
-- ====================================================================

-- Insert Sample Data (Optional - for testing)
-- Uncomment the sections below to insert test data

-- ====================================================================
-- INSERT SAMPLE USERS
-- ====================================================================
/*
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2a$10$...', 'ADMIN'),
('John Student', 'student@example.com', '$2a$10$...', 'STUDENT'),
('Jane Trainer', 'trainer@example.com', '$2a$10$...', 'TRAINER');
*/

-- ====================================================================
-- INSERT SAMPLE SUBJECTS
-- ====================================================================
/*
INSERT INTO subjects (name, subject_code, description, department, credit_hours) VALUES
('Mathematics', 'MATH101', 'Basic Mathematics Course', 'Science', 4),
('Physics', 'PHY101', 'Introduction to Physics', 'Science', 4),
('Chemistry', 'CHEM101', 'Basic Chemistry', 'Science', 3);
*/

-- ====================================================================
-- INSERT SAMPLE TRAINERS
-- ====================================================================
/*
INSERT INTO trainers (emp_id, name, email, phone, department, qualification, experience_years, subject_id) VALUES
('EMP001', 'Dr. John Smith', 'john.smith@example.com', '+1234567890', 'Science', 'PhD', 10, 1),
('EMP002', 'Prof. Jane Doe', 'jane.doe@example.com', '+1234567891', 'Science', 'Masters', 8, 2);
*/

-- ====================================================================
-- INSERT SAMPLE COURSES
-- ====================================================================
/*
INSERT INTO courses (name, code, description, credits, trainer_id) VALUES
('Advanced Mathematics', 'MATH201', 'Advanced calculus and algebra', 4, 1),
('Physics Lab', 'PHY201', 'Practical physics experiments', 3, 2);
*/

-- ====================================================================
-- INSERT SAMPLE MODULES
-- ====================================================================
/*
INSERT INTO modules (name, module_code, description, course_id, duration_hours, status, sequence_number) VALUES
('Calculus Basics', 'MOD001', 'Introduction to calculus', 1, 30, 'ACTIVE', 1),
('Algebra Advanced', 'MOD002', 'Advanced algebraic techniques', 1, 25, 'ACTIVE', 2);
*/

-- ====================================================================
-- DISPLAY TABLE INFORMATION
-- ====================================================================
-- Show all tables created
SHOW TABLES;

-- Show users table structure
DESCRIBE users;

-- ====================================================================
-- END OF SCHEMA
-- ====================================================================
