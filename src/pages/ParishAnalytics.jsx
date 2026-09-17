import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  CircularProgress, Alert, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Collapse
} from '@mui/material';
import { Church, TrendingUp, People, ExpandMore, ExpandLess } from '@mui/icons-material';
import axiosInstance from '../axiosConfig';

const ParishAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedParish, setExpandedParish] = useState(null);
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Analytics data
  const [parishData, setParishData] = useState(null);
  const [parishDetails, setParishDetails] = useState({});

  // Fetch parish-wise analysis
  const fetchParishAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/analytics/parish-wise-analysis', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });

      setParishData(response.data);
    } catch (err) {
      console.error('Error fetching parish analysis:', err);
      setError(err.response?.data?.message || 'Failed to load parish analysis');
    } finally {
      setLoading(false);
    }
  };

  // Fetch details for specific parish
  const fetchParishDetails = async (parishId) => {
    try {
      // If already expanded, collapse it
      if (expandedParish === parishId) {
        setExpandedParish(null);
        return;
      }

      // If details already loaded, just expand
      if (parishDetails[parishId]) {
        setExpandedParish(parishId);
        return;
      }

      setLoading(true);
      const response = await axiosInstance.get(`/analytics/parish-details/${parishId}`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });

      setParishDetails(prev => ({
        ...prev,
        [parishId]: response.data
      }));
      setExpandedParish(parishId);
    } catch (err) {
      console.error('Error fetching parish details:', err);
      setError('Failed to load parish details');
    } finally {
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
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
          Parish-wise Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Transaction analytics grouped by parish
        </Typography>
      </Box>

      {/* Date Range Selection */}
      <Card sx={{ mb: 4, boxShadow: 2 }}>
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
              onClick={fetchParishAnalysis}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TrendingUp />}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Loading...' : 'Analyze'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Statistics */}
      {parishData?.summary && (
        <>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Overall Summary
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Parishes"
                value={parishData.summary.totalParishes}
                subtitle="Active parishes"
                icon={<Church fontSize="large" />}
                color="primary.main"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Transactions"
                value={parishData.summary.totalTransactions}
                subtitle="All parishes combined"
                icon={<TrendingUp fontSize="large" />}
                color="success.main"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Revenue"
                value={`₹${(parishData.summary.totalAmount || 0).toLocaleString('en-IN')}`}
                subtitle="Combined collection"
                icon={<TrendingUp fontSize="large" />}
                color="info.main"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Families"
                value={parishData.summary.totalFamilies}
                subtitle="Unique families"
                icon={<People fontSize="large" />}
                color="warning.main"
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* Parish-wise Table */}
      {parishData?.parishes && parishData.parishes.length > 0 && (
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Parish-wise Breakdown
              </Typography>
              <Chip 
                label={`${parishData.parishes.length} Parishes`} 
                color="primary" 
                variant="outlined"
              />
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Parish Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Transactions</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Families</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>                    
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parishData.parishes.map((parish, index) => (
                    <React.Fragment key={parish.parishId}>
                      <TableRow 
                        hover
                        sx={{ 
                          '&:nth-of-type(odd)': { bgcolor: 'grey.50' },
                          cursor: 'pointer'
                        }}
                        onClick={() => fetchParishDetails(parish.parishId)}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Church sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                            <Typography variant="body2" fontWeight="medium">
                              {parish.parishName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={parish.totalTransactions} 
                            size="small" 
                            color="info"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={parish.uniqueFamiliesCount} 
                            size="small" 
                            color="warning"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            ₹{(parish.totalAmount || 0).toLocaleString('en-IN')}
                          </Typography>
                        </TableCell>
                      
                        <TableCell align="center">
                          <IconButton size="small">
                            {expandedParish === parish.parishId ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Details Row */}
                      <TableRow>
                        <TableCell colSpan={8} sx={{ py: 0, border: 0 }}>
                          <Collapse in={expandedParish === parish.parishId} timeout="auto" unmountOnExit>
                            {parishDetails[parish.parishId] && (
                              <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                                <Typography variant="h6" gutterBottom>
                                  {parishDetails[parish.parishId].parishInfo.name} - Detailed Breakdown
                                </Typography>

                                {/* Top Families in this Parish */}
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                                  Top Contributing Families
                                </Typography>
                                <TableContainer component={Paper} sx={{ mb: 2 }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell><strong>Family Code</strong></TableCell>
                                        <TableCell><strong>Family Name</strong></TableCell>
                                        <TableCell align="right"><strong>Transactions</strong></TableCell>
                                        <TableCell align="right"><strong>Total Amount</strong></TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {parishDetails[parish.parishId].familyDetails.slice(0, 10).map((family) => (
                                        <TableRow key={family.familyId}>
                                          <TableCell>
                                            <Chip label={family.familyCode} size="small" variant="outlined" />
                                          </TableCell>
                                          <TableCell>{family.familyName}</TableCell>
                                          <TableCell align="right">{family.transactionCount}</TableCell>
                                          <TableCell align="right">
                                            <strong>₹{family.totalAmount.toLocaleString('en-IN')}</strong>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>

                                {/* Daily Breakdown */}
                                {parishDetails[parish.parishId].dailyBreakdown && (
                                  <>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                                      Daily Breakdown
                                    </Typography>
                                    <TableContainer component={Paper}>
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell><strong>Date</strong></TableCell>
                                            <TableCell align="right"><strong>Transactions</strong></TableCell>
                                            <TableCell align="right"><strong>Families</strong></TableCell>
                                            <TableCell align="right"><strong>Amount</strong></TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {parishDetails[parish.parishId].dailyBreakdown.map((day) => (
                                            <TableRow key={day.date}>
                                              <TableCell>
                                                {new Date(day.date).toLocaleDateString('en-IN')}
                                              </TableCell>
                                              <TableCell align="right">{day.transactionCount}</TableCell>
                                              <TableCell align="right">{day.uniqueFamiliesCount}</TableCell>
                                              <TableCell align="right">
                                                ₹{day.amount.toLocaleString('en-IN')}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </>
                                )}
                              </Box>
                            )}
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !parishData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* No Data State */}
      {!loading && !parishData && !error && (
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Church sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Data Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select a date range and click "Analyze" to view parish statistics
              </Typography>
              <Button 
                variant="contained" 
                onClick={fetchParishAnalysis}
                startIcon={<TrendingUp />}
              >
                Load Analytics
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ParishAnalytics;