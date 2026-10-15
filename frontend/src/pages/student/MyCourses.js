import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCourse, setExpandedCourse] = useState(null);

  const { user: contextUser, token: contextToken } = useContext(AuthContext) || {};

  const user =
    contextUser ||
    JSON.parse(localStorage.getItem("user") || "null") ||
    JSON.parse(sessionStorage.getItem("user") || "null") ||
    {};

  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      if (!user?.id) {
        throw new Error("Student profile not found. Please login again.");
      }

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      // Fetch current student's enrollments from JWT-auth endpoint
      const res = await fetch(`${BASE_URL}/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const enrollments = await res.json();

      const courseData = Array.isArray(enrollments)
        ? enrollments
            .map((enrollment) => enrollment?.course)
            .filter(Boolean)
        : [];

      setCourses(courseData);
    } catch (err) {
      setError(err.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadModules(courseId) {
    try {
      if (modules[courseId]) {
        setExpandedCourse(courseId);
        return;
      }

      const res = await fetch(`${BASE_URL}/modules/course/${courseId}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : {},
      });
      if (!res.ok) throw new Error("Failed to fetch modules");
      const data = await res.json();
      setModules((prev) => ({
        ...prev,
        [courseId]: Array.isArray(data) ? data : [],
      }));
      setExpandedCourse(courseId);
    } catch (err) {
      setError("Failed to load modules");
    }
  }

  if (loading) return <div>Loading courses...</div>;

  return (
    <div className="page-container student-courses-page">
      <div className="dashboard-header">
        <h1>My Enrolled Courses</h1>
        <p className="dashboard-subtitle">Review your courses and explore learning modules</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {courses.length === 0 ? (
        <div className="empty-state">You are not enrolled in any courses yet.</div>
      ) : (
        <div className="courses-list">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.name}</h3>
              <p>{course.description}</p>
              <button className="btn btn-primary" type="button" onClick={() => loadModules(course.id)}>
                {expandedCourse === course.id ? "Hide" : "View"} Modules
              </button>

              {expandedCourse === course.id && (
                <div className="modules-list">
                  <h4>Course Modules:</h4>
                  {modules[course.id] && modules[course.id].length > 0 ? (
                    <ul className="modules-items">
                      {modules[course.id].map((module) => (
                        <li key={module.id} className="module-item">
                          <strong>{module.name}</strong>
                          <p>{module.description || module.content || "No module details available."}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-modules">No modules available yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
