# NEXANOVA2 Database - Entity Relationship Diagram

## Full Database Schema Diagram

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         NEXANOVA2 DATABASE SCHEMA                            ║
║                      (8 Tables - Fully Normalized)                           ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                              USERS TABLE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─ PK  id              BIGINT AUTO_INCREMENT                                │
│ │     name             VARCHAR(255)                                         │
│ │     email*           VARCHAR(255) UNIQUE, INDEXED ◄─── Login Key          │
│ │     password         VARCHAR(255) ◄─── Bcrypt hashed                      │
│ │     role             ENUM('ADMIN','STUDENT','TRAINER') ◄─── Access       │
│ │     created_at       TIMESTAMP AUTO                                       │
│ │     updated_at       TIMESTAMP AUTO                                       │
│ └─────────────────────────────────────────────────────────────────────────  │
│ Used by: Courses(trainer_id), Enrollments(student_id), PasswordReset       │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ (1) ─────────────────┬──────────────────────┬──────────────── (M)
         │                      │                      │
         │              trainer_id              student_id
         │                      │                      │
         ▼                      ▼                      ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
   │  COURSES     │  │ ENROLLMENTS  │  │  PASSWORD_RESET  │
   └──────────────┘  └──────────────┘  └──────────────────┘
         │ (1)             │ (M)                    │
         │                 │                        └─► user_id
         │                 │                         reset_token UNIQUE
         │                 └─ course_id               expiry_time
         │                    INDEXED                 used: BOOLEAN
         │
         ▼
    ┌──────────────┐
    │  MODULES     │
    └──────────────┘
         │ (M)
         │ course_id
         │ INDEXED
         │
         └──────────────────────┐
                                │
                                └──► Stored as FK

┌─────────────────────────────────────────────────────────────────────────────┐
│                          SUBJECTS TABLE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─ PK  id              BIGINT AUTO_INCREMENT                                │
│ │     name*            VARCHAR(255) UNIQUE ◄─── Subject identifier          │
│ │     subject_code*    VARCHAR(255) UNIQUE ◄─── Code (e.g., MATH101)       │
│ │     description      VARCHAR(500)                                         │
│ │     department       VARCHAR(255)                                         │
│ │     credit_hours     INT                                                  │
│ │     created_at       TIMESTAMP AUTO                                       │
│ │     updated_at       TIMESTAMP AUTO                                       │
│ └─────────────────────────────────────────────────────────────────────────  │
│ Used by: Trainers(subject_id), Schedules(subject_id)                       │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ (1) ────────────────┬────────────────── (M)
         │                     │
         │                     ▼
         │              ┌──────────────┐
         │              │  TRAINERS    │
         │              └──────────────┘
         │                     │ (1)
         │                     │ subject_id
         │                     │
         │                     └──► One trainer per subject
         │
         └────────────────────┐
                              │
                              ▼
                         ┌──────────────┐
                         │  SCHEDULES   │
                         └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         TRAINERS TABLE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─ PK  id              BIGINT AUTO_INCREMENT                                │
│ │     emp_id*          VARCHAR(255) UNIQUE ◄─── Employee identifier         │
│ │     name             VARCHAR(255)                                         │
│ │     email*           VARCHAR(255) UNIQUE, INDEXED                         │
│ │     phone            VARCHAR(20)                                          │
│ │     department       VARCHAR(255)                                         │
│ │     qualification    VARCHAR(255) ◄─── PhD, Masters, etc.                │
│ │     experience_years INT                                                  │
│ ├─ FK  subject_id      BIGINT ──► subjects.id (ON DELETE SET NULL)         │
│ │     created_at       TIMESTAMP AUTO                                       │
│ │     updated_at       TIMESTAMP AUTO                                       │
│ └─────────────────────────────────────────────────────────────────────────  │
│ Relationships: (1) to Subject, (M) to Schedules                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ (1)
                                 │ trainer_id
                                 │ INDEXED
                                 │
                                 ▼
                         ┌──────────────┐
                         │  SCHEDULES   │
                         └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          COURSES TABLE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─ PK  id              BIGINT AUTO_INCREMENT                                │
│ │     name             VARCHAR(255)                                         │
│ │     code             VARCHAR(255) UNIQUE ◄─── Course code                 │
│ │     description      TEXT                                                 │
│ │     credits          INT ◄─── Academic credits                            │
│ ├─ FK  trainer_id      BIGINT ──► users.id (ON DELETE SET NULL)            │
│ │     created_at       TIMESTAMP AUTO                                       │
│ │     updated_at       TIMESTAMP AUTO                                       │
│ └─────────────────────────────────────────────────────────────────────────  │
│ Relationships: (M) to Users(trainer), (1) to Modules, (1) to Enrollments   │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ (1) ──────────────┬─────────────────────── (M)
         │                   │
         │                   ▼
         │            ┌──────────────┐
         │            │  MODULES     │
         │            └──────────────┘
         │
         └────────────────────┐
                              │
                              ▼
                         ┌──────────────┐
                         │ ENROLLMENTS  │
                         └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          MODULES TABLE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─ PK  id              BIGINT AUTO_INCREMENT                                │
