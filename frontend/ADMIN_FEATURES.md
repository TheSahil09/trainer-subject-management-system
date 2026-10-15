# Admin Features Implementation Guide

## Overview
This document outlines all the admin functional requirements implemented in the Trainer-Subject Management System.

---

## ✅ **FR-Admin-01: View Trainers**

### Implementation: `ViewTrainersCoursesPage.js`
**Route:** `/admin/view-trainers-courses`

**Features:**
- Lists all registered trainers with their details
- Displays trainer information:
  - Name
  - Employee ID (empId)
  - Email
  - Assigned Subject
- View trainers in a responsive grid/card layout
- Filter and search capabilities

**Components:**
```jsx
<ViewTrainersCoursesPage />
```

**API Endpoints Used:**
- `GET /api/trainer` - Fetch all trainers

---

## ✅ **FR-Admin-02: View Courses and Modules**

### Implementation: `ViewTrainersCoursesPage.js`
**Route:** `/admin/view-trainers-courses`

**Features:**
- Lists all available courses
- Shows associated modules for each course
- Expandable course cards to view modules
- Module details display:
  - Module name
  - Module content/description
  - Module ID
- Tabbed interface (Trainers / Courses & Modules)

**Components:**
```jsx
<ViewTrainersCoursesPage />
```

**API Endpoints Used:**
- `GET /api/courses` - Fetch all courses
- `GET /api/modules` - Fetch all modules
- `GET /api/modules/course/{courseId}` - Get modules for specific course

---

## ✅ **FR-Admin-03: Create Blank Weekly Schedule**

### Implementation: `ScheduleBuilderPage.js`
**Route:** `/admin/schedule-builder`

**Features:**
- Create blank weekly schedules with specific structure
- **Time slots per day (4 slots):**
  - 8 AM - 11 AM
  - 11 AM - 2 PM
  - 2 PM - 5 PM
  - 5 PM - 8 PM
- Covers all 7 days of the week (Monday - Sunday)
- Form to input:
  - Schedule name (e.g., "Week 1 - Jan 2026")
  - Start date
- Automatic generation of 28 time slots (4 slots × 7 days)

**Components:**
```jsx
<ScheduleBuilderPage />
```

**API Endpoints Used:**
- `POST /api/schedule/create-blank` - Create blank schedule

**Request Body:**
```json
{
  "name": "Week 1 - Jan 2026",
  "startDate": "2026-01-20",
  "days": ["Monday", "Tuesday", ..., "Sunday"],
  "timeSlots": [
    { "label": "8 AM - 11 AM", "start": "08:00", "end": "11:00" },
    { "label": "11 AM - 2 PM", "start": "11:00", "end": "14:00" },
    { "label": "2 PM - 5 PM", "start": "14:00", "end": "17:00" },
    { "label": "5 PM - 8 PM", "start": "17:00", "end": "20:00" }
  ]
}
```

---

## ✅ **FR-Admin-04: Allocate Time Slots**

### Implementation: `ScheduleBuilderPage.js`
**Route:** `/admin/schedule-builder`

**Features:**
- Assign specific modules to time slots
- Assign trainers to time slots
- Form with dropdowns for:
  - Select Schedule (from existing blank schedules)
  - Select Day (Monday - Sunday)
  - Select Time Slot (8AM-11AM, 11AM-2PM, 2PM-5PM, 5PM-8PM)
  - Select Module (from created modules)
  - Select Trainer (from registered trainers)
- View allocated schedules with full details
- Display trainer and module assignments

**Components:**
```jsx
<ScheduleBuilderPage />
```

**API Endpoints Used:**
- `POST /api/schedule/{scheduleId}/allocate-slot` - Allocate time slot
- `GET /api/schedule` - Fetch all schedules
- `GET /api/courses` - Fetch courses
- `GET /api/trainer` - Fetch trainers
- `GET /api/modules` - Fetch modules

