import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [courseId, setCourseId] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");

  // Filter and search state
  const [filterDay, setFilterDay] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [searchRoom, setSearchRoom] = useState("");
  const [sortBy, setSortBy] = useState("day");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const { token: ctxToken } = useContext(AuthContext);

  // Utility functions for filtering and statistics
  const getFilteredAndSortedSchedules = () => {
    let filtered = schedules;

    // Apply filters
    if (filterDay) {
      filtered = filtered.filter((s) => s.day === filterDay);
    }
    if (filterCourse) {
      filtered = filtered.filter((s) => s.courseId === parseInt(filterCourse));
    }
    if (searchRoom) {
      filtered = filtered.filter((s) =>
        s.room.toLowerCase().includes(searchRoom.toLowerCase())
      );
    }

    // Apply sorting
    try {
      const sorted = [...filtered].sort((a, b) => {
        // Handle undefined or null values
        if (!a || !b) return 0;
        
        if (sortBy === "day") {
          const dayA = a.day ? a.day.trim() : "";
          const dayB = b.day ? b.day.trim() : "";
          const indexA = days.indexOf(dayA);
          const indexB = days.indexOf(dayB);
          // Handle case where day is not found
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        } else if (sortBy === "time") {
          const timeA = a.startTime || "";
          const timeB = b.startTime || "";
          return timeA.localeCompare(timeB);
        } else if (sortBy === "room") {
          const roomA = (a.room || "").toLowerCase();
          const roomB = (b.room || "").toLowerCase();
          return roomA.localeCompare(roomB);
        }
        return 0;
      });
      return sorted;
    } catch (err) {
      console.error("Error sorting schedules:", err);
      return filtered;
    }
  };

  const getScheduleStats = () => {
    return {
      total: schedules.length,
      byDay: days.map((d) => ({
        day: d,
        count: schedules.filter((s) => s.day === d).length,
      })),
      uniqueCourses: [...new Set(schedules.map((s) => s.courseId))].length,
      uniqueRooms: [...new Set(schedules.map((s) => s.room))].length,
    };
  };

  useEffect(() => {
    loadSchedules();
    loadCourses();
  }, []);

  async function loadSchedules() {
    try {
      setLoading(true);
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/class-schedules`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch schedules");
      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load schedules");
      setSchedules([]);
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

  async function addSchedule(e) {
    e.preventDefault();
    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/class-schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          courseId,
          day,
          startTime,
          endTime,
          room,
        }),
      });

      if (!res.ok) throw new Error("Failed to add schedule");
      setCourseId("");
      setDay("");
      setStartTime("");
      setEndTime("");
      setRoom("");
      loadSchedules();
    } catch (err) {
      setError("Failed to add schedule");
    }
  }

  async function deleteSchedule(id) {
    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/class-schedules/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Failed to delete schedule");
      loadSchedules();
    } catch (err) {
      setError("Failed to delete schedule");
    }
  }

  async function startEditSchedule(schedule) {
    setCourseId(String(schedule.courseId));
    setDay(schedule.day);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setRoom(schedule.room);
    setEditingId(schedule.id);
    setError("");
    setSuccessMsg("");
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function updateSchedule(e) {
    e.preventDefault();
    try {
      if (!editingId) return;

      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/class-schedules/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          courseId,
          day,
          startTime,
          endTime,
          room,
        }),
      });

      if (!res.ok) throw new Error("Failed to update schedule");
      setSuccessMsg("Schedule updated successfully!");
      cancelEdit();
      loadSchedules();
    } catch (err) {
      setError("Failed to update schedule");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setCourseId("");
    setDay("");
    setStartTime("");
    setEndTime("");
    setRoom("");
    setError("");
  }

  if (loading) return <div>Loading schedules...</div>;

  return (
    <div className="page-container schedules-page">
      <h1>Manage Schedules</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="card">
        <h2>{editingId ? "📝 Edit Schedule" : "➕ Add New Schedule"}</h2>
        <form onSubmit={editingId ? updateSchedule : addSchedule} className="form-container schedule-form">
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
          <div className="form-row">
            <label>Day</label>
            <select value={day} onChange={(e) => setDay(e.target.value)} required>
              <option value="">Select Day</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Room Number</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              required
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              {editingId ? "Update Schedule" : "Add Schedule"}
            </button>
            {editingId && (
              <button 
                className="btn btn-secondary" 
                type="button" 
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
          {error && <div className="error">{error}</div>}
        </form>
      </div>

      <div className="list-container">
        <h2>📋 Manage Schedules</h2>

        {/* Statistics Section */}
        <div className="schedules-stats">
          <div className="stat-item">
            <span className="stat-label">Total Schedules</span>
            <span className="stat-value">{getScheduleStats().total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unique Courses</span>
            <span className="stat-value">{getScheduleStats().uniqueCourses}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unique Rooms</span>
            <span className="stat-value">{getScheduleStats().uniqueRooms}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Days with Classes</span>
            <span className="stat-value">
              {getScheduleStats().byDay.filter((d) => d.count > 0).length}
            </span>
          </div>
        </div>

        {/* Filter and Search Section */}
        <div className="filter-search-section">
          <div className="filter-group">
            <label>Filter by Day:</label>
            <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
              <option value="">-- All Days --</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Course:</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="">-- All Courses --</option>
              {courses.map((course) => {
                return (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="search-group">
            <label>Search by Room:</label>
            <input
              type="text"
              placeholder="e.g., A101, B202"
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
            />
          </div>

          <div className="sort-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="day">Day</option>
              <option value="time">Time</option>
              <option value="room">Room</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          Showing {getFilteredAndSortedSchedules().length} of {schedules.length} schedules
        </div>

        {/* Schedules Table */}
        {getFilteredAndSortedSchedules().length === 0 ? (
          <div className="no-data">
            <p>No schedules found matching your filters.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Room</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAndSortedSchedules().map((schedule) => (
                  <tr key={schedule.id}>
                    <td>{schedule.id}</td>
                    <td>
                      {courses.find((c) => c.id === schedule.courseId)?.name ||
                        `Course ${schedule.courseId}`}
                    </td>
                    <td>{schedule.day}</td>
                    <td>
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td>
                      <span className="room-badge">{schedule.room}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-edit"
                        onClick={() => startEditSchedule(schedule)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => deleteSchedule(schedule.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
