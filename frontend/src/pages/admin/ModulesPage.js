import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function ModulesPage() {
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState("");
  const [editingId, setEditingId] = useState(null);

  const { token: ctxToken } = useContext(AuthContext);

  const stats = {
    totalModules: modules.length,
    linkedCourses: new Set(
      modules
        .map((module) => module.courseId ?? module.course?.id)
        .filter((value) => value !== undefined && value !== null)
    ).size,
  };

  useEffect(() => {
    loadModules();
    loadCourses();
  }, []);

  async function loadModules() {
    try {
      setLoading(true);
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/modules`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch modules");
      const data = await res.json();
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load modules");
      setModules([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCourses() {
    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/courses`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setCourses([]);
    }
  }

  async function addModule(e) {
    e.preventDefault();
    try {
      setError("");
      setSuccessMsg("");
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          description: content,
          course: { id: Number(courseId) },
        }),
      });

      if (!res.ok) throw new Error("Failed to add module");
      setName("");
      setContent("");
      setCourseId("");
      setSuccessMsg("Module added successfully!");
      loadModules();
    } catch (err) {
      setError("Failed to add module");
    }
  }

  function startEditModule(module) {
    setEditingId(module.id);
    setName(module.name || "");
    setContent(module.description || module.content || "");
    setCourseId(String(module.courseId ?? module.course?.id ?? ""));
    setError("");
    setSuccessMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setContent("");
    setCourseId("");
    setError("");
  }

  async function updateModule(e) {
    e.preventDefault();
    if (!editingId) return;

    try {
      setError("");
      setSuccessMsg("");
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/modules/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          description: content,
          course: { id: Number(courseId) },
        }),
      });

      if (!res.ok) throw new Error("Failed to update module");

      setSuccessMsg("Module updated successfully!");
      cancelEdit();
      loadModules();
    } catch (err) {
      setError("Failed to update module");
    }
  }

  async function deleteModule(id) {
    try {
      setError("");
      setSuccessMsg("");
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/modules/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Failed to delete module");
      setSuccessMsg("Module deleted successfully!");
      loadModules();
    } catch (err) {
      setError("Failed to delete module");
    }
  }

  if (loading) return <div>Loading modules...</div>;

  return (
    <div className="page-container modules-page">
      <h1>Manage Modules</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="card">
        <h2>{editingId ? "📝 Edit Module" : "➕ Add New Module"}</h2>
        <form onSubmit={editingId ? updateModule : addModule} className="form-container module-form">
          <div className="form-row">
            <label>Module Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Module Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Course</label>
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
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              {editingId ? "Update Module" : "Add Module"}
            </button>
            {editingId && (
              <button className="btn btn-secondary" type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="list-container">
        <h2>Modules List</h2>

        <div className="modules-stats">
          <div className="stat-item">
            <span className="stat-label">Total Modules</span>
            <span className="stat-value">{stats.totalModules}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Linked Courses</span>
            <span className="stat-value">{stats.linkedCourses}</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="management-table modules-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Course ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => (
                <tr key={module.id}>
                  <td>{module.id}</td>
                  <td>{module.name}</td>
                  <td>
                    <span className="course-id-badge">{module.courseId ?? module.course?.id ?? "N/A"}</span>
                  </td>
                  <td>
                    <button className="btn btn-edit" type="button" onClick={() => startEditModule(module)}>
                      Edit
                    </button>
                    <button className="btn btn-delete" type="button" onClick={() => deleteModule(module.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
