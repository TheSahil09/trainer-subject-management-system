import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function MyProfile() {
  const { user: contextUser } = useContext(AuthContext) || {};

  const user =
    contextUser ||
    JSON.parse(localStorage.getItem("user") || "null") ||
    JSON.parse(sessionStorage.getItem("user") || "null") ||
    {};

  const hiddenKeys = new Set(["password", "token", "accessToken", "refreshToken"]);

  const profileEntries = Object.entries(user || {}).filter(([key, value]) => {
    if (hiddenKeys.has(String(key).toLowerCase())) return false;
    return value !== null && value !== undefined && value !== "";
  });

  function formatLabel(key) {
    return String(key)
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/^./, (char) => char.toUpperCase());
  }

  function formatValue(value) {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

  return (
    <div className="page-container student-profile-page">
      <div className="dashboard-header">
        <h1>My Profile</h1>
        <p className="dashboard-subtitle">View your student account details</p>
      </div>

      <div className="profile-card">
        {profileEntries.length === 0 ? (
          <p className="empty-state">No profile details available.</p>
        ) : (
          <div className="profile-grid">
            {profileEntries.map(([key, value]) => (
              <div key={key} className="profile-item">
                <p className="profile-label">{formatLabel(key)}</p>
                <p className="profile-value">{formatValue(value)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
