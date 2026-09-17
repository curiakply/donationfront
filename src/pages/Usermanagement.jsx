import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import axiosInstance from "../axiosConfig";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Box, Typography, IconButton, Tooltip, Card, CardContent, Fade,
  CircularProgress, Snackbar, Alert, CssBaseline, ThemeProvider, createTheme,
  Chip, Divider, InputAdornment, Switch,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Refresh as RefreshIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility, VisibilityOff,
} from "@mui/icons-material";
import { Users, UserPlus, UserCheck, UserX, Mail, Phone, Lock, User } from "lucide-react";

// ─── Theme ────────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#1a237e", secondary: "#64748B" },
  },
});

// ─── Styled ───────────────────────────────────────────────────────────────────

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

const defaultForm = { name: "", email: "", phone: "", password: "" };

// ─── Component ────────────────────────────────────────────────────────────────

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [showPassword, setShowPassword] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
  const [totalRows, setTotalRows] = useState(0);

  const setField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchTableData = async () => {
    setIsLoading(true);
    try {
      const [userRes, sumRes] = await Promise.all([
        axiosInstance.get("/users/", {
          params: { page: pagination.pageIndex + 1, limit: pagination.pageSize },
        }),
        axiosInstance.get("/users/summary"),
      ]);
      setUsers(userRes.data.data || []);
      setTotalRows(userRes.data.total || 0);
      setSummary(sumRes.data.data || null);
    } catch {
      setMessage({ type: "error", text: "Failed to fetch users" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [pagination.pageIndex, pagination.pageSize]);

  // ── Dialog handlers ────────────────────────────────────────────────────────

  const openDialog = (record = null) => {
    if (record) {
      setIsEditing(true);
      setSelectedUser(record);
      setFormData({
        name: record.name || "",
        email: record.email || "",
        phone: record.phone || "",
        password: "",
      });
    } else {
      setIsEditing(false);
      setSelectedUser(null);
      setFormData(defaultForm);
    }
    setShowPassword(false);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      fetchTableData();
      setMessage({ type: "success", text: "User deactivated" });
    } catch {
      setMessage({ type: "error", text: "Failed to deactivate" });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await axiosInstance.patch(`/users/${id}/toggle-status`);
      fetchTableData();
      setMessage({ type: "success", text: res.data.message });
    } catch {
      setMessage({ type: "error", text: "Failed to update status" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...formData };

      // Don't send empty password on edit
      if (isEditing && !payload.password) delete payload.password;

      if (isEditing) {
        await axiosInstance.put(`/users/${selectedUser._id}`, payload);
        setMessage({ type: "success", text: "User updated" });
      } else {
        await axiosInstance.post("/users/", payload);
        setMessage({ type: "success", text: "User created" });
      }

      fetchTableData();
      setIsModalVisible(false);
      setFormData(defaultForm);
      setIsEditing(false);
      setSelectedUser(null);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 200,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36, height: 36, borderRadius: "10px",
                background: row.original.isActive
                  ? "linear-gradient(135deg, #1a237e20, #0d47a140)"
                  : "linear-gradient(135deg, #ef444420, #ef444440)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: row.original.isActive ? "#1a237e" : "#ef4444",
                fontWeight: 700, fontSize: "0.85rem",
              }}
            >
              {(row.original.name || "?").charAt(0).toUpperCase()}
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a237e" }}>
                {row.original.name}
              </Typography>
              {row.original.createdBy?.name && (
                <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem" }}>
                  Added by {row.original.createdBy.name}
                </Typography>
              )}
            </Box>
          </Box>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 220,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Mail size={14} color="#64748B" />
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              {row.original.email}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        size: 150,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Phone size={14} color="#64748B" />
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              {row.original.phone || "—"}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        size: 120,
        Cell: ({ row }) => (
          <Chip
            label={row.original.isActive ? "Active" : "Inactive"}
            size="small"
            sx={{
              bgcolor: row.original.isActive ? "#D1FAE5" : "#FEE2E2",
              color: row.original.isActive ? "#059669" : "#DC2626",
              fontWeight: 700,
              fontSize: "0.72rem",
            }}
          />
        ),
      },
      {
        accessorKey: "lastLogin",
        header: "Last Login",
        size: 150,
        Cell: ({ row }) => (
          <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.8rem" }}>
            {row.original.lastLogin
              ? new Date(row.original.lastLogin).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })
              : "Never"}
          </Typography>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        size: 120,
        Cell: ({ row }) => (
          <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.8rem" }}>
            {new Date(row.original.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 150,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title={row.original.isActive ? "Deactivate" : "Activate"}>
              <Switch
                size="small"
                checked={row.original.isActive}
                onChange={() => handleToggleStatus(row.original._id)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#059669" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#059669" },
                }}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                onClick={() => openDialog(row.original)}
                sx={{ bgcolor: "#E8EAF6", "&:hover": { bgcolor: "#C5CAE9" } }}
              >
                <EditIcon fontSize="small" sx={{ color: "#1a237e" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Deactivate">
              <IconButton
                size="small"
                onClick={() => handleDelete(row.original._id)}
                sx={{ bgcolor: "#FEE2E2", "&:hover": { bgcolor: "#FECACA" } }}
              >
                <DeleteIcon fontSize="small" sx={{ color: "#DC2626" }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
  );

  // ── Summary cards ──────────────────────────────────────────────────────────

  const statCards = summary
    ? [
        { title: "Total Users", value: summary.total || 0, icon: <Users size={24} />, color: "#4f46e5" },
        { title: "Active", value: summary.active || 0, icon: <UserCheck size={24} />, color: "#059669" },
        { title: "Inactive", value: summary.inactive || 0, icon: <UserX size={24} />, color: "#DC2626" },
      ]
    : [];

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
                  <Users size={24} />
                </IconBox>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background: "linear-gradient(45deg, #1a237e, #0d47a1)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    User Management
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Create and manage system users
                  </Typography>
                </Box>
              </Box>
              <GradientButton onClick={() => openDialog()} startIcon={<UserPlus size={18} />}>
                Create User
              </GradientButton>
            </Box>
          </StyledCardContent>
        </StyledCard>

        {/* Summary Cards */}
        {statCards.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {statCards.map((stat, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <StyledCard>
                  <StyledCardContent>
                    <StatWrapper>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: "text.secondary", fontSize: "0.875rem", fontWeight: 600,
                            textTransform: "uppercase", letterSpacing: "0.1em",
                          }}
                        >
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
            data={users}
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
            initialState={{ density: "comfortable", sorting: [{ id: "createdAt", desc: true }] }}
          />
        </ChartCard>

        {/* ─── Create / Edit Dialog ─────────────────────────────────────── */}
        <Dialog
          open={isModalVisible}
          onClose={() => { setIsModalVisible(false); setFormData(defaultForm); setIsEditing(false); }}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Fade}
          PaperProps={{ elevation: 0, sx: { borderRadius: 4, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" } }}
        >
          <DialogTitle
            sx={{
              p: 3, borderBottom: "1px solid #E2E8F0",
              background: "linear-gradient(135deg, #f8fafc, #E8EAF6)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconBox color="#4f46e5" sx={{ width: 40, height: 40 }}>
                {isEditing ? <EditIcon sx={{ fontSize: 20 }} /> : <UserPlus size={20} />}
              </IconBox>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background: "linear-gradient(45deg, #1a237e, #0d47a1)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {isEditing ? "Edit User" : "Create New User"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  {isEditing ? "Update user account details" : "Set up a new user account"}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={2.5}>
                {/* Personal Info */}
                <Grid item xs={12}>
                  <SectionLabel><User size={14} color="#0d47a1" /> Personal Information</SectionLabel>
                  <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setField("name", e.target.value)}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={18} color="#64748B" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setField("email", e.target.value)}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={18} color="#64748B" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={18} color="#64748B" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Credentials */}
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <SectionLabel><Lock size={14} color="#0d47a1" /> Credentials</SectionLabel>
                  <Divider sx={{ mb: 2, borderColor: "#E2E8F0" }} />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    label={isEditing ? "New Password (leave blank to keep current)" : "Password"}
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setField("password", e.target.value)}
                    fullWidth
                    required={!isEditing}
                    inputProps={{ minLength: isEditing && !formData.password ? 0 : 6 }}
                    helperText={isEditing ? "Leave empty to keep current password" : "Minimum 6 characters"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={18} color="#64748B" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: "1px solid #E2E8F0", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => { setIsModalVisible(false); setFormData(defaultForm); setIsEditing(false); }}
                sx={{ borderRadius: 12, fontWeight: 600, borderColor: "#C5CAE9", color: "#1a237e", textTransform: "none" }}
              >
                Cancel
              </Button>
              <GradientButton type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={18} color="inherit" />
                    <span>Saving...</span>
                  </Box>
                ) : isEditing ? "Update User" : "Create User"}
              </GradientButton>
            </DialogActions>
          </form>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={Boolean(message)}
          autoHideDuration={5000}
          onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setMessage(null)}
            severity={message?.type || "info"}
            variant="filled"
            sx={{ borderRadius: 2, bgcolor: message?.type === "error" ? "#DC2626" : "#1a237e" }}
          >
            {message?.text}
          </Alert>
        </Snackbar>
      </DashboardContainer>
    </ThemeProvider>
  );
};


export default UserManagement;