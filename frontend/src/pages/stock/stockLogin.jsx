import React, { useState } from "react";
import { useStockAuth } from "../../context/StockAuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function StockLogin() {
  const { login, forgotPassword, resetPassword } = useStockAuth();
  const [mode, setMode] = useState("login"); // login | forgot | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(""); // for reset
  const [newPassword, setNewPassword] = useState("");
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav("/stock/inventory");
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Login failed");
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ email });
      alert("If the email exists, a reset link has been sent.");
      setMode("reset");
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Request failed");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({ token, newPassword });
      alert("Password reset successful! Please login.");
      setMode("login");
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Reset failed");
    }
  };

  return (
    <div style={styles.container}>
      <form
        onSubmit={mode === "login" ? handleLogin : mode === "forgot" ? handleForgot : handleReset}
        style={styles.form}
      >
        <h2 style={styles.heading}>
          {mode === "login" ? "Stock Management Login" : mode === "forgot" ? "Forgot Password" : "Reset Password"}
        </h2>

        {(mode === "login" || mode === "forgot") && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        )}

        {mode === "login" && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        )}

        {mode === "reset" && (
          <>
            <input
              type="text"
              placeholder="Reset Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              required
            />
          </>
        )}

        <button type="submit" style={styles.button}>
          {mode === "login" ? "Login" : mode === "forgot" ? "Send Reset Link" : "Reset Password"}
        </button>

        {mode === "login" && (
          <p style={styles.link} onClick={() => setMode("forgot")}>
            Forgot password?
          </p>
        )}
        {mode === "forgot" && (
          <p style={styles.link} onClick={() => setMode("login")}>
            Back to login
          </p>
        )}
        {mode === "reset" && (
          <p style={styles.link} onClick={() => setMode("login")}>
            Back to login
          </p>
        )}
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100%",
    background: "#23D758",
  },
  form: {
    backgroundColor: "#2c9191",
    padding: "32px",
    borderRadius: "10px",
    width: "360px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    color: "white",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
  },
  heading: { textAlign: "center", marginBottom: "10px" },
  input: { padding: "10px", borderRadius: "6px", border: "none", fontSize: "14px" },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#23b758",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  link: {
    marginTop: "8px",
    color: "#fff",
    textDecoration: "underline",
    cursor: "pointer",
    textAlign: "center",
  },
};
