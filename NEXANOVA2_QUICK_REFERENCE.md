# 🎯 NEXANOVA2 Database - QUICK REFERENCE CARD

**Print This for Easy Access!**

---

## 📊 DATABASE AT A GLANCE

| Item | Details |
|------|---------|
| **Database Name** | nexanova2 |
| **Tables** | 8 |
| **Columns** | ~60 |
| **Relationships** | 11 |
| **Setup Time** | 5 minutes |
| **Status** | ✅ Ready |

---

## 📂 TABLES CREATED

```
1. users           → User accounts
2. subjects        → Topics offered
3. trainers        → Trainer info
4. courses         → Courses available
5. modules         → Course modules
6. schedules       → Class schedules
7. enrollments     → Student registrations
8. password_reset  → Reset tokens
```

---

## ⚡ FASTEST SETUP (5 Minutes)

```powershell
# 1. Open PowerShell
# 2. Run this command:
mysql -u root -pDatabase < "C:\Users\Admin\Desktop\Trainer-Subject_Management\backend\nexanova2_database_schema.sql"

# 3. Verify:
mysql -u root -pDatabase -e "USE nexanova2; SHOW TABLES;"

# 4. You should see 8 tables listed ✅
```

---

## 📚 WHICH FILE TO READ?

| Need | Read This |
|------|-----------|
| **Quick Setup** | HOW_TO_CREATE_NEXANOVA2_DATABASE.md |
| **Overview** | NEXANOVA2_DATABASE_SUMMARY.md |
| **Diagrams** | NEXANOVA2_DATABASE_DIAGRAM.md |
| **Details** | backend/NEXANOVA2_DATABASE_SETUP.md |
| **Verify** | NEXANOVA2_DATABASE_CHECKLIST.md |
| **Navigate** | NEXANOVA2_DATABASE_INDEX.md |

---

## 🔧 SPRING BOOT CONFIGURATION

**File:** `backend/src/main/resources/application.properties`

```properties
# Database Connection
spring.datasource.url=jdbc:mysql://localhost:3306/nexanova2
spring.datasource.username=root
spring.datasource.password=Database
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Server
server.port=8080
```

---

## 🚀 START APPLICATION

```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend
cd frontend
npm start

# Browser opens at: http://localhost:3000
```

---

## 🧪 TEST LOGIN

```
Email: admin@example.com
Password: password123
Role: ADMIN
```

---

## 💾 BACKUP DATABASE

```bash
mysqldump -u root -pDatabase nexanova2 > C:\backup\nexanova2_backup.sql
```

## 📥 RESTORE DATABASE

```bash
mysql -u root -pDatabase nexanova2 < C:\backup\nexanova2_backup.sql
```

---

## 🔗 DATABASE RELATIONSHIPS

```
users ───────────→ courses
users ───────────→ enrollments
users ───────────→ password_reset
subjects ────────→ trainers
subjects ────────→ schedules
trainers ────────→ schedules
courses ─────────→ modules
courses ─────────→ enrollments
```

---

## 📋 VERIFY SETUP

```sql
-- Check database exists
SHOW DATABASES;

-- Check tables created
USE nexanova2;
SHOW TABLES;

-- Check table structure
DESCRIBE users;

-- Check relationships
SHOW CREATE TABLE enrollments;
```

---

## 🆘 COMMON ISSUES

| Problem | Solution |
|---------|----------|
| MySQL not running | `Start-Service MySQL80` |
| Connection refused | Verify MySQL is running on :3306 |
| Access denied | Check password is "Database" |
| Table not found | Rerun SQL script completely |
| Spring Boot won't connect | Check application.properties URL |

---

## 📞 SUPPORT

**Setup Issues?**
→ Read: HOW_TO_CREATE_NEXANOVA2_DATABASE.md

**Database Structure?**
→ View: NEXANOVA2_DATABASE_DIAGRAM.md

**Need Details?**
→ Read: backend/NEXANOVA2_DATABASE_SETUP.md

**Verify Everything?**
→ Follow: NEXANOVA2_DATABASE_CHECKLIST.md

---

## ✅ SUCCESS CHECKLIST

- [ ] Database created
- [ ] All 8 tables present
- [ ] Spring Boot configured
- [ ] Backend starts successfully
- [ ] Frontend loads
- [ ] Can login successfully
- [ ] Data persists
- [ ] Backup created

---

## 📊 TABLE QUICK REFERENCE

### users
```
Columns: id, name, email, password, role, created_at, updated_at
Role: ADMIN, STUDENT, TRAINER
Key: email (unique, indexed)
```

### courses
```
Columns: id, name, code, description, credits, trainer_id
Foreign Key: trainer_id → users.id
Key: code (unique)
```

### enrollments
```
Columns: id, student_id, course_id, status, enrolled_date
Status: ENROLLED, COMPLETED, DROPPED
Unique: (student_id, course_id) - prevents duplicates
```

### modules
```
Columns: id, name, module_code, description, course_id, duration_hours, status
Foreign Key: course_id → courses.id (CASCADE)
Key: module_code (unique)
```

### schedules
```
Columns: id, week_start, day_of_week, slot, trainer_id, subject_id, status
Status: AVAILABLE, ASSIGNED, COMPLETED
Foreign Keys: trainer_id, subject_id
```

---

## 🎯 LEARNING PATHS

### Beginner (30 min)
1. NEXANOVA2_DATABASE_SUMMARY.md
2. NEXANOVA2_DATABASE_DIAGRAM.md
3. HOW_TO_CREATE_NEXANOVA2_DATABASE.md
4. Create database

### Developer (45 min)
1. backend/NEXANOVA2_DATABASE_SETUP.md
2. NEXANOVA2_DATABASE_DIAGRAM.md
3. nexanova2_database_schema.sql
4. Configure & test

### Complete (90 min)
1. Read all documentation
2. Study all diagrams
3. Follow checklist
4. Create & verify
5. Run all tests

---

## 🔐 SECURITY NOTES

- Passwords are bcrypt-hashed
- Reset tokens are cryptographically secure
- Foreign keys prevent orphaned data
- Role-based access (ADMIN, STUDENT, TRAINER)
- Email uniqueness enforced
- Password reset tokens time-limited

---

## 📦 FILES PROVIDED

```
nexanova2_database_schema.sql             - SQL Script
HOW_TO_CREATE_NEXANOVA2_DATABASE.md      - Quick Start
NEXANOVA2_DATABASE_SUMMARY.md            - Summary
NEXANOVA2_DATABASE_DIAGRAM.md            - Diagrams
NEXANOVA2_DATABASE_SETUP.md             - Details
NEXANOVA2_DATABASE_CHECKLIST.md         - Checklist
NEXANOVA2_DATABASE_INDEX.md             - Navigation
NEXANOVA2_SETUP_COMPLETE.md             - Status
NEXANOVA2_DELIVERY_SUMMARY.md           - Overview
NEXANOVA2_QUICK_REFERENCE.md            - This File
```

---

## 🎉 YOU'RE READY!

Everything you need is included and documented.

**Next Step:** Choose your setup path and get started! 🚀

---

**Bookmark This Page for Quick Reference!**

---

Created: January 21, 2026  
Status: ✅ Complete
