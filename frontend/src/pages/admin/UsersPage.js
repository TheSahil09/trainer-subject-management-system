import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:8080/api";

export default function UsersPage() {
  const { token: ctxToken } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function addUser(e) {
    e.preventDefault();
    try {
      setError("");
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const trimmedId = String(id || "").trim();
      if (trimmedId && !/^\d+$/.test(trimmedId)) {
        throw new Error("ID must be a number");
      }

      const payload = {
        name,
        email,
        password,
        role,
      };

      if (trimmedId) {
        payload.id = Number(trimmedId);
      }

      const res = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        let responsePayload = {};
        try {
          responsePayload = text ? JSON.parse(text) : {};
        } catch {
          responsePayload = {};
        }
        throw new Error(responsePayload.error || responsePayload.message || "Failed to add user");
      }
      setId("");
      setName("");
      setEmail("");
      setPassword("");
      setRole("STUDENT");
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to add user");
    }
  }

  async function deleteUser(id) {
    try {
      const token = ctxToken || localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Failed to delete user");
      loadUsers();
    } catch (err) {
      setError("Failed to delete user");
    }
  }

  const userStats = {
    total: users.length,
    admins: users.filter((user) => user.role === "ADMIN").length,
    trainers: users.filter((user) => user.role === "TRAINER").length,
    students: users.filter((user) => user.role === "STUDENT").length,
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="page-container users-page">
      <h1>Manage Users</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={addUser} className="form-container user-form">
        <h2>Add New User</h2>

        <div className="form-row">
          <label>ID (Optional)</label>
          <input
            type="number"
            placeholder="Enter custom user ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            min="1"
          />
        </div>

        <div className="form-row">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <label>Temporary Password</label>
          <input
            type="password"
            placeholder="Set temporary password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="STUDENT">Student</option>
            <option value="TRAINER">Trainer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button className="btn btn-primary" type="submit">Add User</button>
      </form>

      <div className="list-container">
        <h2>Users List</h2>

        <div className="users-stats">
          <div className="stat-item">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{userStats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Admins</span>
            <span className="stat-value">{userStats.admins}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Trainers</span>
            <span className="stat-value">{userStats.trainers}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Students</span>
            <span className="stat-value">{userStats.students}</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="management-table users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td className="user-email">{user.email}</td>
                  <td>
                    <span className={`role-badge role-${String(user.role || "").toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-edit" type="button">Edit</button>
                    <button
                      className="btn btn-delete"
                      type="button"
                      onClick={() => deleteUser(user.id)}
                    >
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
