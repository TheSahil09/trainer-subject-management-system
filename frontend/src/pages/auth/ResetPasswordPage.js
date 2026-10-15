import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import "./PasswordResetPages.css";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setError("No reset token provided. Please use the link from your email.");
      setValidating(false);
      return;
    }

    validateToken();
  }, [token]);

  async function validateToken() {
    try {
      const response = await authService.validateResetToken(token);
      setTokenValid(response.valid);
      if (!response.valid) {
        setError("Reset token is invalid or has expired. Please request a new one.");
      }
    } catch (err) {
      setError("Failed to validate reset token. Please try again.");
    } finally {
      setValidating(false);
    }
  }

  function validatePassword() {
    if (newPassword.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (newPassword !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const validation = validatePassword();
    if (validation) {
      setError(validation);
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({ token, newPassword });
      setSubmitted(true);
      setMessage("Password reset successfully!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <div className="password-reset-container">
        <div className="password-reset-card">
          <p>Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <h1>Set New Password</h1>

        {submitted ? (
          <div className="success-section">
            <div className="success-icon">✓</div>
            <p className="success-message">{message}</p>
            <p className="reset-info">
              Redirecting you to login page...
            </p>
          </div>
        ) : !tokenValid ? (
          <div className="error-section">
            <p className="error-message">{error}</p>
            <Link to="/forgot-password" className="btn-primary">
              Request New Reset Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="instructions">
              Enter a new password for your account.
            </p>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
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
              <small className="password-hint">Minimum 6 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={loading}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="btn-primary"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="form-footer">
              <p>
                Remember your password? <Link to="/login">Back to Login</Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
