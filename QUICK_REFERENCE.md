# 🚀 Quick Reference Guide

## Start the Application

### Terminal 1 - Frontend
```bash
cd c:\Users\Admin\Desktop\Trainer-Subject_Management\frontend
npm install
npm start
# Opens http://localhost:3000
```

### Terminal 2 - Backend
```bash
# In your Spring Boot project directory
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080
```

---

## Admin Features Quick Access

| Feature | URL | Time Slots | Purpose |
|---------|-----|-----------|---------|
| **View Trainers** | `/admin/view-trainers-courses` | N/A | See all trainers and their subjects |
| **View Courses** | `/admin/view-trainers-courses` | N/A | See courses with modules |
| **Schedule Builder** | `/admin/schedule-builder` | 4/day × 7days = 28 | Create blank & allocate slots |
| **Enrollments** | `/admin/student-enrollments` | N/A | Enroll students individually |
| **Bulk Operations** | `/admin/bulk-operations` | N/A | Upload students & bulk enroll |
| **Dashboard** | `/admin/dashboard` | N/A | Admin overview & stats |

---

## Test Accounts (to be created in backend)

### Admin Account
```
Email: admin@test.com
Password: password123
Role: ADMIN
```

### Student Account
```
Email: student@test.com
Password: password123
Role: STUDENT
```

---

## File Structure at a Glance

```
frontend/
├── src/
│   ├── pages/admin/              → All admin pages
│   ├── pages/student/            → All student pages
│   ├── services/                 → API calls
│   ├── components/               → Reusable components
│   ├── context/                  → Auth context
│   ├── App.js                    → Main router
│   └── index.js                  → Entry point
├── package.json                  → Dependencies
├── ADMIN_FEATURES.md            → Feature details
├── SETUP_AND_TESTING_GUIDE.md   → Setup instructions
└── PROJECT_SUMMARY.md           → Overview
```

---

## npm Commands

```bash
# Install all dependencies
npm install

# Add missing package
npm install react-router-dom@^6.20.0

# Start development server
npm start

# Build for production
npm build

# Run tests
npm test

# Check for issues
npm list

# Update packages
npm update
```

---

## Important Routes

### Public Routes
```
/login          - Login page
/register       - Register page
```

### Admin Routes
```
/admin/dashboard               - Admin home
/admin/view-trainers-courses  - View trainers & courses (FR-01, FR-02)
/admin/subjects               - Manage subjects
/admin/trainers               - Manage trainers
/admin/courses                - Manage courses
/admin/modules                - Manage modules
/admin/schedule-builder       - Create schedules (FR-03, FR-04)
/admin/schedules              - Manage schedules
/admin/student-enrollments    - Enroll students (FR-05)
/admin/bulk-operations        - Upload & bulk enroll (FR-06, FR-07)
/admin/enrollments            - Manage enrollments
/admin/users                  - Manage users
/admin/timetable              - View all schedules
```

### Student Routes
```
/student/dashboard            - Student home
/student/timetable           - View personal schedule
/student/courses             - View enrolled courses
```

---

## Feature Implementation Files

### FR-Admin-01 & FR-02: View Trainers & Courses
- **File:** `src/pages/admin/ViewTrainersCoursesPage.js`
- **Route:** `/admin/view-trainers-courses`
- **Components:** Trainer cards, Expandable course list with modules
- **API:** GET /api/trainer, GET /api/courses, GET /api/modules

