import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import axiosInstance from "../axiosConfig";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Box, Typography, IconButton, Tooltip, Card, CardContent, Fade, MenuItem,
  CircularProgress, Snackbar, Alert, CssBaseline, ThemeProvider, createTheme,
  Chip, Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Refresh as RefreshIcon, Edit as EditIcon, Delete as DeleteIcon,
} from "@mui/icons-material";
import { Plus, Building2, DollarSign, ArrowRightLeft, TrendingUp, Wallet, Hash } from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar", symbol: "$" },
  { value: "CAD", label: "CAD — Canadian Dollar", symbol: "C$" },
  { value: "AUD", label: "AUD — Australian Dollar", symbol: "A$" },
  { value: "GBP", label: "GBP — British Pound", symbol: "£" },
  { value: "EUR", label: "EUR — Euro", symbol: "€" },
];

const MODES = [
  { value: "Wire Transfer", label: "Wire Transfer", color: "#4f46e5", bg: "#EEF2FF" },
  { value: "NEFT/RTGS", label: "NEFT/RTGS", color: "#059669", bg: "#D1FAE5" },
  { value: "Cash", label: "Cash", color: "#ea580c", bg: "#FFF7ED" },
];

const currencySymbol = (c) => CURRENCIES.find((x) => x.value === c)?.symbol || c;
const modeStyle = (m) => MODES.find((x) => x.value === m) || { color: "#6B7280", bg: "#F3F4F6" };

// ─── Theme (matching Home page) ───────────────────────────────────────────────

const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#1a237e", secondary: "#64748B" },
  },
});

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

