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
  AccountTree as AccountTreeIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { Plus } from "lucide-react";

// ─── Category → Subcategory mapping ──────────────────────────────────────────

const CATEGORY_MAP = {
  Department: [
    "Pastoral Department",
    "Social Department",
  ],
  Organization: [
    "Pastoral Organizations",
    "Social Organizations",
  ],
  Institution: [
    "Pastoral Institutions",
    "Educational Institutions",
    "Medical Institutions",
    "Training Institutions",
    "Business Institutions",
  ],
};

const CATEGORIES = Object.keys(CATEGORY_MAP);

// ─── Chip style maps ──────────────────────────────────────────────────────────

const CATEGORY_STYLES = {
  Department:   { color: "#1D4ED8", bg: "#DBEAFE" },
  Organization: { color: "#15803D", bg: "#DCFCE7" },
  Institution:  { color: "#B45309", bg: "#FEF3C7" },
};

const SUBCATEGORY_STYLES = {
  "Pastoral Department":      { color: "#6D28D9", bg: "#EDE9FE" },
  "Social Department":        { color: "#0E7490", bg: "#CFFAFE" },
  "Pastoral Organizations":   { color: "#6D28D9", bg: "#EDE9FE" },
  "Social Organizations":     { color: "#0E7490", bg: "#CFFAFE" },
  "Pastoral Institutions":    { color: "#6D28D9", bg: "#EDE9FE" },
  "Educational Institutions": { color: "#15803D", bg: "#DCFCE7" },
  "Medical Institutions":     { color: "#BE185D", bg: "#FCE7F3" },
  "Training Institutions":    { color: "#B45309", bg: "#FEF3C7" },
  "Business Institutions":    { color: "#1D4ED8", bg: "#DBEAFE" },
};

const catStyle  = (v) => CATEGORY_STYLES[v]   || { color: "#475569", bg: "#F1F5F9" };
const subStyle  = (v) => SUBCATEGORY_STYLES[v] || { color: "#475569", bg: "#F1F5F9" };

