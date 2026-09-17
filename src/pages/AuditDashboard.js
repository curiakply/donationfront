import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Pagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Snackbar,
  Avatar
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from "../axiosConfig.jsx";

// API Functions using axiosInstance
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Updated API function to get all users' audit logs with better parameter validation
const getAllUsersAuditLogs = async (options = {}) => {
  const {
    page = 1,
    limit = 50,
    action = 'all',
    startDate = null,
    endDate = null,
    userId = null
  } = options;

  try {
    // Build path with parameters - ensure proper null handling and validation
    const startDateParam = startDate && startDate !== 'null' ? startDate : 'null';
    const endDateParam = endDate && endDate !== 'null' ? endDate : 'null';
    
    // Extra validation for userId to prevent object serialization
    let userIdParam = 'null';
    if (userId !== null && userId !== undefined && userId !== '') {
      if (typeof userId === 'object') {
        console.error('userId is still an object:', userId);
        userIdParam = userId._id || userId.toString();
      } else {
        userIdParam = String(userId);
      }
    }
    
    console.log('API call params:', { 
      page, 
      limit, 
      action, 
      startDateParam, 
      endDateParam, 
      userIdParam,
      userIdType: typeof userIdParam 
    });
    
    const url = `/transaction/audit/all/${page}/${limit}/${action}/${startDateParam}/${endDateParam}/${userIdParam}`;
    console.log('API URL:', url);
    
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching all users audit logs:', error);
    throw error;
  }
};

