import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  CircularProgress, Alert, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { People, TrendingUp, CalendarToday } from '@mui/icons-material';
import axiosInstance from '../axiosConfig';

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Analytics data state
  const [uniqueFamiliesData, setUniqueFamiliesData] = useState(null);
  const [familiesDetails, setFamiliesDetails] = useState([]);

  // Fetch unique families count on component mount
  useEffect(() => {
    fetchUniqueFamiliesCount();
  }, []);

  // Fetch unique families count
  const fetchUniqueFamiliesCount = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/analytics/unique-families-count', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });

      setUniqueFamiliesData(response.data);
    } catch (err) {
      console.error('Error fetching unique families:', err);
      setError(err.response?.data?.message || 'Failed to load unique families count');
    } finally {
      setLoading(false);
    }
  };

  // Fetch families with details
  const fetchFamiliesDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/analytics/families-with-details-manual', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });

      setFamiliesDetails(response.data.families || []);
    } catch (err) {
      console.error('Error fetching families details:', err);
      setError(err.response?.data?.message || 'Failed to load families details');
    } finally {
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  // Handle analyze button click
  const handleAnalyze = () => {
    fetchUniqueFamiliesCount();
    fetchFamiliesDetails();
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Stat Card Component
  const StatCard = ({ title, value, subtitle, icon, color = 'primary.main' }) => (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
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
          Welcome Diocese Of Kanjirapally
        </Typography>
        {/* <Typography variant="body1" color="text.secondary">
          Analytics and Insights for Transaction Management
        </Typography> */}
      </Box>

      {/* Date Range Selection */}
      {/* <Card sx={{ mb: 4, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Select Date Range
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mt: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ minWidth: 180 }}
            />
            
            <TextField
              label="End Date"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ minWidth: 180 }}
            />

            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TrendingUp />}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Loading...' : 'Analyze'}
            </Button>
          </Box>
        </CardContent>
      </Card> */}

      {/* Error Alert
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )} */}

      {/* Statistics Cards */}
      {/* {uniqueFamiliesData && (
        <>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Overview Statistics
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Unique Families"
                value={uniqueFamiliesData.totalFamilies}
                subtitle="Total families with transactions"
                icon={<People fontSize="large" />}
                color="primary.main"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Transactions"
                value={uniqueFamiliesData.detailedStats?.totalTransactions || 0}
                subtitle="Number of transactions"
                icon={<TrendingUp fontSize="large" />}
                color="success.main"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Revenue"
                value={`₹${(uniqueFamiliesData.detailedStats?.totalAmount || 0).toLocaleString('en-IN')}`}
                subtitle="Total amount collected"
                icon={<TrendingUp fontSize="large" />}
                color="info.main"
              />
            </Grid>
          </Grid>
        </>
      )} */}

      {/* Families Details Table */}
      {/* {familiesDetails.length > 0 && (
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Family-wise Transaction Details
              </Typography>
              <Chip 
                label={`${familiesDetails.length} Families`} 
                color="primary" 
                variant="outlined"
              />
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                      #
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                      Family Code
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                      Family Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                      Parish
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                      Transaction Date
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                      Transactions
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                      Total Amount
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {familiesDetails.map((family, index) => (
                    <TableRow 
                      key={family.familyId} 
                      hover
                      sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' } }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Chip 
                          label={family.familyCode || 'N/A'} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {family.familyName || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>{family.parishName || 'N/A'}</TableCell>
                     
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(family.lastTransaction)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={family.transactionCount} 
                          size="small" 
                          color="info"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ₹{(family.totalAmount || 0).toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )} */}

      {/* Loading State */}
      {/* {loading && !uniqueFamiliesData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )} */}

      {/* No Data State */}
      {/* {!loading && !uniqueFamiliesData && !error && (
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Data Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select a date range and click "Analyze" to view statistics
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleAnalyze}
                startIcon={<TrendingUp />}
              >
                Load Analytics
              </Button>
            </Box>
          </CardContent>
        </Card>
      )} */}
    </Box>
  );
};

export default SuperAdminDashboard;