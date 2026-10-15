import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function BulkOperationsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Bulk upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Bulk enroll state
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const { token: ctxToken, user } = useContext(AuthContext);

  // reload when token changes (ensures data available after login)
  useEffect(() => {
    // block non-admins immediately
    if (user && user.role && user.role !== "ADMIN") {
      setError("Access denied: admin only");
      setLoading(false);
      return;
    }
    loadAllData();
  }, [ctxToken, user]);

  async function loadAllData() {
    try {
      setLoading(true);
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [studentsRes, coursesRes] = await Promise.all([
        fetch(`${BASE_URL}/users?role=STUDENT`, { headers }),
        fetch(`${BASE_URL}/courses`, { headers }),
      ]);

      if (!studentsRes.ok || !coursesRes.ok) throw new Error("Failed to fetch");

      const [studentsData, coursesData] = await Promise.all([
        studentsRes.json(),
        coursesRes.json(),
      ]);

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // FR-Admin-06: Bulk Upload Student Data
  async function handleBulkUpload(e) {
    e.preventDefault();
    if (!uploadFile) {
      setError("Please select a file");
      return;
    }

    try {
      setError("");
      setSuccessMsg("");
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", uploadFile);

      // Show progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);

      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/student/bulk-upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const raw = await res.text();
      let payload = {};
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        payload = {};
      }

      if (!res.ok) {
        throw new Error(
          payload.message || payload.error || `Failed to upload students (${res.status})`
        );
      }

      const result = payload;
      setSuccessMsg(
        `Successfully uploaded ${result.count || 0} students!`
      );
      setUploadFile(null);
      loadAllData();

      setTimeout(() => setUploadProgress(0), 1500);
    } catch (err) {
      setError(err.message || "Failed to upload file");
      setUploadProgress(0);
    }
  }

  // Toggle student selection
  function toggleStudentSelection(studentId) {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
    setSelectAll(newSelected.size === students.length);
  }

  // Toggle select all
  function toggleSelectAll() {
    if (selectAll) {
      setSelectedStudents(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(students.map((s) => s.id));
      setSelectedStudents(allIds);
      setSelectAll(true);
    }
  }

  // FR-Admin-07: Bulk Enroll Students
  async function handleBulkEnroll(e) {
    e.preventDefault();
    try {
      setError("");
      setSuccessMsg("");

      if (selectedStudents.size === 0) {
        setError("Please select at least one student");
        return;
      }

      if (!selectedCourse) {
        setError("Please select a course");
        return;
      }

      const token = ctxToken || sessionStorage.getItem("token") || localStorage.getItem("token");
      console.log("🔐 Bulk enroll using token:", token);
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            console.log("🧾 Bulk token payload", JSON.parse(atob(parts[1])));
          }
        } catch (e) {
          console.warn("⚠️ Unable to decode bulk token", e);
        }
      }
      const res = await fetch(`${BASE_URL}/enrollments/bulk-enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents),
          courseId: selectedCourse,
        }),
      });

      if (!res.ok) throw new Error("Failed to enroll students");

      const result = await res.json();
      setSuccessMsg(`Successfully enrolled ${result.count || selectedStudents.size} students!`);
      setSelectedStudents(new Set());
      setSelectedCourse("");
      setSelectAll(false);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to enroll students");
    }
  }

  if (loading) return <div className="loading">Loading bulk operations...</div>;

  return (
    <div className="page-container bulk-operations-page">
      <h1> Bulk Operations</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* FR-Admin-06: Bulk Upload Student Data */}
      <div className="card">
        <h2>Bulk Upload Student Data</h2>
        <form onSubmit={handleBulkUpload}>
          <div className="form-row">
            <label>Upload CSV or Excel File </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              required
            />
            <p className="info-text">
              File format: ID, Name, Email, Phone, Address
            </p>
          </div>

          <button type="submit" className="btn btn-primary">
            Upload Students
          </button>

          {uploadProgress > 0 && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
              <span>{uploadProgress}%</span>
            </div>
          )}
        </form>
      </div>

      {/* FR-Admin-07: Bulk Enroll Students */}
      <div className="card">
        <h2> Bulk Enroll Students in Course</h2>

        <div className="bulk-enroll-container">
          <div className="select-students">
            <h3>Step 1: Select Students</h3>
            {students.length === 0 ? (
              <p>No students available. Upload students first.</p>
            ) : (
              <>
                <div className="select-all-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                    Select All ({selectedStudents.size}/{students.length})
                  </label>
                </div>

                <div className="students-list">
                  {students.map((student) => (
                    <div key={student.id} className="student-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student.id)}
                          onChange={() =>
                            toggleStudentSelection(student.id)
                          }
                        />
                        {student.name} ({student.email})
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="select-course">
            <h3>Step 2: Select Course</h3>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleBulkEnroll}
            className="btn btn-primary"
            disabled={selectedStudents.size === 0 || !selectedCourse}
          >
            Enroll {selectedStudents.size} Student(s)
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h2>Enrollment Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <h4>Total Students</h4>
            <p className="stat-number">{students.length}</p>
          </div>
          <div className="summary-item">
            <h4>Total Courses</h4>
            <p className="stat-number">{courses.length}</p>
          </div>
          <div className="summary-item">
            <h4>Selected Students</h4>
            <p className="stat-number">{selectedStudents.size}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
