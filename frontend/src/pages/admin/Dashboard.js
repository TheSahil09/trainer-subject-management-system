import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTrainers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token: ctxToken } = useContext(AuthContext);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const token = ctxToken || sessionStorage.getItem("token") || localStorage.getItem("token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const [studentsRes, trainersRes, coursesRes, enrollmentsRes] = await Promise.all([
        fetch(`${BASE_URL}/users?role=STUDENT`, { headers }),
        fetch(`${BASE_URL}/trainer`, { headers }),
        fetch(`${BASE_URL}/courses`, { headers }),
        fetch(`${BASE_URL}/enrollments`, { headers }),
      ]);

      const students = studentsRes.ok ? await studentsRes.json() : [];
      const trainers = trainersRes.ok ? await trainersRes.json() : [];
      const courses = coursesRes.ok ? await coursesRes.json() : [];
      const enrollments = enrollmentsRes.ok ? await enrollmentsRes.json() : [];

      setStats({
        totalStudents: Array.isArray(students) ? students.length : 0,
        totalTrainers: Array.isArray(trainers) ? trainers.length : 0,
        totalCourses: Array.isArray(courses) ? courses.length : 0,
        totalEnrollments: Array.isArray(enrollments) ? enrollments.length : 0,
      });
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard-container admin-dashboard-page">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">Monitor platform activity and access key admin actions</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-students">
          <h3>Total Students</h3>
          <p className="stat-number">{stats.totalStudents}</p>
        </div>
        <div className="stat-card stat-card-trainers">
          <h3>Total Trainers</h3>
          <p className="stat-number">{stats.totalTrainers}</p>
        </div>
        <div className="stat-card stat-card-courses">
          <h3>Total Courses</h3>
          <p className="stat-number">{stats.totalCourses}</p>
        </div>
        <div className="stat-card stat-card-enrollments">
          <h3>Total Enrollments</h3>
          <p className="stat-number">{stats.totalEnrollments}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <button className="quick-action-btn" onClick={() => navigate("/admin/trainers")}>
          <span className="action-label">Add Trainer</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate("/admin/courses")}>
          <span className="action-label">Create Course</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate("/admin/schedule-builder")}>
          <span className="action-label">Add Schedule</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate("/admin/student-enrollments")}>
          <span className="action-label">Manage Enrollments</span>
        </button>
      </div>
    </div>
  );
}
