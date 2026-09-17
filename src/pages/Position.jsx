import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import axiosInstance from "../axiosConfig";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Box, Typography, IconButton, Tooltip, Card, Fade, Chip,
  CircularProgress, Snackbar, Alert, CssBaseline, createTheme, ThemeProvider,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WorkOutline as WorkIcon,
} from "@mui/icons-material";
import { Plus } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
// "Administration", "Curia", "Tribunal","Other"
const GROUPS = [
  { value: "Administration", color: "#1D4ED8", bg: "#DBEAFE" },
  { value: "Curia",       color: "#15803D", bg: "#DCFCE7" },
  { value: "Tribunal",        color: "#B45309", bg: "#FEF3C7" },
  { value: "Other",      color: "#7C3AED", bg: "#EDE9FE" },
  { value: "Pastoral",        color: "#BE185D", bg: "#FCE7F3" },
//   { value: "Other",          color: "#475569", bg: "#F1F5F9" },
];

const groupStyle = (val) => GROUPS.find((g) => g.value === val) || { color: "#475569", bg: "#F1F5F9" };

// ─── Theme ────────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1E3A5F", light: "#2E5B8E", dark: "#142847" },
    background: { default: "#F7F9FC", paper: "#FFFFFF" },
    text: { primary: "#1E293B", secondary: "#64748B" },
  },
  typography: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
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

// ─── Component ────────────────────────────────────────────────────────────────

const Position = () => {
  const [positions, setPositions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", group: "" });
  const [message, setMessage] = useState(null);

  useEffect(() => { fetchPositions(); }, []);

  const fetchPositions = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/position/");
      setPositions(res.data);
      setMessage({ type: "success", text: "Positions fetched successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to fetch positions" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record) => {
    setIsEditing(true);
    setSelectedPosition(record);
    setFormData({ name: record.name, group: record.group || "" });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this position?")) return;
    try {
      await axiosInstance.delete(`/position/${id}`);
      fetchPositions();
      setMessage({ type: "success", text: "Position deleted successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete position" });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.group) return;
    setIsLoading(true);
    try {
      const payload = { name: formData.name.trim(), group: formData.group };
      if (isEditing) {
        await axiosInstance.put(`/position/${selectedPosition._id}`, payload);
        setMessage({ type: "success", text: "Position updated successfully" });
      } else {
        await axiosInstance.post("/position", payload);
        setMessage({ type: "success", text: "Position created successfully" });
      }
      fetchPositions();
      setIsModalVisible(false);
      resetForm();
    } catch {
      setMessage({ type: "error", text: `Failed to ${isEditing ? "update" : "create"} position` });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", group: "" });
    setIsEditing(false);
    setSelectedPosition(null);
  };

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Position Name",
      size: 260,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: "8px",
            background: "linear-gradient(135deg, #2E5B8E22, #1E3A5F22)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <WorkIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "'Georgia', serif", color: theme.palette.text.primary }}>
            {row.original.name}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: "group",
      header: "Group",
      size: 180,
      Cell: ({ row }) => {
        const g = groupStyle(row.original.group);
        return (
          <Chip
            label={row.original.group || "—"}
            size="small"
            sx={{
              backgroundColor: g.bg,
              color: g.color,
              fontWeight: 700,
              fontSize: "0.72rem",
              fontFamily: "'Georgia', serif",
              border: `1px solid ${g.color}22`,
            }}
          />
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      size: 150,
      Cell: ({ row }) => (
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "—"}
        </Typography>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 110,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(row.original)}
              sx={{ backgroundColor: theme.palette.primary.light + "20", "&:hover": { backgroundColor: theme.palette.primary.light + "35" } }}>
              <EditIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3, minHeight: "100vh", background: "#F7F9FC" }}>

        {/* ── Header ── */}
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: "12px",
                background: "linear-gradient(135deg, #2E5B8E, #1E3A5F)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <WorkIcon sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", color: theme.palette.text.primary, mb: 0.3 }}>
                  Position Management
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Manage clergy positions and roles
                </Typography>
              </Box>
            </Box>
            <GradientButton startIcon={<Plus size={18} />} onClick={() => { setIsModalVisible(true); resetForm(); }}>
              Add Position
            </GradientButton>
          </Box>
        </StyledCard>

        {/* ── Table ── */}
        <StyledCard>
          <MaterialReactTable
            columns={columns}
            data={positions}
            enableColumnFiltering
            enableGlobalFilter
            enablePagination
            enableSorting
            enableRowSelection
            enableFullScreenToggle
            enableDensityToggle
            positionToolbarAlertBanner="bottom"
            state={{ isLoading }}
            renderTopToolbarCustomActions={() => (
              <Box sx={{ p: 2 }}>
                <IconButton onClick={fetchPositions}
                  sx={{ backgroundColor: theme.palette.primary.light + "20", "&:hover": { backgroundColor: theme.palette.primary.light + "35" } }}>
                  <RefreshIcon sx={{ color: theme.palette.primary.main }} />
                </IconButton>
              </Box>
            )}
            muiTablePaperProps={{ elevation: 0, sx: { borderRadius: "12px", border: "none", backgroundColor: "white" } }}
            muiTableProps={{ sx: { "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9", backgroundColor: "white" } } }}
            initialState={{ density: "comfortable", pagination: { pageSize: 15 } }}
          />
        </StyledCard>

        {/* ── Dialog ── */}
        <Dialog
          open={isModalVisible}
          onClose={() => { setIsModalVisible(false); resetForm(); }}
          maxWidth="xs" fullWidth TransitionComponent={Fade}
          PaperProps={{ elevation: 0, sx: { borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" } }}
        >
          <DialogTitle sx={{ p: 3, borderBottom: "1px solid #F1F5F9" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{
                width: 38, height: 38, borderRadius: "10px",
                background: "linear-gradient(135deg, #2E5B8E, #1E3A5F)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <WorkIcon sx={{ color: "white", fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif" }}>
                  {isEditing ? "Edit Position" : "Add Position"}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.2 }}>
                  {isEditing ? "Update position details" : "Enter position name and group"}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <form onSubmit={handleFormSubmit}>
            <DialogContent sx={{ p: 3, pt: 2.5 }}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Position Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vicar, Asst. Vicar, Administrator..."
                    fullWidth required autoFocus
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    select
                    label="Group"
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    fullWidth required
                  >
                    {GROUPS.map((g) => (
                      <MenuItem key={g.value} value={g.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: g.color, flexShrink: 0 }} />
                          {g.value}
                        </Box>
                      </MenuItem>
                    ))}
                  </StyledTextField>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0, gap: 1.5 }}>
              <Button variant="outlined" onClick={() => { setIsModalVisible(false); resetForm(); }}
                sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600, borderColor: "#CBD5E1", color: "#64748B", flex: 1 }}>
                Cancel
              </Button>
              <GradientButton type="submit" disabled={isLoading} sx={{ flex: 1 }}>
                {isLoading
                  ? <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} color="inherit" />
                      <span>Saving...</span>
                    </Box>
                  : isEditing ? "Update" : "Save"
                }
              </GradientButton>
            </DialogActions>
          </form>
        </Dialog>

        {/* ── Snackbar ── */}
        <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert onClose={() => setMessage(null)} severity={message?.type || "info"} variant="filled"
            sx={{ borderRadius: "8px", backgroundColor: message?.type === "error" ? "#DC2626" : theme.palette.primary.main }}>
            {message?.text}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Position;