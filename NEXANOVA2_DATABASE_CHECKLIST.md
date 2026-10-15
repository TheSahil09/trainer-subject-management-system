# NEXANOVA2 Database - Setup Checklist

**Date Created:** January 21, 2026  
**Database Name:** nexanova2  
**Status:** ✅ Ready for Implementation  

---

## 📋 Pre-Setup Requirements

### System Requirements
- [ ] Windows 10 or higher
- [ ] MySQL Server 5.7+ installed
- [ ] MySQL Server running on port 3306
- [ ] MySQL root user with password "Database"
- [ ] Java 11+ for Spring Boot
- [ ] Node.js + npm for React frontend
- [ ] PowerShell or Command Prompt access

### Verify MySQL Installation
```bash
# Check MySQL version
mysql --version

# Test connection
mysql -u root -p
# Enter password: Database
# Type: EXIT to exit
```

---

## 🗂️ Files Checklist

### Database Files Created
- [ ] `backend/nexanova2_database_schema.sql` (Main SQL script)
- [ ] `backend/NEXANOVA2_DATABASE_SETUP.md` (Detailed setup guide)
- [ ] `HOW_TO_CREATE_NEXANOVA2_DATABASE.md` (Quick start guide)
- [ ] `NEXANOVA2_DATABASE_SUMMARY.md` (Project summary)
- [ ] `NEXANOVA2_DATABASE_DIAGRAM.md` (ER diagrams)
- [ ] `NEXANOVA2_DATABASE_CHECKLIST.md` (This file)

### Verify Files Exist
```bash
ls "C:\Users\Admin\Desktop\Trainer-Subject_Management\backend\nexanova2_database_schema.sql"
ls "C:\Users\Admin\Desktop\Trainer-Subject_Management\backend\NEXANOVA2_DATABASE_SETUP.md"
```

---

## 🚀 Database Creation Steps

### Step 1: Prepare MySQL
- [ ] MySQL Server is running
  ```bash
  Get-Service MySQL80 | Format-List
  # Should show Status: Running
  ```

- [ ] Verify MySQL connection
  ```bash
  mysql -u root -pDatabase -e "SELECT VERSION();"
  # Should show version number
  ```

### Step 2: Create Database

**Choose ONE method:**

#### Method A: PowerShell (Fastest)
```bash
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysql -u root -pDatabase < "C:\Users\Admin\Desktop\Trainer-Subject_Management\backend\nexanova2_database_schema.sql"
```
- [ ] Command executed without errors
- [ ] Verify with: `mysql -u root -pDatabase -e "SHOW DATABASES;" | findstr nexanova2`

#### Method B: MySQL Command Line
```bash
mysql -u root -p
# Enter password: Database
SOURCE C:\Users\Admin\Desktop\Trainer-Subject_Management\backend\nexanova2_database_schema.sql;
SHOW TABLES;
EXIT;
```
- [ ] All commands executed
- [ ] 8 tables shown in output

#### Method C: MySQL Workbench
- [ ] Open MySQL Workbench
- [ ] Connect to MySQL Server
- [ ] File → Open SQL Script
- [ ] Select: nexanova2_database_schema.sql
- [ ] Click Execute (⚡)
- [ ] Verify in Database dropdown

#### Method D: VS Code (with MySQL extension)
- [ ] MySQL extension installed
- [ ] Connection configured
- [ ] SQL file opened in editor
- [ ] Executed with Run Query
- [ ] Verified in MySQL Explorer

### Step 3: Verify Database Creation

```sql
-- Connect to database
mysql -u root -pDatabase

-- Show all databases
SHOW DATABASES;
```
- [ ] `nexanova2` appears in list

```sql
-- Use nexanova2
USE nexanova2;

-- Show all tables
SHOW TABLES;
```
- [ ] All 8 tables present:
  - [ ] courses
  - [ ] enrollments
  - [ ] modules
  - [ ] password_reset
  - [ ] schedules
  - [ ] subjects
  - [ ] trainers
  - [ ] users

### Step 4: Verify Table Structure

```sql
-- Verify users table
DESCRIBE users;
```
- [ ] Columns match specification
- [ ] PK: id BIGINT
- [ ] Email: VARCHAR UNIQUE
- [ ] Role: ENUM

```sql
-- Check all tables
DESCRIBE subjects;
DESCRIBE trainers;
DESCRIBE courses;
DESCRIBE modules;
DESCRIBE schedules;
DESCRIBE enrollments;
DESCRIBE password_reset;
```
- [ ] All tables have correct columns
- [ ] Foreign keys present
- [ ] Indexes created

---

## 🔧 Configuration Steps

### Step 1: Update Spring Boot Configuration

