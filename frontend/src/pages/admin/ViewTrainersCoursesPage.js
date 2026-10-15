import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function ViewTrainersCoursesPage() {
  const [trainers, setTrainers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("trainers");
  const [expandedCourse, setExpandedCourse] = useState(null);
  const { token: ctxToken } = useContext(AuthContext);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [trainersRes, coursesRes, modulesRes] = await Promise.all([
        fetch(`${BASE_URL}/trainer`, { headers }),
        fetch(`${BASE_URL}/courses`, { headers }),
        fetch(`${BASE_URL}/modules`, { headers }),
      ]);

      if (!trainersRes.ok || !coursesRes.ok || !modulesRes.ok)
        throw new Error("Failed to fetch");

      const [trainersData, coursesData, modulesData] = await Promise.all([
        trainersRes.json(),
        coursesRes.json(),
        modulesRes.json(),
      ]);

      setTrainers(Array.isArray(trainersData) ? trainersData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setModules(Array.isArray(modulesData) ? modulesData : []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // Get modules for a course
  function getModulesForCourse(courseId) {
    return modules.filter((m) => {
      const moduleCourseId = m?.courseId ?? m?.course?.id;
      return Number(moduleCourseId) === Number(courseId);
    });
  }

  // Get trainer name
  function getTrainerName(trainerId) {
    const trainer = trainers.find((t) => t.id === trainerId);
    return trainer ? `${trainer.name} (${trainer.empId})` : "Unknown Trainer";
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container view-trainers-courses-page">
      <div className="overview-header">
        <h1>Trainers & Courses Overview</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "trainers" ? "active" : ""}`}
          onClick={() => setActiveTab("trainers")}
        >
          View Trainers ({trainers.length})
        </button>
        <button
          className={`tab-button ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          View Courses & Modules ({courses.length})
        </button>
      </div>

      {/* Trainers Tab */}
      {activeTab === "trainers" && (
        <div className="card">
          <h2>Registered Trainers</h2>
          {trainers.length === 0 ? (
            <p>No trainers registered yet.</p>
          ) : (
            <div className="grid-container">
              {trainers.map((trainer) => (
                <div key={trainer.id} className="trainer-card">
                  <div className="card-header">
                    <h3>{trainer.name}</h3>
                    <span className="badge badge-info">{trainer.empId}</span>
                  </div>
                  <div className="card-body">
                    <p>
                      <strong>Email:</strong> {trainer.email}
                    </p>
                    <p>
                      <strong>Course:</strong>{" "}
                      {trainer.course?.name || "Not assigned"}
                    </p>
                    <p>
                      <strong>Course ID:</strong> {trainer.course?.id || "N/A"}
                    </p>
                  </div>
                  <div className="card-footer">
                    <span className="status-badge">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Courses & Modules Tab */}
      {activeTab === "courses" && (
        <div className="card">
          <h2>Courses and Associated Modules</h2>
          {courses.length === 0 ? (
            <p>No courses available yet.</p>
          ) : (
            <div className="courses-list">
              {courses.map((course) => {
                const courseModules = getModulesForCourse(course.id);
                return (
                  <div key={course.id} className="course-item">
                    <div
                      className="course-header"
                      onClick={() =>
                        setExpandedCourse(
                          expandedCourse === course.id ? null : course.id
                        )
                      }
                    >
                      <div className="course-title">
                        <h3>{course.name}</h3>
                        <span className="module-count">
                          {courseModules.length} modules
                        </span>
                      </div>
                      <span className="expand-icon">
                        {expandedCourse === course.id ? "▼" : "▶"}
                      </span>
                    </div>

                    {expandedCourse === course.id && (
                      <div className="course-details">
                        <div className="course-info">
                          <p>
                            <strong>Description:</strong> {course.description}
                          </p>
                          <p>
                            <strong>Course ID:</strong> {course.id}
                          </p>
                        </div>

                        <div className="modules-section">
                          <h4>Modules in this Course:</h4>
                          {courseModules.length === 0 ? (
                            <p className="no-data">
                              No modules assigned to this course yet.
                            </p>
                          ) : (
                            <div className="modules-grid">
                              {courseModules.map((module) => (
                                <div key={module.id} className="module-card">
                                  <h5>{module.name}</h5>
                                  <p>{module.description || module.content || "No description"}</p>
                                  <p className="module-id">
                                    Module ID: {module.id}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="card">
        <h2>Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Trainers</h3>
            <p className="stat-number">{trainers.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Courses</h3>
            <p className="stat-number">{courses.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Modules</h3>
            <p className="stat-number">{modules.length}</p>
          </div>
          <div className="stat-card">
            <h3>Avg. Modules/Course</h3>
            <p className="stat-number">
              {courses.length > 0
                ? (modules.length / courses.length).toFixed(1)
                : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
