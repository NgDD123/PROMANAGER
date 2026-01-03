import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Stack,
  IconButton,
  Chip,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useJournal } from "../../context/JournalContext";
import { useStock } from "../../context/stockContext";

export default function JournalForm({ onCancel, initialData }) {
  const { addJournalEntry } = useJournal();
  const { accountSettings } = useStock();

  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [lines, setLines] = useState(
    initialData?.lines || [
      { type: "debit", accountId: "", amount: 0 },
      { type: "credit", accountId: "", amount: 0 },
    ]
  );
  const [saving, setSaving] = useState(false);

  const totals = useMemo(() => {
    let debit = 0,
      credit = 0;
    lines.forEach((l) => {
      if (l.type === "debit") debit += Number(l.amount) || 0;
      if (l.type === "credit") credit += Number(l.amount) || 0;
    });
    return { debit, credit, balanced: debit === credit && debit > 0 };
  }, [lines]);

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const addLine = (type) => {
    setLines([...lines, { type, accountId: "", amount: 0 }]);
  };

  const removeLine = (index) => setLines(lines.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!totals.balanced) {
      alert("Debits and Credits must be equal before saving!");
      return;
    }

    const formattedLines = lines.map((l) => {
      const account = accountSettings.find((a) => a.id === l.accountId);
      return {
        accountId: l.accountId,
        accountName: account ? account.name : "",
        type: l.type,
        amount: Number(l.amount),
        debit: l.type === "debit" ? Number(l.amount) : 0,
        credit: l.type === "credit" ? Number(l.amount) : 0,
      };
    });

    setSaving(true);
    try {
      await addJournalEntry({ date, description, lines: formattedLines });
      onCancel();
    } catch (err) {
      console.error(err);
      alert("Failed to save journal entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
        height: "100%",
        p: 3,
        borderRadius: 3,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: "white",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          height: "100%",
          overflow: "auto",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            mb: 3,
            fontWeight: 600,
            color: "grey.800",
            pb: 2,
            borderBottom: "2px solid",
            borderColor: "#0d9488",
          }}
        >
          {initialData ? "Edit Journal Entry" : "New Journal Entry"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Date */}
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#0d9488" },
                  "&.Mui-focused fieldset": { borderColor: "#0d9488" },
                },
              }}
            />

            {/* Description */}
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g. Sales revenue or payment to supplier"
              required
              size="small"
              multiline
              rows={2}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#0d9488" },
                  "&.Mui-focused fieldset": { borderColor: "#0d9488" },
                },
              }}
            />

            {/* Journal Lines */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "grey.700" }}>
                Journal Lines (Debits & Credits)
              </Typography>

              <Stack spacing={1.5}>
                {lines.map((line, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: index % 2 === 0 ? "#fafafa" : "#f5f5f5",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                          value={line.type}
                          onChange={(e) =>
                            handleLineChange(index, "type", e.target.value)
                          }
                          sx={{
                            bgcolor: line.type === "debit" ? "#e3f2fd" : "#fff3e0",
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#0d9488",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#0d9488",
                            },
                          }}
                        >
                          <MenuItem value="debit">Debit</MenuItem>
                          <MenuItem value="credit">Credit</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel>Account</InputLabel>
                        <Select
                          value={line.accountId}
                          onChange={(e) =>
                            handleLineChange(index, "accountId", e.target.value)
                          }
                          label="Account"
                          required
                          sx={{
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#0d9488",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#0d9488",
                            },
                          }}
                        >
                          <MenuItem value="">Select Account</MenuItem>
                          {accountSettings.map((a) => (
                            <MenuItem key={a.id} value={a.id}>
                              {a.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TextField
                        type="number"
                        step="0.01"
                        value={line.amount}
                        onChange={(e) =>
                          handleLineChange(index, "amount", e.target.value)
                        }
                        placeholder="Amount"
                        size="small"
                        sx={{ width: 120 }}
                        inputProps={{ min: 0 }}
                        sx={{
                          width: 120,
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": { borderColor: "#0d9488" },
                            "&.Mui-focused fieldset": { borderColor: "#0d9488" },
                          },
                        }}
                      />

                      {lines.length > 2 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeLine(index)}
                          sx={{
                            "&:hover": {
                              bgcolor: "error.light",
                              color: "white",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => addLine("debit")}
                  sx={{
                    color: "#0d9488",
                    "&:hover": {
                      bgcolor: "#e0f2f1",
                    },
                  }}
                >
                  Add Debit
                </Button>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => addLine("credit")}
                  sx={{
                    color: "#0d9488",
                    "&:hover": {
                      bgcolor: "#e0f2f1",
                    },
                  }}
                >
                  Add Credit
                </Button>
              </Stack>
            </Box>

            {/* Totals */}
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "grey.50",
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Total Debit:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {totals.debit.toFixed(2)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Total Credit:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {totals.credit.toFixed(2)}
                  </Typography>
                </Stack>
                <Alert
                  icon={totals.balanced ? <CheckCircleIcon /> : <WarningIcon />}
                  severity={totals.balanced ? "success" : "warning"}
                  sx={{ mt: 1 }}
                >
                  {totals.balanced
                    ? "Balanced Entry"
                    : "Debits and Credits must balance"}
                </Alert>
              </Stack>
            </Box>

            {/* Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                startIcon={<CancelIcon />}
                sx={{
                  borderColor: "grey.400",
                  color: "grey.700",
                  "&:hover": {
                    borderColor: "grey.600",
                    bgcolor: "grey.50",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!totals.balanced || saving}
                startIcon={<SaveIcon />}
                sx={{
                  bgcolor: "#0d9488",
                  "&:hover": {
                    bgcolor: "#14b8a6",
                  },
                  "&:disabled": {
                    bgcolor: "grey.400",
                  },
                }}
              >
                {saving ? "Saving..." : "Save Entry"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
