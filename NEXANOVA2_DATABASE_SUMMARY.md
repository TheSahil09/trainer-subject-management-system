# NEXANOVA2 Database - Complete Summary

**Created:** January 21, 2026  
**Database Name:** nexanova2  
**Status:** ✅ Ready for Setup  
**MySQL Version:** 5.7+  

---

## 📋 What Has Been Created

### 1. **SQL Schema File**
📁 **File:** `backend/nexanova2_database_schema.sql`
- Complete database creation script
- All 8 tables with relationships
- Indexes and constraints
- Sample data scripts (commented)
- 500+ lines of well-documented SQL

### 2. **Setup Guide**
📁 **File:** `backend/NEXANOVA2_DATABASE_SETUP.md`
- Detailed table descriptions
- Database relationships
- Configuration instructions
- Verification steps
- Troubleshooting guide

### 3. **Quick Start Guide**
📁 **File:** `HOW_TO_CREATE_NEXANOVA2_DATABASE.md`
- Step-by-step instructions
- 4 different methods to create database
- Common issues and solutions
- Testing procedures

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Create Database
**Using PowerShell (Recommended):**
```bash
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysql -u root -pDatabase < "C:\Users\Admin\Desktop\Trainer-Subject_Management\backend\nexanova2_database_schema.sql"
```

### Step 2: Verify
```bash
mysql -u root -pDatabase -e "USE nexanova2; SHOW TABLES;"
```

**Expected Output:**
```
courses
enrollments
modules
password_reset
schedules
subjects
trainers
users
```

### Step 3: Update Application (Optional)
Edit: `backend/src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/nexanova2
```

### Step 4: Start Application
```bash
cd backend
mvn spring-boot:run
```

---

## 📊 Database Structure

### Tables (8 Total)

| Table | Purpose | Records | Keys |
|-------|---------|---------|------|
| **users** | Users (Admin, Student, Trainer) | Multiple | Email unique, Role indexed |
| **subjects** | Course subjects | Multiple | Name/Code unique |
| **trainers** | Trainer information | Multiple | Emp_ID unique, FK to subjects |
| **courses** | Courses offered | Multiple | Code unique, FK to users |
| **modules** | Course modules | Multiple | Module_Code unique, FK to courses |
| **schedules** | Class schedules/slots | Multiple | FK to trainers & subjects |
| **enrollments** | Student enrollments | Multiple | FK to users & courses, unique pair |
| **password_reset** | Reset tokens | Multiple | FK to users, token unique |

---

## 🔗 Entity Relationships

```
┌─────────┐
│ users   │◄─────────────────────┐
└────┬────┘                      │
     │ trainer_id                │ student_id
     │                           │
     ▼                           │
┌─────────────┐           ┌──────────────┐
│ courses     │           │ enrollments  │
└────┬────────┘           └──────────────┘
     │ course_id                  ▲
     │                            │ course_id
     ▼                            │
┌──────────┐      ┌──────────┐   │
│ modules  │      │ subjects │◄──┘
└──────────┘      └────┬─────┘
                       │
                       │ subject_id
                       ▼
                  ┌──────────┐
                  │ trainers │
                  └────┬─────┘
                       │
                       │ trainer_id
                       ▼
                  ┌──────────────┐
                  │ schedules    │
                  └──────────────┘

┌─────────────────────┐
│ password_reset      │ ─── FK: user_id
└─────────────────────┘
```

---

## ✨ Features

### Column Types
- **ID Fields:** BIGINT AUTO_INCREMENT (Large scale support)
- **Strings:** VARCHAR(255) with proper constraints
- **Status Fields:** ENUM for type safety
- **Timestamps:** Automatic creation & update tracking

### Data Integrity
- Foreign key constraints
- Unique constraints on emails and codes
- NOT NULL on required fields
- CASCADE deletes where appropriate

### Performance
- Indexed columns for fast queries:
  - email (users)
  - role (users)
  - subject_id (trainers)
  - course_id (modules)
  - student_id & course_id (enrollments)

### Security
- Password field for encrypted passwords
- Reset token table for password recovery
- Role-based access (ADMIN, STUDENT, TRAINER)
- Email uniqueness enforcement

---

## 📝 Table Details

### users
```
- Admin, Student, Trainer accounts
- Email: unique, indexed
- Role: ENUM (ADMIN, STUDENT, TRAINER)
- Timestamps: auto-managed
```

### subjects
```
- Mathematics, Physics, Chemistry, etc.
- Code: unique identifier
- Department: optional categorization
- Credit hours: academic credit value
```

### trainers
```
- Employee information
- Emp_ID: unique identifier
- Subject: foreign key relationship
- Qualifications & experience tracking
```

