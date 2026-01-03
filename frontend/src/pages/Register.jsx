import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); // ✅ add phone state
  const [role, setRole] = useState("PATIENT");
  const [pharmacyId, setPharmacyId] = useState("");
  const [newPharmacyName, setNewPharmacyName] = useState("");
  const [pharmacies, setPharmacies] = useState([]);
  const nav = useNavigate();

  // Fetch all existing pharmacies
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const resp = await fetch("http://localhost:5000/api/v1/pharmacies/search");
        if (!resp.ok) throw new Error("Failed to fetch pharmacies");
        const data = await resp.json();
        setPharmacies(data);
      } catch (err) {
        console.error("Fetch pharmacies error:", err);
      }
    };
    fetchPharmacies();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!phone && role === "PATIENT") {
      alert("Please enter your phone number");
      return;
    }

    try {
      await register({ name, email, password, phone, role, pharmacyId, newPharmacyName });
      nav("/"); // redirect after successful registration
    } catch (err) {
      console.error("Register error:", err.message);
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={onSubmit} style={styles.form}>
        <h2 style={styles.heading}>Register</h2>
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="Phone number (e.g., 250788123456)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
          <option value="PHARMACY">Pharmacy</option>
        </select>

        {role === "PHARMACY" && (
          <>
            <label style={styles.label}>Select Existing Pharmacy</label>
            <select
              value={pharmacyId}
              onChange={(e) => setPharmacyId(e.target.value)}
              style={styles.input}
            >
              <option value="">-- None / Create New --</option>
              {pharmacies.map((ph) => (
                <option key={ph.id} value={ph.id}>
                  {ph.name}
                </option>
              ))}
            </select>

            {!pharmacyId && (
              <>
                <label style={styles.label}>New Pharmacy Name</label>
                <input
                  placeholder="Enter new pharmacy name"
                  value={newPharmacyName}
                  onChange={(e) => setNewPharmacyName(e.target.value)}
                  style={styles.input}
                />
              </>
            )}
          </>
        )}

        <button type="submit" style={styles.button}>Create Account</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 128px)',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  form: {
    backgroundColor: 'rgb(44,145,145)',
    padding: '32px',
    borderRadius: '12px',
    maxWidth: '400px',
    width: '100%',
    display: 'grid',
    gap: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    color: '#fff',
  },
  heading: { textAlign: 'center', marginBottom: '16px', fontSize: '24px' },
  label: { marginTop: '8px', marginBottom: '4px', fontWeight: '600' },
  input: { padding: '10px', borderRadius: '6px', border: 'none', width: '100%', fontSize: '14px' },
  button: {
    marginTop: '16px',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#23b758',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
};
