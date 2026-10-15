# 🚀 Quick Start Guide

## Project Status
✅ **All code is ready to run!**  
⚠️ **Requires setup steps** (5-10 minutes)

---

## ⚡ Quick Setup (5 minutes)

### 1. **Create Database** (30 seconds)
```bash
mysql -u root -p
> CREATE DATABASE nexanova_db;
> EXIT;
```

### 2. **Install Frontend Dependencies** (1-2 minutes)
```bash
cd frontend
npm install
```

### 3. **Start Backend** (terminal 1)
```bash
cd backend
mvn spring-boot:run
```
Wait for: `Started TrainerSubjectAppApplication`

### 4. **Start Frontend** (terminal 2)
```bash
cd frontend
npm start
```
Browser opens at: `http://localhost:3000`

---

## 🎯 Default Test Accounts

### Admin Account
- **Email**: admin@example.com
- **Password**: password123
- **Role**: ADMIN

### Student Account
- **Email**: student@example.com
- **Password**: password123
- **Role**: STUDENT

### Trainer Account
- **Email**: trainer@example.com
- **Password**: password123
- **Role**: TRAINER

**Note**: Create these accounts via the register page first, or insert directly into database.

---

## 📋 Prerequisites

Must be installed and ready:
- ✅ Java 21+
- ✅ Node.js 16+
- ✅ MySQL 5.7+ (running on localhost:3306)
- ✅ Maven 3.6+

**Verify**:
```bash
java -version
node -v
npm -v
mvn -version
mysql -u root -p
```

---

## 🔑 Key Features

### Available on Login
- **Admin Dashboard** - View stats and manage system
- **Subject Management** - Create/edit/delete subjects
- **Trainer Management** - Manage trainers and their subjects
- **Course Management** - Create and manage courses
- **Module Management** - Add modules to courses
- **Schedule Builder** - Create weekly timetables
- **Student Enrollment** - Enroll students in courses
- **Bulk Operations** - Bulk upload students and enrollments

### Student Features
- View personal timetable
- View enrolled courses
- Access module content

### Password Reset
- Forgot password? - Use /forgot-password page
- Reset with email link - Valid for 1 hour

---

## 📱 Application URLs

| Component | URL | Port |
|-----------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:8080 | 8080 |
| MySQL | localhost | 3306 |

---

## 🧪 Quick API Test

Test if backend is running:
```bash
curl http://localhost:8080/api/subject
```

Should return: `[]` (empty array)

---

## 💡 Useful Commands

### Backend
```bash
# Build only (no run)
mvn clean package

# Run with debug
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=5005"

# Check logs
tail -f backend/target/logs.log
```

### Frontend
```bash
# Build for production
npm run build

# Run tests
npm test

# Clear cache
npm cache clean --force
```

### Database
```bash
# Connect to database
mysql -u root -p -D nexanova_db

# View tables
SHOW TABLES;

# View users
SELECT * FROM user;

# Clear database
DROP DATABASE nexanova_db;
CREATE DATABASE nexanova_db;
```

---

## 🐛 Troubleshooting

### "Cannot find module 'react-router-dom'"
```bash
npm install react-router-dom
```

### "Connection refused: localhost:3306"
```bash
# Start MySQL
# Windows
net start MySQL80

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

### "Port 8080 already in use"
```bash
# Kill process
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8080
kill -9 <PID>
```

### "Port 3000 already in use"
```bash
# Use different port
PORT=3001 npm start
```

---

## 📊 Project Structure

```
Trainer-Subject_Management/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/nexanova/trainer_subject_app/
│   │   │   │       ├── entity/ (User, Course, etc)
│   │   │   │       ├── controller/ (API endpoints)
│   │   │   │       ├── repository/ (Database)
│   │   │   │       └── util/ (Helpers)
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/ (Login, Register, Password Reset)
│   │   │   ├── admin/ (Dashboard, Management)
│   │   │   └── student/ (Dashboard, Timetable)
│   │   ├── components/ (Navbar, Sidebar, etc)
│   │   ├── services/ (API calls)
│   │   ├── context/ (Auth state)
│   │   └── App.js
│   └── package.json
│
└── *.md (Documentation files)
```

---

## 📝 Next Steps

1. ✅ Run `mvn clean package` in backend to verify build
2. ✅ Run `npm install` in frontend to verify dependencies
3. ✅ Start both services
4. ✅ Test login at http://localhost:3000
5. ✅ Register test user and explore features

---

## 🎓 Learning Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [REST API Best Practices](https://restfulapi.net)
- [MySQL Documentation](https://dev.mysql.com/doc)

---

## 📞 Support

Check console logs for errors:
- **Backend**: Check Spring Boot console output
- **Frontend**: Open browser DevTools (F12) → Console tab
- **Database**: Use MySQL Workbench or CLI

---

**Ready? Start with Step 1 above! 🚀**
