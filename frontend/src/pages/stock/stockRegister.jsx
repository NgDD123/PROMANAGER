import React, { useState } from "react";
import { useStockAuth } from "../../context/StockAuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function StockRegister() {
  const { register } = useStockAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
    department: "General",
  });
  const nav = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      alert("Registration successful! Please login.");
      nav("/stock/login");
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>Create Stock Account</h2>
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} style={styles.input} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} style={styles.input} required />

        <label style={styles.label}>Select Role</label>
        <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
          <option value="STAFF">Staff</option>
        </select>

        <label style={styles.label}>Select Department</label>
        <select name="department" value={form.department} onChange={handleChange} style={styles.input}>
          <option value="General">General</option>
        </select>

        <button type="submit" style={styles.button}>Register</button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", width: "100%", backgroundColor: "#23D758", padding: "20px" },
  form: { backgroundColor: "#2c9191", padding: "32px", borderRadius: "14px", width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "12px", color: "white", boxShadow: "0 8px 18px rgba(0,0,0,0.2)" },
  heading: { textAlign: "center", marginBottom: "10px" },
  label: { marginTop: "8px", fontWeight: "600" },
  input: { padding: "10px", borderRadius: "6px", border: "none", outline: "none", fontSize: "14px" },
  button: { marginTop: "12px", padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#23b758", color: "#fff", fontWeight: "bold", cursor: "pointer", transition: "background 0.3s ease" },
};
