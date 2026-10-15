import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import PrivateRoute from "./components/PrivateRoute";
import { AuthContext } from "./context/AuthContext";

// global admin styles
import "./pages/admin/AdminPages.css";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import SubjectsPage from "./pages/admin/SubjectsPage";
import TrainersPage from "./pages/admin/TrainersPage";
import CoursesPage from "./pages/admin/CoursesPage";
import ModulesPage from "./pages/admin/ModulesPage";
import SchedulesPage from "./pages/admin/SchedulesPage";
import EnrollmentsPage from "./pages/admin/EnrollmentsPage";
import UsersPage from "./pages/admin/UsersPage";
import TimetablePage from "./pages/admin/TimetablePage";
import ViewTrainersCoursesPage from "./pages/admin/ViewTrainersCoursesPage";
import ScheduleBuilderPage from "./pages/admin/ScheduleBuilderPage";
import BulkOperationsPage from "./pages/admin/BulkOperationsPage";
import StudentEnrollmentsPage from "./pages/admin/StudentEnrollmentsPage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MyProfile from "./pages/student/MyProfile";
import MyTimetable from "./pages/student/MyTimetable";
import MyCourses from "./pages/student/MyCourses";


// Trainer Pages

import TrainerDashboard from "./pages/TrainerDashboard";

//<Route path="/trainer-dashboard" element={<TrainerDashboard />} />


// 404 Page
import NotFoundPage from "./pages/NotFoundPage";

// Layout Component for Pages with Navbar and Sidebar
function AdminLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="main-area">{children}</main>
      </div>
    </div>
  );
}

function StudentLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="main-area">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useContext(AuthContext) || {
    user: null,
    loading: true,
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <SubjectsPage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/trainers"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <TrainersPage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/courses"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <CoursesPage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/modules"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <ModulesPage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/schedules"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <SchedulesPage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/enrollments"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <EnrollmentsPage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <UsersPage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/timetable"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <TimetablePage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/view-trainers-courses"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <ViewTrainersCoursesPage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/schedule-builder"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <ScheduleBuilderPage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/bulk-operations"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <BulkOperationsPage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/student-enrollments"
          element={
            <PrivateRoute
              user={user}
              role="ADMIN"
              component={
                <AdminLayout>
                  <StudentEnrollmentsPage />
                </AdminLayout>
              }
            />
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute
              user={user}
              role="STUDENT"
              component={
                <StudentLayout>
                  <StudentDashboard />
                </StudentLayout>
              }
            />
          }
        />
        <Route
          path="/student/profile"
          element={
            <PrivateRoute
              user={user}
              role="STUDENT"
              component={
                <StudentLayout>
                  <MyProfile />
                </StudentLayout>
              }
            />
          }
        />
        <Route
          path="/student/timetable"
          element={
            <PrivateRoute
              user={user}
              role="STUDENT"
              component={
                <StudentLayout>
                  <MyTimetable />
                </StudentLayout>
              }
            />
          }
        />
        <Route
          path="/student/courses"
          element={
            <PrivateRoute
              user={user}
              role="STUDENT"
              component={
                <StudentLayout>
                  <MyCourses />
                </StudentLayout>
              }
            />
          }
        />


         {/* Trainer Routes */}
         <Route
  path="/trainer/dashboard"
  element={
    <PrivateRoute
      user={user}
      role="TRAINER"
      component={
        <AdminLayout>
          <TrainerDashboard initialSection="profile" />
        </AdminLayout>
      }
    />
  }
/>

        <Route
          path="/trainer/profile"
          element={
            <PrivateRoute
              user={user}
              role="TRAINER"
              component={
                <AdminLayout>
                  <TrainerDashboard initialSection="profile" />
                </AdminLayout>
              }
            />
          }
        />

        <Route
          path="/trainer/timetable"
          element={
            <PrivateRoute
              user={user}
              role="TRAINER"
              component={
                <AdminLayout>
                  <TrainerDashboard initialSection="timetable" />
                </AdminLayout>
              }
            />
          }
        />






        {/* Default redirect */}
 
 <Route
  path="/"
  element={
    user ? (
      user.role === "ADMIN" ? (
        <Navigate to="/admin/dashboard" replace />
      ) : user.role === "STUDENT" ? (
        <Navigate to="/student/dashboard" replace />
      ) : user.role === "TRAINER" ? (
        <Navigate to="/trainer/profile" replace />
      ) : (
        <Navigate to="/login" replace />
      )
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>


 {/* 404 */}
       <Route path="*" element={<NotFoundPage />} />
     </Routes>
   </Router>
  );
}
 
 
