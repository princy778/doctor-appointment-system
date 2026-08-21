import { useState } from "react";
import { loginUser } from "./auth";
import PasswordInput from "./PasswordInput";
import { inputStyle, labelStyle, formCardStyle, primaryBtn } from "./styles";

function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} style={formCardStyle}>
        <h2 style={{ textAlign: "center" }}>Welcome Back</h2>
        <p style={{ textAlign: "center", marginBottom: "20px", fontSize: "14px" }}>
          Login to the Doctor Appointment System
        </p>

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
          placeholder="Enter your password"
          required
        />

        {error && (
          <p style={{ color: "#d32f2f", fontSize: "14px", margin: "0 0 10px" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={primaryBtn(true)}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", marginTop: "16px" }}>
          Don&apos;t have an account?{" "}
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
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;