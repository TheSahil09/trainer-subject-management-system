import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import "./TimetablePage.css";

function TrainerDashboard({ initialSection = "profile" }) {
  const [timetable, setTimetable] = useState([]);
  const [modulesById, setModulesById] = useState({});
  const [coursesById, setCoursesById] = useState({});
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trainerInfo, setTrainerInfo] = useState(null);

  // Use AuthContext for consistent token and user data
  const { user, token } = useContext(AuthContext);
  
  // Fallback to storage if context not available
  const trainerId = user?.id || (() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user")) || {};
    return storedUser.id;
  })();

  const authToken = token || sessionStorage.getItem("token") || localStorage.getItem("token");
  const userEmail = user?.email || (() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user")) || {};
    return storedUser.email;
  })();

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const dayLabels = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
  };

  function formatDateYmd(date) {
    return date.toISOString().slice(0, 10);
  }

  function getUpcomingDateForDay(dayOfWeek) {
    const target = Number(dayOfWeek);
    if (!target || target < 1 || target > 7) return "-";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentDay = ((today.getDay() + 6) % 7) + 1; // Mon=1..Sun=7
    const delta = target >= currentDay ? target - currentDay : 7 - (currentDay - target);
    const next = new Date(today);
    next.setDate(today.getDate() + delta);
    return formatDateYmd(next);
  }

  function getDisplayDate(slot) {
    const dayOfWeek = Number(slot?.dayOfWeek);
    const weekStart = slot?.weekStart;

    if (weekStart && dayOfWeek >= 1 && dayOfWeek <= 7) {
      const base = new Date(weekStart);
      if (!Number.isNaN(base.getTime())) {
        const classDate = new Date(base);
        classDate.setDate(base.getDate() + (dayOfWeek - 1));

        const today = new Date();
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (classDate < todayOnly) {
          const diffDays = Math.floor((todayOnly - classDate) / (1000 * 60 * 60 * 24));
          const weeksToAdd = Math.ceil(diffDays / 7);
          classDate.setDate(classDate.getDate() + (weeksToAdd * 7));
        }

        return formatDateYmd(classDate);
      }
    }

    return getUpcomingDateForDay(dayOfWeek);
  }

  const fetchTrainerData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch trainer's timetable
      const response = await fetch(
        `http://localhost:8080/api/schedules/trainer/${trainerId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login again");
        } else if (response.status === 404) {
          throw new Error("Trainer not found");
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Trainer timetable loaded:", data);

      const [modulesRes, coursesRes] = await Promise.all([
        fetch("http://localhost:8080/api/modules", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:8080/api/courses", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      const modulesData = modulesRes.ok ? await modulesRes.json() : [];
      const coursesData = coursesRes.ok ? await coursesRes.json() : [];

      let profileData = null;
      try {
        const trainerRes = await fetch("http://localhost:8080/api/trainer", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        if (trainerRes.ok) {
          const trainers = await trainerRes.json();
          if (Array.isArray(trainers)) {
            profileData = trainers.find(
              (trainer) => trainer?.email?.toLowerCase() === userEmail?.toLowerCase()
            ) || null;
          }
        }
      } catch (profileErr) {
        console.warn("Could not fetch trainer profile details", profileErr);
      }

      const moduleMap = Array.isArray(modulesData)
        ? modulesData.reduce((acc, module) => {
            acc[module.id] = module;
            return acc;
          }, {})
        : {};

      const courseMap = Array.isArray(coursesData)
        ? coursesData.reduce((acc, course) => {
            acc[course.id] = course;
            return acc;
          }, {})
        : {};
      
      setTimetable(data.timetable || []);
      setModulesById(moduleMap);
      setCoursesById(courseMap);
      setTrainerProfile(profileData);
      setTrainerInfo({
        trainerId: data.trainerId,
        totalSlots: data.totalAssignedSlots,
      });
    } catch (err) {
      console.error("❌ Error fetching trainer data:", err);
      setError(err.message || "Failed to load timetable");
      setTimetable([]);
      setModulesById({});
      setCoursesById({});
      setTrainerProfile(null);
    } finally {
      setLoading(false);
    }
  }, [trainerId, authToken, userEmail]);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const getModuleName = (moduleId) => {
    if (!moduleId) return "-";
    const module = modulesById[moduleId];
    return module?.name || `Module ${moduleId}`;
  };

  const getCourseName = (slot) => {
    if (!slot?.moduleId) return "-";
    const module = modulesById[slot.moduleId];
    const courseId = module?.courseId ?? module?.course?.id;
    if (!courseId) return "-";
    return coursesById[courseId]?.name || module?.course?.name || `Course ${courseId}`;
  };

  const assignedCourseNames = Array.from(
    new Set(
      timetable
        .map((slot) => getCourseName(slot))
        .filter((courseName) => courseName && courseName !== "-")
    )
  );

  const allAssignedCourses = trainerProfile?.course?.name
    ? [trainerProfile.course.name, ...assignedCourseNames.filter((n) => n !== trainerProfile.course.name)]
    : assignedCourseNames;

  useEffect(() => {
    if (!trainerId || !authToken) {
      setError("User not authenticated. Please login.");
      setLoading(false);
      return;
    }

    fetchTrainerData();
  }, [trainerId, authToken, fetchTrainerData]);

  if (loading) {
    return (
      <div className="trainer-dashboard">
        <h2>My Timetable</h2>
        <div className="loading">Loading your timetable...</div>
      </div>
    );
  }

  return (
    <div className="trainer-dashboard">
      <h2>Trainer Dashboard</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={`btn ${activeSection === "profile" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveSection("profile")}
        >
          Profile
        </button>
        <button
          type="button"
          className={`btn ${activeSection === "timetable" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveSection("timetable")}
        >
          Timetable
        </button>
      </div>

      {user && (
        <div className="trainer-info">
          <p>
            <strong>Welcome:</strong> {user.name || user.email}
          </p>
          {trainerInfo && (
            <p>
              <strong>Total Assigned Slots:</strong> {trainerInfo.totalSlots}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {activeSection === "profile" && (
        <div className="card">
          <h3>My Profile</h3>
          <p><strong>Name:</strong> {user?.name || "-"}</p>
          <p><strong>Email:</strong> {user?.email || "-"}</p>
          <p><strong>Role:</strong> {user?.role || "TRAINER"}</p>
          <p><strong>Trainer ID:</strong> {trainerInfo?.trainerId || trainerProfile?.id || "-"}</p>
          <p><strong>Employee ID:</strong> {trainerProfile?.empId || "-"}</p>
          <p><strong>Assigned Course(s):</strong></p>
          {allAssignedCourses.length > 0 ? (
            <ul className="enrolled-courses-list">
              {allAssignedCourses.map((courseName, idx) => (
                <li key={idx} className="enrolled-course-item">{courseName}</li>
              ))}
            </ul>
          ) : (
            <p style={{ marginLeft: "16px", color: "#64748b" }}>Not assigned</p>
          )}
          <p><strong>Total Assigned Slots:</strong> {trainerInfo?.totalSlots ?? 0}</p>
        </div>
      )}

      {activeSection === "timetable" && (!error && timetable.length === 0 ? (
        <div className="no-data">
          <p>📅 No assigned slots yet</p>
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            Contact your administrator to assign you to teaching slots.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="timetable">
            <thead>
              <tr>
                <th>Week Start</th>
                <th>Day</th>
                <th>Slot</th>
                <th>Module</th>
                <th>Course</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map((slot) => (
                <tr key={slot.id}>
                  <td>{getDisplayDate(slot)}</td>
                  <td>{dayLabels[slot.dayOfWeek] || `Day ${slot.dayOfWeek}`}</td>
                  <td>Slot {slot.slot}</td>
                  <td>{getModuleName(slot.moduleId)}</td>
                  <td>{getCourseName(slot)}</td>
                  <td>
                    <span className={`status-badge ${slot.status?.toLowerCase()}`}>
                      {slot.status || "ASSIGNED"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default TrainerDashboard;