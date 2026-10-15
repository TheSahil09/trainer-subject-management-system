import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext) || {};

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isStudentRoute = location.pathname.startsWith("/student");
  const isTrainerRoute = location.pathname.startsWith("/trainer");

  if (!isAdminRoute && !isStudentRoute && !isTrainerRoute) return null;

  // Admin Menu Items
  const adminMenuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "" },
    { label: "View Trainers & Courses", path: "/admin/view-trainers-courses", icon: "" },
   // { label: "Manage Subjects", path: "/admin/subjects", icon: "" },
    { label: "Manage Trainers", path: "/admin/trainers", icon: "" },
    { label: "Manage Courses", path: "/admin/courses", icon: "" },
    { label: "Manage Modules", path: "/admin/modules", icon: "" },
    { label: "Schedule Builder", path: "/admin/schedule-builder", icon: "" },
    { label: "Manage Schedules", path: "/admin/schedules", icon: "" },
    { label: "Student Enrollments", path: "/admin/student-enrollments", icon: "" },
    { label: "Bulk Operations", path: "/admin/bulk-operations", icon: "" },
    { label: "Manage Users", path: "/admin/users", icon: "" },
  ];

  // Student Menu Items
  const studentMenuItems = [
    { label: "Dashboard", path: "/student/dashboard", icon: "" },
    { label: "My Profile", path: "/student/profile", icon: "" },
    { label: "My Timetable", path: "/student/timetable", icon: "" },
    { label: "My Courses", path: "/student/courses", icon: "" },
  ];

  // Trainer Menu Items
  const trainerMenuItems = [
    { label: "Profile", path: "/trainer/profile", icon: "" },
    { label: "Timetable", path: "/trainer/timetable", icon: "" },
  ];

  let menuItems = [];
  let menuTitle = "";

  if (isAdminRoute) {
    menuItems = adminMenuItems;
    menuTitle = "Admin Menu";
  } else if (isStudentRoute) {
    menuItems = studentMenuItems;
    menuTitle = "Student Menu";
  } else if (isTrainerRoute) {
    menuItems = trainerMenuItems;
    menuTitle = "Trainer Menu";
  }

  function handleLogout() {
    if (typeof logout === "function") logout();
    navigate("/login");
  }

  const sidebarClassName = `sidebar ${isAdminRoute ? "sidebar-admin" : ""} ${isStudentRoute ? "sidebar-student" : ""}`.trim();

  return (
    <aside className={sidebarClassName}>
      <div className="sidebar-header">
        <h3>{menuTitle}</h3>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {
        <div className="sidebar-footer">
          <button className="btn-link" onClick={handleLogout}>
            Logout
          </button>
        </div>
      }
    </aside>
  );
}