**Request Body:**
```json
{
  "day": "Monday",
  "startTime": "08:00",
  "endTime": "11:00",
  "moduleId": 1,
  "trainerId": 2
}
```

---

## ✅ **FR-Admin-05: Enroll Student in a Course**

### Implementation: `StudentEnrollmentsPage.js`
**Route:** `/admin/student-enrollments`

**Features:**
- Single student enrollment interface
- Dropdown selectors for:
  - Student (name + email)
  - Course
- Prevent duplicate enrollments
- Display current enrollments in table format
- Show enrollment date
- Remove enrollment functionality
- Filter enrollments by course
- Enrollment statistics

**Components:**
```jsx
<StudentEnrollmentsPage />
```

**API Endpoints Used:**
- `POST /api/enrollment` - Create enrollment
- `GET /api/enrollment` - Fetch all enrollments
- `GET /api/student` - Fetch students
- `GET /api/courses` - Fetch courses
- `DELETE /api/enrollment/{id}` - Remove enrollment

**Request Body:**
```json
{
  "studentId": 1,
  "courseId": 2,
  "enrolledDate": "2026-01-21T00:00:00Z"
}
```

---

## ✅ **FR-Admin-06: Bulk Upload Student Data**

### Implementation: `BulkOperationsPage.js`
**Route:** `/admin/bulk-operations`

**Features:**
- File upload interface (CSV, Excel)
- Accepts files in formats:
  - `.csv`
  - `.xlsx`
  - `.xls`
- Expected file format:
  ```
  ID, Name, Email, Phone, Address
  ```
- Upload progress indicator
- Success/error messages
- Detailed feedback on upload completion

**Components:**
```jsx
<BulkOperationsPage />
```

**API Endpoints Used:**
- `POST /api/student/bulk-upload` - Upload student data

**Request:**
```
Content-Type: multipart/form-data
- file: [CSV/Excel file]
```

**Response:**
```json
{
  "count": 50,
  "message": "Successfully uploaded 50 students"
}
```

---

## ✅ **FR-Admin-07: Bulk Enroll Students in a Course**

### Implementation: `BulkOperationsPage.js`
**Route:** `/admin/bulk-operations`

**Features:**
- **Step 1: Select Multiple Students**
  - Checkbox list of all students
  - "Select All" checkbox
  - Display count of selected students
  
- **Step 2: Select Course**
  - Dropdown menu with available courses
  - Only one course can be selected at a time

- **Features:**
  - Bulk enrollment button (disabled if no students/course selected)
  - Success message showing count of enrolled students
  - Prevents duplicate enrollments
  - Clear selections after enrollment

**Components:**
```jsx
<BulkOperationsPage />
```

**API Endpoints Used:**
- `POST /api/enrollment/bulk-enroll` - Bulk enroll students
- `GET /api/student` - Fetch students
- `GET /api/courses` - Fetch courses

**Request Body:**
```json
{
  "studentIds": [1, 2, 3, 4, 5],
  "courseId": 2
}
```

**Response:**
```json
{
  "count": 5,
  "message": "Successfully enrolled 5 students"
}
```

---

## 📁 File Structure

```
frontend/src/
├── pages/admin/
│   ├── Dashboard.js                      ✅
│   ├── SubjectsPage.js                   ✅
│   ├── TrainersPage.js                   ✅
│   ├── CoursesPage.js                    ✅
│   ├── ModulesPage.js                    ✅
│   ├── SchedulesPage.js                  ✅
│   ├── EnrollmentsPage.js                ✅
│   ├── UsersPage.js                      ✅
│   ├── TimetablePage.js                  ✅
│   ├── ViewTrainersCoursesPage.js        ✅ NEW
│   ├── ScheduleBuilderPage.js            ✅ NEW
│   ├── BulkOperationsPage.js             ✅ NEW
│   └── StudentEnrollmentsPage.js         ✅ NEW
├── services/
│   ├── authService.js
│   ├── subjectService.js
│   ├── trainerService.js
│   ├── courseService.js
│   ├── scheduleService.js
│   ├── enrollmentService.js              ✅ ENHANCED
│   └── studentService.js                 ✅ NEW
└── App.js                                 ✅ UPDATED
```

