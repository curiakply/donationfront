import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Alert,
  CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Snackbar, LinearProgress, Tooltip
} from '@mui/material';
import {
  CloudUpload, Refresh, Delete, Schedule, CheckCircle,
  Error as ErrorIcon, CloudDownload, Folder, Info
} from '@mui/icons-material';
import axiosInstance from '../axiosConfig';

const DatabaseBackup = () => {
  const [loading, setLoading] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [status, setStatus] = useState(null);
  const [backups, setBackups] = useState([]);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Schedule dialog
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    frequency: 'daily',
    time: '02:00'
  });

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState(null);

  useEffect(() => {
    fetchStatus();
    fetchBackups();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchStatus = async () => {
    try {
      const response = await axiosInstance.get('/backup/status');
      setStatus(response.data.status);
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Failed to load backup status');
    }
  };

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/backup/list');
      setBackups(response.data.backups || []);
    } catch (err) {
      console.error('Error fetching backups:', err);
      showSnackbar('Failed to load backups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setBackupInProgress(true);
      showSnackbar('Creating backup... This may take a few minutes', 'info');

      const response = await axiosInstance.post('/backup/create');
      
      showSnackbar('Backup created and uploaded successfully!', 'success');
      fetchBackups();
      fetchStatus();
    } catch (err) {
      console.error('Error creating backup:', err);
      showSnackbar(err.response?.data?.message || 'Failed to create backup', 'error');
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleDeleteBackup = async () => {
    try {
      await axiosInstance.delete(`/backup/${backupToDelete.id}`);
      showSnackbar('Backup deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setBackupToDelete(null);
      fetchBackups();
    } catch (err) {
      console.error('Error deleting backup:', err);
      showSnackbar('Failed to delete backup', 'error');
    }
  };

  const handleScheduleBackup = async () => {
    try {
      await axiosInstance.post('/backup/schedule', scheduleForm);
      showSnackbar('Backup schedule configured successfully', 'success');
      setScheduleDialogOpen(false);
    } catch (err) {
      console.error('Error scheduling backup:', err);
      showSnackbar('Failed to configure schedule', 'error');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ title, value, icon, color = 'primary.main', subtitle }) => (
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
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
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
          Database Backup & Restore
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Backup your database to Google Drive automatically
        </Typography>
      </Box>

      {/* System Status */}
      {status && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Google Drive Status"
              value={status.googleDriveConfigured ? 'Connected' : 'Not Connected'}
              icon={status.googleDriveConfigured ? <CheckCircle fontSize="large" /> : <ErrorIcon fontSize="large" />}
              color={status.googleDriveConfigured ? 'success.main' : 'error.main'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Total Backups"
              value={backups.length}
              icon={<CloudUpload fontSize="large" />}
              color="info.main"
              subtitle="In Google Drive"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Database"
              value={status.databaseName}
              icon={<Folder fontSize="large" />}
              color="warning.main"
            />
          </Grid>
        </Grid>
      )}

      {/* Configuration Warning */}
      {status && !status.googleDriveConfigured && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            Google Drive is not configured
          </Typography>
          <Typography variant="body2">
            Please configure Google Drive API credentials in your environment variables to enable automatic backups.
          </Typography>
        </Alert>
      )}

      {/* Action Buttons */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={backupInProgress ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
              onClick={handleCreateBackup}
              disabled={backupInProgress || !status?.googleDriveConfigured}
              size="large"
            >
              {backupInProgress ? 'Creating Backup...' : 'Create Backup Now'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => setScheduleDialogOpen(true)}
              disabled={!status?.googleDriveConfigured}
            >
              Schedule Automatic Backup
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchBackups}
              disabled={loading}
            >
              Refresh List
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Backup Progress */}
      {backupInProgress && (
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="body2" gutterBottom>
              Creating database backup...
            </Typography>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Please wait while we create and upload your backup to Google Drive
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Backups List */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Backup History
            </Typography>
            <Chip label={`${backups.length} Backups`} color="primary" variant="outlined" />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : backups.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CloudDownload sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Backups Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first backup to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={handleCreateBackup}
                disabled={!status?.googleDriveConfigured}
              >
                Create First Backup
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Backup Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {backup.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={formatBytes(backup.size)} size="small" color="info" />
                      </TableCell>
                      <TableCell>{formatDate(backup.created)}</TableCell>
                      <TableCell>
                        <Chip
                          label="Uploaded"
                          size="small"
                          color="success"
                          icon={<CheckCircle />}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View in Google Drive">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => window.open(backup.driveLink, '_blank')}
                          >
                            <CloudDownload fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Backup">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setBackupToDelete(backup);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Schedule Backup Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Schedule Automatic Backup</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Frequency"
              select
              fullWidth
              value={scheduleForm.frequency}
              onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly (Sunday)</MenuItem>
              <MenuItem value="monthly">Monthly (1st)</MenuItem>
            </TextField>

            <TextField
              label="Time"
              type="time"
              fullWidth
              value={scheduleForm.time}
              onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <Alert severity="info" icon={<Info />}>
              Backups will be created automatically at the scheduled time and uploaded to Google Drive.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleScheduleBackup}>
            Configure Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete this backup?
          </Alert>
          <Typography variant="body2">
            <strong>Backup:</strong> {backupToDelete?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteBackup}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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

export default DatabaseBackup;