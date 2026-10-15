import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:8080/api";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedModules: 0,
    upcomingClasses: 0,
  });
  const [enrolledCourseNames, setEnrolledCourseNames] = useState([]);
  const [upcomingLectures, setUpcomingLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Use AuthContext for consistent user and token data
  const { user: contextUser, token: contextToken } = useContext(AuthContext) || {};

  const user = contextUser || 
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user")) ||
    {};

  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  const displayName =
    user?.name ||
    user?.username ||
    (typeof user?.email === "string" ? user.email.split("@")[0] : null) ||
    "Student";

  useEffect(() => {
    loadStats();
  }, []);

  function toMondayBasedDay(jsDay) {
    return ((jsDay + 6) % 7) + 1; // JS: Sun=0...Sat=6 -> Mon=1...Sun=7
  }

  function slotEndTime(slot) {
    const slotEndByNumber = {
      1: "11:00",
      2: "14:00",
      3: "17:00",
      4: "20:00",
    };
    return slotEndByNumber[Number(slot)] || "23:59";
  }

  function slotStartTime(slot) {
    const slotStartByNumber = {
      1: "08:00",
      2: "11:00",
      3: "14:00",
      4: "17:00",
    };
    return slotStartByNumber[Number(slot)] || "08:00";
  }

  function dayLabel(dayOfWeek) {
    const labels = {
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
      7: "Sunday",
    };
    return labels[Number(dayOfWeek)] || "Day";
  }

  function getUpcomingTimetableEntries(timetable) {
    if (!Array.isArray(timetable) || timetable.length === 0) return [];

    const now = new Date();
    const todayYmd = now.toISOString().slice(0, 10);
    const currentDay = toMondayBasedDay(now.getDay());
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const dateBasedUpcoming = timetable.filter((slot) => {
      const weekStart = slot?.weekStart;
      const dayOfWeek = Number(slot?.dayOfWeek);

      if (!weekStart || !dayOfWeek) return false;

      const classDate = new Date(weekStart);
      if (Number.isNaN(classDate.getTime())) return false;

      classDate.setDate(classDate.getDate() + (dayOfWeek - 1));
      const classYmd = classDate.toISOString().slice(0, 10);

      if (classYmd > todayYmd) return true;
      if (classYmd < todayYmd) return false;

      if (dayOfWeek > currentDay) return true;
      if (dayOfWeek < currentDay) return false;

      return slotEndTime(slot?.slot) >= currentTime;
    });

    const upcoming =
      dateBasedUpcoming.length > 0
        ? dateBasedUpcoming
        : timetable.filter((slot) => {
            const dayOfWeek = Number(slot?.dayOfWeek);
            if (!dayOfWeek) return false;

            if (dayOfWeek > currentDay) return true;
            if (dayOfWeek < currentDay) return false;

            return slotEndTime(slot?.slot) >= currentTime;
          });

    return upcoming.sort((a, b) => {
      const aDate = new Date(a.weekStart);
      if (!Number.isNaN(aDate.getTime())) {
        aDate.setDate(aDate.getDate() + (Number(a.dayOfWeek) - 1));
      }
      const bDate = new Date(b.weekStart);
      if (!Number.isNaN(bDate.getTime())) {
        bDate.setDate(bDate.getDate() + (Number(b.dayOfWeek) - 1));
      }

      if (!Number.isNaN(aDate.getTime()) && !Number.isNaN(bDate.getTime())) {
        const dateCompare = aDate - bDate;
        if (dateCompare !== 0) return dateCompare;
      }

      const dayCompare = Number(a.dayOfWeek) - Number(b.dayOfWeek);
      if (dayCompare !== 0) return dayCompare;

      const aStart = slotStartTime(a.slot);
      const bStart = slotStartTime(b.slot);
      return aStart.localeCompare(bStart);
    });
  }

  function calculateUpcomingClasses(timetable) {
    return getUpcomingTimetableEntries(timetable).length;
  }

  async function loadStats() {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      console.log(`📥 Fetching enrollments for current student...`);

      // Use /api/enrollments endpoint (gets current user from JWT)
      const response = await fetch(`${BASE_URL}/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Your session may have expired. Please login again.");
        } else if (response.status === 404) {
          console.warn("⚠️ Enrollments endpoint not found - showing default stats");
          setEnrolledCourseNames([]);
          setStats({
            enrolledCourses: 0,
            completedModules: 0,
            upcomingClasses: 0,
          });
          setLoading(false);
          return;
        } else if (response.status === 500) {
          throw new Error("Server error - Please contact support");
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const enrollmentRes = await response.json();
      console.log("✅ Enrollments loaded:", enrollmentRes);

      let completedModules = 0;
      let upcomingClasses = 0;
      let upcomingLecturesList = [];
      let moduleNameById = {};

      if (Array.isArray(enrollmentRes) && enrollmentRes.length > 0) {
        const completedCourseIds = Array.from(
          new Set(
            enrollmentRes
              .filter((enrollment) => String(enrollment?.status || "").toUpperCase() === "COMPLETED")
              .map((enrollment) => enrollment?.course?.id ?? enrollment?.courseId)
              .filter((id) => id != null)
          )
        );

        if (completedCourseIds.length > 0) {
          try {
            const modulesRes = await fetch(`${BASE_URL}/modules`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (modulesRes.ok) {
              const modulesData = await modulesRes.json();
              const modules = Array.isArray(modulesData) ? modulesData : [];
              
              // Build module name mapping for upcoming lectures
              moduleNameById = modules.reduce((acc, moduleItem) => {
                if (moduleItem?.id != null && moduleItem?.name) {
                  acc[String(moduleItem.id)] = moduleItem.name;
                }
                return acc;
              }, {});
              
              completedModules = modules.filter((moduleItem) => {
                const moduleCourseId = moduleItem?.course?.id ?? moduleItem?.courseId;
                return moduleCourseId != null && completedCourseIds.includes(moduleCourseId);
              }).length;
            } else {
              completedModules = completedCourseIds.length;
            }
          } catch {
            completedModules = completedCourseIds.length;
          }
        }
      }

      try {
        const timetableRes = await fetch(`${BASE_URL}/schedules/student/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (timetableRes.ok) {
          const timetableData = await timetableRes.json();
          const timetable = Array.isArray(timetableData)
            ? timetableData
            : Array.isArray(timetableData?.timetable)
            ? timetableData.timetable
            : [];

          const upcomingEntries = getUpcomingTimetableEntries(timetable);
          upcomingClasses = calculateUpcomingClasses(timetable);
          upcomingLecturesList = upcomingEntries.slice(0, 5).map((slot) => ({
            id: slot?.id,
            day: dayLabel(slot?.dayOfWeek),
            time: `${slotStartTime(slot?.slot)} - ${slotEndTime(slot?.slot)}`,
            module: slot?.moduleName || 
              (slot?.moduleId ? moduleNameById[String(slot.moduleId)] || `Module #${slot.moduleId}` : "Lecture"),
          }));
        }
      } catch {
        upcomingClasses = 0;
        upcomingLecturesList = [];
      }

      const courseNames = Array.isArray(enrollmentRes)
        ? Array.from(
            new Set(
              enrollmentRes
                .map((enrollment) => {
                  if (typeof enrollment?.courseName === "string") return enrollment.courseName;
                  if (typeof enrollment?.course?.name === "string") return enrollment.course.name;
                  if (typeof enrollment?.course?.code === "string") return enrollment.course.code;
                  if (enrollment?.courseId != null) return `Course #${enrollment.courseId}`;
                  return null;
                })
                .filter(Boolean)
            )
          )
        : [];

      setEnrolledCourseNames(courseNames);

      setStats({
        enrolledCourses: Array.isArray(enrollmentRes) ? enrollmentRes.length : 0,
        completedModules,
        upcomingClasses,
      });
      setUpcomingLectures(upcomingLecturesList);
    } catch (err) {
      console.error("❌ Error loading statistics:", err.message);
      setError(err.message || "Failed to load statistics");
      // Set default empty stats so dashboard still displays
      setEnrolledCourseNames([]);
      setUpcomingLectures([]);
      setStats({
        enrolledCourses: 0,
        completedModules: 0,
        upcomingClasses: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container student-dashboard-page">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container student-dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome to our learning portal, {displayName}!</h1>
        <p className="dashboard-subtitle">Track your learning progress and upcoming activities</p>
      </div>

      {error && (
        <div className="error-message">
          <strong>⚠️ Warning:</strong> {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card stat-card-courses">
          <h3>Enrolled Courses</h3>
          <p className="stat-number">{stats.enrolledCourses}</p>
          {enrolledCourseNames.length > 0 && (
            <ul className="enrolled-courses-list">
              {enrolledCourseNames.map((courseName, index) => (
                <li key={`${courseName}-${index}`} className="enrolled-course-item">
                  {courseName}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="stat-card stat-card-classes">
          <h3>Upcoming Classes</h3>
          <p className="stat-number">{stats.upcomingClasses}</p>
          {upcomingLectures.length > 0 ? (
            <ul className="upcoming-lectures-list">
              {upcomingLectures.map((lecture, index) => (
                <li key={lecture.id || `${lecture.day}-${lecture.time}-${index}`} className="upcoming-lecture-item">
                  <span className="lecture-day-time">{lecture.day} • {lecture.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="upcoming-empty">No upcoming lectures</p>
          )}
        </div>
      </div>

      <div className="announcements">
        <h2>Announcements</h2>
        <p>Check your timetable for upcoming classes</p>
      </div>

      <div className="quick-actions">
        <h2>Quick Access</h2>
        <button className="quick-action-btn" type="button" onClick={() => navigate("/student/timetable")}>View Timetable</button>
        <button className="quick-action-btn" type="button" onClick={() => navigate("/student/courses")}>My Courses</button>
      </div>
    </div>
  );
}
