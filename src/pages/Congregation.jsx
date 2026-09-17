import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import axiosInstance from "../axiosConfig";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Box, Typography, IconButton, Tooltip, Card, Avatar, Fade,
  CircularProgress, Snackbar, Alert, CssBaseline, createTheme, ThemeProvider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  FileDownload as FileDownloadIcon, Refresh as RefreshIcon,
  LocationOn, Phone, Business, Edit as EditIcon, Delete as DeleteIcon,
} from "@mui/icons-material";
import { Plus } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0F766E", light: "#14B8A6", dark: "#115E59" },
    secondary: { main: "#F59E0B", light: "#FCD34D", dark: "#B45309" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text: { primary: "#1E293B", secondary: "#64748B" },
  },
  typography: { fontFamily: "Inter, system-ui, -apple-system, sans-serif" },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.07)", transition: "all 0.3s ease",
          "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 20px rgba(0,0,0,0.12)" },
        },
      },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600 } },
    },
  },
});

const StyledCard = styled(Card)(() => ({
  borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.07)", transition: "all 0.3s ease",
  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 20px rgba(0,0,0,0.12)" },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  color: "white",
  "&:hover": { background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    "& fieldset": { borderColor: theme.palette.divider },
    "&:hover fieldset": { borderColor: theme.palette.primary.main },
    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
  },
}));

const Congregation = () => {
  const [congregations, setCongregations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCongregation, setSelectedCongregation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: "", phone: "", building: "", street: "",
    city: "", district: "", state: "", pincode: "",
  });

  const handleExportRows = (rows) => {
    if (!rows.length) return;
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Name", "Phone", "Building", "City", "District", "State", "Pincode"]],
      body: rows.map((r) => [
        r.original.name, r.original.phone, r.original.building,
        r.original.city, r.original.district, r.original.state, r.original.pincode,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 118, 110], textColor: 255 },
      startY: 20,
    });
    doc.text("Congregation Management Report", 14, 15);
    doc.save("congregations.pdf");
  };

  useEffect(() => { fetchCongregations(); }, []);

  const fetchCongregations = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/congregation/");
      setCongregations(res.data);
      setMessage({ type: "success", text: "Congregations fetched successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to fetch congregations" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record) => {
    setIsModalVisible(true);
    setIsEditing(true);
    setSelectedCongregation(record);
    setFormData(record);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this congregation?")) return;
    try {
      await axiosInstance.delete(`/congregation/${id}`);
      fetchCongregations();
      setMessage({ type: "success", text: "Congregation deleted successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete congregation" });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await axiosInstance.put(`/congregation/${selectedCongregation._id}`, formData);
        setMessage({ type: "success", text: "Congregation updated successfully" });
      } else {
        await axiosInstance.post("/congregation", formData);
        setMessage({ type: "success", text: "Congregation created successfully" });
      }
      fetchCongregations();
      setIsModalVisible(false);
      resetForm();
    } catch {
      setMessage({ type: "error", text: `Failed to ${isEditing ? "update" : "create"} congregation` });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", building: "", street: "", city: "", district: "", state: "", pincode: "" });
    setIsEditing(false);
    setSelectedCongregation(null);
  };

  const columns = useMemo(() => [
    {
      accessorKey: "name", header: "Name", size: 210,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
            {row.original.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              {row.original.name}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {row.original.city}, {row.original.state}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      accessorKey: "phone", header: "Contact", size: 170,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Phone fontSize="small" sx={{ color: theme.palette.text.secondary }} />
          <Typography variant="body2">{row.original.phone}</Typography>
        </Box>
      ),
    },
    {
      accessorKey: "location", header: "Address", size: 240,
      Cell: ({ row }) => (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Business fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            <Typography variant="body2">{row.original.building}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOn fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {row.original.city}, {row.original.pincode}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "actions", header: "Actions", size: 110,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(row.original)}
              sx={{ backgroundColor: theme.palette.primary.light + "20", "&:hover": { backgroundColor: theme.palette.primary.light + "30" } }}>
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
      <Box sx={{ p: 3, minHeight: "100vh", background: "#fff" }}>

        {/* Header */}
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
                Congregation Management
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Manage and organize all congregation details in one place
              </Typography>
            </Box>
            <GradientButton startIcon={<Plus size={20} />} onClick={() => { setIsModalVisible(true); resetForm(); }}>
              Add New Congregation
            </GradientButton>
          </Box>
        </StyledCard>

        {/* Table */}
        <StyledCard>
          <MaterialReactTable
            columns={columns} data={congregations}
            enableColumnFiltering enableGlobalFilter enableColumnOrdering enablePagination
            enableSorting enableRowSelection enableColumnResizing enableFullScreenToggle
            enableDensityToggle enableHiding positionToolbarAlertBanner="bottom"
            state={{ isLoading }}
            renderTopToolbarCustomActions={({ table }) => (
              <Box sx={{ display: "flex", gap: 2, p: 2 }}>
                <IconButton onClick={fetchCongregations}
                  sx={{ backgroundColor: theme.palette.primary.light + "20", "&:hover": { backgroundColor: theme.palette.primary.light + "30" } }}>
                  <RefreshIcon sx={{ color: theme.palette.primary.main }} />
                </IconButton>
                <Button variant="outlined" onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                  startIcon={<FileDownloadIcon />} disabled={!table.getSelectedRowModel().rows.length}
                  sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600 }}>
                  Export Selected
                </Button>
              </Box>
            )}
            muiTablePaperProps={{ elevation: 0, sx: { borderRadius: "12px", border: "none", backgroundColor: "white" } }}
            muiTableProps={{ sx: { "& .MuiTableCell-root": { borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: "white" } } }}
            initialState={{ density: "comfortable", pagination: { pageSize: 10 } }}
          />
        </StyledCard>

        {/* Create / Edit Dialog */}
        <Dialog open={isModalVisible} onClose={() => { setIsModalVisible(false); resetForm(); }}
          maxWidth="md" fullWidth TransitionComponent={Fade}
          PaperProps={{ elevation: 0, sx: { borderRadius: "12px", bgcolor: "#ffffff", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" } }}>
          <DialogTitle sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {isEditing ? "Edit Congregation Details" : "Add New Congregation"}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
              {isEditing ? "Update the congregation information below" : "Fill in the details to create a new congregation"}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleFormSubmit}>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField label="Congregation Name" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField label="Phone Number" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth required />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField label="Building Name" value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField label="Street" value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField label="City" value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField label="District" value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField label="State" value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField label="Pincode" value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} fullWidth required />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, gap: 2 }}>
              <Button variant="outlined" onClick={() => { setIsModalVisible(false); resetForm(); }}
                sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600 }}>Cancel</Button>
              <GradientButton type="submit" disabled={isLoading}>
                {isLoading
                  ? <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CircularProgress size={20} color="inherit" /><span>Saving...</span></Box>
                  : isEditing ? "Update" : "Save"}
              </GradientButton>
            </DialogActions>
          </form>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={Boolean(message)} autoHideDuration={6000} onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert onClose={() => setMessage(null)} severity={message?.type || "info"} variant="filled"
            sx={{ borderRadius: "8px", backgroundColor: message?.type === "error" ? theme.palette.error.main : theme.palette.primary.main }}>
            {message?.text}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Congregation;