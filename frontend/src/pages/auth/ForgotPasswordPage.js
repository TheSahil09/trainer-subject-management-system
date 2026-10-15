import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import "./PasswordResetPages.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword({ email });
      setSubmitted(true);
      setMessage("If an account exists with this email, a password reset link has been sent.");
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <h1>Reset Your Password</h1>

        {submitted ? (
          <div className="success-section">
            <div className="success-icon">✓</div>
            <p className="success-message">{message}</p>
            <p className="reset-info">
              Check your email for a password reset link. The link will expire in 1 hour.
            </p>
            <Link to="/login" className="btn-primary">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="instructions">
              Enter your email address and we'll send you a link to reset your password.
            </p>

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

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Sending..." : "Send Reset Link"}
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