│ │     name             VARCHAR(255)                                         │
│ │     description      VARCHAR(500)                                         │
│ │     module_code      VARCHAR(255) UNIQUE ◄─── Module identifier           │
│ │     duration_hours   INT ◄─── Hours required                              │
│ │     status           VARCHAR(50) ◄─── ACTIVE, INACTIVE                    │
│ │     sequence_number  INT ◄─── Module order in course                      │
│ ├─ FK  course_id       BIGINT NOT NULL ──► courses.id (CASCADE DELETE)      │
│ │     created_at       TIMESTAMP AUTO                                       │
│ │     updated_at       TIMESTAMP AUTO                                       │
│ └─────────────────────────────────────────────────────────────────────────  │
│ Relationship: (M) to Courses (many modules per course)                      │
│ Key Feature: CASCADE DELETE - modules deleted when course deleted           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         SCHEDULES TABLE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─ PK  id              BIGINT AUTO_INCREMENT                                │
│ │     week_start       DATE ◄─── Identifies the week                        │
│ │     day_of_week      VARCHAR(20) ◄─── Monday, Tuesday, etc.              │
│ │     slot             VARCHAR(50) ◄─── 09:00-10:30, etc.                  │
│ │     status           VARCHAR(50) ◄─── AVAILABLE, ASSIGNED, COMPLETED     │
│ ├─ FK  trainer_id      BIGINT ──► trainers.id (ON DELETE SET NULL)         │
│ ├─ FK  subject_id      BIGINT ──► subjects.id (ON DELETE SET NULL)         │
│ │     created_at       TIMESTAMP AUTO                                       │
│ │     updated_at       TIMESTAMP AUTO                                       │
│ └─────────────────────────────────────────────────────────────────────────  │
│ Indexed: week_start, status, trainer_id for fast queries                   │
│ Relationships: (M) to Trainers, (M) to Subjects                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        ENROLLMENTS TABLE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─ PK  id              BIGINT AUTO_INCREMENT                                │
│ ├─ FK  student_id      BIGINT NOT NULL ──► users.id (CASCADE DELETE)       │
│ ├─ FK  course_id       BIGINT NOT NULL ──► courses.id (CASCADE DELETE)      │
│ │     status           ENUM('ENROLLED','COMPLETED','DROPPED')              │
│ │                      DEFAULT: 'ENROLLED'                                  │
│ │     enrolled_date    TIMESTAMP AUTO ◄─── When enrolled                   │
│ │     updated_at       TIMESTAMP Auto ◄─── Last status change              │
│ │                                                                           │
│ │     UNIQUE CONSTRAINT (student_id, course_id) ─► Prevent duplicates     │
│ └─────────────────────────────────────────────────────────────────────────  │
│ Indexed: student_id, course_id, status for filtering                       │
│ Key Feature: Composite unique key prevents double enrollments              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      PASSWORD_RESET TABLE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─ PK  id              BIGINT AUTO_INCREMENT                                │
│ ├─ FK  user_id         BIGINT NOT NULL ──► users.id (CASCADE DELETE)       │
│ │     reset_token      VARCHAR(255) UNIQUE ◄─── Crypto secure token       │
│ │     expiry_time      DATETIME ◄─── Token expiration (1 hour default)     │
│ │     used              BOOLEAN DEFAULT FALSE ◄─── Prevent reuse           │
│ │     created_at       TIMESTAMP Auto                                      │
│ │                                                                           │
│ │     Indexed: token (fast lookup), user_id (cleanup), used (filtering)   │
│ └─────────────────────────────────────────────────────────────────────────  │
│ Relationship: (M) to Users (one token per reset request)                   │
│ Security Feature: Single-use tokens with expiration                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Relationship Summary

### One-to-Many Relationships (1:M)
- `users` (1) ──→ `courses` (M) via `courses.trainer_id`
- `users` (1) ──→ `enrollments` (M) via `enrollments.student_id`
- `users` (1) ──→ `password_reset` (M) via `password_reset.user_id`
- `subjects` (1) ──→ `trainers` (M) via `trainers.subject_id`
- `subjects` (1) ──→ `schedules` (M) via `schedules.subject_id`
- `courses` (1) ──→ `modules` (M) via `modules.course_id`
- `courses` (1) ──→ `enrollments` (M) via `enrollments.course_id`
- `trainers` (1) ──→ `schedules` (M) via `schedules.trainer_id`

### Many-to-Many Relationships (M:M)
**Implemented via junction table (enrollments):**
- `users` (M) ──→ `courses` (M) through `enrollments`
- A student can enroll in many courses
- A course can have many students

---

