import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MaterialReactTable } from "material-react-table";
import axiosInstance from "../axiosConfig";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Box, Typography, IconButton, Tooltip, Card, Fade, Chip,
  CircularProgress, Snackbar, Alert, CssBaseline, createTheme, ThemeProvider,
  MenuItem, Divider, Paper, InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Church as ChurchIcon,
  AccountTree as AccountTreeIcon,
  CalendarMonth as CalendarIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Plus } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Constants ────────────────────────────────────────────────────────────────

const ASSIGNMENT_TYPES = ["Parish", "Department/Institution"];

const DURATION_MODES = [
  { value: "dateRange", label: "From / To Date" },
  { value: "years",     label: "Number of Years" },
  { value: "months",    label: "Number of Months" },
];

// blank entry template
const blankEntry = () => ({
  _id: `new_${Date.now()}_${Math.random()}`,
  assignmentType: "",
  parish: "",
  department: "",
  position: "",
  durationMode: "dateRange",
  fromDate: "",
  toDate: "",
  durationYears: "",
  durationMonths: "",
  notes: "",
});

// ─── Theme ────────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    mode: "light",
    primary:    { main: "#6D28D9", light: "#8B5CF6", dark: "#4C1D95" },
    secondary:  { main: "#0F766E", light: "#14B8A6", dark: "#115E59" },
    background: { default: "#FAF5FF", paper: "#FFFFFF" },
    text:       { primary: "#1E1B4B", secondary: "#6B7280" },
  },
  typography: { fontFamily: "'Georgia', 'Times New Roman', serif" },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          transition: "all 0.3s ease",
          "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.11)" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontFamily: "inherit" },
      },
    },
  },
});

// ─── Styled ───────────────────────────────────────────────────────────────────

const StyledCard = styled(Card)(() => ({
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  transition: "all 0.3s ease",
  "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.11)" },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  color: "white",
  "&:hover": { background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    fontFamily: "inherit",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: theme.palette.primary.light },
    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
  },
  "& .MuiInputLabel-root": { fontFamily: "inherit" },
}));

const EntryCard = styled(Paper)(({ theme }) => ({
  padding: 20,
  borderRadius: 12,
  border: `1px solid ${theme.palette.primary.light}44`,
  background: "linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%)",
  position: "relative",
  marginBottom: 16,
}));

const SectionLabel = styled(Typography)(() => ({
  fontFamily: "'Georgia', serif",
  fontWeight: 700,
  fontSize: "0.75rem",
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "#6D28D9",
  marginBottom: 10,
  display: "flex",
  alignItems: "center",
  gap: 6,
}));

// ─── Helper: calculate toDate from fromDate + years/months ────────────────────

const calcToDate = (fromDate, years, months) => {
  if (!fromDate) return "";
  const d = new Date(fromDate);
  if (years)  d.setFullYear(d.getFullYear() + Number(years));
  if (months) d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().substring(0, 10);
};

// ─── Single Assignment Entry subcomponent ─────────────────────────────────────