const StatWrapper = styled(Box)(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
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

const StatValue = styled(Typography)(() => ({
  fontSize: "2rem",
  fontWeight: 700,
  marginTop: 8,
  background: "linear-gradient(45deg, #1a237e, #0d47a1)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
}));

const ChartCard = styled(Card)(({ theme }) => ({
  height: "100%",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: theme.spacing(3),
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
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

// ─── Default Form ─────────────────────────────────────────────────────────────

const defaultForm = {
  priest: "", organization: "", organizationName: "", purpose: "", currency: "",
  amount: "", inrAmount: "", modeOfTransfer: "", date: new Date().toISOString().split("T")[0], remarks: "",
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DonationPage = () => {
  const [donations, setDonations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [priests, setPriests] = useState([]);
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
const [totalRows, setTotalRows] = useState(0);
  const setField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

//   useEffect(() => { fetchTableData(); }, []);

//   const fetchAll = async () => {
//     setIsLoading(true);
//     try {
//       const [donRes, orgRes, sumRes, priestRes] = await Promise.all([
//         axiosInstance.get("/donations/"),
//         axiosInstance.get("/organization/"),
//         axiosInstance.get("/donations/summary"),
//         axiosInstance.get("/priest/"),
//       ]);
//       setDonations(donRes.data.data || []);
//       setOrganizations(orgRes.data || []);
//       setSummary(sumRes.data.data || null);
//       setPriests(priestRes.data || []);
//     } catch { setMessage({ type: "error", text: "Failed to fetch data" }); }
//     finally { setIsLoading(false); }
//   };
const fetchTableData = async () => {
  setIsLoading(true);
  try {
    const [donRes, sumRes] = await Promise.all([
      axiosInstance.get("/donations/", {
        params: { page: pagination.pageIndex + 1, limit: pagination.pageSize }
      }),
      axiosInstance.get("/donations/summary"),
    ]);
    setDonations(donRes.data.data || []);
    setTotalRows(donRes.data.total || 0);
    setSummary(sumRes.data.data || null);
  } catch { setMessage({ type: "error", text: "Failed to fetch data" }); }
  finally { setIsLoading(false); }
};

useEffect(() => { fetchTableData(); }, [pagination.pageIndex, pagination.pageSize]);

const fetchDropdowns = async () => {
  if (priests.length && organizations.length) return; // already loaded
  try {
    const [orgRes, priestRes] = await Promise.all([
      axiosInstance.get("/organization/"),
      axiosInstance.get("/priest/list"),  // lightweight endpoint
    ]);
    setOrganizations(orgRes.data?.data || orgRes.data || []);
    setPriests(priestRes.data || []);
  } catch { console.error("Failed to load dropdowns"); }
};

// useEffect(() => { fetchTableData(); }, []);

// Call fetchDropdowns when dialog opens:
const openDialog = (record = null) => {
  fetchDropdowns();
  if (record) { handleEdit(record); } 
  else { resetForm(); setIsModalVisible(true); }
};
  const handleEdit = (record) => {
    setIsEditing(true);
    setSelectedDonation(record);
    setFormData({
      priest: record.priest?._id || "",
      organization: record.organization?._id || "",
      organizationName: "",
      purpose: record.purpose || "",
      currency: record.currency || "",
      amount: record.amount || "",
      inrAmount: record.inrAmount || "",
      modeOfTransfer: record.modeOfTransfer || "",
      date: record.date ? record.date.substring(0, 10) : "",
      remarks: record.remarks || "",
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this donation?")) return;
    try {
      await axiosInstance.delete(`/donations/${id}`);
      fetchTableData();
      setMessage({ type: "success", text: "Donation deleted" });
    } catch { setMessage({ type: "error", text: "Failed to delete" }); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        const payload = { ...formData };
        if (payload.organization === "other") {
          const orgRes = await axiosInstance.post("/organization/", { name: formData.organizationName });
          payload.organization = orgRes.data._id;
        }
        delete payload.organizationName;
        await axiosInstance.put(`/donations/${selectedDonation._id}`, payload);
        setMessage({ type: "success", text: "Donation updated" });
      } else {
        await axiosInstance.post("/donations/", formData);
        setMessage({ type: "success", text: "Donation recorded" });
      }
      fetchTableData();
      setIsModalVisible(false);
      resetForm();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save" });
    } finally { setIsLoading(false); }
  };

  const resetForm = () => { setFormData(defaultForm); setIsEditing(false); setSelectedDonation(null); };

  const formatINR = (n) => {
    if (!n && n !== 0) return "—";
    return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatAmount = (amount, currency) => {
    if (!amount && amount !== 0) return "—";
    return `${currencySymbol(currency)} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo(() => [
    {
      accessorKey: "date", header: "Date", size: 110,
      Cell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a237e" }}>
          {row.original.date ? new Date(row.original.date).toLocaleDateString("en-IN") : "—"}
        </Typography>
      ),
    },
    {
      accessorKey: "priest.name", header: "Priest", size: 200,
      Cell: ({ row }) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a237e" }}>
            Fr. {row.original.priest?.name || "—"}
          </Typography>
          {row.original.priest?.hname && (
            <Typography variant="caption" sx={{ color: "#64748B" }}>
              {row.original.priest.hname}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      accessorKey: "organization.name", header: "Reciver Details", size: 200,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Building2 size={16} color="#4f46e5" />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a237e" }}>{row.original.organization?.name || "—"}</Typography>
        </Box>
      ),
    },
    {
      accessorKey: "purpose", header: "Purpose", size: 180,
      Cell: ({ row }) => (
        <Typography variant="body2" sx={{ color: "#64748B" }}>{row.original.purpose || "—"}</Typography>
      ),
    },
    {
      accessorKey: "amount", header: "Foreign Amount", size: 160,
      Cell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#4f46e5" }}>
          {formatAmount(row.original.amount, row.original.currency)}
        </Typography>
      ),
    },
    {
      accessorKey: "inrAmount", header: "INR Amount", size: 150,
      Cell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#059669" }}>
          {formatINR(row.original.inrAmount)}
        </Typography>
      ),
    },
    {
      accessorKey: "modeOfTransfer", header: "Mode", size: 140,
      Cell: ({ row }) => {
        const m = modeStyle(row.original.modeOfTransfer);
        return <Chip label={m.label || row.original.modeOfTransfer} size="small" sx={{ bgcolor: m.bg, color: m.color, fontWeight: 700, fontSize: "0.72rem" }} />;
      },
    },
    {
      id: "actions", header: "Actions", size: 100,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton onClick={() => openDialog(row.original)}
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

  // ── Summary stat cards config ──────────────────────────────────────────────

  const statCards = summary ? [
    { title: "Total Donations", value: summary.totalDonations || 0, icon: <Hash size={24} />, color: "#4f46e5" },
    { title: "Total INR", value: formatINR(summary.grandTotalINR), icon: <Wallet size={24} />, color: "#ea580c" },
    ...((summary.byCurrency || []).slice(0, 2).map((c) => ({
      title: c._id,
      value: `${currencySymbol(c._id)} ${Number(c.totalAmount).toLocaleString()}`,
      icon: <DollarSign size={24} />,
      color: c._id === "USD" ? "#7c3aed" : "#059669",
    }))),
  ] : [];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardContainer>

        {/* Header */}
        <StyledCard sx={{ mb: 3 }}>
          <StyledCardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconBox color="#4f46e5">
                  <DollarSign size={24} />
                </IconBox>
                <Box>
                  <Typography variant="h5" sx={{
                    fontWeight: 700,
                    background: "linear-gradient(45deg, #1a237e, #0d47a1)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}>
                    Donation Management
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Record and track foreign donations
                  </Typography>
                </Box>
              </Box>
              <GradientButton onClick={() => openDialog()}>
                Record Donation
              </GradientButton>
            </Box>
          </StyledCardContent>
        </StyledCard>

        {/* Summary Cards */}
        {statCards.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {statCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StyledCard>
                  <StyledCardContent>
                    <StatWrapper>
                      <Box>
                        <Typography variant="subtitle1" sx={{
                          color: "text.secondary", fontSize: "0.875rem", fontWeight: 600,
                          textTransform: "uppercase", letterSpacing: "0.1em",
                        }}>
                          {stat.title}
                        </Typography>
                        <StatValue>{stat.value}</StatValue>
                      </Box>
                      <IconBox color={stat.color}>{stat.icon}</IconBox>
                    </StatWrapper>
                  </StyledCardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Table */}
        <ChartCard>
         <MaterialReactTable
  columns={columns}
  data={donations}
  manualPagination
  rowCount={totalRows}
  onPaginationChange={setPagination}
  state={{ isLoading, pagination }}
  enableColumnFiltering
  enableGlobalFilter
  enableSorting
  renderTopToolbarCustomActions={() => (
    <Box sx={{ display: "flex", gap: 2, p: 2 }}>
      <IconButton onClick={fetchTableData} sx={{ bgcolor: "#E8EAF6", "&:hover": { bgcolor: "#C5CAE9" } }}>
        <RefreshIcon sx={{ color: "#1a237e" }} />
      </IconButton>
    </Box>
  )}
  muiTablePaperProps={{ elevation: 0, sx: { borderRadius: "16px", border: "none" } }}
  muiTableProps={{ sx: { "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9" } } }}
  initialState={{ density: "comfortable", sorting: [{ id: "date", desc: true }] }}
/>
        </ChartCard>

        {/* Create / Edit Dialog */}
        <Dialog open={isModalVisible} onClose={() => { setIsModalVisible(false); resetForm(); }}
          maxWidth="md" fullWidth TransitionComponent={Fade}
          PaperProps={{ elevation: 0, sx: { borderRadius: 4, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" } }}>

          <DialogTitle sx={{ p: 3, borderBottom: "1px solid #E2E8F0", background: "linear-gradient(135deg, #f8fafc, #E8EAF6)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconBox color="#4f46e5" sx={{ width: 40, height: 40 }}>
                <DollarSign size={20} />
              </IconBox>
              <Box>
                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  background: "linear-gradient(45deg, #1a237e, #0d47a1)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}>
                  {isEditing ? "Edit Donation" : "Record New Donation"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  {isEditing ? "Update donation details" : "Enter the donation details below"}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ p: 3, maxHeight: "65vh", overflowY: "auto" }}>
              <Grid container spacing={2.5}>

                {/* Priest */}
                <Grid item xs={12}>
                  <SectionLabel><span style={{ fontSize: 14 }}>⛪</span> Priest</SectionLabel>
                  <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField select label="Select Priest" value={formData.priest}
                    onChange={(e) => setField("priest", e.target.value)} fullWidth required>
                    <MenuItem value=""><em>Select Priest</em></MenuItem>
                   {priests
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((p) => (
                        <MenuItem key={p._id} value={p._id}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                            <Typography sx={{ color: "#1a237e" }}>Fr. {p.name}</Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", ml: 2 }}>{p.hname}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                  </StyledTextField>
                </Grid>

                {/* Organization */}
                <Grid item xs={12}>
                  <SectionLabel><Building2 size={14} color="#0d47a1" /> Reciver Details</SectionLabel>
                  <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
                </Grid>
                <Grid item xs={12} sm={formData.organization === "other" ? 6 : 12}>
                  <StyledTextField select label="Reciver Details" value={formData.organization}
                    onChange={(e) => {
                      setField("organization", e.target.value);
                      if (e.target.value !== "other") setField("organizationName", "");
                    }} fullWidth required>
                    <MenuItem value=""><em>Select Reciver Details</em></MenuItem>
                    {organizations.map((o) => <MenuItem key={o._id} value={o._id}>{o.name}</MenuItem>)}
                    <Divider />
                    <MenuItem value="other" sx={{ color: "#1a237e", fontWeight: 600 }}>
                      + Add New Reciver Details
                    </MenuItem>
                  </StyledTextField>
                </Grid>
                {formData.organization === "other" && (
                  <Grid item xs={12} sm={6}>
                    <StyledTextField label="New Reciver Details" value={formData.organizationName}
                      onChange={(e) => setField("organizationName", e.target.value)}
                      placeholder="Enter Reciver Details" fullWidth required
                      helperText="Will be saved automatically for future use" />
                  </Grid>
                )}

                {/* Donation Details */}
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <SectionLabel><DollarSign size={14} color="#0d47a1" /> Donation Details</SectionLabel>
                  <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField label="Purpose" value={formData.purpose}
                    onChange={(e) => setField("purpose", e.target.value)}
                    fullWidth required multiline rows={2} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField select label="Currency" value={formData.currency}
                    onChange={(e) => setField("currency", e.target.value)} fullWidth required>
                    <MenuItem value=""><em>Select Currency</em></MenuItem>
                    {CURRENCIES.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, color: "#1a237e", minWidth: 20 }}>{c.symbol}</Typography>
                          {c.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </StyledTextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField label={`Amount${formData.currency ? ` (${formData.currency})` : ""}`}
                    type="number" value={formData.amount}
                    onChange={(e) => setField("amount", e.target.value)}
                    inputProps={{ min: 0, step: "0.01" }} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField label="INR Amount (₹)" type="number" value={formData.inrAmount}
                    onChange={(e) => setField("inrAmount", e.target.value)}
                    inputProps={{ min: 0, step: "0.01" }} fullWidth required
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#F0FDF4" } }} />
                </Grid>

                {/* Transfer */}
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <SectionLabel><ArrowRightLeft size={14} color="#0d47a1" /> Transfer Details</SectionLabel>
                  <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField select label="Mode of Transfer" value={formData.modeOfTransfer}
                    onChange={(e) => setField("modeOfTransfer", e.target.value)} fullWidth required>
                    <MenuItem value=""><em>Select Mode</em></MenuItem>
                    {MODES.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: m.color }} />
                          {m.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </StyledTextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField label="Date" type="date" value={formData.date}
                    onChange={(e) => setField("date", e.target.value)}
                    InputLabelProps={{ shrink: true }} fullWidth required />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField label="Remarks (Optional)" value={formData.remarks}
                    onChange={(e) => setField("remarks", e.target.value)}
                    fullWidth multiline rows={2} />
                </Grid>

              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: "1px solid #E2E8F0", gap: 2 }}>
              <Button variant="outlined" onClick={() => { setIsModalVisible(false); resetForm(); }}
                sx={{ borderRadius: 12, fontWeight: 600, borderColor: "#C5CAE9", color: "#1a237e", textTransform: "none" }}>
                Cancel
              </Button>
              <GradientButton type="submit" disabled={isLoading}>
                {isLoading
                  ? <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CircularProgress size={18} color="inherit" /><span>Saving...</span></Box>
                  : isEditing ? "Update Donation" : "Save Donation"}
              </GradientButton>
            </DialogActions>
          </form>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert onClose={() => setMessage(null)} severity={message?.type || "info"} variant="filled"
            sx={{ borderRadius: 2, bgcolor: message?.type === "error" ? "#DC2626" : "#1a237e" }}>
            {message?.text}
          </Alert>
        </Snackbar>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default DonationPage;