import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [credits, setCredits] = useState(0);
  const [trainerId, setTrainerId] = useState("");
  const { token: ctxToken } = useContext(AuthContext);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/courses`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      const data = res.ok ? await res.json() : [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error:", err);
      setCourses([]);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }
// 
  // async function addCourse(e) {
    // e.preventDefault();
    // try {
      // const token = localStorage.getItem("token");
      // const res = await fetch(`${BASE_URL}/courses`, {
        // method: "POST",
        // headers: {
          // "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        // },
        // body: JSON.stringify({ name, description, courseId, trainerId }),
      // });
      // if (res.ok) {
        // setName("");
        // setDescription("");
        // setCourseId("");
        // setTrainerId("");
        // loadCourses();
      // } else {
        // setError("Failed to add course");
      // }
    // } catch (err) {
      // console.error("Error:", err);
      // setError("Failed to add course");
    // }
  //

function resetForm() {
  setName("");
  setDescription("");
  setCode("");
  setCredits(0);
  setTrainerId("");
  setEditingCourseId(null);
}

function startEditCourse(course) {
  setEditingCourseId(course.id);
  setName(course.name || "");
  setDescription(course.description || "");
  setCode(course.code || "");
  setCredits(course.credits ?? 0);
  setTrainerId(course.trainerId ?? course?.trainer?.id ?? "");
  setError("");
}

function cancelEdit() {
  resetForm();
  setError("");
}

async function addCourse(e) {
  e.preventDefault();

  try {
    const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      setError("You must be logged in to add a course");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    const method = editingCourseId ? "PUT" : "POST";
    const endpoint = editingCourseId ? `${BASE_URL}/courses/${editingCourseId}` : `${BASE_URL}/courses`;

    const res = await fetch(endpoint, {
     method,
     headers,
      body: JSON.stringify({ name, code, description, credits: Number(credits), trainerId: trainerId ? Number(trainerId) : null }),
    });

    if (res.ok) {
      resetForm();
      loadCourses();
    } else {
      setError(editingCourseId ? "Failed to update course" : "Failed to add course");
    }
  } catch (err) {
    console.error("Error:", err);
    setError(editingCourseId ? "Failed to update course" : "Failed to add course");
  }
}



  async function deleteCourse(id) {
    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/courses/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        loadCourses();
      } else {
        setError("Failed to delete course");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to delete course");
    }
  }

  if (loading) return <div>Loading courses...</div>;

  return (
    <div className="page-container courses-page">
      <h1>Manage Courses</h1>

      <div className="card">
        <h2>{editingCourseId ? "Edit Course" : "Add New Course"}</h2>
        <form onSubmit={addCourse} className="form-container course-form">
          <div className="form-row">
            <label>Course Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Course Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Credits</label>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Trainer ID (optional)</label>
            <input
              type="number"
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
            />
          </div>
          <div className="course-form-actions">
            <button className="btn btn-primary" type="submit">
              {editingCourseId ? "Update Course" : "Add Course"}
            </button>
            {editingCourseId && (
              <button className="btn btn-secondary" type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
          {error && <div className="error">{error}</div>}
        </form>
      </div>

      <div className="list-container">
        <h2>Courses List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>{course.description}</td>
                <td>
                  <button type="button" className="btn edit" onClick={() => startEditCourse(course)}>Edit</button>
                  <button type="button" className="btn btn-danger" onClick={() => deleteCourse(course.id)}>
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
