import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function EnhancedEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  // Add single enrollment
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  const { token: ctxToken } = useContext(AuthContext);

  // reload when token becomes available (covers case where component mounts before auth state is set)
  useEffect(() => {
    loadAllData();
  }, [ctxToken]);

  async function loadAllData() {
    try {
      setLoading(true);
      setError("");
      // prefer sessionStorage first to avoid stale localStorage tokens
      const token = ctxToken || sessionStorage.getItem("token") || localStorage.getItem("token");
      console.log("🔐 Using token:", token);
      if (!token) {
        console.error("❌ No token available for admin fetch - aborting");
        setError("Missing authentication token");
        setLoading(false);
        return;
      }

      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log("🧾 Token payload:", payload);
          }
        } catch (e) {
          console.warn("⚠️ Unable to decode token", e);
        }
      }
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      console.log("📥 Loading enrollments, students, and courses...");

      const [enrollmentsRes, studentsRes, coursesRes] = await Promise.all([
        fetch(`${BASE_URL}/enrollments/admin/all`, { headers }),
        fetch(`${BASE_URL}/users?role=STUDENT`, { headers }),
        fetch(`${BASE_URL}/courses`, { headers }),
      ]);

      if (!enrollmentsRes.ok) {
        const text = await enrollmentsRes.text();
        console.error("❌ Failed to fetch enrollments:", enrollmentsRes.status, text);
        throw new Error(`Failed to fetch enrollments: ${enrollmentsRes.statusText}`);
      }
      if (!studentsRes.ok) {
        console.error("❌ Failed to fetch students:", studentsRes.status);
        throw new Error(`Failed to fetch students: ${studentsRes.statusText}`);
      }
      if (!coursesRes.ok) {
        console.error("❌ Failed to fetch courses:", coursesRes.status);
        throw new Error(`Failed to fetch courses: ${coursesRes.statusText}`);
      }

      const [enrollmentsData, studentsData, coursesData] = await Promise.all([
        enrollmentsRes.json(),
        studentsRes.json(),
        coursesRes.json(),
      ]);

      console.log("✅ Loaded enrollments:", enrollmentsData);
      console.log("✅ Loaded students:", studentsData);
      console.log("✅ Loaded courses:", coursesData);

      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (err) {
      console.error("❌ Error loading data:", err.message);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // FR-Admin-05: Enroll Student in a Course
  async function addEnrollment(e) {
    e.preventDefault();
    try {
      setError("");
      setSuccessMsg("");

      if (!studentId || !courseId) {
        setError("Please select both student and course");
        return;
      }

      // Check if already enrolled
      const alreadyEnrolled = enrollments.some(
        (e) => e.student?.id === Number(studentId) && e.course?.id === Number(courseId)
      );

      if (alreadyEnrolled) {
        setError("Student is already enrolled in this course");
        return;
      }

      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      
      console.log("📤 Enrolling student...", { studentId: Number(studentId), courseId: Number(courseId) });

      const res = await fetch(`${BASE_URL}/enrollments/admin/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          studentId: Number(studentId),
          courseId: Number(courseId),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Enrollment failed:", errorData);
        throw new Error(errorData.error || "Failed to enroll student");
      }

      const result = await res.json();
      console.log("✅ Enrollment successful:", result);

      setSuccessMsg("Student enrolled successfully!");
      setStudentId("");
      setCourseId("");
      loadAllData();
    } catch (err) {
      console.error("❌ Error in addEnrollment:", err.message);
      setError(err.message || "Failed to enroll student");
    }
  }

  async function removeEnrollment(enrollmentId) {
    if (!window.confirm("Remove this enrollment?")) return;

    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      
      console.log("🗑️ Deleting enrollment:", enrollmentId);

      const res = await fetch(`${BASE_URL}/enrollments/${enrollmentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Deletion failed:", errorData);
        throw new Error(errorData.error || "Failed to remove enrollment");
      }

      const result = await res.json();
      console.log("✅ Enrollment deleted:", result);

      setSuccessMsg("Enrollment removed successfully!");
      loadAllData();
    } catch (err) {
      console.error("❌ Error in removeEnrollment:", err.message);
      setError(err.message || "Failed to remove enrollment");
    }
  }

  // Get student name by ID or from enrollment object
  function getStudentName(enrollment) {
    if (enrollment.student?.name) {
      return enrollment.student.name;
    }
    if (enrollment.studentId) {
      return students.find((s) => s.id === enrollment.studentId)?.name || `Student ${enrollment.studentId}`;
    }
    return "Unknown Student";
  }

  // Get course name by ID or from enrollment object
  function getCourseName(enrollment) {
    if (enrollment.course?.name) {
      return enrollment.course.name;
    }
    if (enrollment.courseId) {
      return courses.find((c) => c.id === enrollment.courseId)?.name || `Course ${enrollment.courseId}`;
    }
    return "Unknown Course";
  }

  // Get student ID from enrollment object
  function getStudentId(enrollment) {
    return enrollment.student?.id || enrollment.studentId;
  }

  // Get course ID from enrollment object
  function getCourseId(enrollment) {
    return enrollment.course?.id || enrollment.courseId;
  }

  // Filtered enrollments
  const filteredEnrollments = filterCourse
    ? enrollments.filter((e) => {
        const courseId = e.course?.id || e.courseId;
        return courseId === Number(filterCourse);
      })
    : enrollments;

  if (loading) return <div className="loading">Loading enrollments...</div>;

  return (
    <div className="page-container student-enrollments-page">
      <h1> Student Enrollments</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* FR-Admin-05: Single Enrollment */}
      <div className="card">
        <h2> Enroll Student in a Course</h2>
        <form onSubmit={addEnrollment}>
          <div className="form-row">
            <label>Select Student </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            >
              <option value="">-- Select Student --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Select Course </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Enroll Student
          </button>
        </form>
      </div>

      {/* Enrollments List */}
      <div className="card">
        <h2>Current Enrollments</h2>

        <div className="filter-row">
          <label>Filter by Course:</label>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {filteredEnrollments.length === 0 ? (
          <p>No enrollments found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Enrolled Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>{enrollment.id}</td>
                    <td>{getStudentName(enrollment)}</td>
                    <td>{getCourseName(enrollment)}</td>
                    <td>
                      {enrollment.enrolledDate 
                        ? new Date(enrollment.enrolledDate).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => removeEnrollment(enrollment.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="card">
        <h2>Enrollment Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Enrollments</h3>
            <p className="stat-number">{enrollments.length}</p>
          </div>
          <div className="stat-card">
            <h3>Unique Students</h3>
            <p className="stat-number">
              {new Set(enrollments.map((e) => e.student?.id || e.studentId)).size}
            </p>
          </div>
          <div className="stat-card">
            <h3>Courses with Enrollments</h3>
            <p className="stat-number">
              {new Set(enrollments.map((e) => e.course?.id || e.courseId)).size}
            </p>
          </div>
          <div className="stat-card">
            <h3>Avg. Students per Course</h3>
            <p className="stat-number">
              {courses.length > 0
                ? (enrollments.length / courses.length).toFixed(1)
                : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
