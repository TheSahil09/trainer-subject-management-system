import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function TrainersPage() {
  const { token: ctxToken } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [details, setDetails] = useState(null);

  // allocation form state
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");

  useEffect(() => {
    loadCourses();
    loadTrainers();
  }, []);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  async function loadCourses() {
    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/courses`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
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
      const res = await fetch(`${BASE_URL}/trainer`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = res.ok ? await res.json() : [];
      setTrainers(Array.isArray(data) ? data : []);
    } catch (err) {
      setTrainers([]);
      setError("Failed to load trainers.");
    } finally {
      setLoading(false);
    }
  }

  async function allocateTrainer(e) {
    e.preventDefault();
    if (!selectedTrainerId || !selectedCourseId) {
      setError("Please select both trainer and course.");
      return;
    }

    try {
      setError("");
      setSuccessMsg("");
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/trainer/${selectedTrainerId}/assign-course`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ courseId: Number(selectedCourseId) }),
      });
      if (!res.ok) {
        const text = await res.text();
        let payload = {};
        try { payload = text ? JSON.parse(text) : {}; } catch { payload = {}; }
        throw new Error(payload.error || payload.message || "Failed to allocate trainer");
      }

      const trainerName = trainers.find((trainer) => trainer.id === Number(selectedTrainerId))?.name || "Trainer";
      const courseName = courses.find((course) => course.id === Number(selectedCourseId))?.name || "Course";
      setSuccessMsg(`${trainerName} allocated to ${courseName}.`);
      setSelectedTrainerId("");
      setSelectedCourseId("");
      loadTrainers();
    } catch (err) {
      setError(err.message || "Failed to allocate trainer.");
    }
  }

  async function viewTrainer(empIdParam) {
    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/trainer/${empIdParam}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
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
      setError("");
      setSuccessMsg("");
      
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/trainer/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!res.ok) {
        const text = await res.text();
        let payload = {};
        try {
          payload = text ? JSON.parse(text) : {};
        } catch {
          payload = {};
        }
        throw new Error(payload.error || `Failed to delete trainer (Status: ${res.status})`);
      }
      
      // Optimistic update: Remove trainer from UI immediately
      setTrainers(prevTrainers => prevTrainers.filter(t => t.id !== id));
      
      // Clear details if the deleted trainer was being viewed
      if (details && details.id === id) {
        setDetails(null);
      }
      
      setSuccessMsg("Trainer deleted successfully!");
      
      // Refresh from server to ensure consistency
      setTimeout(() => {
        loadTrainers();
      }, 500);
    } catch (err) {
      console.error("Delete trainer error:", err);
      setError(err.message || "Failed to delete trainer.");
    }
  }

  function getResolvedCourse(trainer) {
    if (trainer?.course?.id) return trainer.course;

    const trainerEmail = String(trainer?.email || "").trim().toLowerCase();
    const trainerEmpId = String(trainer?.empId || "").trim();
    if (!trainerEmail) return null;

    const matchedCourse = courses.find((course) => {
      const assignedTrainerEmail = String(course?.trainer?.email || "").trim().toLowerCase();
      const assignedTrainerUserId = course?.trainer?.id;
      const assignedTrainerEmpId = assignedTrainerUserId != null ? `U${assignedTrainerUserId}` : "";
      return (
        (assignedTrainerEmail && assignedTrainerEmail === trainerEmail) ||
        (trainerEmpId && assignedTrainerEmpId && trainerEmpId === assignedTrainerEmpId)
      );
    });

    return matchedCourse || null;
  }

  function getResolvedCourseName(trainer) {
    return getResolvedCourse(trainer)?.name || "—";
  }

  function filterByCourse(cId) {
    setFilterCourseId(cId);
    if (!cId) { loadTrainers(); return; }
    setTrainers(prev => prev.filter(t => getResolvedCourse(t)?.id === Number(cId)));
  }

  function clearFilter() { setFilterCourseId(""); loadTrainers(); }

  const persistedTrainers = trainers.filter((trainer) => trainer?.id != null);

  return (
    <div className="page-container trainers-page">
      <h1>Manage Trainers</h1>

      <div className="card">
        <h2>Allocate Trainer to Course</h2>
        <form onSubmit={allocateTrainer}>
          <div className="form-row">
            <label>Select Trainer</label>
            <select value={selectedTrainerId} onChange={(e) => setSelectedTrainerId(e.target.value)}>
              <option value="">Select Trainer</option>
              {persistedTrainers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Select Course</label>
            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">Allocate</button>
          {successMsg && <div className="success">{successMsg}</div>}
        </form>
      </div>

      <div className="card">
        <h2>Trainers List</h2>
        <div className="form-row">
          <label>Filter by Course</label>
          <select value={filterCourseId} onChange={(e) => filterByCourse(e.target.value)}>
            <option value="">Show All</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={clearFilter}>Clear</button>
        </div>

        {loading ? <p>Loading...</p> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Emp ID</th><th>Name</th><th>Email</th><th>Course</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {persistedTrainers.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.empId}</td>
                    <td>{t.name}</td>
                    <td>{t.email}</td>
                    <td>{getResolvedCourseName(t)}</td>
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
          <p><b>Course:</b> {getResolvedCourseName(details)}</p>
        </div>
      )}
    </div>
  );
}