## Data Flow Diagrams

### User Registration & Login Flow
```
1. User fills registration form
   ↓
2. New row inserted into users table
   ├─ Password: hashed with bcrypt
   ├─ Role: ADMIN, STUDENT, or TRAINER
   ├─ Email: must be unique
   └─ Timestamps: auto-set
   ↓
3. User logs in
   ├─ Email lookup in users table
   ├─ Password verification
   └─ JWT token generated
   ↓
4. User can now access system
   ├─ Admins: manage everything
   ├─ Students: view courses, enroll
   └─ Trainers: create content
```

### Course Enrollment Flow
```
1. Admin creates course
   └─ courses table updated
      ├─ name, code, credits
      └─ trainer_id (FK to users)
   ↓
2. Admin creates modules
   └─ modules table updated
      ├─ name, module_code
      └─ course_id (FK to courses)
   ↓
3. Student enrolls in course
   └─ enrollments table updated
      ├─ student_id (FK to users)
      ├─ course_id (FK to courses)
      ├─ status: ENROLLED
      └─ enrolled_date: auto-timestamp
   ↓
4. Student views their courses
   └─ Query: SELECT * FROM courses
      WHERE id IN (SELECT course_id FROM enrollments WHERE student_id = ?)
```

### Schedule Assignment Flow
```
1. Admin creates blank schedule
   └─ schedules table entries
      ├─ week_start: 2026-01-20
      ├─ day_of_week: MONDAY..FRIDAY
      ├─ slot: 09:00-10:30
      └─ status: AVAILABLE
   ↓
2. Admin assigns trainer + subject
   └─ schedules table updated
      ├─ trainer_id (FK to trainers)
      ├─ subject_id (FK to subjects)
      └─ status: ASSIGNED
   ↓
3. Students view schedule
   └─ Query: SELECT * FROM schedules
      WHERE week_start >= TODAY
      ORDER BY week_start, day_of_week
```

### Password Reset Flow
```
1. User requests password reset
   └─ Email verification
   ↓
2. Reset token generated & stored
   └─ password_reset table entry
      ├─ user_id (FK to users)
      ├─ reset_token: crypto-secure
      ├─ expiry_time: NOW() + 1 HOUR
      └─ used: FALSE
   ↓
3. Email sent with reset link
   └─ Link includes: reset_token
   ↓
4. User clicks link & sets new password
   └─ Verify token exists, not expired, not used
   └─ users.password updated
   └─ password_reset.used = TRUE (prevent reuse)
```

---

## Key Design Features

### 1. **Normalization (3NF)**
- No data redundancy
- Entities separated into logical tables
- Relationships via foreign keys

### 2. **Referential Integrity**
- Foreign key constraints
- CASCADE delete where appropriate
- ON DELETE SET NULL for non-critical relationships

### 3. **Uniqueness Constraints**
- `users.email`: No duplicate accounts
- `subjects.name`, `subjects.subject_code`: Unique subjects
- `modules.module_code`: Unique module codes
- `courses.code`: Unique course codes
- `trainers.emp_id`, `trainers.email`: Unique trainers
- `enrollments`: Composite unique (student_id, course_id)
- `password_reset.reset_token`: One-time tokens

### 4. **Indexing Strategy**
**Primary Keys (Auto-indexed):**
- All `id` columns

**Business Keys (Indexed):**
- `users.email` - Login lookup
- `users.role` - Role-based filtering

**Foreign Keys (Indexed):**
- `courses.trainer_id`
- `modules.course_id`
- `trainers.subject_id`
- `schedules.trainer_id`
- `schedules.subject_id`
- `enrollments.student_id`
- `enrollments.course_id`
- `password_reset.user_id`

**Search Keys (Indexed):**
- `subjects.subject_code`
- `modules.module_code`
- `courses.code`
- `trainers.emp_id`
- `schedules.week_start`
- `schedules.status`
- `enrollments.status`

### 5. **Timestamps**
All tables have:
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE

**Benefit:** Audit trail for data changes

### 6. **Enumerated Types**
- `users.role`: ADMIN, STUDENT, TRAINER
- `enrollments.status`: ENROLLED, COMPLETED, DROPPED
- Database enforces valid values

---

## Performance Considerations

### Query Optimization
1. **Indexed lookups:** Email-based user lookup is O(1)
2. **Student enrollments:** FK indexes on enrollments table
3. **Course modules:** FK index on modules.course_id
4. **Schedule queries:** Indexes on week_start, status, trainer_id

### Scaling Capacity
- `BIGINT` for IDs supports ~9 billion records
- Auto-increment ensures no ID collisions
- Proper normalization prevents data explosion

### Maintenance
- Foreign key constraints prevent orphaned records
- CASCADE deletes clean up related data
- Indexes keep queries fast as data grows

---

**Last Updated:** January 21, 2026  
**Diagram Version:** 1.0  
**Database:** nexanova2