const getTransactionAuditLogs = async (transactionId, page = 1, limit = 20) => {
  try {
    const response = await axiosInstance.get(`/transaction/audit/transaction/${transactionId}/${page}/${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction audit logs:', error);
    throw error;
  }
};

const getAuditSummary = async (options = {}) => {
  const { startDate, endDate, userId } = options;

  try {
    const startDateParam = startDate || 'null';
    const endDateParam = endDate || 'null';
    const userIdParam = userId || 'null';
    
    const response = await axiosInstance.get(`/transaction/audit/summary/${startDateParam}/${endDateParam}/${userIdParam}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching audit summary:', error);
    throw error;
  }
};

// Function to get unique users from current audit logs (with better debugging)
const getUniqueUsersFromCurrentResults = (auditLogs) => {
  console.log('Processing audit logs for users:', auditLogs.length);
  
  const usersMap = new Map();
  auditLogs.forEach((log, index) => {
    // Debug first few logs
    if (index < 3) {
      console.log('Log sample:', {
        userId: log.userId,
        userName: log.userName,
        userEmail: log.userEmail,
        userIdType: typeof log.userId,
        userNameType: typeof log.userName
      });
    }
    
    if (log.userName) {
      // Use userName as key since userId might not be reliable
      const key = log.userName.trim().toLowerCase();
      if (!usersMap.has(key)) {
        // Ensure _id is always a string, never an object
        const userId = log.userId;
        const userIdString = typeof userId === 'string' ? userId : 
                           typeof userId === 'object' && userId !== null ? JSON.stringify(userId) :
                           log.userName.replace(/\s+/g, '_').toLowerCase(); // fallback to processed username
        
        usersMap.set(key, {
          _id: userIdString,
          name: log.userName.trim(),
          email: log.userEmail || 'N/A'
        });
      }
    }
  });
  
  const uniqueUsers = Array.from(usersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  console.log('Unique users found:', uniqueUsers);
  
  return uniqueUsers;
};

const AuditDashboard = () => {
  const [currentUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Users state for filter dropdown
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Filters state with user filter and configurable limit
  const [filters, setFilters] = useState({
    action: 'all',
    startDate: null,
    endDate: null,
    userId: null, // User filter for filtering by specific user
    limit: 25 // Configurable limit with selector
  });

  // Summary state
  const [auditSummary, setAuditSummary] = useState(null);

  // Dialog state
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [transactionAuditLogs, setTransactionAuditLogs] = useState([]);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Update users list when audit logs change
    console.log('Audit logs changed, updating users. Log count:', auditLogs.length);
    
    if (auditLogs.length > 0) {
      const currentUsers = getUniqueUsersFromCurrentResults(auditLogs);
      console.log('Setting users to:', currentUsers);
      setUsers(currentUsers);
    } else {
      console.log('No audit logs, clearing users');
      setUsers([]);
    }
  }, [auditLogs]);

  useEffect(() => {
    if (activeTab === 0) {
      fetchAllUsersAuditLogs();
    } else if (activeTab === 1) {
      fetchAuditSummary();
    }
  }, [activeTab, currentPage, filters]);

  // Removed fetchUsers function since we now extract users from current results

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const fetchAllUsersAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching audit logs with filters:', filters);
      
      const result = await getAllUsersAuditLogs({
        page: currentPage,
        limit: filters.limit,
        action: filters.action,
        startDate: filters.startDate?.toISOString().split('T')[0],
        endDate: filters.endDate?.toISOString().split('T')[0],
        userId: filters.userId // This should now be properly handled
      });

      if (result) {
        setAuditLogs(result.auditLogs || []);
        setTotalPages(result.pagination?.totalPages || 1);
      } else {
        throw new Error('Failed to fetch audit logs');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch audit logs: ' + err.message);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAuditSummary({
        startDate: filters.startDate?.toISOString().split('T')[0],
        endDate: filters.endDate?.toISOString().split('T')[0],
        userId: filters.userId
      });

      if (result) {
        setAuditSummary(result);
      } else {
        throw new Error('Failed to fetch audit summary');
      }
    } catch (err) {
      setError('Failed to fetch audit summary: ' + err.message);
      setAuditSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionAuditLogs = async (transactionId) => {
    try {
      // Validate transactionId before making the request
      if (!transactionId || typeof transactionId !== 'string') {
        console.error('Invalid transaction ID:', transactionId);
        showSnackbar('Invalid transaction ID', 'error');
        return;
      }

      const result = await getTransactionAuditLogs(transactionId);
      if (result) {
        setTransactionAuditLogs(result.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to fetch transaction audit logs:', err);
      showSnackbar('Failed to fetch transaction audit logs', 'error');
    }
  };

  const handleFilterChange = (field, value) => {
    console.log('Filter change:', field, value, typeof value);
    
    // Ensure proper value handling, especially for userId
    let processedValue = value;
    
    if (field === 'userId') {
      // Ensure userId is either null or a string, never an object
      if (value === '' || value === null || value === undefined) {
        processedValue = null;
      } else if (typeof value === 'object') {
        console.error('userId is an object, converting to string:', value);
        processedValue = value._id || JSON.stringify(value);
      } else {
        processedValue = String(value);
      }
      console.log('Processed userId:', processedValue);
    }
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [field]: processedValue
      };
      console.log('New filters state:', newFilters);
      return newFilters;
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewDetails = async (log) => {
    setSelectedLog(log);
    // Ensure we have a valid transaction ID before fetching
    if (log.transactionId && typeof log.transactionId === 'string') {
      await fetchTransactionAuditLogs(log.transactionId);
    } else if (log.transactionId && typeof log.transactionId === 'object' && log.transactionId._id) {
      // If transactionId is a populated object, use its _id
      await fetchTransactionAuditLogs(log.transactionId._id);
    } else {
      console.warn('No valid transaction ID found in log:', log);
    }
    setDetailsDialogOpen(true);
  };

  const getActionColor = (action) => {
    const colors = {
      'CREATE': 'success',
      'UPDATE': 'info',
      'DELETE': 'error',
      'TRANSFER': 'warning',
      'ROLLBACK': 'secondary',
      'RESTORE': 'primary'
    };
    return colors[action] || 'default';
  };

  const formatCurrency = (amount) => {
    return amount ? `₹${amount.toLocaleString()}` : 'N/A';
  };

  const exportAuditLogs = () => {
    if (auditLogs.length === 0) {
      showSnackbar('No data to export', 'warning');
      return;
    }

    try {
      // Create CSV content with user information
      const headers = ['Date', 'Action', 'User', 'Email', 'Person', 'Family', 'Amount', 'Description', 'IP Address'];
      const csvContent = [
        headers.join(','),
        ...auditLogs.map(log => [
          new Date(log.createdAt).toLocaleDateString(),
          log.action,
          log.userName || 'N/A',
          log.userEmail || 'N/A',
          log.personName || 'N/A',
          log.familyName || 'N/A',
          log.amount || 0,
          `"${(log.description || '').replace(/"/g, '""')}"`, // Escape quotes
          log.ipAddress || 'N/A'
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all_users_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSnackbar('Audit logs exported successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar('Failed to export audit logs', 'error');
    }
  };

  const exportTransactionAudit = async (transactionId, personName) => {
    try {
      const result = await getTransactionAuditLogs(transactionId, 1, 1000); // Get all logs
      const logs = result.auditLogs || [];

      if (logs.length === 0) {
        showSnackbar('No audit data to export for this transaction', 'warning');
        return;
      }

      const headers = ['Date', 'Action', 'User', 'Email', 'Amount', 'Previous Amount', 'Description', 'IP Address'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          new Date(log.createdAt).toLocaleString(),
          log.action,
          log.userName,
          log.userEmail,
          log.amount || 0,
          log.previousAmount || 0,
          `"${(log.description || '').replace(/"/g, '""')}"`,
          log.ipAddress || 'N/A'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transaction_audit_${personName}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSnackbar('Transaction audit exported successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar('Failed to export transaction audit', 'error');
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderAuditLogsTab = () => (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter Audit Logs
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  label="Action"
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  <MenuItem value="CREATE">Create</MenuItem>
                  <MenuItem value="UPDATE">Update</MenuItem>
                  <MenuItem value="DELETE">Delete</MenuItem>
                  <MenuItem value="TRANSFER">Transfer</MenuItem>
                  <MenuItem value="ROLLBACK">Rollback</MenuItem>
                  <MenuItem value="RESTORE">Restore</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>User</InputLabel>
                <Select
                  value={filters.userId || ''}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    console.log('User dropdown changed to:', selectedValue);
                    handleFilterChange('userId', selectedValue || null);
                  }}
                  label="User"
                  disabled={usersLoading || users.length === 0}
                >
                  <MenuItem value="">All Users</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={`user-${user._id}`} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Per Page</InputLabel>
                <Select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', e.target.value)}
                  label="Per Page"
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={fetchAllUsersAuditLogs}
                  startIcon={<RefreshIcon />}
                  disabled={loading}
                  size="small"
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  onClick={exportAuditLogs}
                  startIcon={<DownloadIcon />}
                  disabled={auditLogs.length === 0 || loading}
                  size="small"
                >
                  Export
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Users Activity Log
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Person</TableCell>
                      <TableCell>Family</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log._id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(log.createdAt).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar 
                              sx={{ width: 32, height: 32, fontSize: '0.75rem' }}
                              alt={log.userName}
                            >
                              {getUserInitials(log.userName)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {log.userName || 'Unknown User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.userEmail || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.action}
                            color={getActionColor(log.action)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{log.personName || 'N/A'}</TableCell>
                        <TableCell>{log.familyName || 'N/A'}</TableCell>
                        <TableCell>{formatCurrency(log.amount)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {log.ipAddress || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleViewDetails(log)}
                              size="small"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {auditLogs.length === 0 && !loading && (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">
                    No audit logs found for the selected criteria
                  </Typography>
                </Box>
              )}

              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderSummaryTab = () => (
    <Box>
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : auditSummary && auditSummary.summary ? (
        <Grid container spacing={3}>
          {auditSummary.summary.map((userSummary) => (
            <Grid item xs={12} key={userSummary._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {getUserInitials(userSummary.userName)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {userSummary.userName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Operations: {userSummary.totalOperations}
                      </Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={2}>
                    {userSummary.actions.map((action) => (
                      <Grid item xs={6} sm={4} md={2} key={action.action}>
                        <Card variant="outlined">
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {action.action}
                            </Typography>
                            <Typography variant="h6">
                              {action.count}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(action.totalAmount)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">No summary data available</Alert>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        All Users Audit Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Track and monitor all users' transaction activities
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            icon={<TimelineIcon />} 
            label="Activity Log" 
            iconPosition="start"
          />
          <Tab 
            icon={<AssessmentIcon />} 
            label="Summary" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {activeTab === 0 && renderAuditLogsTab()}
      {activeTab === 1 && renderSummaryTab()}

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">User</Typography>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {getUserInitials(selectedLog.userName)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {selectedLog.userName || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedLog.userEmail || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Action</Typography>
                  <Chip 
                    label={selectedLog.action} 
                    color={getActionColor(selectedLog.action)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Date & Time</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Person</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedLog.personName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Family</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedLog.familyName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Amount</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formatCurrency(selectedLog.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">IP Address</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedLog.ipAddress || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedLog.description || 'No description available'}
                  </Typography>
                </Grid>
              </Grid>

              {transactionAuditLogs.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Transaction History
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactionAuditLogs.map((log) => (
                          <TableRow key={log._id}>
                            <TableCell>
                              {new Date(log.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={log.action}
                                color={getActionColor(log.action)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{log.userName}</TableCell>
                            <TableCell>{formatCurrency(log.amount)}</TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap>
                                {log.description}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          {selectedLog && selectedLog.transactionId && (
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={() => {
                // Extract the actual transaction ID
                const actualTransactionId = typeof selectedLog.transactionId === 'string' 
                  ? selectedLog.transactionId 
                  : selectedLog.transactionId._id;
                
                if (actualTransactionId) {
                  exportTransactionAudit(actualTransactionId, selectedLog.personName);
                } else {
                  showSnackbar('Invalid transaction ID for export', 'error');
                }
              }}
            >
              Export Transaction Audit
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditDashboard;