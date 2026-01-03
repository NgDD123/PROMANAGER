import React, { useEffect, useState } from "react";
import { useAppState, useAppDispatch, ACTIONS } from "../context/AppStateContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { motion } from "framer-motion";
import {
  FaUserMd,
  FaStethoscope,
  FaHospital,
  FaClipboard,
  FaUserInjured,
  FaPills,
  FaPrescriptionBottleAlt,
  FaShoppingBag,
  FaAmbulance,
  FaTruck,
} from "react-icons/fa";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

export default function Prescription() {
  const { user, fetchWithAuth, loading: authLoading } = useAuth();
  const { prescriptionForm, pharmacies } = useAppState();
  const dispatch = useAppDispatch();

  const [drugMaster, setDrugMaster] = useState("");
  const [dosageText, setDosageText] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [res, setRes] = useState(null);

  useEffect(() => {
    if (authLoading || pharmacies.length > 0) return;
    const loadPharmacies = async () => {
      try {
        const resp = await fetchWithAuth("http://localhost:5000/api/v1/pharmacies/search");
        if (!resp.ok) throw new Error("Failed to fetch pharmacies");
        const data = await resp.json();
        dispatch({ type: ACTIONS.SET_PHARMACIES, payload: data });
      } catch (err) {
        setErrorMsg("Failed to load pharmacies: " + err.message);
        setSnackbar({ open: true, message: "Failed to load pharmacies", severity: "error" });
      }
    };
    loadPharmacies();
  }, [authLoading, fetchWithAuth, pharmacies.length, dispatch]);

  useEffect(() => {
    if (user && user.role === "PHARMACY") {
      dispatch({ type: ACTIONS.UPDATE_FORM, payload: { pharmacyId: user.pharmacyId } });
    }
  }, [user, dispatch]);

  const availablePharmacies =
    user?.role === "PHARMACY"
      ? pharmacies.filter((ph) => ph.id === user.pharmacyId)
      : pharmacies;

  const addItem = () => {
    if (!drugMaster.trim() || !dosageText.trim() || qty <= 0) {
      setErrorMsg("Please fill all item fields properly");
      setSnackbar({ open: true, message: "Please fill all item fields properly", severity: "error" });
      return;
    }
    const newItems = [...prescriptionForm.items, { drugMaster, dosageText, qty }];
    dispatch({ type: ACTIONS.UPDATE_FORM, payload: { items: newItems } });
    setDrugMaster("");
    setDosageText("");
    setQty(1);
    setErrorMsg("");
  };

  const removeItem = (index) => {
    const newItems = prescriptionForm.items.filter((_, i) => i !== index);
    dispatch({ type: ACTIONS.UPDATE_FORM, payload: { items: newItems } });
  };

  const submit = async () => {
    if (!prescriptionForm.pharmacyId) {
      setErrorMsg("Select a pharmacy");
      setSnackbar({ open: true, message: "Please select a pharmacy", severity: "error" });
      return;
    }
    if (
      !prescriptionForm.patientId?.trim() ||
      !prescriptionForm.diagnosis?.trim() ||
      prescriptionForm.items.length === 0
    ) {
      setErrorMsg("Fill all required fields and add at least one item");
      setSnackbar({ open: true, message: "Fill all required fields and add at least one item", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const resp = await fetchWithAuth("http://localhost:5000/api/v1/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: prescriptionForm.patientId,
          diagnosis: prescriptionForm.diagnosis,
          items: prescriptionForm.items,
          pharmacyId: prescriptionForm.pharmacyId,
          notes: prescriptionForm.notes || "",
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || "Failed to create prescription");
      }

      const data = await resp.json();
      setRes(data);
      dispatch({ type: ACTIONS.RESET_FORM });
      setErrorMsg("");
      setSnackbar({ open: true, message: "Prescription created successfully!", severity: "success" });
      
      // Reset after 3 seconds
      setTimeout(() => {
        setRes(null);
      }, 5000);
    } catch (err) {
      const errorMessage = "Error creating prescription: " + err.message;
      setErrorMsg(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start p-6 relative min-h-screen overflow-hidden bg-gray-50">
      {/* LEFT SIDE ICONS */}
      <AnimatedPathIcons mirror={false} />

      {/* PRESCRIPTION FORM */}
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 600,
          borderRadius: 3,
          zIndex: 1,
          position: "relative",
          bgcolor: "#0d9488",
          color: "white",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <div className="flex items-center justify-center gap-2 mb-6">
            <AssignmentIcon sx={{ fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, textAlign: "center" }}>
              Create Prescription
            </Typography>
          </div>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, bgcolor: "#ffebee", color: "#c62828" }}>
              {errorMsg}
            </Alert>
          )}

          {res && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Prescription Created Successfully!
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                ID: {res.id || res._id || "N/A"}
              </Typography>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Patient ID */}
            <TextField
              fullWidth
              label="Patient ID"
              placeholder="Enter Patient ID"
              value={prescriptionForm.patientId || ""}
              onChange={(e) =>
                dispatch({ type: ACTIONS.UPDATE_FORM, payload: { patientId: e.target.value } })
              }
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                  "&.Mui-focused fieldset": { borderColor: "white" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.9)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              }}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: "#0d9488" }} />,
              }}
            />

            {/* Diagnosis */}
            <TextField
              fullWidth
              label="Diagnosis"
              placeholder="Enter Diagnosis"
              value={prescriptionForm.diagnosis || ""}
              onChange={(e) =>
                dispatch({ type: ACTIONS.UPDATE_FORM, payload: { diagnosis: e.target.value } })
              }
              required
              multiline
              rows={2}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                  "&.Mui-focused fieldset": { borderColor: "white" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.9)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              }}
            />

            {/* Notes (Optional) */}
            <TextField
              fullWidth
              label="Notes (Optional)"
              placeholder="Additional notes..."
              value={prescriptionForm.notes || ""}
              onChange={(e) =>
                dispatch({ type: ACTIONS.UPDATE_FORM, payload: { notes: e.target.value } })
              }
              multiline
              rows={2}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                  "&.Mui-focused fieldset": { borderColor: "white" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.9)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              }}
            />

            <div className="my-6 border-t border-white/30"></div>

            {/* Prescription Items Section */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Prescription Items
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-white text-sm font-medium mb-1">Drug Master ID</label>
                <TextField
                  placeholder="Enter Drug Master ID"
                  value={drugMaster}
                  onChange={(e) => setDrugMaster(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    },
                  }}
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Dosage</label>
                <TextField
                  placeholder="Enter Dosage"
                  value={dosageText}
                  onChange={(e) => setDosageText(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    },
                  }}
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Quantity</label>
                <div className="flex gap-2">
                  <TextField
                    type="number"
                    placeholder="Qty"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value) || 1)}
                    size="small"
                    inputProps={{ min: 1 }}
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={addItem}
                    startIcon={<AddIcon />}
                    sx={{
                      bgcolor: "#23b758",
                      "&:hover": { bgcolor: "#1ea049" },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Items Table */}
            {prescriptionForm.items.length > 0 && (
              <TableContainer
                component={Paper}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: "white",
                  maxHeight: 300,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }}>Drug Master</TableCell>
                      <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }}>Dosage</TableCell>
                      <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }} align="center">
                        Quantity
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prescriptionForm.items.map((it, i) => (
                      <TableRow key={i} hover>
                        <TableCell>{it.drugMaster}</TableCell>
                        <TableCell>{it.dosageText}</TableCell>
                        <TableCell align="center">
                          <Chip label={it.qty} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              onClick={() => removeItem(i)}
                              sx={{ color: "#d32f2f" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pharmacy Selection */}
            {user?.role !== "PHARMACY" && (
              <>
                <div className="my-6 border-t border-white/30"></div>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  <LocalPharmacyIcon sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }} />
                  Select Pharmacy
                </Typography>
                <FormControl
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    },
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.9)" },
                  }}
                >
                  <InputLabel>Pharmacy</InputLabel>
                  <Select
                    value={prescriptionForm.pharmacyId || ""}
                    onChange={(e) =>
                      dispatch({ type: ACTIONS.UPDATE_FORM, payload: { pharmacyId: e.target.value } })
                    }
                    label="Pharmacy"
                  >
                    <MenuItem value="">-- Choose Pharmacy --</MenuItem>
                    {availablePharmacies.map((ph) => (
                      <MenuItem key={ph.id} value={ph.id}>
                        {ph.name} {ph.city ? `- ${ph.city}` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={submit}
              disabled={loading}
              size="large"
              sx={{
                mt: 4,
                py: 1.5,
                bgcolor: "#23b758",
                "&:hover": { bgcolor: "#1ea049" },
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1, color: "white" }} />
                  Creating Prescription...
                </>
              ) : (
                "Create Prescription"
              )}
            </Button>

            {prescriptionForm.items.length > 0 && (
              <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 2, opacity: 0.9 }}>
                {prescriptionForm.items.length} item(s) added
              </Typography>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RIGHT SIDE ICONS */}
      <AnimatedPathIcons mirror />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

// ------------------------
// ICON ANIMATION PATH WITH PAUSE/BOUNCE
// ------------------------
function AnimatedPathIcons({ mirror }) {
  const icons = [
    { Icon: FaUserInjured, color: "#88c0d0" },
    { Icon: FaUserMd, color: "#23b758" },
    { Icon: FaStethoscope, color: "#2c9191" },
    { Icon: FaClipboard, color: "#4c8bf5" },
    { Icon: FaPills, color: "#ff9800" },
    { Icon: FaPrescriptionBottleAlt, color: "#9c27b0" },
    { Icon: FaShoppingBag, color: "#03a9f4" },
    { Icon: FaAmbulance, color: "#e91e63" },
    { Icon: FaTruck, color: "#607d8b" },
  ];

  // Key points for "workflow stops" around rectangle
  const pathX = mirror
    ? ["0%", "20%", "40%", "60%", "80%", "100%", "80%", "60%", "40%", "20%", "0%"]
    : ["0%", "-20%", "-40%", "-60%", "-80%", "-100%", "-80%", "-60%", "-40%", "-20%", "0%"];
  const pathY = ["0%", "5%", "10%", "15%", "10%", "0%", "-5%", "-10%", "-15%", "-10%", "0%"];
  const rotate = [0, 15, -15, 30, -30, 15, -15, 0, 15, -15, 0];
  const scale = [1, 1.2, 1, 1.2, 1, 1.2, 1, 1.2, 1, 1.2, 1]; // bounce at stops

  return (
    <div className="flex flex-col items-center mx-4">
      {icons.map(({ Icon, color }, index) => (
        <motion.div
          key={index}
          initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
          animate={{ x: pathX, y: pathY, rotate, scale }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "mirror", delay: index * 0.5 }}
          style={{
            backgroundColor: color,
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 50,
            height: 50,
            color: "#fff",
            margin: "12px 0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          <Icon size={24} />
        </motion.div>
      ))}
    </div>
  );
}
