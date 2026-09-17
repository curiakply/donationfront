import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import axiosInstance from "../axiosConfig";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Box, Typography, IconButton, Tooltip, Card, CardContent, Avatar, Fade,
  CircularProgress, Snackbar, Alert, CssBaseline, MenuItem, Chip, Divider,
  FormControlLabel, Checkbox,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Church as ChurchIcon,
  CalendarMonth as CalendarIcon,
  Home as HomeIcon,
  Public as PublicIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { Plus } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Constants ───────────────────────────────────────────────────────────────

const HOME_TYPES = [
  { value: "homeDiocese", label: "Home Diocese" },
  { value: "otherDiocese", label: "Other Diocese" },
  { value: "congregation", label: "Congregation" },
];

const STATUSES = [
  { value: "active",   label: "Active",   color: "#059669", bg: "#D1FAE5" },
  { value: "inactive", label: "Inactive", color: "#D97706", bg: "#FEF3C7" },
  { value: "retired",  label: "Retired",  color: "#4f46e5", bg: "#EEF2FF" },
  { value: "died",     label: "Died",     color: "#DC2626", bg: "#FEE2E2" },
];

const WORKING_REGIONS = [
  { value: "India",  label: "India",  color: "#059669", bg: "#D1FAE5" },
  { value: "Abroad", label: "Abroad", color: "#4f46e5", bg: "#EEF2FF" },
];

const statusStyle = (val) => STATUSES.find((s) => s.value === val) || { color: "#6B7280", bg: "#F3F4F6" };
const regionStyle = (val) => WORKING_REGIONS.find((r) => r.value === val) || { color: "#6B7280", bg: "#F3F4F6" };

// ─── Styled (matching Home page) ──────────────────────────────────────────────

const DashboardContainer = styled(Box)(() => ({
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
  padding: 24,
}));

const StyledCard = styled(Card)(() => ({
  height: "100%",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  position: "relative",
  zIndex: 1,
}));

