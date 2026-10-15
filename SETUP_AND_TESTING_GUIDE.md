# Complete Setup & Testing Guide

## 📋 Table of Contents
1. [Project Structure Overview](#project-structure)
2. [Installation & Setup](#installation--setup)
3. [Running the Application](#running-the-application)
4. [Testing All Features](#testing-all-features)
5. [Database Schema Requirements](#database-schema-requirements)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ Project Structure

```
Trainer-Subject_Management/
├── frontend/                          # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.js
│   │   │   │   └── RegisterPage.js
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── SubjectsPage.js
│   │   │   │   ├── TrainersPage.js
│   │   │   │   ├── CoursesPage.js
│   │   │   │   ├── ModulesPage.js
│   │   │   │   ├── SchedulesPage.js
│   │   │   │   ├── EnrollmentsPage.js
│   │   │   │   ├── UsersPage.js
│   │   │   │   ├── TimetablePage.js
│   │   │   │   ├── ViewTrainersCoursesPage.js
│   │   │   │   ├── ScheduleBuilderPage.js
│   │   │   │   ├── BulkOperationsPage.js
│   │   │   │   └── StudentEnrollmentsPage.js
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.js
│   │   │   │   ├── MyTimetable.js
│   │   │   │   └── MyCourses.js
│   │   │   └── NotFoundPage.js
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Sidebar.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── subjectService.js
│   │   │   ├── trainerService.js
│   │   │   ├── courseService.js
│   │   │   ├── scheduleService.js
│   │   │   └── enrollmentService.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── App.css
│   ├── package.json
│   └── README.md
└── backend/                           # Java Spring Boot Backend
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   └── com/trainer/
    │   │   │       ├── controller/
    │   │   │       ├── service/
    │   │   │       ├── repository/
    │   │   │       ├── entity/
    │   │   │       └── dto/
    │   │   └── resources/
    │   │       └── application.properties
    │   └── test/
    ├── pom.xml
    └── README.md
```

---

## 💻 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Java 11+ (for backend)
- MySQL or PostgreSQL
- Git

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# If react-router-dom is missing:
npm install react-router-dom@^6.20.0

# Check if all required packages are installed:
npm list
```

### Required npm packages
```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "react-router-dom": "^6.20.0",
  "axios": "^1.13.2",
  "react-scripts": "5.0.1"
}
```

---

## 🚀 Running the Application

### Start Frontend
```bash
cd frontend
npm start
```
- Application will open at `http://localhost:3000`
- Frontend will use `http://localhost:8080` as backend API

### Start Backend (Spring Boot)
```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```
- Backend will run on `http://localhost:8080`

---

## 🧪 Testing All Features

### 1. **Test Authentication**
```
Route: http://localhost:3000/login
1. Try invalid credentials
2. Login with valid admin account
3. Login with valid student account
4. Check localStorage for token and user data
```

### 2. **Test Admin Features - FR-Admin-01: View Trainers**
```
Route: /admin/view-trainers-courses
1. Login as admin
2. Click on "View Trainers & Courses" in sidebar
3. Verify all trainers are displayed
4. Check trainer details (name, email, empId, subject)
5. Verify trainer cards are displayed correctly
```

### 3. **Test FR-Admin-02: View Courses & Modules**
```
Route: /admin/view-trainers-courses
1. Switch to "Courses & Modules" tab
2. Verify all courses are listed
3. Click on a course to expand
4. Verify modules are shown under the course
5. Check module details (name, content, ID)
```

### 4. **Test FR-Admin-03: Create Blank Schedule**
```
Route: /admin/schedule-builder
1. Click "Create Blank Schedule" form
2. Enter schedule name: "Week 1 Test"
3. Enter start date: 2026-01-20
4. Click "Create Blank Schedule"
5. Verify success message
6. Check schedules list shows new schedule
7. Verify schedule has 28 empty slots (4 per day × 7 days)
```

### 5. **Test FR-Admin-04: Allocate Time Slots**
```
Route: /admin/schedule-builder
1. Select the created schedule
2. Select Monday as day
3. Select "8 AM - 11 AM" time slot
4. Select a module from dropdown
5. Select a trainer from dropdown
6. Click "Allocate Time Slot"
7. Verify success message
8. View schedule details to confirm allocation
9. Repeat for multiple slots
```

### 6. **Test FR-Admin-05: Enroll Student**
```
Route: /admin/student-enrollments
1. Select a student from dropdown
2. Select a course from dropdown
3. Click "Enroll Student"
4. Verify success message
5. Check enrollments table shows new enrollment
6. Try enrolling same student in same course (should error)
7. Test "Remove" button to unenroll student
8. Verify filter by course works
```

### 7. **Test FR-Admin-06: Bulk Upload Students**
```
Route: /admin/bulk-operations
1. Prepare CSV file with student data:
   - ID, Name, Email, Phone, Address
   - 1, John Doe, john@test.com, 1234567890, 123 Main St
   - 2, Jane Smith, jane@test.com, 0987654321, 456 Oak Ave

2. Select file in "Upload CSV or Excel File" input
3. Click "Upload Students"
4. Watch progress bar reach 100%
5. Verify success message shows count
6. Confirm students appear in student list
```

### 8. **Test FR-Admin-07: Bulk Enroll Students**
```
Route: /admin/bulk-operations
1. Check multiple students using checkboxes
2. Click "Select All" to select all students
3. Verify count displays correctly
4. Select a course from dropdown
5. Click "Enroll X Student(s)" button
6. Verify success message with enrollment count
7. Check enrollments page shows all new enrollments
8. Verify students are no longer in "selected" state
```

### Test Student Features
```
Routes:
- /student/dashboard
- /student/timetable
- /student/courses

1. Login as student
2. Navigate to dashboard
3. Check enrolled courses count
4. View personal timetable
5. View enrolled courses with modules
6. Verify modules are readable
```

---

## 🗄️ Database Schema Requirements

### Student Table
```sql
CREATE TABLE student (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Subject Table
```sql
CREATE TABLE subject (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Trainer Table
```sql
CREATE TABLE trainer (
  id INT PRIMARY KEY AUTO_INCREMENT,
  emp_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subject(id)
);
```

### Course Table
```sql
CREATE TABLE course (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id INT,
  trainer_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subject(id),
  FOREIGN KEY (trainer_id) REFERENCES trainer(id)
);
```

### Module Table
```sql
CREATE TABLE module (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  content TEXT,
  course_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES course(id)
);
```

### Schedule Table
```sql
CREATE TABLE schedule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Schedule_Slot Table
```sql
CREATE TABLE schedule_slot (
  id INT PRIMARY KEY AUTO_INCREMENT,
  schedule_id INT NOT NULL,
  day VARCHAR(20) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  module_id INT,
  trainer_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES schedule(id),
  FOREIGN KEY (module_id) REFERENCES module(id),
  FOREIGN KEY (trainer_id) REFERENCES trainer(id)
);
```

### Enrollment Table
```sql
CREATE TABLE enrollment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  FOREIGN KEY (student_id) REFERENCES student(id),
  FOREIGN KEY (course_id) REFERENCES course(id),
  UNIQUE KEY unique_enrollment (student_id, course_id)
);
```

### User Table
```sql
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'STUDENT', 'TRAINER') DEFAULT 'STUDENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'react-router-dom'"
**Solution:**
```bash
npm install react-router-dom@^6.20.0
```

### Issue: Backend API returns 404
**Solution:**
1. Check backend is running on `http://localhost:8080`
2. Verify API endpoints match backend implementation
3. Check browser console for API errors
4. Verify request URL in network tab

### Issue: CORS errors
**Solution:**
Add to Spring Boot `application.properties`:
```properties
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

### Issue: Login not working
**Solution:**
1. Verify user exists in database with ADMIN role
2. Check AuthContext is properly initialized
3. Verify localStorage can store data
4. Check browser console for errors

### Issue: Sidebar not showing
**Solution:**
1. Ensure you're logged in
2. Check user.role is set correctly
3. Verify you're on /admin/* or /student/* routes
4. Check AuthContext is providing user data

### Issue: Schedule creation fails
**Solution:**
1. Verify backend has `/api/schedule/create-blank` endpoint
2. Check request body matches expected format
3. Verify course and trainer exist before allocating
4. Check console for API response details

### Issue: Bulk upload not working
**Solution:**
1. Verify file format is correct (CSV/Excel)
2. Check file has correct headers
3. Ensure backend has bulk-upload endpoint
4. Verify file size is reasonable
5. Check backend CSV parsing implementation

---

## 📊 Test Data Creation

### SQL Script to Create Test Data

```sql
-- Create test subject
INSERT INTO subject (name, description) VALUES 
('Java Programming', 'Core Java concepts and OOP'),
('Web Development', 'Frontend and backend web development');

-- Create test trainer
INSERT INTO trainer (emp_id, name, email, subject_id) VALUES 
('T001', 'John Trainer', 'john@trainer.com', 1),
('T002', 'Jane Trainer', 'jane@trainer.com', 2);

-- Create test course
INSERT INTO course (name, description, subject_id, trainer_id) VALUES 
('Java Basics', 'Learn Java from scratch', 1, 1),
('React Advanced', 'Advanced React patterns', 2, 2);

-- Create test module
INSERT INTO module (name, content, course_id) VALUES 
('Variables and Data Types', 'Learn about Java variables', 1),
('Components', 'React components deep dive', 2);

-- Create test student
INSERT INTO student (name, email, phone, address) VALUES 
('Student One', 'student1@test.com', '1234567890', '123 Main St'),
('Student Two', 'student2@test.com', '0987654321', '456 Oak Ave');

-- Create test user (admin)
INSERT INTO user (name, email, password, role) VALUES 
('Admin User', 'admin@test.com', 'hashed_password', 'ADMIN');

-- Create test user (student)
INSERT INTO user (name, email, password, role) VALUES 
('Student User', 'student1@test.com', 'hashed_password', 'STUDENT');
```

---

## ✅ Testing Checklist

- [ ] Frontend builds without errors
- [ ] Backend starts without errors
- [ ] Login page loads and is accessible
- [ ] Can login with valid credentials
- [ ] JWT token is stored in localStorage
- [ ] Can view trainers (FR-Admin-01)
- [ ] Can view courses and modules (FR-Admin-02)
- [ ] Can create blank schedule (FR-Admin-03)
- [ ] Can allocate time slots (FR-Admin-04)
- [ ] Can enroll single student (FR-Admin-05)
- [ ] Can bulk upload students (FR-Admin-06)
- [ ] Can bulk enroll students (FR-Admin-07)
- [ ] Student dashboard shows enrolled courses
- [ ] Student can view personal timetable
- [ ] Student can view course modules
- [ ] Sidebar navigation works correctly
- [ ] All error messages display properly
- [ ] Success messages confirm actions
- [ ] Pagination works for large datasets
- [ ] Filters work correctly

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check backend logs for API errors
4. Verify database connections
5. Ensure all tables are created with correct schema

