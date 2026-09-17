import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  CircularProgress, Alert, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, InputAdornment,
  MenuItem, Snackbar, Pagination, Avatar, Switch, FormControlLabel
} from '@mui/material';
import {
  People, Search, Add, Edit, Delete, Lock, Visibility,
  VisibilityOff, CheckCircle, Cancel
} from '@mui/icons-material';
import axiosInstance from '../axiosConfig';

const AdminManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'admin',
    isActive: true
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, [pagination.page, searchTerm, roleFilter]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin-management/list', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          role: roleFilter
        }
      });

      setAdmins(response.data.admins || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching admins:', err);
      showSnackbar('Failed to load admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      if (!formData.name || !formData.email || !formData.password) {
        showSnackbar('Please fill all required fields', 'error');
        return;
      }

      if (formData.password.length < 6) {
        showSnackbar('Password must be at least 6 characters', 'error');
        return;
      }

      await axiosInstance.post('/admin-management/create', formData);
      showSnackbar('Admin created successfully');
      setCreateDialogOpen(false);
      resetForm();
      fetchAdmins();
    } catch (err) {
      console.error('Error creating admin:', err);
      showSnackbar(err.response?.data?.message || 'Failed to create admin', 'error');
    }
  };

  const handleUpdateAdmin = async () => {
    try {
      if (!formData.name || !formData.email) {
        showSnackbar('Please fill all required fields', 'error');
        return;
      }

      // Create update payload - exclude password from regular update
      const updatePayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive
      };

      // Only include password if it was changed (non-empty)
      if (formData.password && formData.password.trim() !== '') {
        if (formData.password.length < 6) {
          showSnackbar('Password must be at least 6 characters', 'error');
          return;
        }
        updatePayload.password = formData.password;
      }

      await axiosInstance.put(`/admin-management/${selectedAdmin._id}`, updatePayload);
      showSnackbar('Admin updated successfully');
      setEditDialogOpen(false);
      setSelectedAdmin(null);
      resetForm();
      fetchAdmins();
    } catch (err) {
      console.error('Error updating admin:', err);
      showSnackbar(err.response?.data?.message || 'Failed to update admin', 'error');
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      await axiosInstance.delete(`/admin-management/${selectedAdmin._id}`);
      showSnackbar('Admin deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err) {
      console.error('Error deleting admin:', err);
      showSnackbar(err.response?.data?.message || 'Failed to delete admin', 'error');
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      await axiosInstance.patch(`/admin-management/${admin._id}/toggle-status`);
      showSnackbar(`Admin ${admin.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchAdmins();
    } catch (err) {
      console.error('Error toggling status:', err);
      showSnackbar('Failed to toggle status', 'error');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!newPassword || newPassword.length < 6) {
        showSnackbar('Password must be at least 6 characters', 'error');
        return;
      }

      await axiosInstance.patch(`/admin-management/${selectedAdmin._id}/change-password`, {
        newPassword
      });
      showSnackbar('Password changed successfully');
      setPasswordDialogOpen(false);
      setSelectedAdmin(null);
      setNewPassword('');
      setShowNewPassword(false);
    } catch (err) {
      console.error('Error changing password:', err);
      showSnackbar(err.response?.data?.message || 'Failed to change password', 'error');
    }
  };

  const openEditDialog = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.phone || '',
      password: '', // Keep empty - don't show current password
      role: admin.role || 'admin',
      isActive: admin.isActive !== false
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (admin) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };

  const openPasswordDialog = (admin) => {
    setSelectedAdmin(admin);
    setNewPassword('');
    setShowNewPassword(false);
    setPasswordDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'admin',
      isActive: true
    });
    setShowPassword(false);
  };

  const StatCard = ({ title, value, icon, color = 'primary.main' }) => (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" color={color}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: color,
              color: 'white',
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage admin and super admin accounts
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Admins"
              value={stats.total}
              icon={<People fontSize="large" />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active"
              value={stats.active}
              icon={<CheckCircle fontSize="large" />}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Super Admins"
              value={stats.superAdmins}
              icon={<People fontSize="large" />}
              color="error.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Regular Admins"
              value={stats.admins}
              icon={<People fontSize="large" />}
              color="info.main"
            />
          </Grid>
        </Grid>
      )}

      {/* Filters and Actions */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by name, email, or phone..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ flexGrow: 1, minWidth: 250 }}
            />

            <TextField
              select
              size="small"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superadmin">Super Admin</MenuItem>
            </TextField>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                resetForm();
                setCreateDialogOpen(true);
              }}
            >
              Create Admin
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Admin</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">No admins found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {admin.name?.charAt(0).toUpperCase() || '?'}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {admin.name || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{admin.email || 'N/A'}</TableCell>
                      <TableCell>{admin.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                          size="small"
                          color={admin.role === 'superadmin' ? 'error' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={admin.isActive !== false}
                              onChange={() => handleToggleStatus(admin)}
                              size="small"
                            />
                          }
                          label={admin.isActive !== false ? 'Active' : 'Inactive'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openEditDialog(admin)}
                          title="Edit"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => openPasswordDialog(admin)}
                          title="Change Password"
                        >
                          <Lock fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteDialog(admin)}
                          title="Delete"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Admin</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name *"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email *"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              label="Password *"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              helperText="Minimum 6 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Role"
              select
              fullWidth
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superadmin">Super Admin</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAdmin}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Admin</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name *"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email *"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              label="Role"
              select
              fullWidth
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superadmin">Super Admin</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
            <Alert severity="info">
              To change the password, click the lock icon in the actions column or use the "Change Password" button below.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateAdmin}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Changing password for: <strong>{selectedAdmin?.name}</strong>
            </Typography>
            <TextField
              label="New Password *"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Minimum 6 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPasswordDialogOpen(false);
            setNewPassword('');
            setShowNewPassword(false);
          }}>
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={handleChangePassword}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete this admin?
          </Alert>
          <Typography variant="body2">
            <strong>Name:</strong> {selectedAdmin?.name}<br />
            <strong>Email:</strong> {selectedAdmin?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action will deactivate the admin account. The account can be reactivated later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteAdmin}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminManagement;