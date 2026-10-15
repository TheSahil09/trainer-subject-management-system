import React, { useState, useEffect } from "react";
import './TimetablePage.css';  // ADD THIS LINE after React import


export default function TimetablePage() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const weekStart = "2026-01-20";

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/schedules/student/1?weekStart=${weekStart}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.ok ? await res.json() : {};
      setTimetable(data.timetable || []);
    } catch (error) {
      console.error("Error:", error);
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-content">Loading timetable...</div>;
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>🕒 Timetable - Week of {weekStart}</h2>
        <p>Assigned slots: {timetable.length}/28</p>
      </div>

      <div className="table-container">
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Day</th>
              <th>Slot</th>
              <th>Trainer</th>
              <th>Module</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {timetable.map((slot) => (
              <tr key={slot.id}>
                <td>{slot.id}</td>
                <td>Day {slot.dayOfWeek}</td>
                <td>{slot.slot}</td>
                <td>{slot.trainerId}</td>
                <td>{slot.module?.name || slot.moduleId || slot.courseId}</td>
                <td>
                  <span className="status-badge assigned">ASSIGNED</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {timetable.length === 0 && (
        <div className="no-data">No classes assigned yet</div>
      )}
    </div>
  );
}
