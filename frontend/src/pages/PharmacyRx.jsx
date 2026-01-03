import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  Phone as PhoneIcon,
  PhoneDisabled as PhoneDisabledIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext.jsx";
import { useAppState, useAppDispatch, ACTIONS } from "../context/AppStateContext.jsx";

export default function PharmacyRx() {
  const { user, fetchWithAuth } = useAuth();
  const { pharmacyRx } = useAppState();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [pharmaciesMap, setPharmaciesMap] = useState({});
  const [payingIds, setPayingIds] = useState({});
  const [calls, setCalls] = useState([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // ✅ Accept an incoming call
  const acceptCall = async (callId) => {
    try {
      const resp = await fetchWithAuth(`http://localhost:5000/api/v1/callcenter/${callId}/accept`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!resp.ok) throw new Error("Failed to accept call");
      fetchCalls(); // refresh
      showSnackbar("Call accepted successfully", "success");
    } catch (err) {
      console.error("Accept call error:", err);
      showSnackbar("Failed to accept call: " + err.message, "error");
    }
  };

  // ✅ End an active call
  const endCall = async (callId) => {
    try {
      const resp = await fetchWithAuth(`http://localhost:5000/api/v1/callcenter/${callId}/end`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!resp.ok) throw new Error("Failed to end call");
      fetchCalls(); // refresh
      showSnackbar("Call ended successfully", "success");
    } catch (err) {
      console.error("End call error:", err);
      showSnackbar("Failed to end call: " + err.message, "error");
    }
  };

  // Fetch pharmacies
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const resp = await fetchWithAuth("http://localhost:5000/api/v1/pharmacies/search");
        if (!resp.ok) throw new Error("Failed to fetch pharmacies");
        const data = await resp.json();
        const map = {};
        data.forEach((ph) => (map[ph.id] = ph));
        setPharmaciesMap(map);
      } catch (err) {
        console.error("Failed to load pharmacies:", err);
      }
    };
    fetchPharmacies();
  }, [fetchWithAuth]);

  // Fetch prescriptions
  useEffect(() => {
    if (!user || user.role !== "PHARMACY") return;
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const resp = await fetchWithAuth("http://localhost:5000/api/v1/prescriptions/pharmacy/mine");
        if (!resp.ok) throw new Error("Failed to fetch prescriptions");
        const data = await resp.json();
        dispatch({ type: ACTIONS.SET_PHARMACY_RX, payload: { prescriptions: data, errorMsg: "" } });
      } catch (err) {
        console.error("Failed to load prescriptions:", err);
        dispatch({
          type: ACTIONS.SET_PHARMACY_RX,
          payload: { prescriptions: [], errorMsg: err.message },
        });
        showSnackbar("Failed to load prescriptions: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [user, dispatch, fetchWithAuth]);

  // Fetch calls
  const fetchCalls = async () => {
    if (!user || user.role !== "PHARMACY") return;
    setCallsLoading(true);
    try {
      const resp = await fetchWithAuth("http://localhost:5000/api/v1/callcenter/active");
      if (!resp.ok) throw new Error("Failed to load calls");
      const data = await resp.json();
      const myCalls = data.filter((c) => {
        if (!c.assignedTo) return false;
        return (
          c.assignedTo === user.uid ||
          c.assignedTo === user.userId ||
          c.assignedTo.includes(user.role)
        );
      });
      setCalls(myCalls);
    } catch (err) {
      console.error("Failed to fetch calls:", err);
    } finally {
      setCallsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Prescription actions
  const markDispensed = async (id) => {
    dispatch({
      type: ACTIONS.SET_PHARMACY_RX,
      payload: { loadingIds: { ...pharmacyRx.loadingIds, [id]: true } },
    });
    try {
      const resp = await fetchWithAuth(`http://localhost:5000/api/v1/prescriptions/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DISPENSED" }),
      });
      if (!resp.ok) throw new Error("Failed to update prescription status");
      const updated = await resp.json();
      const updatedPrescriptions = pharmacyRx.prescriptions.map((rx) =>
        rx.id === id ? updated : rx
      );
      dispatch({
        type: ACTIONS.SET_PHARMACY_RX,
        payload: { prescriptions: updatedPrescriptions, errorMsg: "" },
      });
      showSnackbar("Prescription marked as dispensed", "success");
    } catch (err) {
      console.error("Update error:", err);
      dispatch({ type: ACTIONS.SET_PHARMACY_RX, payload: { errorMsg: err.message } });
      showSnackbar("Failed to update prescription: " + err.message, "error");
    } finally {
      dispatch({
        type: ACTIONS.SET_PHARMACY_RX,
        payload: { loadingIds: { ...pharmacyRx.loadingIds, [id]: false } },
      });
    }
  };

  const savePrice = async (id, items) => {
    setPayingIds({ ...payingIds, [id]: true });
    try {
      const resp = await fetchWithAuth(`http://localhost:5000/api/v1/prescriptions/${id}/price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!resp.ok) throw new Error("Failed to save price");
      const updated = await resp.json();
      const updatedPrescriptions = pharmacyRx.prescriptions.map((rx) =>
        rx.id === id ? updated : rx
      );
      dispatch({
        type: ACTIONS.SET_PHARMACY_RX,
        payload: { prescriptions: updatedPrescriptions, errorMsg: "" },
      });
      showSnackbar("Prices saved successfully", "success");
    } catch (err) {
      console.error("Save price error:", err);
      showSnackbar("Failed to save prices: " + err.message, "error");
    } finally {
      setPayingIds({ ...payingIds, [id]: false });
    }
  };

  const markPaid = async (id) => {
    setPayingIds({ ...payingIds, [id]: true });
    try {
      const resp = await fetchWithAuth(`http://localhost:5000/api/v1/prescriptions/${id}/paid`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!resp.ok) throw new Error("Failed to mark as paid");
      const updatedPrescriptions = pharmacyRx.prescriptions.map((rx) =>
        rx.id === id ? { ...rx, paid: true } : rx
      );
      dispatch({
        type: ACTIONS.SET_PHARMACY_RX,
        payload: { prescriptions: updatedPrescriptions, errorMsg: "" },
      });
      showSnackbar("Prescription marked as paid", "success");
    } catch (err) {
      console.error("Mark paid error:", err);
      showSnackbar("Failed to mark as paid: " + err.message, "error");
    } finally {
      setPayingIds({ ...payingIds, [id]: false });
    }
  };

  const handlePriceChange = (rxId, index, value) => {
    const updatedPrescriptions = pharmacyRx.prescriptions.map((rx) => {
      if (rx.id === rxId) {
        const newItems = rx.items.map((item, i) =>
          i === index ? { ...item, price: parseFloat(value) || 0 } : item
        );
        return { ...rx, items: newItems };
      }
      return rx;
    });
    dispatch({
      type: ACTIONS.SET_PHARMACY_RX,
      payload: { prescriptions: updatedPrescriptions, errorMsg: "" },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "DISPENSED":
        return "success";
      case "PAID":
        return "info";
      default:
        return "default";
    }
  };

  const getCallStatusColor = (status) => {
    switch (status) {
      case "CONNECTED_BY_CALLCENTER":
        return "warning";
      case "CONNECTED":
        return "success";
      default:
        return "default";
    }
  };

  const getRowBgColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50";
      case "DISPENSED":
        return "bg-green-50";
      case "PAID":
        return "bg-blue-50";
      default:
        return "bg-gray-50";
    }
  };

  const getCallRowBgColor = (status) => {
    switch (status) {
      case "CONNECTED_BY_CALLCENTER":
        return "bg-yellow-50";
      case "CONNECTED":
        return "bg-green-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 min-h-screen">
      <div className="mb-6">
        <Typography variant="h4" className="font-bold text-teal-800 mb-2">
          Pharmacy Dashboard
        </Typography>
        {pharmacyRx.errorMsg && (
          <Alert severity="error" className="mb-4">
            {pharmacyRx.errorMsg}
          </Alert>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Prescriptions Column */}
        <div className="flex-1 lg:flex-[2] min-w-0">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <Typography variant="h5" className="font-semibold text-teal-700 mb-4">
              Prescriptions
            </Typography>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <CircularProgress />
              </div>
            ) : pharmacyRx.prescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Typography>No prescriptions assigned yet.</Typography>
              </div>
            ) : (
              <TableContainer className="max-h-[600px] overflow-y-auto">
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell className="bg-teal-600 text-white font-semibold">Patient</TableCell>
                      <TableCell className="bg-teal-600 text-white font-semibold">Doctor</TableCell>
                      <TableCell className="bg-teal-600 text-white font-semibold">Diagnosis</TableCell>
                      <TableCell className="bg-teal-600 text-white font-semibold">Status</TableCell>
                      <TableCell className="bg-teal-600 text-white font-semibold">Items & Prices</TableCell>
                      <TableCell className="bg-teal-600 text-white font-semibold">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pharmacyRx.prescriptions.map((rx) => (
                      <TableRow key={rx.id} className={getRowBgColor(rx.status)}>
                        <TableCell>{rx.patient}</TableCell>
                        <TableCell>{rx.doctor}</TableCell>
                        <TableCell>
                          <Typography variant="body2" className="max-w-xs truncate">
                            {rx.diagnosis}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={rx.status}
                            color={getStatusColor(rx.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {rx.items.map((item, i) => (
                              <div key={i} className="text-sm">
                                <span className="font-medium">{item.drugMaster}</span>
                                {" — "}
                                <span>{item.dosageText}</span>
                                {" — Qty: "}
                                <span className="font-semibold">{item.qty}</span>
                                {rx.status === "PENDING" && (
                                  <TextField
                                    type="number"
                                    size="small"
                                    value={item.price || ""}
                                    onChange={(e) => handlePriceChange(rx.id, i, e.target.value)}
                                    placeholder="Price"
                                    className="ml-2 w-20"
                                    inputProps={{ min: 0, step: 0.01 }}
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        height: "28px",
                                        fontSize: "0.875rem",
                                      },
                                    }}
                                  />
                                )}
                                {item.price && (
                                  <span className="ml-1 text-teal-600 font-semibold">
                                    — ${item.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            ))}
                            {rx.totalAmount && (
                              <div className="mt-2 pt-2 border-t border-gray-300">
                                <Typography variant="body2" className="font-semibold text-teal-700">
                                  Total: ${rx.totalAmount.toFixed(2)}
                                </Typography>
                                {rx.paid && (
                                  <Chip
                                    icon={<CheckCircleIcon />}
                                    label="Paid"
                                    color="success"
                                    size="small"
                                    className="mt-1"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {rx.status === "PENDING" && (
                              <>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<SaveIcon />}
                                  onClick={() => savePrice(rx.id, rx.items)}
                                  disabled={payingIds[rx.id]}
                                  sx={{
                                    bgcolor: "#14b8a6",
                                    "&:hover": { bgcolor: "#0d9488" },
                                    fontSize: "0.75rem",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {payingIds[rx.id] ? "Saving..." : "Save Prices"}
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() => markDispensed(rx.id)}
                                  disabled={!!pharmacyRx.loadingIds[rx.id]}
                                  sx={{
                                    bgcolor: "#23b758",
                                    "&:hover": { bgcolor: "#1ea049" },
                                    fontSize: "0.75rem",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {pharmacyRx.loadingIds[rx.id] ? "Updating..." : "Mark Dispensed"}
                                </Button>
                              </>
                            )}
                            {rx.totalAmount && !rx.paid && (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<PaymentIcon />}
                                onClick={() => markPaid(rx.id)}
                                disabled={payingIds[rx.id]}
                                sx={{
                                  bgcolor: "#3b82f6",
                                  "&:hover": { bgcolor: "#2563eb" },
                                  fontSize: "0.75rem",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {payingIds[rx.id] ? "Processing..." : "Mark Paid"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </div>

        {/* Incoming Calls Column */}
        <div className="flex-1 lg:max-w-sm">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <Typography variant="h5" className="font-semibold text-teal-700 mb-4">
              Incoming Calls
            </Typography>
            
            {callsLoading ? (
              <div className="flex justify-center items-center py-8">
                <CircularProgress />
              </div>
            ) : calls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Typography>No incoming calls</Typography>
              </div>
            ) : (
              <TableContainer className="max-h-[600px] overflow-y-auto">
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell className="bg-cyan-600 text-white font-semibold">From</TableCell>
                      <TableCell className="bg-cyan-600 text-white font-semibold">Status</TableCell>
                      <TableCell className="bg-cyan-600 text-white font-semibold">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calls.map((c) => (
                      <TableRow key={c.id} className={getCallRowBgColor(c.status)}>
                        <TableCell>{c.patientName || c.patientId}</TableCell>
                        <TableCell>
                          <Chip
                            label={c.status}
                            color={getCallStatusColor(c.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {c.status === "CONNECTED_BY_CALLCENTER" && (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<PhoneIcon />}
                                onClick={() => acceptCall(c.id)}
                                sx={{
                                  bgcolor: "#23b758",
                                  "&:hover": { bgcolor: "#1ea049" },
                                  fontSize: "0.75rem",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Accept
                              </Button>
                            )}
                            {c.status === "CONNECTED" && (
                              <>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<PhoneDisabledIcon />}
                                  onClick={() => endCall(c.id)}
                                  sx={{
                                    bgcolor: "#ef4444",
                                    "&:hover": { bgcolor: "#dc2626" },
                                    fontSize: "0.75rem",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  End Call
                                </Button>
                                {c.patientLink && (
                                  <Tooltip title="Open WhatsApp chat with patient">
                                    <IconButton
                                      component="a"
                                      href={c.patientLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      size="small"
                                      sx={{
                                        color: "#25d366",
                                        "&:hover": { bgcolor: "rgba(37, 211, 102, 0.1)" },
                                      }}
                                    >
                                      <MessageIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {c.providerLink && (
                                  <Tooltip title="Open WhatsApp chat with provider">
                                    <IconButton
                                      component="a"
                                      href={c.providerLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      size="small"
                                      sx={{
                                        color: "#3b82f6",
                                        "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" },
                                      }}
                                    >
                                      <MessageIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