const IconBox = styled(Box)(({ color }) => ({
  width: 56,
  height: 56,
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${color}20, ${color}40)`,
  color: color,
}));

const GradientButton = styled(Button)(() => ({
  background: "linear-gradient(135deg, #1a237e, #0d47a1)",
  color: "white",
  borderRadius: 12,
  padding: "10px 24px",
  fontWeight: 600,
  textTransform: "none",
  "&:hover": { background: "linear-gradient(135deg, #0d47a1, #1a237e)" },
}));

const StyledTextField = styled(TextField)(() => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#0d47a1" },
    "&.Mui-focused fieldset": { borderColor: "#1a237e" },
  },
}));

const SectionLabel = styled(Typography)(() => ({
  fontWeight: 700,
  fontSize: "0.8rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  background: "linear-gradient(45deg, #1a237e, #0d47a1)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  marginBottom: 12,
  marginTop: 4,
  display: "flex",
  alignItems: "center",
  gap: 6,
}));

const ChartCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: theme.spacing(3),
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
}));

// ─── Default form state ───────────────────────────────────────────────────────

const defaultAddress = { houseName: "", street: "", city: "", district: "", state: "", pincode: "", country: "India" };

const defaultForm = {
  name: "", hname: "",
  dob: "2000-01-01", ordinationDate: "2000-01-01",
  email: "", phone: "",
  workingRegion: "India", workingCountry: "",
  homeType: "", homeParish: "", homeParishText: "", homeCongregation: "",
  homeAddress: { ...defaultAddress },
  currentAddress: { ...defaultAddress },
  sameAsHome: false,
  status: "active", statusDate: "", restHome: "",
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Priest = () => {
  const [priests, setPriests] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [congregations, setCongregations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [bulkFile, setBulkFile] = useState(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const setField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const setAddressField = (type, key, val) => {
    setFormData((prev) => {
      const updated = { ...prev, [type]: { ...prev[type], [key]: val } };
      if (type === "homeAddress" && prev.sameAsHome) {
        updated.currentAddress = { ...updated.homeAddress };
      }
      return updated;
    });
  };

  const toggleSameAsHome = () => {
    setFormData((prev) => ({
      ...prev,
      sameAsHome: !prev.sameAsHome,
      currentAddress: !prev.sameAsHome ? { ...prev.homeAddress } : { ...defaultAddress },
    }));
  };

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => { fetchPriests(); }, []);

  const openDialog = (priest = null) => {
    if (!parishes.length) fetchParishes();
    if (!congregations.length) fetchCongregations();
    if (priest) {
      handleEdit(priest);
    } else {
      resetForm();
      setIsModalVisible(true);
    }
  };

  const fetchPriests = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/priest/");
      setPriests(res.data);
    } catch { setMessage({ type: "error", text: "Failed to fetch priests" }); }
    finally { setIsLoading(false); }
  };

  const fetchParishes = async () => {
    try { const res = await axiosInstance.get("/parish/"); setParishes(res.data); }
    catch { console.error("Failed to fetch parishes"); }
  };

  const fetchCongregations = async () => {
    try { const res = await axiosInstance.get("/congregation/"); setCongregations(res.data); }
    catch { console.error("Failed to fetch congregations"); }
  };

  // ── Bulk Upload ────────────────────────────────────────────────────────────

  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    setIsBulkUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", bulkFile);
      const res = await axiosInstance.post("/priest/bulk-upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const { created, failed } = res.data.data;
      let msg = `${created} priests uploaded successfully.`;
      if (failed?.length > 0) {
        msg += ` ${failed.length} failed: ${failed.slice(0, 3).map((f) => `Row ${f.row}: ${f.error}`).join("; ")}`;
        if (failed.length > 3) msg += `... and ${failed.length - 3} more`;
      }
      setMessage({ type: failed?.length > 0 ? "warning" : "success", text: msg });
      fetchPriests();
      setBulkFile(null);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Bulk upload failed" });
    } finally { setIsBulkUploading(false); }
  };

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleEdit = (record) => {
    setIsModalVisible(true);
    setIsEditing(true);
    setSelectedPriest(record);
    const ha = record.homeAddress || {};
    const ca = record.currentAddress || {};
    setFormData({
      name: record.name || "", hname: record.hname || "",
      dob: record.dob ? record.dob.substring(0, 10) : "",
      ordinationDate: record.ordinationDate ? record.ordinationDate.substring(0, 10) : "",
      email: record.email || "", phone: record.phone || "",
      workingRegion: record.workingRegion || "India",
      workingCountry: record.workingCountry || "",
      homeType: record.homeType || "",
      homeParish: record.homeParish?._id || record.homeParish || "",
      homeParishText: record.homeParishText || "",
      homeCongregation: record.homeCongregation?._id || record.homeCongregation || "",
      homeAddress: {
        houseName: ha.houseName || "", street: ha.street || "", city: ha.city || "",
        district: ha.district || "", state: ha.state || "", pincode: ha.pincode || "", country: ha.country || "India",
      },
      currentAddress: {
        houseName: ca.houseName || "", street: ca.street || "", city: ca.city || "",
        district: ca.district || "", state: ca.state || "", pincode: ca.pincode || "", country: ca.country || "India",
      },
      sameAsHome: false,
      status: record.status || "active",
      statusDate: record.statusDate ? record.statusDate.substring(0, 10) : "",
      restHome: record.restHome || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this priest?")) return;
    try {
      await axiosInstance.delete(`/priest/${id}`);
      fetchPriests();
      setMessage({ type: "success", text: "Priest deleted successfully" });
    } catch { setMessage({ type: "error", text: "Failed to delete priest" }); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { ...formData };
    delete payload.sameAsHome;
    if (payload.homeType !== "homeDiocese") payload.homeParish = null;
    if (payload.homeType !== "otherDiocese") payload.homeParishText = "";
    if (payload.homeType !== "congregation") payload.homeCongregation = null;
    // ── statusDate: allowed for inactive, retired, died ──
    if (payload.status === "active") payload.statusDate = null;
    if (payload.status !== "retired") payload.restHome = "";
    if (payload.workingRegion !== "Abroad") payload.workingCountry = "";
    try {
      if (isEditing) {
        await axiosInstance.put(`/priest/${selectedPriest._id}`, payload);
        setMessage({ type: "success", text: "Priest updated successfully" });
      } else {
        await axiosInstance.post("/priest", payload);
        setMessage({ type: "success", text: "Priest created successfully" });
      }
      fetchPriests();
      setIsModalVisible(false);
      resetForm();
    } catch { setMessage({ type: "error", text: `Failed to ${isEditing ? "update" : "create"} priest` }); }
    finally { setIsLoading(false); }
  };

  const resetForm = () => { setFormData(defaultForm); setIsEditing(false); setSelectedPriest(null); };

  // ── PDF export ─────────────────────────────────────────────────────────────

  const handleExportRows = (rows) => {
    if (!rows.length) return;
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Name", "Hname", "Phone", "Email", "Working", "Home Type", "Status"]],
      body: rows.map((r) => [
        r.original.name, r.original.hname, r.original.phone || "", r.original.email || "",
        r.original.workingRegion === "Abroad" ? `Abroad - ${r.original.workingCountry || ""}` : "India",
        r.original.homeType || "", r.original.status || "",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126], textColor: 255 },
      startY: 20,
    });
    doc.text("Priest Management Report", 14, 15);
    doc.save("priests.pdf");
  };

  // ── Address fields renderer ────────────────────────────────────────────────

  const AddressFields = ({ type, disabled = false }) => {
    const addr = formData[type];
    return (
      <>
        <Grid item xs={12} sm={6}>
          <StyledTextField label="House Name" value={addr.houseName} disabled={disabled}
            onChange={(e) => setAddressField(type, "houseName", e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField label="Street" value={addr.street} disabled={disabled}
            onChange={(e) => setAddressField(type, "street", e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StyledTextField label="City / Town" value={addr.city} disabled={disabled}
            onChange={(e) => setAddressField(type, "city", e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StyledTextField label="District" value={addr.district} disabled={disabled}
            onChange={(e) => setAddressField(type, "district", e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StyledTextField label="State" value={addr.state} disabled={disabled}
            onChange={(e) => setAddressField(type, "state", e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField label="Pincode" value={addr.pincode} disabled={disabled}
            onChange={(e) => setAddressField(type, "pincode", e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField label="Country" value={addr.country} disabled={disabled}
            onChange={(e) => setAddressField(type, "country", e.target.value)} fullWidth size="small" />
        </Grid>
      </>
    );
  };

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = useMemo(() => [
    {
      accessorKey: "name", header: "Priest", size: 220,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "#1a237e", width: 42, height: 42, fontSize: "1rem" }}>
            {row.original.name.charAt(0)}
          </Avatar>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a237e" }}>
            Fr. {row.original.name}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: "hname", header: "House Name", size: 200,
      Cell: ({ row }) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0F172A" }}>
          {row.original.hname}
        </Typography>
      ),
    },
    {
      accessorKey: "workingRegion", header: "Working", size: 140,
      Cell: ({ row }) => {
        const r = regionStyle(row.original.workingRegion);
        return (
          <Box>
            <Chip label={r.label || row.original.workingRegion || "India"} size="small"
              sx={{ backgroundColor: r.bg, color: r.color, fontWeight: 700, fontSize: "0.72rem" }} />
            {row.original.workingRegion === "Abroad" && row.original.workingCountry && (
              <Typography variant="caption" display="block" sx={{ color: "#64748B", mt: 0.3 }}>
                {row.original.workingCountry}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      accessorKey: "homeType", header: "Home", size: 190,
      Cell: ({ row }) => {
        const { homeType, homeParish, homeParishText, homeCongregation } = row.original;
        let label = "—", sub = "";
        if (homeType === "homeDiocese") { label = "Home Diocese"; sub = homeParish?.name || ""; }
        else if (homeType === "otherDiocese") { label = "Other Diocese"; sub = homeParishText || ""; }
        else if (homeType === "congregation") { label = "Congregation"; sub = homeCongregation?.name || ""; }
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ChurchIcon fontSize="small" sx={{ color: "#7c3aed", flexShrink: 0 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>{label}</Typography>
              {sub && <Typography variant="caption" sx={{ color: "#64748B" }}>{sub}</Typography>}
            </Box>
          </Box>
        );
      },
    },
    {
      accessorKey: "status", header: "Status", size: 150,
      Cell: ({ row }) => {
        const s = statusStyle(row.original.status);
        return (
          <Box>
            <Chip label={s.label || row.original.status} size="small"
              sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.72rem" }} />
            {row.original.statusDate && (
              <Typography variant="caption" display="block" sx={{ color: "#64748B", mt: 0.3 }}>
                {new Date(row.original.statusDate).toLocaleDateString()}
              </Typography>
            )}
            {row.original.restHome && (
              <Typography variant="caption" display="block" sx={{ color: "#64748B" }}>
                🏠 {row.original.restHome}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      accessorKey: "phone", header: "Contact", size: 160,
      Cell: ({ row }) => (
        <Box>
          <Typography variant="body2" sx={{ color: "#0F172A" }}>{row.original.phone || "—"}</Typography>
          <Typography variant="caption" sx={{ color: "#64748B" }}>{row.original.email || ""}</Typography>
        </Box>
      ),
    },
    {
      id: "actions", header: "Actions", size: 100,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openDialog(row.original)}
              sx={{ bgcolor: "#E8EAF6", "&:hover": { bgcolor: "#C5CAE9" } }}>
              <EditIcon fontSize="small" sx={{ color: "#1a237e" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(row.original._id)}
              sx={{ bgcolor: "#FEE2E2", "&:hover": { bgcolor: "#FECACA" } }}>
              <DeleteIcon fontSize="small" sx={{ color: "#DC2626" }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardContainer>
      <CssBaseline />

      {/* ── Header ── */}
      <StyledCard sx={{ mb: 3 }}>
        <StyledCardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconBox color="#4f46e5">
                <PersonIcon sx={{ fontSize: 26 }} />
              </IconBox>
              <Box>
                <Typography variant="h5" sx={{
                  fontWeight: 700,
                  background: "linear-gradient(45deg, #1a237e, #0d47a1)",
                  backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent",
                }}>
                  Priest Management
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Manage clergy records, assignments and status
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Button variant="outlined" component="label"
                  sx={{ borderRadius: 12, fontWeight: 600, borderColor: "#C5CAE9", color: "#1a237e", textTransform: "none" }}>
                  {bulkFile ? bulkFile.name : "Choose Excel"}
                  <input type="file" hidden accept=".xlsx,.xls" onChange={(e) => setBulkFile(e.target.files[0])} />
                </Button>
                {bulkFile && (
                  <GradientButton startIcon={isBulkUploading ? <CircularProgress size={16} color="inherit" /> : <UploadIcon />}
                    onClick={handleBulkUpload} disabled={isBulkUploading}>
                    {isBulkUploading ? "Uploading..." : "Upload"}
                  </GradientButton>
                )}
              </Box>
              <GradientButton startIcon={<Plus size={18} />} onClick={() => openDialog()}>
                Add New Priest
              </GradientButton>
            </Box>
          </Box>
        </StyledCardContent>
      </StyledCard>

      {/* ── Table ── */}
      <ChartCard>
        <MaterialReactTable
          columns={columns} data={priests}
          enableColumnFiltering enableGlobalFilter enableColumnOrdering enablePagination
          enableSorting enableRowSelection enableColumnResizing enableFullScreenToggle
          enableDensityToggle enableHiding positionToolbarAlertBanner="bottom"
          state={{ isLoading }}
          renderTopToolbarCustomActions={({ table }) => (
            <Box sx={{ display: "flex", gap: 2, p: 2 }}>
              <IconButton onClick={fetchPriests} sx={{ bgcolor: "#E8EAF6", "&:hover": { bgcolor: "#C5CAE9" } }}>
                <RefreshIcon sx={{ color: "#1a237e" }} />
              </IconButton>
              <Button variant="outlined" onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                startIcon={<FileDownloadIcon />} disabled={!table.getSelectedRowModel().rows.length}
                sx={{ borderRadius: 12, textTransform: "none", fontWeight: 600, borderColor: "#C5CAE9", color: "#1a237e" }}>
                Export Selected
              </Button>
            </Box>
          )}
          muiTablePaperProps={{ elevation: 0, sx: { borderRadius: "16px", border: "none" } }}
          muiTableProps={{ sx: { "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9" } } }}
          initialState={{ density: "comfortable", pagination: { pageSize: 10 } }}
        />
      </ChartCard>

      {/* ── Create / Edit Dialog ── */}
      <Dialog
        open={isModalVisible}
        onClose={() => { setIsModalVisible(false); resetForm(); }}
        maxWidth="md" fullWidth TransitionComponent={Fade}
        PaperProps={{ elevation: 0, sx: { borderRadius: 4, bgcolor: "#ffffff", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" } }}
      >
        <DialogTitle sx={{ p: 3, borderBottom: "1px solid #E2E8F0", background: "linear-gradient(135deg, #f8fafc, #E8EAF6)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconBox color="#4f46e5" sx={{ width: 40, height: 40 }}>
              <PersonIcon sx={{ fontSize: 20 }} />
            </IconBox>
            <Box>
              <Typography variant="h6" sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #1a237e, #0d47a1)",
                backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent",
              }}>
                {isEditing ? "Edit Priest Details" : "Add New Priest"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                {isEditing ? "Update the priest's information below" : "Fill in the details to register a new priest"}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ p: 3, maxHeight: "70vh", overflowY: "auto" }}>
            <Grid container spacing={2.5}>

              {/* Personal Info */}
              <Grid item xs={12}>
                <SectionLabel><PersonIcon sx={{ fontSize: 14, color: "#0d47a1" }} /> Personal Information</SectionLabel>
                <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField label="Priest Name" value={formData.name}
                  onChange={(e) => setField("name", e.target.value)} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField label="House Name" value={formData.hname}
                  onChange={(e) => setField("hname", e.target.value)} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField label="Phone" value={formData.phone}
                  onChange={(e) => setField("phone", e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField label="Email" type="email" value={formData.email}
                  onChange={(e) => setField("email", e.target.value)} fullWidth />
              </Grid>

              {/* Working Region */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <SectionLabel><PublicIcon sx={{ fontSize: 14, color: "#0d47a1" }} /> Working Region</SectionLabel>
                <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField select label="Currently Working" value={formData.workingRegion}
                  onChange={(e) => setField("workingRegion", e.target.value)} fullWidth required>
                  {WORKING_REGIONS.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: r.color }} />
                        {r.label}
                      </Box>
                    </MenuItem>
                  ))}
                </StyledTextField>
              </Grid>
              {formData.workingRegion === "Abroad" && (
                <Grid item xs={12} sm={6}>
                  <StyledTextField label="Working Country" value={formData.workingCountry}
                    onChange={(e) => setField("workingCountry", e.target.value)}
                    placeholder="e.g. Germany, USA" fullWidth required />
                </Grid>
              )}

              {/* Home Parish */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <SectionLabel><ChurchIcon sx={{ fontSize: 14, color: "#0d47a1" }} /> Home Parish</SectionLabel>
                <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField select label="Home Type" value={formData.homeType}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, homeType: e.target.value, homeParish: "", homeParishText: "", homeCongregation: "" }));
                  }} fullWidth required>
                  {HOME_TYPES.map((ht) => <MenuItem key={ht.value} value={ht.value}>{ht.label}</MenuItem>)}
                </StyledTextField>
              </Grid>
              {formData.homeType === "homeDiocese" && (
                <Grid item xs={12} sm={6}>
                  <StyledTextField select label="Home Parish" value={formData.homeParish}
                    onChange={(e) => setField("homeParish", e.target.value)} fullWidth required>
                    {parishes.length === 0
                      ? <MenuItem disabled>No parishes found</MenuItem>
                      : parishes.map((p) => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                  </StyledTextField>
                </Grid>
              )}
              {formData.homeType === "otherDiocese" && (
                <Grid item xs={12} sm={6}>
                  <StyledTextField label="Home Parish Name" value={formData.homeParishText}
                    onChange={(e) => setField("homeParishText", e.target.value)} placeholder="Enter home parish name" fullWidth required />
                </Grid>
              )}
              {formData.homeType === "congregation" && (
                <Grid item xs={12} sm={6}>
                  <StyledTextField select label="Congregation" value={formData.homeCongregation}
                    onChange={(e) => setField("homeCongregation", e.target.value)} fullWidth required>
                    {congregations.length === 0
                      ? <MenuItem disabled>No congregations found</MenuItem>
                      : congregations.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                  </StyledTextField>
                </Grid>
              )}

              {/* Home Address */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <SectionLabel><HomeIcon sx={{ fontSize: 14, color: "#0d47a1" }} /> Home Address</SectionLabel>
                <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
              </Grid>
              <AddressFields type="homeAddress" />

              {/* Current Address */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <SectionLabel sx={{ mb: 0 }}><HomeIcon sx={{ fontSize: 14, color: "#0d47a1" }} /> Current Address</SectionLabel>
                  <FormControlLabel
                    control={<Checkbox checked={formData.sameAsHome} onChange={toggleSameAsHome} size="small"
                      sx={{ color: "#1a237e", "&.Mui-checked": { color: "#1a237e" } }} />}
                    label={<Typography variant="caption" sx={{ color: "#64748B" }}>Same as Home</Typography>}
                  />
                </Box>
                <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
              </Grid>
              <AddressFields type="currentAddress" disabled={formData.sameAsHome} />

              {/* Status */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <SectionLabel><CalendarIcon sx={{ fontSize: 14, color: "#0d47a1" }} /> Status</SectionLabel>
                <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
              </Grid>
              <Grid item xs={12} sm={["inactive", "retired", "died"].includes(formData.status) ? 4 : 6}>
                <StyledTextField select label="Status" value={formData.status}
                  onChange={(e) => { setFormData((prev) => ({ ...prev, status: e.target.value, statusDate: "", restHome: "" })); }}
                  fullWidth required>
                  {STATUSES.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: s.color }} />
                        {s.label}
                      </Box>
                    </MenuItem>
                  ))}
                </StyledTextField>
              </Grid>
              {["inactive", "retired", "died"].includes(formData.status) && (
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    label={
                      formData.status === "retired" ? "Retirement Date"
                        : formData.status === "died" ? "Date of Death"
                        : "Inactive From"
                    }
                    type="date" value={formData.statusDate}
                    onChange={(e) => setField("statusDate", e.target.value)}
                    InputLabelProps={{ shrink: true }} fullWidth required />
                </Grid>
              )}
              {formData.status === "retired" && (
                <Grid item xs={12} sm={4}>
                  <StyledTextField label="Rest Home" value={formData.restHome}
                    onChange={(e) => setField("restHome", e.target.value)} placeholder="Name of rest home" fullWidth />
                </Grid>
              )}

            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: "1px solid #E2E8F0", gap: 2 }}>
            <Button variant="outlined" onClick={() => { setIsModalVisible(false); resetForm(); }}
              sx={{ borderRadius: 12, textTransform: "none", fontWeight: 600, borderColor: "#C5CAE9", color: "#1a237e" }}>
              Cancel
            </Button>
            <GradientButton type="submit" disabled={isLoading}>
              {isLoading
                ? <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CircularProgress size={18} color="inherit" /><span>Saving...</span></Box>
                : isEditing ? "Update Priest" : "Save Priest"}
            </GradientButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={Boolean(message)} autoHideDuration={6000} onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setMessage(null)} severity={message?.type || "info"} variant="filled"
          sx={{ borderRadius: 2, bgcolor: message?.type === "error" ? "#DC2626" : "#1a237e" }}>
          {message?.text}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};

export default Priest;