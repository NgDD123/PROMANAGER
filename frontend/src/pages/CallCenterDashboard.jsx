import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import { useAppState, useAppDispatch, ACTIONS } from "../context/AppStateContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function CallCenterDashboard() {
  const navigate = useNavigate();
  const { token, user, loading, fetchWithAuth } = useAuth();
  const { callCenter } = useAppState();
  const dispatch = useAppDispatch();

  const [doctors, setDoctors] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [callType, setCallType] = useState("DOCTOR");
  const [onlineProviders, setOnlineProviders] = useState({ DOCTOR: [], PHARMACY: [] });
  const [assignToMap, setAssignToMap] = useState({}); // stores selection per call row
  const [showLoginToast, setShowLoginToast] = useState(false);

  // -------------------------
  // Fetch active calls
  // -------------------------
  const fetchActiveCalls = async () => {
    if (!token) return;
    try {
      const resp = await fetchWithAuth("http://localhost:5000/api/v1/callcenter/active");
      if (!resp.ok) throw new Error("Failed to fetch active calls");
      const data = await resp.json();
      console.log("[Frontend] Active calls:", data);
      dispatch({ type: ACTIONS.SET_ACTIVE_CALLS, payload: data });
    } catch (err) {
      console.error("[Frontend] fetchActiveCalls error:", err);
    }
  };

  // -------------------------
  // Fetch online/offline status by role
  // -------------------------
  const fetchStatus = async (role, setState) => {
    if (!token) return;
    try {
      const resp = await fetchWithAuth(`http://localhost:5000/api/v1/callcenter/providers?type=${role}`);
      if (!resp.ok) throw new Error(`Failed to fetch ${role}`);
      const data = await resp.json();
      console.log(`[Frontend] Online providers for ${role}:`, data);
      setState(data);
      setOnlineProviders(prev => ({ ...prev, [role]: data }));
    } catch (err) {
      console.error(`[Frontend] fetchStatus error (${role}):`, err);
    }
  };

  // -------------------------
  // Request a call (Patient / Doctor / Pharmacy)
  // -------------------------
  const requestCall = async () => {
    if (!token) return;
    try {
      const resp = await fetchWithAuth("http://localhost:5000/api/v1/callcenter/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: callType }),
      });
      if (!resp.ok) throw new Error("Failed to request call");
      const data = await resp.json();
      console.log("[Frontend] Call requested:", data);
      fetchActiveCalls();
      alert("Call requested successfully!");
    } catch (err) {
      console.error("[Frontend] requestCall error:", err);
      alert(err.message);
    }
  };

  // -------------------------
  // Call Center accepts / assigns a call
  // -------------------------
  const acceptCallByCallCenter = async (call) => {
    if (!token) return;

    const selected = assignToMap[call.id];
    if (!selected) {
      alert("Please select a provider to assign.");
      return;
    }

    try {
      const resp = await fetchWithAuth(
        `http://localhost:5000/api/v1/callcenter/${call.id}/accept-callcenter`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignTo: selected }),
        }
      );
      if (!resp.ok) throw new Error("Failed to accept call");
      const data = await resp.json();
      console.log("[Frontend] Call accepted by call center:", data);
      fetchActiveCalls();
      setAssignToMap(prev => ({ ...prev, [call.id]: "" }));
    } catch (err) {
      console.error("[Frontend] acceptCallByCallCenter error:", err);
      alert(err.message);
    }
  };

  // -------------------------
  // Provider accepts a call
  // -------------------------
  const acceptCall = async (callId) => {
    if (!token) return;
    try {
      const resp = await fetchWithAuth(`http://localhost:5000/api/v1/callcenter/${callId}/accept`, {
        method: "PATCH",
      });
      if (!resp.ok) throw new Error("Failed to accept call");
      const data = await resp.json();
      console.log("[Frontend] Call accepted by provider:", data);
      dispatch({ type: ACTIONS.SET_CURRENT_CALL, payload: data });
      fetchActiveCalls();
    } catch (err) {
      console.error("[Frontend] acceptCall error:", err);
    }
  };

  // -------------------------
  // End a call
  // -------------------------
  const endCall = async (callId) => {
    if (!token) return;
    try {
      const resp = await fetchWithAuth(`http://localhost:5000/api/v1/callcenter/${callId}/end`, {
        method: "PATCH",
      });
      if (!resp.ok) throw new Error("Failed to end call");
      const data = await resp.json();
      console.log("[Frontend] Call ended:", data);
      dispatch({ type: ACTIONS.SET_CURRENT_CALL, payload: null });
      fetchActiveCalls();
    } catch (err) {
      console.error("[Frontend] endCall error:", err);
    }
  };

  // -------------------------
  // Redirect to login if not authenticated
  // -------------------------
  useEffect(() => {
    if (!loading && !user) {
      setShowLoginToast(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Show toast for 2 seconds before redirecting
    }
  }, [loading, user, navigate]);

  // -------------------------
  // Auto-refresh active calls + statuses
  // -------------------------
  useEffect(() => {
    if (!token || !user) return;
    
    fetchActiveCalls();
    fetchStatus("DOCTOR", setDoctors);
    fetchStatus("PHARMACY", setPharmacies);

    const interval = setInterval(() => {
      fetchActiveCalls();
      fetchStatus("DOCTOR", setDoctors);
      fetchStatus("PHARMACY", setPharmacies);
    }, 5000);

    return () => clearInterval(interval);
  }, [token, user]);

  // -------------------------
  // Helper: render status badge
  const StatusBadge = ({ online }) => (
  <span
    style={{
      padding: "2px 8px",
      borderRadius: 12,
      color: "#fff",
      backgroundColor: online ? "green" : "red",
      fontWeight: "bold",
      fontSize: 12,
    }}
  >
    {online ? "ONLINE" : "OFFLINE"}
  </span>
);

  // -------------------------
  // Render
  // -------------------------
  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!user) {
    return (
      <>
        <Snackbar
          open={showLoginToast}
          autoHideDuration={2000}
          onClose={() => setShowLoginToast(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="warning" onClose={() => setShowLoginToast(false)}>
            Please log in to access the Call Center Dashboard. Redirecting to login...
          </Alert>
        </Snackbar>
        <div style={{ padding: 20 }}>Redirecting to login...</div>
      </>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Call Center Dashboard</h2>

      {/* Request Call */}
      {user && ["PATIENT", "DOCTOR", "PHARMACY"].includes(user.role) && (
        <div style={{ marginBottom: 20 }}>
          <h3>Request a Call</h3>
          <select value={callType} onChange={(e) => setCallType(e.target.value)}>
            <option value="DOCTOR">Doctor</option>
            <option value="PHARMACY">Pharmacy</option>
          </select>
          <button onClick={requestCall} style={{ marginLeft: 10 }}>Request Call</button>
        </div>
      )}

      {/* Active Calls */}
      {user && ["CALLCENTER", "ADMIN"].includes(user.role) && (
        <>
          <h3>Active Calls</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Patient ID</th>
                <th>Provider ID</th>
                <th>Assign To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {callCenter.activeCalls.map(call => (
                <tr key={call.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{call.id}</td>
                  <td>{call.type}</td>
                  <td>{call.status}</td>
                  <td>{call.patientId}</td>
                  <td>{call.providerId || "-"}</td>
                  <td>
                    <select
                      value={assignToMap[call.id] || ""}
                      onChange={(e) =>
                        setAssignToMap(prev => ({ ...prev, [call.id]: e.target.value }))
                      }
                      style={{ color: "black" }}
                    >
                      <option value="">Select Provider</option>
                      {onlineProviders[call.type]?.map(p => (
                        <option
                          key={p.id}
                          value={p.id}
                          style={{ color: p.online ? "green" : "red" }}
                        >
                          {p.name} ({p.role}) - {p.id}
                        </option>
                      ))}
                    </select>
                  </td>
                 <td>
                {call.status === "WAITING" && (
                  <>
                    <button onClick={() => acceptCallByCallCenter(call)}>Accept / Transfer</button>
                    {call.providerLink && (
                      <a href={call.providerLink} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                        📱 WhatsApp Provider
                      </a>
                    )}
                    {call.patientLink && (
                      <a href={call.patientLink} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                        📱 WhatsApp Patient
                      </a>
                    )}
                  </>
                )}
                <button onClick={() => endCall(call.id)} style={{ marginLeft: 4 }}>End</button>
              </td>

                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Current Call */}
      {callCenter.currentCall && (
        <div style={{ padding: 10, border: "1px solid #ccc", marginBottom: 20 }}>
          <h3>Current Call</h3>
          <p>
            <strong>ID:</strong> {callCenter.currentCall.id} <br />
            <strong>Type:</strong> {callCenter.currentCall.type} <br />
            <strong>Status:</strong> {callCenter.currentCall.status} <br />
            <strong>Patient ID:</strong> {callCenter.currentCall.patientId} <br />
            <strong>Provider ID:</strong> {callCenter.currentCall.providerId} <br />
          </p>
          <button onClick={() => endCall(callCenter.currentCall.id)}>End Call</button>
        </div>
      )}

      {/* Doctors */}
      <h3>Doctors Availability</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {doctors.length === 0 ? (
            <tr><td colSpan="4">No doctors available</td></tr>
          ) : (
            doctors.map(doc => (
              <tr key={doc.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{doc.id}</td>
                <td>{doc.name}</td>
                <td>{doc.email}</td>
                <td><StatusBadge online={doc.online} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pharmacies */}
      <h3>Pharmacies Availability</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pharmacies.length === 0 ? (
            <tr><td colSpan="4">No pharmacies available</td></tr>
          ) : (
            pharmacies.map(ph => (
              <tr key={ph.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{ph.id}</td>
                <td>{ph.name}</td>
                <td>{ph.email}</td>
                <td><StatusBadge online={ph.online} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
