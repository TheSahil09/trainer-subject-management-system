import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import "./AuthPages.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [rememberMe, setRememberMe] = useState(false);//added after for login issue

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(email, password);

      console.log("Login response:", response);//after added for login issue
      
      // Store user data
      // const userData = {
        // id: response.email.split("@")[0],
        // email: response.email,
        // role: response.role,
        // name: response.email.split("@")[0],
      // };

      const userData = {
        id: response.id,          // ✅ real DB id
        email: response.email,
        role: response.role,
        name: response.name || response.email?.split("@")[0] || "Student",
        };
      
     // login(userData, response.token);
     login(userData, response.token, rememberMe);
      
      // Redirect based on role
      if (response.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (response.role === "STUDENT") {
        navigate("/student/dashboard");
      } else if (response.role === "TRAINER") {
        navigate("/trainer/profile");
      }


    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
        <p className="subtitle">Trainer Subject Management System</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>


{/* <div className="form-group"> */}
<div className="form-group remember-me-group">

    <input
      type="checkbox"
      id = "rememberMe"//after added
      checked={rememberMe}
      onChange={(e) => setRememberMe(e.target.checked)}
    />
   <label htmlFor="rememberMe">Remember Me</label>
</div>


          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="form-links">
            <Link to="/forgot-password" className="link">
              Forgot Password?
            </Link>
          </div>
        </form>

        <div className="form-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