Edit: `backend/src/main/resources/application.properties`

- [ ] **Option A:** Use nexanova2 (NEW)
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/nexanova2
  spring.datasource.username=root
  spring.datasource.password=Database
  ```

- [ ] **Option B:** Keep nexanova_db (OLD)
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/nexanova_db
  spring.datasource.username=root
  spring.datasource.password=Database
  ```

- [ ] JPA Hibernate settings
  ```properties
  spring.jpa.hibernate.ddl-auto=update
  spring.jpa.show-sql=true
  ```

- [ ] Server configuration
  ```properties
  server.port=8080
  ```

- [ ] Verify file saved

### Step 2: Verify Frontend Configuration

File: `frontend/src/services/authService.js`

- [ ] Backend URL configured
  ```javascript
  const BASE_URL = "http://localhost:8080/api";
  ```

- [ ] All service files configured:
  - [ ] authService.js
  - [ ] courseService.js
  - [ ] enrollmentService.js
  - [ ] scheduleService.js
  - [ ] subjectService.js
  - [ ] trainerService.js

---

## 🏃 Application Startup Checklist

### Backend Startup

- [ ] Navigate to backend:
  ```bash
  cd C:\Users\Admin\Desktop\Trainer-Subject_Management\backend
  ```

- [ ] Build project:
  ```bash
  mvn clean install
  ```
  - [ ] Build successful (BUILD SUCCESS)
  - [ ] No compilation errors

- [ ] Start Spring Boot:
  ```bash
  mvn spring-boot:run
  ```
  - [ ] Application starts
  - [ ] Port 8080 shows: "Started TrainerSubjectAppApplication"
  - [ ] No database connection errors
  - [ ] No SQL syntax errors

- [ ] Verify logs contain:
  - [ ] "Hibernate: create table if not exists..." (for nexanova2)
  - [ ] "Server started on port 8080"
  - [ ] "Application ready to receive requests"

### Frontend Startup

- [ ] Open new terminal/PowerShell

- [ ] Navigate to frontend:
  ```bash
  cd C:\Users\Admin\Desktop\Trainer-Subject_Management\frontend
  ```

- [ ] Install dependencies (if needed):
  ```bash
  npm install
  ```
  - [ ] All packages installed
  - [ ] No critical vulnerabilities

- [ ] Start React:
  ```bash
  npm start
  ```
  - [ ] Application compiles
  - [ ] Browser opens at http://localhost:3000
  - [ ] Login page displays

---

## 🧪 Functional Testing

### Test 1: Database Connectivity
- [ ] Backend starts without errors
- [ ] No "Connection refused" errors
- [ ] No "Access denied" errors
- [ ] Logs show successful Hibernate configuration

### Test 2: User Authentication
- [ ] Navigate to http://localhost:3000/login
- [ ] Register new account:
  ```
  Name: Test User
  Email: test@example.com
  Password: password123
  Role: STUDENT
  ```
  - [ ] Registration successful
  - [ ] Data saved in users table

- [ ] Login with new account:
  - [ ] Email: test@example.com
  - [ ] Password: password123
  - [ ] Login successful
  - [ ] Redirected to student/dashboard

### Test 3: Data Persistence
- [ ] Create subject:
  ```bash
  # Admin dashboard → Subjects
  Name: Test Subject
  Code: TEST101
  ```
  - [ ] Subject created
  - [ ] Data visible in subjectpage
  - [ ] Entry in subjects table

- [ ] Verify in database:
  ```sql
  USE nexanova2;
  SELECT * FROM subjects;
  ```
  - [ ] New subject visible

### Test 4: Relationships
- [ ] Create course with trainer
  - [ ] course.trainer_id set correctly
  - [ ] FK constraint enforced

- [ ] Create module in course
  - [ ] module.course_id set correctly
  - [ ] Proper relationship established

- [ ] Enroll student in course
  - [ ] enrollments entry created
  - [ ] Both FKs populated
  - [ ] Unique constraint prevents duplicates

### Test 5: Password Reset
- [ ] Click "Forgot Password"
- [ ] Enter email
- [ ] Check for reset token in password_reset table:
  ```sql
  SELECT * FROM password_reset WHERE user_id = ?;
  ```
  - [ ] Token exists
  - [ ] expiry_time is in future
  - [ ] used = FALSE

---

## 🔍 Database Inspection Queries

### Verify Data Integrity

