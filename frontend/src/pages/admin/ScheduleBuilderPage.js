import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function ScheduleBuilderPage() {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Week management
  const [expandedWeeks, setExpandedWeeks] = useState(new Set());
  const [selectedWeekFilter, setSelectedWeekFilter] = useState("");

  // Create blank schedule form
  const [newScheduleName, setNewScheduleName] = useState("");
  const [newScheduleStartDate, setNewScheduleStartDate] = useState("");

  // Allocate time slot form
  // instead of picking an individual slot ID we pick the weekStart string and compute slotId later
  const [selectedWeekStart, setSelectedWeekStart] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedTrainerId, setSelectedTrainerId] = useState("");

  // View schedule details
  const [expandedSchedule, setExpandedSchedule] = useState(null);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const timeSlots = [
    { label: "8 AM - 11 AM", start: "08:00", end: "11:00" },
    { label: "11 AM - 2 PM", start: "11:00", end: "14:00" },
    { label: "2 PM - 5 PM", start: "14:00", end: "17:00" },
    { label: "5 PM - 8 PM", start: "17:00", end: "20:00" },
  ];

  const { token: ctxToken } = useContext(AuthContext);

  // Utility functions
  const getDayName = (dayIndex) => {
    const dayMap = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday" };
    return dayMap[dayIndex] || `Day ${dayIndex}`;
  };

  const getTimeSlotLabel = (slotNumber) => {
    const slotsMap = { 1: "8 AM - 11 AM", 2: "11 AM - 2 PM", 3: "2 PM - 5 PM", 4: "5 PM - 8 PM" };
    return slotsMap[slotNumber] || `Slot ${slotNumber}`;
  };

  const toggleWeek = (week) => {
    setExpandedWeeks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(week)) {
        newSet.delete(week);
      } else {
        newSet.add(week);
      }
      return newSet;
    });
  };

  const getWeeksFromSchedules = () => {
    return [...new Set(schedules.map((s) => s.weekStart))].sort();
  };

  const getSchedulesForWeek = (week) => {
    return schedules.filter((s) => s.weekStart === week).sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.slot - b.slot;
    });
  };

  const getWeekStats = (week) => {
    const weekSchedules = getSchedulesForWeek(week);
    return {
      total: weekSchedules.length,
      available: weekSchedules.filter((s) => s.status === "AVAILABLE").length,
      allocated: weekSchedules.filter((s) => s.status === "ASSIGNED").length,
    };
  };

  useEffect(() => {
    loadAllData();
  }, [ctxToken]);

  async function loadAllData() {
    try {
      setLoading(true);
      const token = ctxToken || sessionStorage.getItem("token") || localStorage.getItem("token");
      console.log("🔐 (ScheduleBuilder) Using token:", token);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [schedulesRes, coursesRes, trainersRes, modulesRes] = await Promise.all([
          fetch(`${BASE_URL}/schedules`, { headers }),
          fetch(`${BASE_URL}/courses`, { headers }),
          fetch(`${BASE_URL}/trainer`, { headers }),
          fetch(`${BASE_URL}/modules`, { headers }),
        ]);

      if (!schedulesRes.ok || !coursesRes.ok || !trainersRes.ok || !modulesRes.ok) {
        console.error("❌ loadAllData encountered bad response", {
          schedules: schedulesRes.status,
          courses: coursesRes.status,
          trainers: trainersRes.status,
          modules: modulesRes.status,
        });
        throw new Error("Failed to fetch data");
      }

      const [schedulesData, coursesData, trainersData, modulesData] =
        await Promise.all([
          schedulesRes.json(),
          coursesRes.json(),
          trainersRes.json(),
          modulesRes.json(),
        ]);

      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setTrainers(Array.isArray(trainersData) ? trainersData : []);
      setModules(Array.isArray(modulesData) ? modulesData : []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function createBlankSchedule(e) {
    e.preventDefault();
    try {
      setError("");
      setSuccessMsg("");

      if (!newScheduleName.trim() || !newScheduleStartDate) {
        setError("Schedule name and start date are required");
        return;
      }

      if (
        !window.confirm(
          `This will DELETE all existing schedule data and create a fresh 1-week schedule starting ${newScheduleStartDate}. Continue?`
        )
      ) {
        return;
      }

      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${BASE_URL}/schedules/create-blank`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          weekStart: newScheduleStartDate,
        }),
      });

      if (!res.ok) throw new Error("Failed to create schedule");
      setSuccessMsg("Blank schedule created successfully!");
      setNewScheduleName("");
      setNewScheduleStartDate("");
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to create schedule");
    }
  }

  async function allocateTimeSlot(e) {
    e.preventDefault();
    try {
      setError("");
      setSuccessMsg("");

      if (
        !selectedWeekStart ||
        !selectedDay ||
        selectedSlot === "" ||
        !selectedModuleId ||
        !selectedTrainerId
      ) {
        setError("All fields are required");
        return;
      }

      // find the specific slot record matching week/day/time and available
      const slotNumber = Number(selectedSlot) + 1; // timeSlots index -> slot number
      const dayIndex = days.indexOf(selectedDay) + 1;
      const weekDate = selectedWeekStart;
      const slotObj = schedules.find(
        (s) =>
          s.weekStart === weekDate &&
          s.dayOfWeek === dayIndex &&
          s.slot === slotNumber &&
          s.status === "AVAILABLE"
      );

      if (!slotObj) {
        setError("Selected slot is not available. Please refresh and try again.");
        return;
      }

      const token = ctxToken || sessionStorage.getItem("token") || localStorage.getItem("token");
      console.log("🔐 allocateTimeSlot using token", token);
      if (!token) {
        setError("Authentication required to allocate a slot. Please login again.");
        return;
      }
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      console.log("📤 Allocating slot id", slotObj.id, "for week", weekDate);

      const res = await fetch(`${BASE_URL}/schedules/slot/${slotObj.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          moduleId: Number(selectedModuleId),
          trainerId: Number(selectedTrainerId),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ allocateTimeSlot failed", res.status, text);
        throw new Error(`Failed to allocate time slot (${res.status})`);
      }

      setSuccessMsg("Time slot allocated successfully!");
      setSelectedWeekStart("");
      setSelectedDay("");
      setSelectedSlot("");
      setSelectedModuleId("");
      setSelectedTrainerId("");
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to allocate time slot");
    }
  }

  async function deleteSchedule(id) {
    if (!window.confirm("Delete this schedule?")) return;

    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/schedules/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Failed to delete schedule");
      setSuccessMsg("Schedule deleted successfully!");
      loadAllData();
    } catch (err) {
      setError("Failed to delete schedule");
    }
  }

  if (loading) return <div className="loading">Loading schedule builder...</div>;

  return (
    <div className="page-container schedule-builder-page">
      <h1>📅 Weekly Schedule Builder</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Create Blank Schedule */}
      <div className="card">
        <h2>Create Blank Weekly Schedule</h2>
        <form onSubmit={createBlankSchedule}>
          <div className="form-row">
            <label>Schedule Name </label>
            <input
              type="text"
              placeholder="e.g., Week 1 - Jan 2026"
              value={newScheduleName}
              onChange={(e) => setNewScheduleName(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Start Date </label>
            <input
              type="date"
              value={newScheduleStartDate}
              onChange={(e) => setNewScheduleStartDate(e.target.value)}
              required
            />
          </div>
          <p className="info-text">
            ⚠️ This will <strong>replace all existing schedule data</strong> and create exactly
            1 week (7 days × 4 time slots = 28 slots) starting from the date you choose.
          </p>
          <button type="submit" className="btn btn-primary">
            Create Blank Schedule
          </button>
        </form>
      </div>

      {/* Allocate Time Slots */}
      <div className="card">
        <h2>Allocate Time Slots</h2>
        <form onSubmit={allocateTimeSlot}>
          <div className="form-row">
            <label>Week Starting</label>
            <select
              value={selectedWeekStart}
              onChange={(e) => setSelectedWeekStart(e.target.value)}
              required
            >
              <option value="">-- Select Week --</option>
              {[...new Set(schedules.map((s) => s.weekStart))].map((week) => (
                <option key={week} value={week}>
                  {week}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Day </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              required
            >
              <option value="">-- Select Day --</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Time Slot </label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              required
            >
              <option value="">-- Select Time Slot --</option>
              {timeSlots.map((slot, idx) => (
                <option key={idx} value={idx}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Module </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              required
            >
              <option value="">-- Select Module --</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Trainer </label>
            <select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              required
            >
              <option value="">-- Select Trainer --</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name} ({trainer.empId})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Allocate Time Slot
          </button>
        </form>
      </div>

      {/* Schedules List */}
      <div className="card">
        <h2>📋 Manage Schedules</h2>
        {schedules.length === 0 ? (
          <p>No schedules created yet.</p>
        ) : (
          <>
            {/* Stats Section */}
            <div className="schedules-stats">
              <div className="stat-item">
                <span className="stat-label">Total Slots</span>
                <span className="stat-value">{schedules.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Available</span>
                <span className="stat-value">
                  {schedules.filter((s) => s.status === "AVAILABLE").length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Allocated</span>
                <span className="stat-value">
                  {schedules.filter((s) => s.status === "ASSIGNED").length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Unique Weeks</span>
                <span className="stat-value">
                  {[...new Set(schedules.map((s) => s.weekStart))].length}
                </span>
              </div>
            </div>

            {/* Week Filter */}
            <div className="week-filter-section">
              <label>Filter by Week:</label>
              <select
                value={selectedWeekFilter}
                onChange={(e) => setSelectedWeekFilter(e.target.value)}
              >
                <option value="">-- All Weeks --</option>
                {getWeeksFromSchedules().map((week) => (
                  <option key={week} value={week}>
                    {week}
                  </option>
                ))}
              </select>
            </div>

            {/* Grouped Schedule List by Week */}
            <div className="schedule-weeks-container">
              {getWeeksFromSchedules()
                .filter((week) => !selectedWeekFilter || week === selectedWeekFilter)
                .map((week) => {
                  const stats = getWeekStats(week);
                  const isExpanded = expandedWeeks.has(week);
                  const weekSchedules = getSchedulesForWeek(week);
                  const groupedByDay = {};
                  weekSchedules.forEach((s) => {
                    if (!groupedByDay[s.dayOfWeek]) groupedByDay[s.dayOfWeek] = [];
                    groupedByDay[s.dayOfWeek].push(s);
                  });

                  return (
                    <div key={week} className="week-section">
                      {/* Week Header */}
                      <div className="week-header" onClick={() => toggleWeek(week)}>
                        <div className="week-header-left">
                          <span className="week-toggle">
                            {isExpanded ? "▼" : "▶"}
                          </span>
                          <span className="week-title">Week of {week}</span>
                        </div>
                        <div className="week-header-stats">
                          <span className="stat-badge">
                            <span className="badge-label">Total:</span>
                            <span className="badge-value">{stats.total}</span>
                          </span>
                          <span className="stat-badge">
                            <span className="badge-label">Available:</span>
                            <span className="badge-value available">{stats.available}</span>
                          </span>
                          <span className="stat-badge">
                            <span className="badge-label">Allocated:</span>
                            <span className="badge-value allocated">{stats.allocated}</span>
                          </span>
                        </div>
                      </div>

                      {/* Week Content */}
                      {isExpanded && (
                        <div className="week-content">
                          {Object.entries(groupedByDay)
                            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                            .map(([dayNum, daySchedules]) => (
                              <div key={dayNum} className="day-group">
                                <div className="day-header">
                                  <h4>{getDayName(parseInt(dayNum))}</h4>
                                  <span className="day-slot-count">
                                    {daySchedules.length} slots
                                  </span>
                                </div>
                                <div className="slots-grid">
                                  {daySchedules.map((schedule) => (
                                    <div
                                      key={schedule.id}
                                      className={`slot-card slot-${schedule.status.toLowerCase()}`}
                                    >
                                      <div className="slot-time">
                                        {getTimeSlotLabel(schedule.slot)}
                                      </div>
                                      <div className="slot-details">
                                        <div>
                                          <span className="detail-label">Trainer:</span>
                                          <span className="detail-value">
                                            {schedule.trainerId ? `ID: ${schedule.trainerId}` : "Unassigned"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="detail-label">Module:</span>
                                          <span className="detail-value">
                                            {schedule.moduleId ? `ID: ${schedule.moduleId}` : "Unassigned"}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="slot-status">
                                        <span className={`badge badge-${schedule.status.toLowerCase()}`}>
                                          {schedule.status}
                                        </span>
                                      </div>
                                      <div className="slot-actions">
                                        <button
                                          className="btn btn-sm btn-danger"
                                          onClick={() => deleteSchedule(schedule.id)}
                                          title="Delete this slot"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>

      {/* Slot Details (each schedule entry is a slot) */}
      {expandedSchedule && (
        <div className="card schedule-details">
          <h3>Slot Details</h3>
          {schedules
            .filter((s) => s.id === expandedSchedule)
            .map((slot) => (
              <div key={slot.id} style={{ lineHeight: 1.5 }}>
                <p>
                  <strong>ID:</strong> {slot.id}
                </p>
                <p>
                  <strong>Week Start:</strong> {slot.weekStart}
                </p>
                <p>
                  <strong>Day:</strong> {slot.dayOfWeek}
                </p>
                <p>
                  <strong>Slot:</strong> {slot.slot}
                </p>
                <p>
                  <strong>Status:</strong> {slot.status || "-"}
                </p>
                <p>
                  <strong>Trainer ID:</strong> {slot.trainerId || "-"}
                </p>
                <p>
                  <strong>Module ID:</strong> {slot.moduleId || "-"}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
