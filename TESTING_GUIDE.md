# 🧪 Quick Testing Guide - API Calls

## ✅ Everything is Ready!

**Backend running on:** http://localhost:8080
**Frontend running on:** http://localhost:3000

---

## **STEP 1: Check Frontend Loads**

1. Open http://localhost:3000 in browser
2. You should see the login page

---

## **STEP 2: Login with Admin Account**

**Email:** admin@example.com
**Password:** Admin@123

> If you haven't created admin account yet, run this SQL:
> ```sql
> INSERT INTO users (name, email, password, role) 
> VALUES ('Admin', 'admin@example.com', 
> '$2a$10$slYQmyNdGzin7olVequ5OPST9/PgBkqquzi8Ay0IQqKUqI9GYq2T.', 'ADMIN');
> ```

---

## **STEP 3: Check Browser Console for Logs**

1. After login, press **F12** to open DevTools
2. Click **Console** tab
3. Click on any "Load" button or navigate to a page
4. You should see logs like:
   ```
   📥 Fetching courses from /api/courses...
   ✅ Courses loaded successfully: [...]
   ```

---

## **STEP 4: Check Backend Logs**

Look at the backend terminal/console, you should see:
```
════════════════════════════════════════════
📥 GET /api/courses - Fetching all courses
════════════════════════════════════════════
✅ Found 3 courses
   - 1: Java Basics
   - 2: Python Advanced
   - 3: Web Development
════════════════════════════════════════════
```

---

## **STEP 5: Test Each Feature**

### **Courses**
- Navigate to Admin → Courses
- Should see list of courses OR create new one
- **Console shows:** "Fetching courses from /api/courses..."

### **Schedules**
- Navigate to Admin → Schedules
- Should see list of schedules
- **Console shows:** "Fetching schedules from /api/schedules..." (plural)

### **Trainers**
- Navigate to Admin → Trainers
- Should see list of trainers
- **Console shows:** "Fetching trainers from /api/trainer..."

### **Subjects**
- Navigate to Admin → Subjects
- Should see list of subjects
- **Console shows:** "Fetching subjects from /api/subject..."

---

## **TROUBLESHOOTING**

### **If you see "Failed to load...":**

**Check #1: Browser Console (F12 → Console)**
```javascript
// You might see:
❌ Failed to fetch courses: 404 Not Found
❌ Failed to fetch schedules. Status: 500
```

**Check #2: Backend Console**
Look for error like:
```
❌ ERROR fetching courses: Table 'nexanova2.courses' doesn't exist
❌ ERROR DURING REGISTRATION: Exception message...
```

**Check #3: Network Tab (F12 → Network)**
1. Click on failed request
2. Check "Response" tab to see error message
3. Check "Headers" to see what was sent

---

## **COMMON FIXES**

| Problem | Solution |
|---------|----------|
| **404 on /api/courses** | Frontend calling wrong endpoint (should be /courses plural) |
| **500 Internal Error** | Database table missing or JPA entity issue |
| **Empty list returns** | No data in database - add sample data |
| **CORS error in console** | Backend CORS not configured (should be already fixed) |
| **Connection refused** | Backend not running on port 8080 |

---

## **API ENDPOINTS REFERENCE**

### **Courses**
```bash
GET    /api/courses              # Get all courses
GET    /api/courses/{id}         # Get one course
POST   /api/courses              # Create course (ADMIN)
PUT    /api/courses/{id}         # Update course (ADMIN)
DELETE /api/courses/{id}         # Delete course (ADMIN)
```

### **Schedules**
```bash
GET    /api/schedule             # Get all schedules
GET    /api/schedules/{id}        # Get one slot
POST   /api/schedule             # Create schedule
PUT    /api/schedules/{id}        # Update slot
DELETE /api/schedules/{id}        # Delete slot
GET    /api/schedules/week/{date} # Get week schedule
```

### **Trainers**
```bash
GET    /api/trainer              # Get all trainers
GET    /api/trainer/{id}         # Get one trainer
POST   /api/trainer              # Create trainer
PUT    /api/trainer/{id}         # Update trainer
DELETE /api/trainer/{id}         # Delete trainer
```

### **Subjects**
```bash
GET    /api/subject              # Get all subjects
GET    /api/subject/{id}         # Get one subject
POST   /api/subject              # Create subject
PUT    /api/subject/{id}         # Update subject
DELETE /api/subject/{id}         # Delete subject
```

---

## **TEST WITH CURL**

### **Get All Courses:**
```bash
curl -X GET http://localhost:8080/api/courses
```

### **Get All Schedules:**
```bash
curl -X GET http://localhost:8080/api/schedule
```

### **Create New Course (needs ADMIN role):**
```bash
curl -X POST http://localhost:8080/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Node.js",
    "code": "NODE101",
    "description": "Backend with Node",
    "credits": 4
  }'
```

---

## **✅ ALL FIXES APPLIED**

- ✅ Fixed endpoint paths (course → courses)
- ✅ Added console logging to all services
- ✅ Added backend request logging
- ✅ Improved error messages
- ✅ Added missing CRUD endpoints
- ✅ CORS properly configured

**Status: Ready for Testing! 🚀**