### courses
```
- Courses offered by trainers
- Trainer: foreign key to users
- Credits: academic value
- Description: full course details
```

### modules
```
- Topics/modules within courses
- Sequence: ordered module access
- Duration: hours required
- Status: ACTIVE/INACTIVE tracking
```

### schedules
```
- Weekly schedules with time slots
- Week start date: identifies the week
- Day & Slot: time identification
- Status: AVAILABLE, ASSIGNED, COMPLETED
```

### enrollments
```
- Student course registrations
- Student & Course: composite key prevents duplicates
- Status: ENROLLED, COMPLETED, DROPPED
- Timestamps: enrollment tracking
```

### password_reset
```
- Secure password reset functionality
- Reset token: unique, cryptographically secure
- Expiry time: time-limited tokens
- Used flag: prevents token reuse
```

---

## 🚀 Getting Started

### Files Location
```
Trainer-Subject_Management/
├── backend/
│   ├── nexanova2_database_schema.sql          ← SQL Script
│   ├── NEXANOVA2_DATABASE_SETUP.md           ← Detailed Guide
│   ├── src/main/resources/
│   │   └── application.properties             ← Config (update if needed)
│   └── ...
├── HOW_TO_CREATE_NEXANOVA2_DATABASE.md       ← Quick Start Guide
└── ...
```

### Prerequisites
- ✅ MySQL Server running
- ✅ MySQL root credentials (user: root, pass: Database)
- ✅ SQL script file
- ✅ Java Spring Boot (backend)
- ✅ Node.js (frontend)

### Setup Checklist
- [ ] MySQL Server running
- [ ] Execute SQL script
- [ ] Verify 8 tables created
- [ ] Update application.properties (if needed)
- [ ] Start Spring Boot backend
- [ ] Start React frontend
- [ ] Test login

---

## 🔐 Security Notes

1. **Passwords:** Should be bcrypt-hashed before storage
2. **Reset Tokens:** Cryptographically secure, time-limited
3. **Foreign Keys:** Prevent orphaned records
4. **Role-Based:** ADMIN, STUDENT, TRAINER roles enforced
5. **Email Uniqueness:** Prevents duplicate accounts

---

## 📱 Frontend-Backend Integration

### API Endpoints Using nexanova2

```
/api/users          → GET/POST users from users table
/api/subjects       → GET/POST subjects
/api/trainers       → GET/POST trainers
/api/courses        → GET/POST courses
/api/modules        → GET/POST modules
/api/schedules      → GET/POST schedules
/api/enrollments    → GET/POST enrollments
/api/auth           → Authentication, password reset
```

---

## 🆘 Support & Troubleshooting

### Common Issues
1. **MySQL not running:** Start MySQL service
2. **Wrong password:** Verify "Database" in credentials
3. **Database not found:** Run SQL script first
4. **Connection timeout:** Check MySQL port 3306 is accessible
5. **FK constraints:** Ensure tables created in order (script handles this)

### Debug Commands
```bash
# Check MySQL running
Get-Service MySQL80

# Test connection
mysql -u root -pDatabase -e "SELECT VERSION();"

# Verify database
mysql -u root -pDatabase -e "SHOW DATABASES; USE nexanova2; SHOW TABLES;"

# Check Spring Boot logs
# Look for: "Hibernate: create table..."
```

---

## 📞 Next Steps

1. **Create Database:** Run the SQL script
2. **Start Backend:** `mvn spring-boot:run`
3. **Start Frontend:** `npm start`
4. **Login:** Use test credentials
5. **Manage Data:** Use admin dashboard

---

## 📦 What's Included

✅ **nexanova2_database_schema.sql** - Production-ready SQL  
✅ **NEXANOVA2_DATABASE_SETUP.md** - Comprehensive guide  
✅ **HOW_TO_CREATE_NEXANOVA2_DATABASE.md** - Quick start  
✅ **NEXANOVA2_DATABASE_SUMMARY.md** - This file  

---

## 🎓 Educational Notes

### Normalization
- Database is in 3NF (Third Normal Form)
- No data redundancy
- Referential integrity maintained

### Design Patterns
- **Foreign Keys:** Maintain relationships
- **Indexes:** Optimize query performance
- **Constraints:** Enforce data validity
- **Timestamps:** Track data changes

### Best Practices
- Meaningful table/column names
- Consistent naming conventions
- Proper data types
- Comprehensive documentation

---

**Last Updated:** January 21, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready  
**License:** Internal Use  

---

## 📞 Contact

For setup assistance, refer to:
- NEXANOVA2_DATABASE_SETUP.md (detailed)
- HOW_TO_CREATE_NEXANOVA2_DATABASE.md (quick start)
- Backend Spring Boot logs (debugging)
- MySQL error logs (database issues)