// ─── Theme ────────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0E7490", light: "#06B6D4", dark: "#0C4A6E" },
    background: { default: "#F0FDFF", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#64748B" },
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

// ─── Default form ─────────────────────────────────────────────────────────────

const defaultForm = { name: "", category: "", subcategory: "" };

// ─── Component ────────────────────────────────────────────────────────────────

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [message, setMessage] = useState(null);

  // Subcategories available for the currently selected category
  const availableSubcategories = formData.category ? CATEGORY_MAP[formData.category] : [];

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/department/");
      setDepartments(res.data);
      setMessage({ type: "success", text: "Departments fetched successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to fetch departments" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record) => {
    setIsEditing(true);
    setSelectedDepartment(record);
    setFormData({ name: record.name, category: record.category, subcategory: record.subcategory });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axiosInstance.delete(`/department/${id}`);
      fetchDepartments();
      setMessage({ type: "success", text: "Deleted successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const handleCategoryChange = (value) => {
    // Reset subcategory when category changes
    setFormData((prev) => ({ ...prev, category: value, subcategory: "" }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category || !formData.subcategory) return;
    setIsLoading(true);
    try {
      const payload = { name: formData.name.trim(), category: formData.category, subcategory: formData.subcategory };
      if (isEditing) {
        await axiosInstance.put(`/department/${selectedDepartment._id}`, payload);
        setMessage({ type: "success", text: "Updated successfully" });
      } else {
        await axiosInstance.post("/department", payload);
        setMessage({ type: "success", text: "Created successfully" });
      }
      fetchDepartments();
      setIsModalVisible(false);
      resetForm();
    } catch {
      setMessage({ type: "error", text: `Failed to ${isEditing ? "update" : "create"}` });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setIsEditing(false);
    setSelectedDepartment(null);
  };

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Name",
      size: 250,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: "8px", flexShrink: 0,
            background: `linear-gradient(135deg, ${catStyle(row.original.category).bg}, ${catStyle(row.original.category).color}22)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AccountTreeIcon fontSize="small" sx={{ color: catStyle(row.original.category).color }} />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "'Georgia', serif", color: theme.palette.text.primary }}>
            {row.original.name}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      size: 160,
      Cell: ({ row }) => {
        const s = catStyle(row.original.category);
        return (
          <Chip
            label={row.original.category}
            size="small"
            sx={{
              backgroundColor: s.bg, color: s.color,
              fontWeight: 700, fontSize: "0.72rem",
              fontFamily: "'Georgia', serif",
              border: `1px solid ${s.color}33`,
            }}
          />
        );
      },
    },
    {
      accessorKey: "subcategory",
      header: "Subcategory",
      size: 220,
      Cell: ({ row }) => {
        const s = subStyle(row.original.subcategory);
        return (
          <Chip
            icon={<CategoryIcon style={{ fontSize: 13, color: s.color }} />}
            label={row.original.subcategory}
            size="small"
            sx={{
              backgroundColor: s.bg, color: s.color,
              fontWeight: 600, fontSize: "0.71rem",
              fontFamily: "'Georgia', serif",
              "& .MuiChip-icon": { color: s.color },
            }}
          />
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      size: 130,
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3, minHeight: "100vh", background: "#F0FDFF" }}>

        {/* ── Header ── */}
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: "12px",
                background: "linear-gradient(135deg, #06B6D4, #0E7490)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AccountTreeIcon sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", color: theme.palette.text.primary, mb: 0.3 }}>
                  Department / Institution Management
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Manage departments, organizations and institutions
                </Typography>
              </Box>
            </Box>
            <GradientButton startIcon={<Plus size={18} />} onClick={() => { setIsModalVisible(true); resetForm(); }}>
              Add New
            </GradientButton>
          </Box>
        </StyledCard>

        {/* ── Table ── */}
        <StyledCard>
          <MaterialReactTable
            columns={columns}
            data={departments}
            enableColumnFiltering
            enableGlobalFilter
            enableColumnOrdering
            enablePagination
            enableSorting
            enableRowSelection
            enableColumnResizing
            enableFullScreenToggle
            enableDensityToggle
            enableHiding
            positionToolbarAlertBanner="bottom"
            state={{ isLoading }}
            renderTopToolbarCustomActions={() => (
              <Box sx={{ p: 2 }}>
                <IconButton onClick={fetchDepartments}
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
          maxWidth="sm" fullWidth TransitionComponent={Fade}
          PaperProps={{ elevation: 0, sx: { borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" } }}
        >
          <DialogTitle sx={{ p: 3, borderBottom: "1px solid #F1F5F9", background: "linear-gradient(135deg, #F0FDFF, #CFFAFE)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: "10px",
                background: "linear-gradient(135deg, #06B6D4, #0E7490)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AccountTreeIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif" }}>
                  {isEditing ? "Edit Entry" : "Add New Entry"}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.2 }}>
                  {isEditing ? "Update the details below" : "Fill in the name, category and subcategory"}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <form onSubmit={handleFormSubmit}>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={2.5}>

                {/* Name */}
                <Grid item xs={12}>
                  <StyledTextField
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter department / institution name"
                    fullWidth required autoFocus
                  />
                </Grid>

                {/* Category */}
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    fullWidth required
                  >
                    {CATEGORIES.map((cat) => {
                      const s = catStyle(cat);
                      return (
                        <MenuItem key={cat} value={cat}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: s.color, flexShrink: 0 }} />
                            {cat}
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </StyledTextField>
                </Grid>

                {/* Subcategory — disabled until category is chosen */}
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    select
                    label="Subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    fullWidth required
                    disabled={!formData.category}
                    helperText={!formData.category ? "Select a category first" : ""}
                  >
                    {availableSubcategories.map((sub) => {
                      const s = subStyle(sub);
                      return (
                        <MenuItem key={sub} value={sub}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: s.color, flexShrink: 0 }} />
                            {sub}
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </StyledTextField>
                </Grid>

                {/* Live preview chip */}
                {formData.category && formData.subcategory && (
                  <Grid item xs={12}>
                    <Box sx={{
                      p: 2, borderRadius: 2,
                      backgroundColor: "#F0FDFF",
                      border: "1px dashed #06B6D4",
                      display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap",
                    }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>Preview:</Typography>
                      <Chip label={formData.category} size="small"
                        sx={{ backgroundColor: catStyle(formData.category).bg, color: catStyle(formData.category).color, fontWeight: 700, fontSize: "0.7rem" }} />
                      <Typography variant="caption" sx={{ color: "#94A3B8" }}>→</Typography>
                      <Chip label={formData.subcategory} size="small"
                        sx={{ backgroundColor: subStyle(formData.subcategory).bg, color: subStyle(formData.subcategory).color, fontWeight: 600, fontSize: "0.7rem" }} />
                    </Box>
                  </Grid>
                )}

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

export default Department;