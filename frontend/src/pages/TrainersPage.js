import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function TrainersPage() {
  const { token: ctxToken } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // form
  const [empId, setEmpId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState("");

  // filter
  const [filterCourseId, setFilterCourseId] = useState("");

  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
    loadTrainers();
  }, []);

  async function loadCourses() {
    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/courses`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = res.ok ? await res.json() : [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setCourses([]);
      setError("Failed to load courses.");
    }
  }

  async function loadTrainers() {
    try {
      setLoading(true);
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/trainer`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = res.ok ? await res.json() : [];
      setTrainers(Array.isArray(data) ? data : []);
    } catch (err) {
      setTrainers([]);
      setError("Failed to load trainers.");
    } finally {
      setLoading(false);
    }
  }

  async function addTrainer(e) {
    e.preventDefault();

    if (!empId.trim() || !name.trim() || !email.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Invalid email format.");
      return;
    }
    if (!courseId) {
      setError("Please select a course.");
      return;
    }

    try {
      setError("");
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/trainer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ empId, name, email, course: { id: Number(courseId) } }),
      });
      if (!res.ok) throw new Error();

      setEmpId("");
      setName("");
      setEmail("");
      setCourseId("");

      loadTrainers();
    } catch (err) {
      setError("Failed to save trainer.");
    }
  }

  async function viewTrainer(empIdParam) {
    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/trainer/${empIdParam}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();

      const data = await res.json();
      setDetails(data);
    } catch (err) {
      setError("Failed to load trainer details.");
    }
  }

  async function deleteTrainer(id) {
    if (!window.confirm("Delete this trainer?")) return;

    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/trainer/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      loadTrainers();
    } catch (err) {
      setError("Failed to delete trainer.");
    }
  }

  function filterByCourse(cId) {
    setFilterCourseId(cId);

    if (!cId) {
      loadTrainers();
      return;
    }

    setTrainers((prev) => prev.filter((t) => t.course?.id === Number(cId)));
  }

  function clearFilter() {
    setFilterCourseId("");
    loadTrainers();
  }

  return (
    <>
      <div className="card">
        <h2>Trainers</h2>
        <p className="muted">Trainers register via the <a href="/auth/register">Register</a> page and will appear here automatically.</p>
      </div>

      <div className="card">
        <h2>Trainers List</h2>

        <div className="form-row">
          <label>Filter by Course</label>
          <select value={filterCourseId} onChange={(e) => filterByCourse(e.target.value)}>
            <option value="">Show All</option>
            {courses.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={clearFilter}>Clear</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Emp ID</th><th>Name</th><th>Email</th>
                  <th>Course ID</th><th>Course</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.empId}</td>
                    <td>{t.name}</td>
                    <td>{t.email}</td>
                    <td>{t.course?.id}</td>
                    <td>{t.course?.name}</td>
                    <td>
                      <button className="btn" onClick={() => viewTrainer(t.empId)}>View</button>
                      <button className="btn btn-danger" onClick={() => deleteTrainer(t.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {details && (
        <div className="details-panel">
          <h3>Trainer Details</h3>
          <p><b>ID:</b> {details.id}</p>
          <p><b>Emp ID:</b> {details.empId}</p>
          <p><b>Name:</b> {details.name}</p>
          <p><b>Email:</b> {details.email}</p>
          <p><b>Course:</b> {details.course?.name}</p>
        </div>
      )}
    </>
  );
}
            
