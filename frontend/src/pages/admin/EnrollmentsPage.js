import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost:8080/api";

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    loadEnrollments();
    loadStudents();
    loadCourses();
  }, []);

  async function loadEnrollments() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/enrollments`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      const data = await res.json();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load enrollments");
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/users?role=STUDENT`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setStudents([]);
    }
  }

  async function loadCourses() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/courses`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setCourses([]);
    }
  }

  async function addEnrollment(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/enrollments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId,
          courseId,
          enrolledDate: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to add enrollment");
      setStudentId("");
      setCourseId("");
      loadEnrollments();
    } catch (err) {
      setError("Failed to add enrollment");
    }
  }

  async function deleteEnrollment(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/enrollments/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to delete enrollment");
      loadEnrollments();
    } catch (err) {
      setError("Failed to delete enrollment");
    }
  }

  if (loading) return <div>Loading enrollments...</div>;

  return (
    <div className="page-container enrollments-page">
      <h1>Manage Enrollments</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={addEnrollment} className="form-container">
        <h2>Add New Enrollment</h2>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        >
          <option value="">Select Student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
        <button type="submit">Add Enrollment</button>
      </form>

      <div className="list-container">
        <h2>Enrollments List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student ID</th>
              <th>Course ID</th>
              <th>Enrolled Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td>{enrollment.id}</td>
                <td>{enrollment.studentId}</td>
                <td>{enrollment.courseId}</td>
                <td>
                  {new Date(enrollment.enrolledDate).toLocaleDateString()}
                </td>
                <td>
                  <button onClick={() => deleteEnrollment(enrollment.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
