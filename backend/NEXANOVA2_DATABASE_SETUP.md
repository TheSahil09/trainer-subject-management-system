# NEXANOVA2 Database Setup Guide

## Overview
Complete database schema for the Trainer Subject Management System with all tables, relationships, and sample data scripts.

---

## Database Name
**nexanova2** (MySQL)

---

## Prerequisites
- MySQL Server running (version 5.7 or higher)
- MySQL client or MySQL Workbench
- Credentials: 
  - Username: `root`
  - Password: `Database`

---

## Quick Setup Instructions

### Option 1: Using MySQL Command Line

1. **Open MySQL:**
```bash
mysql -u root -p
```

2. **Enter Password:**
```
Database
```

3. **Run the SQL Script:**
```sql
SOURCE c:\Users\Admin\Desktop\Trainer-Subject_Management\backend\nexanova2_database_schema.sql;
```

4. **Verify Database Created:**
```sql
SHOW DATABASES;
USE nexanova2;
SHOW TABLES;
```

---

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to MySQL Server using root credentials
3. Click: **File** → **Open SQL Script**
4. Select: `nexanova2_database_schema.sql`
5. Click: **Execute** (Lightning bolt icon)
6. Verify all tables are created

---

### Option 3: Using Terminal/PowerShell

```bash
cd c:\Users\Admin\Desktop\Trainer-Subject_Management\backend

# Execute the SQL file directly
mysql -u root -p Database < nexanova2_database_schema.sql
```

---

## Database Tables

### 1. **users**
Stores all user accounts (Admin, Student, Trainer)
```
Columns: id, name, email, password, role, created_at, updated_at
Roles: ADMIN, STUDENT, TRAINER
```
<!--  -->
<!-- ### 2. **subjects** -->
<!-- Course subjects offered -->
<!-- ``` -->
<!-- <!-- Columns: id, name, subject_code, description, department, credit_hours --> -->
<!-- ``` -->
<!--  -->
### 3. **trainers**
Trainer information
```
Columns: id, emp_id, name, email, phone, department, qualification, experience_years, subject_id
Foreign Key: subject_id → courses.id
```

### 4. **courses**
Courses offered
```
Columns: id, name, code, description, credits, trainer_id
Foreign Key: trainer_id → users.id
```

### 5. **modules**
Course modules/topics
```
Columns: id, name, module_code, description, course_id, duration_hours, status, sequence_number
Foreign Key: course_id → courses.id
```

### 6. **schedules**
Class schedules and time slots
```
Columns: id, week_start, day_of_week, slot, trainer_id, subject_id, status
Foreign Keys: trainer_id → trainers.id, course_id → course.id
```

### 7. **enrollments**
Student course enrollments
```
Columns: id, student_id, course_id, status, enrolled_date, updated_at
Foreign Keys: student_id → users.id, course_id → courses.id
Status: ENROLLED, COMPLETED, DROPPED
Unique: (student_id, course_id)
```

### 8. **password_reset**
Password reset tokens
```
Columns: id, user_id, reset_token, expiry_time, used, created_at
Foreign Key: user_id → users.id
```

---

## Entity Relationships

```
users (1) ←──→ (Many) courses [trainer_id]
users (1) ←──→ (Many) enrollments [student_id]

subjects (1) ←──→ (Many) trainers [subject_id]
subjects (1) ←──→ (Many) schedules [subject_id]

courses (1) ←──→ (Many) modules [course_id]
courses (1) ←──→ (Many) enrollments [course_id]

trainers (1) ←──→ (Many) schedules [trainer_id]

users (1) ←──→ (Many) password_reset [user_id]
```

---

## Sample Data (Optional)

The SQL script includes commented-out sample data. To insert sample data:

1. Uncomment the INSERT sections in the SQL file
2. Update the password hashes with bcrypt-encoded values
3. Execute the script again

**Note:** Password hashes should be generated using bcrypt. Example:
```
admin@example.com: password123 → $2a$10$slYQmyNdGzin7olVN3p5be4DQBYuuv8J8w...
```

---

## Application Configuration

### Update application.properties to use nexanova2:

```properties
# Option 1: Use nexanova2 (new database)
spring.datasource.url=jdbc:mysql://localhost:3306/nexanova2
spring.datasource.username=root
spring.datasource.password=Database
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Or keep nexanova_db (original database)
spring.datasource.url=jdbc:mysql://localhost:3306/nexanova_db
```

### Hibernate Configuration:
```properties
# Auto-create tables if they don't exist
spring.jpa.hibernate.ddl-auto=update

# Show SQL queries
spring.jpa.show-sql=true
```

---

## Verification Steps

After creating the database, verify:

```sql
-- Connect to database
USE nexanova2;

-- Check all tables exist
SHOW TABLES;

-- Expected output (8 tables):
-- enrollments
-- modules
-- password_reset
-- schedules
-- subjects
-- trainers
-- users
-- courses

-- Check table structures
DESCRIBE users;
DESCRIBE courses;
DESCRIBE enrollments;

-- Verify relationships
SHOW CREATE TABLE enrollments;
```

---

## Testing Connections

### 1. Test MySQL Connection
```bash
mysql -u root -p -h localhost -e "SELECT VERSION();"
```

### 2. Test Spring Boot Connection
```bash
cd c:\Users\Admin\Desktop\Trainer-Subject_Management\backend
mvn spring-boot:run
```

Check logs for:
```
Hibernate: create table if not exists enrollments
Hibernate: create table if not exists modules
...
Started TrainerSubjectAppApplication
```

---

## Troubleshooting

### Issue: "Access denied for user 'root'@'localhost'"
**Solution:** Verify MySQL password is "Database" in application.properties

### Issue: "Unknown database 'nexanova2'"
**Solution:** Run the SQL script first to create the database

### Issue: "Table already exists"
**Solution:** The script uses `CREATE TABLE IF NOT EXISTS` - this is safe to re-run

### Issue: "Foreign key constraint fails"
**Solution:** Ensure tables are created in order (the script handles this)

### Issue: Port 3306 not accessible
**Solution:** Start MySQL Server:
```bash
# Windows
net start MySQL80

# Or check Services: MySQL80 should be running
```

---

## Backup & Maintenance

### Backup Database:
```bash
mysqldump -u root -p nexanova2 > nexanova2_backup.sql
```

### Restore Database:
```bash
mysql -u root -p nexanova2 < nexanova2_backup.sql
```

### Clear All Data (Keep Schema):
```sql
USE nexanova2;
-- Be careful with this!
DELETE FROM enrollments;
DELETE FROM modules;
DELETE FROM courses;
DELETE FROM trainers;
-- DELETE FROM subjects;
DELETE FROM schedules;
DELETE FROM password_reset;
DELETE FROM users;
```

---

## Next Steps

1. ✅ Create database: Run the SQL script
2. ✅ Update application.properties (if needed)
3. ✅ Start MySQL Server
4. ✅ Start Spring Boot Backend: `mvn spring-boot:run`
5. ✅ Start React Frontend: `npm start`
6. ✅ Test login with sample accounts

---

## Support

For issues or questions:
- Check MySQL logs: `C:\Program Files\MySQL\MySQL Server 8.0\data\`
- Check Spring Boot logs: Terminal where mvn started
- Verify credentials: username=`root`, password=`Database`

---

**Last Updated:** January 21, 2026
**Database Version:** 1.0
**Compatible With:** MySQL 5.7+