### FR-Admin-03 & FR-04: Schedule Builder
- **File:** `src/pages/admin/ScheduleBuilderPage.js`
- **Route:** `/admin/schedule-builder`
- **Components:** Schedule form, Time slot allocation form, Schedule details view
- **API:** POST /api/schedules/create-blank, PUT /api/schedules/slot/{slotId}  (alias /api/schedule/* also works)

### FR-Admin-05: Student Enrollment
- **File:** `src/pages/admin/StudentEnrollmentsPage.js`
- **Route:** `/admin/student-enrollments`
- **Components:** Enrollment form, Enrollments table, Filter options
- **API:** POST /api/enrollment, GET /api/enrollment, DELETE /api/enrollment/{id}

### FR-Admin-06 & FR-07: Bulk Operations
- **File:** `src/pages/admin/BulkOperationsPage.js`
- **Route:** `/admin/bulk-operations`
- **Components:** File upload, Student checkboxes, Course selector
- **API:** POST /api/student/bulk-upload, POST /api/enrollments/bulk-enroll (alias /api/enrollment/* works)

---

## API Response Examples

### Create Blank Schedule
```json
POST /api/schedule/create-blank
Request:
{
  "name": "Week 1",
  "startDate": "2026-01-20",
  "days": ["Monday", "Tuesday", ...],
  "timeSlots": [
    {"label": "8 AM - 11 AM", "start": "08:00", "end": "11:00"}
  ]
}

Response:
{
  "id": 1,
  "name": "Week 1",
  "startDate": "2026-01-20",
  "slots": [28 empty slots]
}
```

### Allocate Time Slot
```json
POST /api/schedule/1/allocate-slot
Request:
{
  "day": "Monday",
  "startTime": "08:00",
  "endTime": "11:00",
  "moduleId": 1,
  "trainerId": 2
}

Response:
{
  "id": 1,
  "day": "Monday",
  "startTime": "08:00",
  "endTime": "11:00",
  "moduleName": "Variables",
  "trainerName": "John"
}
```

### Bulk Upload Students
```json
POST /api/student/bulk-upload
Content-Type: multipart/form-data
file: [CSV file]

Response:
{
  "count": 50,
  "message": "Successfully uploaded 50 students"
}
```

### Bulk Enroll Students
```json
POST /api/enrollment/bulk-enroll
Request:
{
  "studentIds": [1, 2, 3, 4, 5],
  "courseId": 2
}

Response:
{
  "count": 5,
  "message": "Successfully enrolled 5 students"
}
```

---

## Troubleshooting Quick Fixes

### Frontend won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Missing react-router-dom
```bash
npm install react-router-dom@^6.20.0
```

### Backend connection error
- Verify backend runs on `http://localhost:8080`
- Check `BASE_URL` in services is correct
- Check CORS settings in Spring Boot

### Login not working
- Verify user exists with ADMIN/STUDENT role
- Check token storage in localStorage
- Clear localStorage and retry

### Sidebar not showing
- Ensure you're logged in
- Verify route starts with `/admin` or `/student`
- Check user role is set

---

## Database Setup

### Create test subject
```sql
INSERT INTO subject (name, description) VALUES 
('Java Programming', 'Core Java concepts');
```

### Create test trainer
```sql
INSERT INTO trainer (emp_id, name, email, subject_id) VALUES 
('T001', 'John Trainer', 'john@trainer.com', 1);
```

### Create test student
```sql
INSERT INTO student (name, email, phone, address) VALUES 
('Test Student', 'student@test.com', '1234567890', '123 Main St');
```

---

## Testing Workflow

### Step 1: Login
```
Navigate to /login
Enter admin credentials
Should redirect to /admin/dashboard
```

### Step 2: Create Schedule
```
Navigate to /admin/schedule-builder
Enter schedule name and start date
Click "Create Blank Schedule"
Verify success message
```

### Step 3: Allocate Slots
```
Select schedule from dropdown
Select Monday
Select 8 AM - 11 AM
Select a module
Select a trainer
Click "Allocate Time Slot"
View schedule details to verify
```

### Step 4: Enroll Student
```
Navigate to /admin/student-enrollments
Select a student
Select a course
Click "Enroll Student"
Verify in enrollments table
```

### Step 5: Bulk Upload
```
Navigate to /admin/bulk-operations
Prepare CSV file with students
Select file
Click "Upload Students"
Verify success count
```

### Step 6: Bulk Enroll
```
Check multiple students
Select course
Click "Enroll X Student(s)"
Verify all enrolled
```

---

## Key Keyboard Shortcuts

```
Ctrl + Shift + I    - Open developer tools
Ctrl + L            - Focus address bar
Ctrl + R            - Refresh page
Ctrl + K            - Search in project (VS Code)
```

---

## Environment Variables

Create `.env` file in frontend root (if needed):
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_TIMEOUT=5000
```

---

## Performance Tips

1. Use React DevTools to debug
2. Check Network tab for API calls
3. Monitor Console for errors
4. Use localStorage inspection
5. Check browser performance tab

---

## Documentation Files

1. **ADMIN_FEATURES.md** - Detailed feature documentation
2. **SETUP_AND_TESTING_GUIDE.md** - Setup and testing procedures
3. **PROJECT_SUMMARY.md** - Complete project overview
4. **QUICK_REFERENCE.md** - This file

---

## Contact Points

- Check browser Console (F12)
- Check Network tab for API responses
- Review backend logs
- Check database for data persistence
- Verify file upload size limits

---

**Version:** 1.0  
**Last Updated:** January 21, 2026  
**Status:** ✅ Ready for Backend Integration

