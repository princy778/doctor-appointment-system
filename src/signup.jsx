import { useState } from "react";
import { registerUser } from "./auth";
import PasswordInput from "./PasswordInput";
import { inputStyle, labelStyle, formCardStyle, primaryBtn } from "./styles";

function Signup({ onSignup, onSwitch }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (username.trim().length < 3) {
      setError("Full name must be at least 3 characters.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const user = await registerUser({ username, email, password, role });
      onSignup(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} style={formCardStyle}>
        <h2 style={{ textAlign: "center" }}>Create Account</h2>
        <p style={{ textAlign: "center", marginBottom: "20px", fontSize: "14px" }}>
          Join the Doctor Appointment System
        </p>

        <label style={labelStyle}>Full Name</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Password</label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          required
          minLength={6}
        />

        <label style={labelStyle}>Confirm Password</label>
        <PasswordInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          required
        />

        <label style={labelStyle}>I am a</label>
        <div style={{ display: "flex", gap: "10px", margin: "6px 0 14px" }}>
          <button
            type="button"
            onClick={() => setRole("patient")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              border: role === "patient" ? "2px solid var(--accent)" : "1px solid #ccc",
              background: role === "patient" ? "var(--accent-bg)" : "transparent",
              fontWeight: "600",
            }}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              border: role === "doctor" ? "2px solid var(--accent)" : "1px solid #ccc",
              background: role === "doctor" ? "var(--accent-bg)" : "transparent",
              fontWeight: "600",
            }}
          >
            Doctor
          </button>
        </div>

        {error && (
          <p style={{ color: "#d32f2f", fontSize: "14px", margin: "0 0 10px" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={primaryBtn(true)}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", marginTop: "16px" }}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default Signup;