const AssignmentEntry = ({ entry, index, parishes, departments, positions, onChange, onRemove, total }) => {
  const update = (key, val) => onChange(index, { ...entry, [key]: val });

  // When duration mode changes, recalc or clear toDate
  const handleDurationModeChange = (mode) => {
    const updated = { ...entry, durationMode: mode, toDate: "", durationYears: "", durationMonths: "" };
    onChange(index, updated);
  };

  // Recalc toDate whenever years/months or fromDate changes
  const handleYearsChange = (val) => {
    const toDate = calcToDate(entry.fromDate, val, null);
    onChange(index, { ...entry, durationYears: val, durationMonths: "", toDate });
  };
  const handleMonthsChange = (val) => {
    const toDate = calcToDate(entry.fromDate, null, val);
    onChange(index, { ...entry, durationMonths: val, durationYears: "", toDate });
  };
  const handleFromDateChange = (val) => {
    let toDate = entry.toDate;
    if (entry.durationMode === "years" && entry.durationYears)
      toDate = calcToDate(val, entry.durationYears, null);
    else if (entry.durationMode === "months" && entry.durationMonths)
      toDate = calcToDate(val, null, entry.durationMonths);
    onChange(index, { ...entry, fromDate: val, toDate });
  };

  return (
    <EntryCard elevation={0}>
      {/* Entry header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Typography sx={{ color: "white", fontSize: "0.75rem", fontWeight: 700 }}>{index + 1}</Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", color: "#1E1B4B", fontSize: "0.9rem" }}>
            Assignment {index + 1}
          </Typography>
        </Box>
        {total > 1 && (
          <Tooltip title="Remove this assignment">
            <IconButton size="small" onClick={() => onRemove(index)}
              sx={{ color: "#EF4444", backgroundColor: "#FEE2E2", "&:hover": { backgroundColor: "#FECACA" } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Grid container spacing={2}>

        {/* Assignment Type */}
        <Grid item xs={12} sm={6}>
          <StyledTextField
            select label="Assignment Type"
            value={entry.assignmentType}
            onChange={(e) => update("assignmentType", e.target.value)}
            fullWidth required size="small"
          >
            {ASSIGNMENT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {t === "Parish" ? <ChurchIcon fontSize="small" sx={{ color: "#6D28D9" }} /> : <AccountTreeIcon fontSize="small" sx={{ color: "#0E7490" }} />}
                  {t}
                </Box>
              </MenuItem>
            ))}
          </StyledTextField>
        </Grid>

        {/* Parish or Department based on type */}
        {entry.assignmentType === "Parish" && (
          <Grid item xs={12} sm={6}>
            <StyledTextField
              select label="Parish"
              value={entry.parish}
              onChange={(e) => update("parish", e.target.value)}
              fullWidth required size="small"
            >
              {parishes.length === 0
                ? <MenuItem disabled>No parishes found</MenuItem>
                : parishes.map((p) => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)
              }
            </StyledTextField>
          </Grid>
        )}

        {entry.assignmentType === "Department/Institution" && (
          <Grid item xs={12} sm={6}>
            <StyledTextField
              select label="Department / Institution"
              value={entry.department}
              onChange={(e) => update("department", e.target.value)}
              fullWidth required size="small"
            >
              {departments.length === 0
                ? <MenuItem disabled>No departments found</MenuItem>
                : departments.map((d) => (
                    <MenuItem key={d._id} value={d._id}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.name}</Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>{d.category} · {d.subcategory}</Typography>
                      </Box>
                    </MenuItem>
                  ))
              }
            </StyledTextField>
          </Grid>
        )}

        {/* Position */}
        <Grid item xs={12} sm={entry.assignmentType ? 6 : 12}>
          <StyledTextField
            select label="Position"
            value={entry.position}
            onChange={(e) => update("position", e.target.value)}
            fullWidth size="small"
          >
            {positions.length === 0
              ? <MenuItem disabled>No positions found</MenuItem>
              : positions.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                      {p.group && (
                        <Chip label={p.group} size="small"
                          sx={{ fontSize: "0.65rem", height: 18, backgroundColor: "#EDE9FE", color: "#6D28D9" }} />
                      )}
                    </Box>
                  </MenuItem>
                ))
            }
          </StyledTextField>
        </Grid>

        {/* Duration section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 0.5, borderColor: "#EDE9FE" }} />
          <SectionLabel sx={{ mt: 1 }}><CalendarIcon sx={{ fontSize: 13 }} /> Duration</SectionLabel>
        </Grid>

        {/* Duration mode */}
        <Grid item xs={12} sm={4}>
          <StyledTextField
            select label="Duration Mode"
            value={entry.durationMode}
            onChange={(e) => handleDurationModeChange(e.target.value)}
            fullWidth size="small"
          >
            {DURATION_MODES.map((m) => (
              <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
            ))}
          </StyledTextField>
        </Grid>

        {/* From date always shown */}
        <Grid item xs={12} sm={4}>
          <StyledTextField
            label="From Date" type="date"
            value={entry.fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth required size="small"
          />
        </Grid>

        {/* To date — shown for dateRange and as read-only calculated result for years/months */}
        {entry.durationMode === "dateRange" && (
          <Grid item xs={12} sm={4}>
            <StyledTextField
              label="To Date" type="date"
              value={entry.toDate}
              onChange={(e) => update("toDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth size="small"
              helperText="Leave blank if ongoing"
            />
          </Grid>
        )}

        {entry.durationMode === "years" && (
          <>
            <Grid item xs={12} sm={4}>
              <StyledTextField
                label="Number of Years" type="number"
                value={entry.durationYears}
                onChange={(e) => handleYearsChange(e.target.value)}
                inputProps={{ min: 0, step: 1 }}
                InputProps={{ endAdornment: <InputAdornment position="end">yrs</InputAdornment> }}
                fullWidth size="small"
              />
            </Grid>
            {entry.toDate && (
              <Grid item xs={12} sm={4}>
                <StyledTextField
                  label="Calculated To Date" value={entry.toDate}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: true }}
                  fullWidth size="small"
                  sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "#F5F3FF" } }}
                />
              </Grid>
            )}
          </>
        )}

        {entry.durationMode === "months" && (
          <>
            <Grid item xs={12} sm={4}>
              <StyledTextField
                label="Number of Months" type="number"
                value={entry.durationMonths}
                onChange={(e) => handleMonthsChange(e.target.value)}
                inputProps={{ min: 0, step: 1 }}
                InputProps={{ endAdornment: <InputAdornment position="end">mo</InputAdornment> }}
                fullWidth size="small"
              />
            </Grid>
            {entry.toDate && (
              <Grid item xs={12} sm={4}>
                <StyledTextField
                  label="Calculated To Date" value={entry.toDate}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: true }}
                  fullWidth size="small"
                  sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "#F5F3FF" } }}
                />
              </Grid>
            )}
          </>
        )}

        {/* Notes */}
        <Grid item xs={12}>
          <StyledTextField
            label="Notes (optional)"
            value={entry.notes}
            onChange={(e) => update("notes", e.target.value)}
            fullWidth multiline rows={2} size="small"
            placeholder="Any additional notes about this assignment..."
          />
        </Grid>

      </Grid>
    </EntryCard>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AssignmentPage = () => {
  const [assignments, setAssignments]     = useState([]);
  const [priests, setPriests]             = useState([]);
  const [parishes, setParishes]           = useState([]);
  const [departments, setDepartments]     = useState([]);
  const [positions, setPositions]         = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing]           = useState(false);
  const [selectedDoc, setSelectedDoc]       = useState(null);
  const [isLoading, setIsLoading]           = useState(false);
  const [message, setMessage]               = useState(null);

  const [selectedPriest, setSelectedPriest] = useState("");
  const [entries, setEntries]               = useState([blankEntry()]);

  // ── Fetch all lookup data ──────────────────────────────────────────────────

  useEffect(() => {
    fetchAssignments();
    axiosInstance.get("/priest/").then((r) => setPriests(r.data)).catch(() => {});
    axiosInstance.get("/parish/").then((r) => setParishes(r.data)).catch(() => {});
    axiosInstance.get("/department/").then((r) => setDepartments(r.data)).catch(() => {});
    axiosInstance.get("/position/").then((r) => setPositions(r.data)).catch(() => {});
  }, []);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/assignment/");
      setAssignments(res.data);
      setMessage({ type: "success", text: "Assignments fetched successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to fetch assignments" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Entry helpers ──────────────────────────────────────────────────────────

  const handleEntryChange = useCallback((index, updated) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? updated : e)));
  }, []);

  const handleEntryRemove = useCallback((index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddEntry = () => setEntries((prev) => [...prev, blankEntry()]);

  // ── Open modal for new ────────────────────────────────────────────────────

  const openNew = () => {
    setIsEditing(false);
    setSelectedDoc(null);
    setSelectedPriest("");
    setEntries([blankEntry()]);
    setIsModalVisible(true);
  };

  // ── Open modal for edit ───────────────────────────────────────────────────

  const handleEdit = (doc) => {
    setIsEditing(true);
    setSelectedDoc(doc);
    setSelectedPriest(doc.priest?._id || doc.priest || "");
    setEntries(
      doc.assignments.map((a) => ({
        _id: a._id,
        assignmentType:  a.assignmentType || "",
        parish:          a.parish?._id || a.parish || "",
        department:      a.department?._id || a.department || "",
        position:        a.position?._id || a.position || "",
        durationMode:    a.durationYears ? "years" : a.durationMonths ? "months" : "dateRange",
        fromDate:        a.fromDate ? a.fromDate.substring(0, 10) : "",
        toDate:          a.toDate   ? a.toDate.substring(0, 10)   : "",
        durationYears:   a.durationYears  || "",
        durationMonths:  a.durationMonths || "",
        notes:           a.notes || "",
      }))
    );
    setIsModalVisible(true);
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!window.confirm("Delete all assignments for this priest?")) return;
    try {
      await axiosInstance.delete(`/assignment/${id}`);
      fetchAssignments();
      setMessage({ type: "success", text: "Assignments deleted successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete assignments" });
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPriest) return;
    setIsLoading(true);

    const cleanedEntries = entries.map((en) => ({
      assignmentType: en.assignmentType,
      parish:         en.assignmentType === "Parish" ? en.parish || null : null,
      department:     en.assignmentType === "Department/Institution" ? en.department || null : null,
      position:       en.position || null,
      fromDate:       en.fromDate || null,
      toDate:         en.toDate   || null,
      durationYears:  en.durationMode === "years"  ? Number(en.durationYears)  : null,
      durationMonths: en.durationMode === "months" ? Number(en.durationMonths) : null,
      notes:          en.notes || "",
    }));

    try {
      await axiosInstance.post("/assignment", { priestId: selectedPriest, assignments: cleanedEntries });
      setMessage({ type: "success", text: `Assignments ${isEditing ? "updated" : "saved"} successfully` });
      fetchAssignments();
      setIsModalVisible(false);
      resetForm();
    } catch {
      setMessage({ type: "error", text: "Failed to save assignments" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPriest("");
    setEntries([blankEntry()]);
    setIsEditing(false);
    setSelectedDoc(null);
  };

  // ── PDF export ─────────────────────────────────────────────────────────────

  const handleExportRows = (rows) => {
    if (!rows.length) return;
    const doc = new jsPDF();
    const body = [];
    rows.forEach((r) => {
      r.original.assignments.forEach((a) => {
        body.push([
          r.original.priest?.name || "",
          a.assignmentType || "",
          a.parish?.name || a.department?.name || "",
          a.position?.name || "",
          a.fromDate ? new Date(a.fromDate).toLocaleDateString() : "",
          a.toDate   ? new Date(a.toDate).toLocaleDateString()   : "Ongoing",
        ]);
      });
    });
    autoTable(doc, {
      head: [["Priest", "Type", "Parish / Dept", "Position", "From", "To"]],
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [109, 40, 217], textColor: 255 },
      startY: 20,
    });
    doc.text("Priest Assignment Report", 14, 15);
    doc.save("assignments.pdf");
  };

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo(() => [
    {
      accessorKey: "priest.name",
      header: "Priest",
      size: 200,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: "50%",
            background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <PersonIcon sx={{ color: "white", fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif" }}>
              Fr. {row.original.priest?.name || "—"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B" }}>
              {row.original.assignments?.length || 0} assignment(s)
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "assignments",
      header: "Assignments",
      size: 420,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8, py: 0.5 }}>
          {(row.original.assignments || []).map((a, i) => (
            <Box key={i} sx={{
              display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap",
              p: "4px 10px", borderRadius: 2,
              backgroundColor: i % 2 === 0 ? "#F5F3FF" : "#EDE9FE",
              border: "1px solid #DDD6FE",
            }}>
              {/* Type icon */}
              {a.assignmentType === "Parish"
                ? <ChurchIcon sx={{ fontSize: 14, color: "#6D28D9", flexShrink: 0 }} />
                : <AccountTreeIcon sx={{ fontSize: 14, color: "#0E7490", flexShrink: 0 }} />
              }
              {/* Place name */}
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#1E1B4B" }}>
                {a.parish?.name || a.department?.name || "—"}
              </Typography>
              {/* Position */}
              {a.position?.name && (
                <Chip label={a.position.name} size="small"
                  sx={{ fontSize: "0.62rem", height: 17, backgroundColor: "#8B5CF620", color: "#6D28D9", fontWeight: 600 }} />
              )}
              {/* Date range */}
              <Typography variant="caption" sx={{ color: "#64748B", ml: "auto" }}>
                {a.fromDate ? new Date(a.fromDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : ""}
                {" → "}
                {a.toDate ? new Date(a.toDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Ongoing"}
              </Typography>
            </Box>
          ))}
        </Box>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 100,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(row.original)}
              sx={{ backgroundColor: "#8B5CF620", "&:hover": { backgroundColor: "#8B5CF630" } }}>
              <EditIcon fontSize="small" sx={{ color: "#6D28D9" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(row.original._id)}
              sx={{ backgroundColor: "rgb(254,226,226)", "&:hover": { backgroundColor: "rgb(254,202,202)" } }}>
              <DeleteIcon fontSize="small" sx={{ color: "rgb(220,38,38)" }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3, minHeight: "100vh", background: "#FAF5FF" }}>

        {/* ── Header ── */}
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: "12px",
                background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AssignmentIcon sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", color: "#1E1B4B", mb: 0.3 }}>
                  Priest Assignments
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  Assign priests to parishes, departments or institutions
                </Typography>
              </Box>
            </Box>
            <GradientButton startIcon={<Plus size={18} />} onClick={openNew}>
              New Assignment
            </GradientButton>
          </Box>
        </StyledCard>

        {/* ── Table ── */}
        <StyledCard>
          <MaterialReactTable
            columns={columns}
            data={assignments}
            enableColumnFiltering enableGlobalFilter enablePagination
            enableSorting enableRowSelection enableFullScreenToggle
            enableDensityToggle positionToolbarAlertBanner="bottom"
            state={{ isLoading }}
            renderTopToolbarCustomActions={({ table }) => (
              <Box sx={{ display: "flex", gap: 2, p: 2 }}>
                <IconButton onClick={fetchAssignments} sx={{ backgroundColor: "#8B5CF620" }}>
                  <RefreshIcon sx={{ color: "#6D28D9" }} />
                </IconButton>
                <Button variant="outlined" onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                  startIcon={<AssignmentIcon />} disabled={!table.getSelectedRowModel().rows.length}
                  sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600, borderColor: "#8B5CF6", color: "#6D28D9" }}>
                  Export Selected
                </Button>
              </Box>
            )}
            muiTablePaperProps={{ elevation: 0, sx: { borderRadius: "12px", border: "none", backgroundColor: "white" } }}
            muiTableProps={{ sx: { "& .MuiTableCell-root": { borderBottom: "1px solid #F3F4F6", backgroundColor: "white", verticalAlign: "top" } } }}
            initialState={{ density: "comfortable", pagination: { pageSize: 10 } }}
          />
        </StyledCard>

        {/* ── Dialog ── */}
        <Dialog
          open={isModalVisible}
          onClose={() => { setIsModalVisible(false); resetForm(); }}
          maxWidth="md" fullWidth TransitionComponent={Fade}
          PaperProps={{ elevation: 0, sx: { borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: "0 20px 60px rgba(109,40,217,0.15)" } }}
        >
          <DialogTitle sx={{ p: 3, borderBottom: "1px solid #EDE9FE", background: "linear-gradient(135deg, #FAF5FF, #EDE9FE)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{
                width: 42, height: 42, borderRadius: "11px",
                background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AssignmentIcon sx={{ color: "white", fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", color: "#1E1B4B" }}>
                  {isEditing ? "Edit Assignments" : "New Priest Assignment"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mt: 0.2 }}>
                  {isEditing ? "Update priest assignments below" : "Select a priest and add one or more assignments"}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <form onSubmit={handleFormSubmit}>
            <DialogContent sx={{ p: 3, maxHeight: "72vh", overflowY: "auto" }}>

              {/* ── Priest selector ── */}
              <Box sx={{ mb: 3 }}>
                <SectionLabel><PersonIcon sx={{ fontSize: 13 }} /> Select Priest</SectionLabel>
                <StyledTextField
                  select label="Priest"
                  value={selectedPriest}
                  onChange={(e) => setSelectedPriest(e.target.value)}
                  fullWidth required
                  disabled={isEditing}
                >
                  {priests.length === 0
                    ? <MenuItem disabled>No priests found</MenuItem>
                    : priests.map((p) => (
                        <MenuItem key={p._id} value={p._id}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PersonIcon fontSize="small" sx={{ color: "#6D28D9" }} />
                            Fr. {p.name}
                          </Box>
                        </MenuItem>
                      ))
                  }
                </StyledTextField>
              </Box>

              <Divider sx={{ mb: 2.5, borderColor: "#EDE9FE" }} />

              {/* ── Assignment entries ── */}
              <SectionLabel sx={{ mb: 2 }}>
                <AssignmentIcon sx={{ fontSize: 13 }} />
                Assignments ({entries.length})
              </SectionLabel>

              {entries.map((entry, index) => (
                <AssignmentEntry
                  key={entry._id}
                  entry={entry}
                  index={index}
                  total={entries.length}
                  parishes={parishes}
                  departments={departments}
                  positions={positions}
                  onChange={handleEntryChange}
                  onRemove={handleEntryRemove}
                />
              ))}

              {/* Add another entry button */}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddEntry}
                fullWidth
                sx={{
                  borderRadius: 10, textTransform: "none", fontWeight: 600,
                  borderColor: "#8B5CF6", color: "#6D28D9", borderStyle: "dashed",
                  py: 1.2,
                  "&:hover": { backgroundColor: "#F5F3FF", borderStyle: "solid" },
                }}
              >
                Add Another Assignment
              </Button>

            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: "1px solid #EDE9FE", gap: 1.5 }}>
              <Button variant="outlined" onClick={() => { setIsModalVisible(false); resetForm(); }}
                sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600, borderColor: "#CBD5E1", color: "#64748B", flex: 1 }}>
                Cancel
              </Button>
              <GradientButton type="submit" disabled={isLoading} sx={{ flex: 2 }}>
                {isLoading
                  ? <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={18} color="inherit" />
                      <span>Saving...</span>
                    </Box>
                  : isEditing ? `Update Assignments` : `Save ${entries.length} Assignment${entries.length > 1 ? "s" : ""}`
                }
              </GradientButton>
            </DialogActions>
          </form>
        </Dialog>

        {/* ── Snackbar ── */}
        <Snackbar open={Boolean(message)} autoHideDuration={6000} onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert onClose={() => setMessage(null)} severity={message?.type || "info"} variant="filled"
            sx={{ borderRadius: "8px", backgroundColor: message?.type === "error" ? "#DC2626" : "#6D28D9" }}>
            {message?.text}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default AssignmentPage;