---

## 🔗 Admin Routes Summary

| Feature | Route | Page |
|---------|-------|------|
| FR-Admin-01 | `/admin/view-trainers-courses` | ViewTrainersCoursesPage |
| FR-Admin-02 | `/admin/view-trainers-courses` | ViewTrainersCoursesPage |
| FR-Admin-03 | `/admin/schedule-builder` | ScheduleBuilderPage |
| FR-Admin-04 | `/admin/schedule-builder` | ScheduleBuilderPage |
| FR-Admin-05 | `/admin/student-enrollments` | StudentEnrollmentsPage |
| FR-Admin-06 | `/admin/bulk-operations` | BulkOperationsPage |
| FR-Admin-07 | `/admin/bulk-operations` | BulkOperationsPage |

---

## 🔧 Backend API Requirements

Ensure your Spring Boot backend has these endpoints:

### Trainer Endpoints
- `GET /api/trainer` - List all trainers
- `POST /api/trainer` - Create trainer
- `GET /api/trainer/{id}` - Get trainer details
- `PUT /api/trainer/{id}` - Update trainer
- `DELETE /api/trainer/{id}` - Delete trainer

### Course & Module Endpoints
- `GET /api/courses` - List all courses
- `GET /api/modules` - List all modules
- `GET /api/modules/courses/{courseId}` - Get modules for course
- `POST /api/courses` - Create course
- `POST /api/modules` - Create module

### Schedule Endpoints
- `POST /api/schedule/create-blank` - Create blank schedule
- `POST /api/schedule/{scheduleId}/allocate-slot` - Allocate slot
- `GET /api/schedule` - List schedules
- `DELETE /api/schedule/{id}` - Delete schedule

### Student & Enrollment Endpoints
- `POST /api/student/bulk-upload` - Bulk upload students
- `GET /api/student` - List students
- `POST /api/enrollment` - Create enrollment
- `POST /api/enrollment/bulk-enroll` - Bulk enroll
- `GET /api/enrollment` - List enrollments
- `DELETE /api/enrollment/{id}` - Delete enrollment

---

## 📝 Usage Examples

### Create a Blank Schedule
1. Navigate to `/admin/schedule-builder`
2. Fill in schedule name and start date
3. Click "Create Blank Schedule"
4. Schedule with 28 empty slots is created

### Allocate Time Slots
1. In Schedule Builder page
2. Select the schedule, day, time slot, module, and trainer
3. Click "Allocate Time Slot"

### Bulk Upload Students
1. Navigate to `/admin/bulk-operations`
2. Prepare CSV/Excel file with student data
3. Select file and click "Upload Students"
4. Confirmation message shows number of uploaded students

### Bulk Enroll Students
1. In Bulk Operations page
2. Check students to enroll
3. Select course from dropdown
4. Click "Enroll X Student(s)"
5. All selected students are enrolled in the course

---

## ✨ Key Features Summary

- ✅ Complete trainer and course management
- ✅ Weekly schedule creation with predefined time slots
- ✅ Flexible module and trainer allocation to time slots
- ✅ Individual and bulk student enrollments
- ✅ Bulk file upload for student data
- ✅ Responsive UI with dropdowns and tables
- ✅ Error handling and user feedback
- ✅ Statistics and summary displays
- ✅ Duplicate enrollment prevention

---

## 🚀 Next Steps

1. Implement backend endpoints as specified
2. Test all features with sample data
3. Add validation on both frontend and backend
4. Implement authentication/authorization
5. Add role-based access control
6. Create comprehensive logging
7. Add data export functionality
8. Implement schedule conflict detection
9. Add email notifications for enrollments
10. Create admin dashboard with analytics

