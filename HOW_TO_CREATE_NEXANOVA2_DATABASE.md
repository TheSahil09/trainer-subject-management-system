# How to Create nexanova2 Database

## Step-by-Step Guide

### **Prerequisites:**
- MySQL Server is running
- MySQL root password is set to "Database"
- You have access to the SQL script: `nexanova2_database_schema.sql`

---

## **Method 1: Using MySQL Command Line (Windows)**

### Step 1: Open Command Prompt or PowerShell
```bash
# Open as Administrator (recommended)
# Press Windows + R
# Type: cmd or powershell
# Press Enter
```

### Step 2: Navigate to MySQL Installation
```bash
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
```

### Step 3: Connect to MySQL
```bash
mysql -u root -p
```

### Step 4: Enter Password
```
Database
```

### Step 5: Execute the SQL Script
```sql
SOURCE C:\Users\Admin\Desktop\Trainer-Subject_Management\backend\nexanova2_database_schema.sql;
```

### Step 6: Verify Database Created
```sql
SHOW DATABASES;
USE nexanova2;
SHOW TABLES;
DESC users;
```

### Step 7: Exit MySQL
```sql
EXIT;
```

---

## **Method 2: Using One Command (PowerShell)**

```powershell
# In PowerShell, run this single command:
mysql -u root -pDatabase < "C:\Users\Admin\Desktop\Trainer-Subject_Management\backend\nexanova2_database_schema.sql"
```

**Note:** No space between `-p` and password

---

## **Method 3: Using MySQL Workbench (GUI)**

### Step 1: Open MySQL Workbench
- Click on the MySQL Workbench icon
- Or search for "MySQL Workbench" in Start Menu

### Step 2: Connect to MySQL
- Double-click on your MySQL connection (usually "Local instance MySQL80")
- Enter password: "Database"
- Click "OK"

### Step 3: Open SQL Script
- Click: **File** → **Open SQL Script**
- Navigate to: `C:\Users\Admin\Desktop\Trainer-Subject_Management\backend\nexanova2_database_schema.sql`
- Click **Open**

### Step 4: Execute Script
- Click the **Execute** button (Lightning bolt icon ⚡)
- Or press: **Ctrl + Shift + Enter**

### Step 5: Verify Results
- Go to **Database** menu
- Click **Refresh** (or press F5)
- You should see `nexanova2` in the list of databases

### Step 6: View Tables
- Expand **nexanova2** → **Tables**
- Verify all 8 tables are present:
  - users
  - subjects
  - trainers
  - courses
  - modules
  - schedules
  - enrollments
  - password_reset

---

## **Method 4: Using VS Code (if MySQL extension installed)**

### Step 1: Install MySQL Extension
- Open VS Code
- Click Extensions (Ctrl + Shift + X)
- Search: "MySQL"
- Install "MySQL" by Wei Shen or similar

### Step 2: Add Connection
- Open Command Palette (Ctrl + Shift + P)
- Type: "MySQL: Add Connection"
- Enter credentials:
  - Host: `localhost`
  - Port: `3306`
  - Username: `root`
  - Password: `Database`

### Step 3: Open SQL File
- Open the SQL script file in VS Code
- Right-click and select "Run Query"
- Or use the Execute button in the editor

### Step 4: Verify
- In MySQL Explorer, expand the connection
- Verify `nexanova2` database appears with all tables

---

## **Expected Output**

After successful execution, you should see:

```
Query OK, 0 rows affected (0.01 sec)

Database changed

Query OK, 0 rows affected (0.03 sec) - for each table

Query OK, 0 rows affected (0.15 sec) - for all tables

Tables in nexanova2:
+-------------------+
| Tables_in_nexanova2 |
+-------------------+
| courses           |
| enrollments       |
| modules           |
| password_reset    |
| schedules         |
| subjects          |
| trainers          |
| users             |
+-------------------+
8 rows in set (0.00 sec)
```

---

## **Verify Connection in Spring Boot**

### Step 1: Update application.properties (if needed)

Edit: `backend/src/main/resources/application.properties`

```properties
# Change from nexanova_db to nexanova2
spring.datasource.url=jdbc:mysql://localhost:3306/nexanova2
spring.datasource.username=root
spring.datasource.password=Database
```

### Step 2: Start Backend

```bash
cd C:\Users\Admin\Desktop\Trainer-Subject_Management\backend
mvn spring-boot:run
```

### Step 3: Check Logs

Look for these messages:
```
Hibernate: create table if not exists users
Hibernate: create table if not exists subjects
...
Hibernate: create table if not exists enrollments
```

If you see these, the database connection is working!

---

## **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| "Access denied for user 'root'" | Password is wrong. Verify it's exactly "Database" |
| "Unknown database 'nexanova2'" | Run the SQL script first to create DB |
| "Can't connect to MySQL server" | MySQL is not running. Start MySQL service |
| "Syntax error in SQL" | Make sure you copied the entire script |
| "File not found" | Check the file path is correct |

---

## **Checking MySQL Service Status (Windows)**

```bash
# In PowerShell (as Administrator):
Get-Service | Where-Object {$_.Name -like "*MySQL*"} | Format-Table

# Should show:
# Status   Name                DisplayName
# ------   ----                -----------
# Running  MySQL80             MySQL80
```

To start MySQL if stopped:
```bash
Start-Service MySQL80
```

---

## **Database Creation Checklist**

- [ ] MySQL Server is running
- [ ] SQL script file exists at correct path
- [ ] Connected to MySQL with correct credentials
- [ ] SQL script executed without errors
- [ ] All 8 tables created (verified with SHOW TABLES)
- [ ] application.properties updated (if using nexanova2)
- [ ] Spring Boot started successfully
- [ ] No connection errors in logs

---

## **Next Steps After Creation**

1. **Start Backend:**
```bash
cd backend
mvn spring-boot:run
```

2. **Start Frontend:**
```bash
cd frontend
npm install  # if not already done
npm start
```

3. **Login with Test Account:**
- Email: `admin@example.com`
- Password: `password123`
- Role: `ADMIN`

---

## **Insert Sample Data (Optional)**

After creating the database, you can add test users:

```sql
USE nexanova2;

-- Insert sample users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', 'hashed_password_here', 'ADMIN'),
('John Student', 'student@example.com', 'hashed_password_here', 'STUDENT'),
('Jane Trainer', 'trainer@example.com', 'hashed_password_here', 'TRAINER');

-- Insert sample subjects
INSERT INTO subjects (name, subject_code, description, department, credit_hours) VALUES
('Mathematics', 'MATH101', 'Basic Mathematics', 'Science', 4),
('Physics', 'PHY101', 'Introduction to Physics', 'Science', 4),
('Chemistry', 'CHEM101', 'Basic Chemistry', 'Science', 3);
```

**Note:** Passwords should be bcrypt-hashed. Use your application's password hashing for security.

---

**Date:** January 21, 2026
**Database:** nexanova2
**Version:** 1.0
