import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function MyTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user: contextUser, token: contextToken } = useContext(AuthContext) || {};

  const user =
    contextUser ||
    JSON.parse(localStorage.getItem("user") || "null") ||
    JSON.parse(sessionStorage.getItem("user") || "null") ||
    {};

  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  function dayFromIndex(dayOfWeek) {
    const dayMap = {
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
      7: "Sunday",
    };
    return dayMap[Number(dayOfWeek)] || "N/A";
  }

  function timeFromSlot(slot) {
    const slotMap = {
      1: { start: "08:00", end: "11:00" },
      2: { start: "11:00", end: "14:00" },
      3: { start: "14:00", end: "17:00" },
      4: { start: "17:00", end: "20:00" },
    };
    return slotMap[Number(slot)] || { start: "N/A", end: "N/A" };
  }

  function normalizeTime(value) {
    if (!value) return "";
    const [rawHour = "", rawMinute = ""] = String(value).trim().split(":");
    const hour = String(parseInt(rawHour, 10)).padStart(2, "0");
    const minute = String(parseInt(rawMinute, 10) || 0).padStart(2, "0");
    return `${hour}:${minute}`;
  }

  function findRoomForSlot(classSchedules, day, startTime, endTime) {
    const normalizedDay = String(day || "").trim().toLowerCase();
    const normalizedStart = normalizeTime(startTime);
    const normalizedEnd = normalizeTime(endTime);

    const exactMatch = classSchedules.find((item) => {
      const itemDay = String(item?.day || "").trim().toLowerCase();
      const itemStart = normalizeTime(item?.startTime);
      const itemEnd = normalizeTime(item?.endTime);
      return itemDay === normalizedDay && itemStart === normalizedStart && itemEnd === normalizedEnd;
    });

    if (exactMatch?.room) return exactMatch.room;

    const dayMatch = classSchedules.find(
      (item) => String(item?.day || "").trim().toLowerCase() === normalizedDay && item?.room
    );

    return dayMatch?.room || null;
  }

  useEffect(() => {
    loadTimetable();
  }, []);

  async function loadTimetable() {
    try {
      setLoading(true);
      setError("");

      if (!user?.id) {
        throw new Error("Student profile not found. Please login again.");
      }

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      // Fetch student's schedule/timetable
      const res = await fetch(
        `${BASE_URL}/schedules/student/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired. Please login again.");
        if (res.status === 403) throw new Error("Access denied for timetable. Please login again.");
        throw new Error(`Failed to fetch timetable (${res.status})`);
      }
      const data = await res.json();

      let classSchedules = [];
      try {
        const classSchedulesRes = await fetch(`${BASE_URL}/class-schedules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (classSchedulesRes.ok) {
          const classSchedulesData = await classSchedulesRes.json();
          classSchedules = Array.isArray(classSchedulesData) ? classSchedulesData : [];
        }
      } catch {
        classSchedules = [];
      }

      const sourceTimetable = Array.isArray(data)
        ? data
        : Array.isArray(data?.timetable)
        ? data.timetable
        : [];

      const normalizedTimetable = sourceTimetable.map((schedule) => {
        const derivedTime = timeFromSlot(schedule?.slot);
        const day = schedule?.day || dayFromIndex(schedule?.dayOfWeek);
        const startTime = schedule?.startTime || derivedTime.start;
        const endTime = schedule?.endTime || derivedTime.end;
        const matchedRoom = findRoomForSlot(classSchedules, day, startTime, endTime);

        return {
          day,
          startTime,
          endTime,
          moduleName: schedule?.moduleName || schedule?.courseName || "Assigned Class",
          trainerName: schedule?.trainerName || "TBA",
          room: schedule?.room || matchedRoom || "TBA",
        };
      });

      setTimetable(normalizedTimetable);
    } catch (err) {
      setError(err.message || "Failed to load timetable");
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading timetable...</div>;

  return (
    <div className="page-container student-timetable-page">
      <div className="dashboard-header">
        <h1>My Weekly Timetable</h1>
        <p className="dashboard-subtitle">Stay updated with your weekly class schedule</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="timetable-grid">
        {timetable.length === 0 ? (
          <div className="empty-state">No classes scheduled yet.</div>
        ) : (
          <div className="table-wrapper">
            <table className="timetable-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Modules</th>
                  <th>Trainer</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((schedule, idx) => (
                  <tr key={idx}>
                    <td>{schedule.day}</td>
                    <td>
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td>{schedule.moduleName}</td>
                    <td>{schedule.trainerName}</td>
                    <td>{schedule.room}</td>
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