```sql
-- Check user count
SELECT COUNT(*) as total_users FROM users;

-- Check unique emails
SELECT COUNT(*) as total_emails, COUNT(DISTINCT email) as unique_emails FROM users;
-- Should be equal (no duplicates)

-- Check enrollments
SELECT s.name as student, c.name as course, e.status 
FROM enrollments e
JOIN users s ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id;

-- Check modules in courses
SELECT c.name as course, m.name as module, m.sequence_number
FROM modules m
JOIN courses c ON m.course_id = c.id
ORDER BY c.id, m.sequence_number;

-- Check trainers by subject
SELECT t.name as trainer, s.name as subject
FROM trainers t
JOIN subjects s ON t.subject_id = s.id;
```

- [ ] All queries execute successfully
- [ ] Results match expected data
- [ ] No orphaned records

---

## 📊 Database Backup

### Create Initial Backup
```bash
cd C:\Program Files\MySQL\MySQL Server 8.0\bin
mysqldump -u root -pDatabase nexanova2 > C:\backup\nexanova2_backup_20260121.sql
```

- [ ] Backup file created
- [ ] File size > 10 KB
- [ ] SQL statements visible in file

### Schedule Regular Backups
- [ ] Daily backup script created (optional)
- [ ] Backup location documented
- [ ] Restore procedure tested

---

## 🧹 Cleanup & Documentation

### Documentation
- [ ] All 6 documentation files reviewed:
  - [ ] nexanova2_database_schema.sql - SQL script
  - [ ] NEXANOVA2_DATABASE_SETUP.md - Detailed guide
  - [ ] HOW_TO_CREATE_NEXANOVA2_DATABASE.md - Quick start
  - [ ] NEXANOVA2_DATABASE_SUMMARY.md - Overview
  - [ ] NEXANOVA2_DATABASE_DIAGRAM.md - ER diagrams
  - [ ] NEXANOVA2_DATABASE_CHECKLIST.md - This file

### Team Communication
- [ ] Team notified of new database
- [ ] Documentation shared
- [ ] Connection credentials updated in team resources
- [ ] Setup instructions provided

### Development Environment
- [ ] Local database working
- [ ] Staging database ready (optional)
- [ ] Production database ready (optional)

---

## 🎯 Success Criteria

Your setup is complete when:

✅ **Database Layer**
- [ ] nexanova2 database created
- [ ] All 8 tables present
- [ ] All relationships established
- [ ] Indexes created
- [ ] Constraints enforced

✅ **Backend Layer**
- [ ] Spring Boot application starts
- [ ] No database connection errors
- [ ] Hibernate creates/updates tables
- [ ] All APIs respond to requests
- [ ] Port 8080 accessible

✅ **Frontend Layer**
- [ ] React application loads
- [ ] Login page displays
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Dashboard loads user data

✅ **Integration**
- [ ] Data flows from frontend → backend → database
- [ ] Database changes visible in frontend
- [ ] All CRUD operations work
- [ ] Foreign key constraints enforced

✅ **Documentation**
- [ ] Setup guide understood
- [ ] Database schema documented
- [ ] Team trained on structure
- [ ] Backup procedure established

---

## 📞 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| MySQL not running | `Start-Service MySQL80` |
| Connection refused | Check port 3306, restart MySQL |
| Table not found | Verify script was executed completely |
| FK constraint fails | Ensure tables created in order |
| Password denied | Verify password is "Database" |
| Spring Boot won't start | Check application.properties URL |
| Frontend can't reach backend | Verify port 8080 is accessible |

---

## 📋 Final Sign-Off

- [ ] Database created successfully
- [ ] Backend running without errors
- [ ] Frontend accessible and responsive
- [ ] Data persists in database
- [ ] All team members notified
- [ ] Documentation completed
- [ ] Backup created

---

**Project:** Trainer Subject Management System  
**Database:** nexanova2  
**Created:** January 21, 2026  
**Status:** ✅ READY FOR PRODUCTION  

**Completed By:** _________________  
**Date:** _________________  
**Notes:** ________________________________________________________

---

## 📚 Additional Resources

1. **Setup Guides**
   - Quick Start: HOW_TO_CREATE_NEXANOVA2_DATABASE.md
   - Detailed: NEXANOVA2_DATABASE_SETUP.md

2. **Technical Documentation**
   - Schema: NEXANOVA2_DATABASE_SUMMARY.md
   - Diagrams: NEXANOVA2_DATABASE_DIAGRAM.md

3. **MySQL Documentation**
   - Official: https://dev.mysql.com/doc/
   - Workbench: https://dev.mysql.com/doc/workbench/en/

4. **Spring Boot Documentation**
   - JPA/Hibernate: https://spring.io/projects/spring-data-jpa
   - Application Config: https://spring.io/projects/spring-boot

5. **Support**
   - Database issues: Check MySQL error logs
   - Connection issues: Verify application.properties
   - API issues: Check Spring Boot console logs

---

**Setup Complete! 🎉**

Your nexanova2 database is ready for the Trainer Subject Management System.
