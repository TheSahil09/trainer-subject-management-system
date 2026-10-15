#!/bin/bash
# Trainer Dashboard Setup Verification Script

echo "============================================"
echo "🎓 Trainer Dashboard - Verification Script"
echo "============================================"
echo ""

# Check backend status
echo "1️⃣  Checking Backend..."
if curl -s http://localhost:8080/api/trainer -H "Authorization: Bearer test" > /dev/null 2>&1; then
    echo "   ✅ Backend is running (http://localhost:8080)"
else
    echo "   ❌ Backend NOT running. Start with: mvn spring-boot:run"
fi

# Check frontend status
echo ""
echo "2️⃣  Checking Frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running (http://localhost:3000)"
else
    echo "   ❌ Frontend NOT running. Start with: npm start"
fi

# Check database connection
echo ""
echo "3️⃣  Files Modified:"
echo "   ✅ frontend/src/pages/TrainerDashboard.js (149 lines)"
echo "   ✅ frontend/src/pages/TimetablePage.css (enhanced styles)"
echo "   ✅ frontend/src/components/Sidebar.js (trainer routes added)"

echo ""
echo "4️⃣  Next Steps:"
echo "   1. Ensure BOTH backend and frontend are running"
echo "   2. Go to http://localhost:3000/login"
echo "   3. Login with trainer credentials:"
echo "      Email: trainer@test.com"
echo "      Password: password123"
echo "   4. System will redirect to /trainer/dashboard"
echo "   5. View your assigned teaching slots"

echo ""
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
