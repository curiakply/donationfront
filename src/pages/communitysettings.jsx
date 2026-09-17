import React, { useState, useEffect, useCallback } from 'react';
import { InputNumber } from "antd";
import { FaPeopleRoof } from "react-icons/fa6";
import axiosInstance from "../axiosConfig";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { 
  Box, 
  Typography,
  Button,
  Grid,
  Card,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Tooltip,
  IconButton,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  FileDownload as FileDownloadIcon, 
  Refresh as RefreshIcon,
  SaveAlt,
  History
} from '@mui/icons-material';
import { useFinancialYear } from './FinancialYearContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1E40AF'
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#047857'
    },
    background: {
      default: '#F3F4F6',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280'
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  }
});

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  color: 'white',
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: 14,
    padding: theme.spacing(2),
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
    padding: theme.spacing(2),
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const CommunitySettings = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastYearData, setLastYearData] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [yearEndDialog, setYearEndDialog] = useState(false);
  const [yearEndProcessing, setYearEndProcessing] = useState(false);
  const [totalCollectionDialog, setTotalCollectionDialog] = useState(false);
  // const [totalperc, settotalperc] = useState(false);
  // const [totalalloc, settotalalloc] = useState(false);
  const [newTotalAmount, setNewTotalAmount] = useState(0);
  const { selectedYear1: currentYear } = useFinancialYear();
  const lastYear = currentYear - 1;
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [currentYearData, lastYearData] = await Promise.all([
        axiosInstance.get(`/community-settings/with-balance/${currentYear}`),
        axiosInstance.get(`/community-settings/with-balance/${lastYear}`)
      ]);
  
      setTotalAmount(currentYearData.data.total_amount || 0);
      
      // Data comes pre-merged from the backend now
      const communitiesWithBalances = updateBalances(currentYearData.data.communities);
      setCommunities(communitiesWithBalances);
  
      setMessage({ type: 'success', text: 'Data loaded successfully' });
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  }, [currentYear, lastYear]);
  // const fetchInitialData = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const [
  //       communitiesResponse, 
  //       currentYearSettingsResponse,
  //       lastYearSettingsResponse,
  //       balanceSheetsResponse
  //     ] = await Promise.all([
  //       axiosInstance.get("/community/"),
  //       axiosInstance.get(`/community-settings/year/${currentYear}`),
  //       axiosInstance.get(`/community-settings/year/${lastYear}`),
  //       axiosInstance.get(`/balance/community/all/${currentYear}`)
  //     ]);

  //     setTotalAmount(currentYearSettingsResponse.data.total_amount || 0);

  //     const balanceMap = balanceSheetsResponse.data.reduce((acc, sheet) => {
  //       acc[sheet.entity_id] = sheet;
  //       return acc;
  //     }, {});

  //     const currentSettings = currentYearSettingsResponse.data.settings || [];
  //     const lastYearSettings = lastYearSettingsResponse.data.settings || [];

  //     const mergedData = communitiesResponse.data.map(community => ({
  //       ...community,
  //       percent: currentSettings.find(s => s.community_id === community._id)?.percentage || 0,
  //       amountAllocated: currentSettings.find(s => s.community_id === community._id)?.allocated_amount || 0,
  //       lastYearAmount: lastYearSettings.find(s => s.community_id === community._id)?.allocated_amount || 0,
  //       openingBalance: balanceMap[community._id]?.opening_balance || 0,
  //       totalTransactions: balanceMap[community._id]?.total_transactions || 0,
  //       currentBalance: 0
  //     }));

  //     const communitiesWithBalances = updateBalances(mergedData);
  //     setCommunities(communitiesWithBalances);
  //     // setLastYearData({
  //     //   totalAmount: lastYearSettingsResponse.data.total_amount || 0,
  //     //   totalAllocated: lastYearSettings.reduce((sum, setting) => sum + (setting.allocated_amount || 0), 0)
  //     // });
      
  //     setMessage({ type: 'success', text: 'Data loaded successfully' });
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     setMessage({ type: 'error', text: 'Failed to fetch data' });
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [currentYear, lastYear]); // ✅ Dependencies

  // ✅ Now fetchInitialData is stable and included in dependencies
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchTotalCollection = async () => {
    try {
      const collectionResponse = await axiosInstance.get(`/transaction/yearlyData/${currentYear}`);
      const newTotal = collectionResponse.data.totalAmount || 0;
      setNewTotalAmount(newTotal);
      return newTotal;
    } catch (error) {
      console.error('Error fetching total collection:', error);
      setMessage({ type: 'error', text: 'Failed to fetch total collection' });
      return 0;
    }
  };
  const handleUpdateTotalAmount = async () => {
    try {
      setLoading(true);
      const newTotal = await fetchTotalCollection();
      
      if (newTotal !== totalAmount) {
        // Keep allocated amounts the same, just update percentages
        const updatedCommunities = communities.map(community => ({
          ...community,
          // Only update the percentage based on new total
          percent: roundToTwo((community.amountAllocated / newTotal) * 100),
          // Keep amountAllocated unchanged
          amountAllocated: community.amountAllocated
        }));
        
        setCommunities(updateBalances(updatedCommunities));
        setTotalAmount(newTotal);
        setHasChanges(true);
  
        
        const totalAllocated = updatedCommunities.reduce((sum, c) => sum + Number(c.amountAllocated), 0);
        const remainingAmount = newTotal - totalAllocated;
        const totalPercentage = updatedCommunities.reduce((sum, c) => sum + Number(c.percent), 0);
       
  
        setMessage({ type: 'success', text: 'Total amount updated successfully' });
      } else {
        setMessage({ type: 'info', text: 'No change in total amount' });
      }
      setTotalCollectionDialog(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update total amount' });
    } finally {
      setLoading(false);
    }
  };
  const updateBalances = (updatedCommunities) => {
    return updatedCommunities.map((community) => ({
      ...community,
      currentBalance: roundToTwo(
        community.openingBalance + 
        community.amountAllocated - 
        community.totalTransactions
      )
    }));
  };

  const roundToTwo = (num) => {
    return Number(Math.round(num + 'e2') + 'e-2');
  };

  const handlePercentageChange = (id, newPercentage) => {
    if (newPercentage === null) return;
    
    setCommunities(prev => {
      const updated = prev.map(community => {
        if (community._id === id) {
          const updatedAmount = (totalAmount * newPercentage) / 100;
          return {
            ...community,
            percent: newPercentage,
            amountAllocated: roundToTwo(updatedAmount)
          };
        }
        return community;
      });
      return updateBalances(updated);
    });
    setHasChanges(true);
  };

  const handleAllocatedAmountChange = (id, newAmount) => {
    if (newAmount === null) return;
    
    setCommunities(prev => {
      const updated = prev.map(community => {
        if (community._id === id) {
          const updatedPercentage = (newAmount / totalAmount) * 100;
          return {
            ...community,
            percent: roundToTwo(updatedPercentage),
            amountAllocated: newAmount
          };
        }
        return community;
      });
      return updateBalances(updated);
    });
    setHasChanges(true);
  };

  // const handleSave = async () => {
  //   try {
  //     setLoading(true);
  //     const formattedData = communities.map(community => ({
  //       community_id: community._id,
  //       community_name: community.name,
  //       percentage: roundToTwo(community.percent),
  //       allocated_amount: roundToTwo(community.amountAllocated),
  //       opening_balance: community.openingBalance,
  //       total_transactions: community.totalTransactions,
  //       current_balance: community.currentBalance,
  //       year: currentYear
  //     }));

  //     await axiosInstance.post("/community-settings/", {
  //       settings: formattedData,
  //       total_amount: totalAmount,
  //       year: currentYear
  //     });

  //     const balanceUpdates = communities.map(community => ({
  //       year: currentYear,
  //       entity_type: 'community',
  //       entity_id: community._id,
  //       opening_balance: community.openingBalance,
  //       allocated_amount: community.amountAllocated,
  //       total_transactions: community.totalTransactions
  //     }));

  //     await axiosInstance.post('/balance/batch-update', {
  //       balances: balanceUpdates
  //     });

  //     setMessage({ type: 'success', text: 'Settings saved successfully' });
  //     setHasChanges(false);
  //     await fetchInitialData();
  //   } catch (error) {
  //     setMessage({ type: 'error', text: 'Failed to save settings' });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSave = async () => {
    try {
      setLoading(true);
      const formattedData = communities.map(community => ({
        community_id: community._id,
        community_name: community.name,
        percentage: roundToTwo(community.percent),
        allocated_amount: roundToTwo(community.amountAllocated),
        opening_balance: community.openingBalance,
        total_transactions: community.totalTransactions,
        current_balance: community.currentBalance,
        year: currentYear
      }));
  
      // Save community settings first to ensure data consistency
      await axiosInstance.post("/community-settings/", {
        settings: formattedData,
        total_amount: totalAmount,
        year: currentYear
      });
  
      // Get all required data in parallel
      const [communitySettingsRes, projectsRes, balancesRes] = await Promise.all([
        axiosInstance.get(`/community-settings/year/${currentYear}`),
        axiosInstance.get(`/project-settings/year/${currentYear}`),
        axiosInstance.get(`/balance/project/all/${currentYear}`)
      ]);
      
      const other_projects_amount = communitySettingsRes.data.other_projects_amount || 0;
      const projectSettings = projectsRes.data.settings || [];
      const balanceMap = new Map(balancesRes.data.map(b => [b.entity_id, b]));
  
      // Prepare project updates
      const updatedProjectSettings = projectSettings.map(project => {
        const newAmount = roundToTwo((project.percentage * other_projects_amount) / 100);
        const balance = balanceMap.get(project.project_id) || { 
          opening_balance: 0, 
          total_transactions: 0 
        };
        
        return {
          ...project,
          allocated_amount: newAmount,
          current_balance: balance.opening_balance + newAmount - balance.total_transactions
        };
      });
  
      // Update projects and balances in parallel
      await Promise.all([
        axiosInstance.post('/project-settings/bulk', {
          settings: updatedProjectSettings,
          total_amount: other_projects_amount,
          year: currentYear
        }),
        axiosInstance.post('/balance/batch-update', {
          balances: [
            ...communities.map(c => ({
              year: currentYear,
              entity_type: 'community',
              entity_id: c._id,
              opening_balance: c.openingBalance,
              allocated_amount: c.amountAllocated,
              total_transactions: c.totalTransactions
            })),
            ...updatedProjectSettings.map(p => {
              const balance = balanceMap.get(p.project_id) || {
                opening_balance: 0,
                total_transactions: 0
              };
              return {
                year: currentYear,
                entity_type: 'project',
                entity_id: p.project_id,
                opening_balance: balance.opening_balance,
                allocated_amount: p.allocated_amount,
                total_transactions: balance.total_transactions
              };
            })
          ]
        })
      ]);
  
      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setHasChanges(false);
      await fetchInitialData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };
  const handleYearEnd = async () => {
    try {
      setYearEndProcessing(true);
      await axiosInstance.post(`/balance/year-end/${currentYear}/community`);
      setMessage({ type: 'success', text: 'Year-end process completed successfully' });
      setYearEndDialog(false);
      await fetchInitialData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process year end' });
    } finally {
      setYearEndProcessing(false);
    }
  };

  const handleExportData = () => {
    const doc = new jsPDF();
    const tableData = communities.map((community) => [
      community.name,
      `${community.percent}%`,
      community.amountAllocated.toFixed(2),
      community.openingBalance.toFixed(2),
      community.currentBalance.toFixed(2),
      community.lastYearAmount.toFixed(2)
    ]);
    
    autoTable(doc, {
      head: [['Community', 'Percentage', 'Allocated', 'Opening Balance', 'Current Balance', 'Last Year']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      startY: 20,
    });
    
    doc.text('Community Settings Report', 14, 15);
    doc.save('community-settings.pdf');
  };

  const totalAllocated = communities.reduce((sum, c) => sum + Number(c.amountAllocated), 0);
  const totalPercentage = communities.reduce((sum, c) => sum + Number(c.percent), 0);
  const remainingAmount = totalAmount - totalAllocated;
  const totalOpeningBalance = communities.reduce((sum, c) => sum + Number(c.openingBalance), 0);
  const totalCurrentBalance = communities.reduce((sum, c) => sum + Number(c.currentBalance), 0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dialog 
  open={totalCollectionDialog} 
  onClose={() => setTotalCollectionDialog(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
    <Box display="flex" alignItems="center" gap={1}>
      <RefreshIcon />
      <Typography>Update Total Collection</Typography>
    </Box>
  </DialogTitle>
  <DialogContent sx={{ mt: 2, p: 3 }}>
    <Typography variant="body1" paragraph>
      This will:
    </Typography>
    <Box component="ul" sx={{ pl: 2 }}>
      <Typography component="li" sx={{ mb: 1 }}>
        Fetch the latest total collection amount
      </Typography>
      <Typography component="li" sx={{ mb: 1 }}>
        Update all allocations based on current percentages
      </Typography>
      <Typography component="li">
        Recalculate remaining amounts and balances
      </Typography>
    </Box>
  </DialogContent>
  <DialogActions sx={{ p: 3 }}>
    <Button 
      onClick={() => setTotalCollectionDialog(false)}
      variant="outlined"
    >
      Cancel
    </Button>
    <Button 
      onClick={handleUpdateTotalAmount}
      variant="contained"
      disabled={loading}
      sx={{ 
        ml: 2,
        bgcolor: 'secondary.main',
        '&:hover': { bgcolor: 'secondary.dark' }
      }}
    >
      {loading ? <CircularProgress size={24} /> : 'Update Total'}
    </Button>
  </DialogActions>
</Dialog>
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.default', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)'
      }}>
        <Tooltip title="Update Total Collection">
    
  </Tooltip>
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <FaPeopleRoof style={{ fontSize: 32, color: theme.palette.primary.main }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Community Settings
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage community allocations and budgets
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchInitialData}
                  sx={{
                    bgcolor: theme.palette.primary.light + '20',
                    '&:hover': { bgcolor: theme.palette.primary.light + '30' }
                  }}
                >
                  <RefreshIcon sx={{ color: theme.palette.primary.main }} />
                </IconButton>
              </Tooltip>
              {/* <Button
                variant="outlined"
                onClick={() => setYearEndDialog(true)}
                startIcon={<History />}
                sx={{ borderRadius: 2, mr: 1 }}
              >
                Year End
              </Button> */}
              <Button
                variant="outlined"
                onClick={handleExportData}
                startIcon={<FileDownloadIcon />}
                sx={{ borderRadius: 2 }}
              >
                Export Data
              </Button>
              <Button
      variant="outlined"
      onClick={() => setTotalCollectionDialog(true)}
      startIcon={<RefreshIcon />}
      sx={{ borderRadius: 2 }}
    >
      Update Total
    </Button>
            </Box>
          </Box>
        </StyledCard>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { title: 'Total Budget', value: totalAmount },
            { title: 'Allocated Amount', value: totalAllocated },
            { title: 'Remaining Amount', value: remainingAmount },
            { title: 'Total Percentage', value: `${totalPercentage.toFixed(2)}%` }
          ].map((item, index) => (
            <Grid item xs={12} md={3} key={index}>
              <StyledCard>
                <Box p={3}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    color={
                      item.title === 'Remaining Amount' && item.value < 0
                        ? 'error.main'
                        : item.title === 'Total Percentage' && parseFloat(item.value) > 100
                          ? 'error.main'
                          : 'inherit'
                    }
                  >
                    {typeof item.value === 'number'
                      ? `₹${item.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`: item.value}
                      </Typography>
                    </Box>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
    
            {hasChanges && (
              <Box mb={3}>
                <GradientButton
                  fullWidth
                  onClick={handleSave}
                  disabled={remainingAmount < 0 || totalPercentage > 100}
                  startIcon={<SaveAlt />}
                >
                  Save Changes
                </GradientButton>
              </Box>
            )}
    
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <StyledCard>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Community Name</StyledTableCell>
                          <StyledTableCell align="right">Percentage (%)</StyledTableCell>
                          <StyledTableCell align="right">Allocated Amount (₹)</StyledTableCell>
                          <StyledTableCell align="right">Opening Balance (₹)</StyledTableCell>
                          <StyledTableCell align="right">Total Transactions (₹)</StyledTableCell>
                          <StyledTableCell align="right">Current Balance (₹)</StyledTableCell>
                          <StyledTableCell align="right">Last Year Amount (₹)</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {communities.map((community) => (
                          <StyledTableRow key={community._id}>
                            <StyledTableCell>{community.name}</StyledTableCell>
                            <StyledTableCell align="right">
                              <InputNumber
                                min={0}
                                max={100}
                                value={community.percent}
                                onChange={(value) => handlePercentageChange(community._id, value)}
                                precision={2}
                                style={{ width: '100%' }}
                                addonAfter="%"
                              />
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <InputNumber
                                min={0}
                                max={totalAmount}
                                value={community.amountAllocated}
                                onChange={(value) => handleAllocatedAmountChange(community._id, value)}
                                precision={2}
                                style={{ width: '100%' }}
                                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              />
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {community.openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {community.totalTransactions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </StyledTableCell>
                            <StyledTableCell 
                              align="right"
                              sx={{ color: community.currentBalance < 0 ? 'error.main' : 'success.main' }}
                            >
                              {community.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {community.lastYearAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: theme.palette.primary.light + '10' }}>
                          <StyledTableCell>
                            <Typography fontWeight="bold" color="primary">Total</Typography>
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            <Typography 
                              fontWeight="bold" 
                              color={totalPercentage > 100 ? 'error.main' : 'primary'}
                            >
                              {totalPercentage.toFixed(2)}%
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            <Typography fontWeight="bold" color="primary">
                              ₹{totalAllocated.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            <Typography fontWeight="bold" color="primary">
                              ₹{totalOpeningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            <Typography fontWeight="bold" color="primary">
                              ₹{communities.reduce((sum, c) => sum + c.totalTransactions, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            <Typography 
                              fontWeight="bold" 
                              color={totalCurrentBalance < 0 ? 'error.main' : 'success.main'}
                            >
                              ₹{totalCurrentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            <Typography fontWeight="bold" color="primary">
                              ₹{communities.reduce((sum, c) => sum + c.lastYearAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Typography>
                          </StyledTableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </StyledCard>
    
                {/* <Box mt={4}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Year Over Year Comparison
                  </Typography>
                  <StyledCard>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <StyledTableCell>Community</StyledTableCell>
                            <StyledTableCell align="right">Current Year (₹)</StyledTableCell>
                            <StyledTableCell align="right">Last Year (₹)</StyledTableCell>
                            <StyledTableCell align="right">Difference (₹)</StyledTableCell>
                            <StyledTableCell align="right">Change (%)</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {communities.map((community) => {
                            const difference = community.amountAllocated - community.lastYearAmount;
                            const percentageChange = community.lastYearAmount 
                              ? (difference / community.lastYearAmount) * 100 
                              : 100;
    
                            return (
                              <StyledTableRow key={`yoy-${community._id}`}>
                                <StyledTableCell>{community.name}</StyledTableCell>
                                <StyledTableCell align="right">
                                  {community.amountAllocated.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                  {community.lastYearAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </StyledTableCell>
                                <StyledTableCell 
                                  align="right"
                                  sx={{ color: difference < 0 ? 'error.main' : 'success.main' }}
                                >
                                  {difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </StyledTableCell>
                                <StyledTableCell 
                                  align="right"
                                  sx={{ color: percentageChange < 0 ? 'error.main' : 'success.main' }}
                                >
                                  {percentageChange.toFixed(2)}%
                                </StyledTableCell>
                              </StyledTableRow>
                            );
                          })}
                          
                          <TableRow sx={{ backgroundColor: theme.palette.primary.light + '10' }}>
                            <StyledTableCell>
                              <Typography fontWeight="bold" color="primary">Total</Typography>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <Typography fontWeight="bold" color="primary">
                                ₹{totalAllocated.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <Typography fontWeight="bold" color="primary">
                                ₹{communities.reduce((sum, c) => sum + c.lastYearAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <Typography 
                                fontWeight="bold"
                                color={totalAllocated - communities.reduce((sum, c) => sum + c.lastYearAmount, 0) < 0 ? 'error.main' : 'success.main'}
                              >
                                ₹{(totalAllocated - communities.reduce((sum, c) => sum + c.lastYearAmount, 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <Typography 
                                fontWeight="bold"
                                color={((totalAllocated / (communities.reduce((sum, c) => sum + c.lastYearAmount, 0) || 1)) - 1) * 100 < 0 ? 'error.main' : 'success.main'}
                              >
                                {(((totalAllocated / (communities.reduce((sum, c) => sum + c.lastYearAmount, 0) || 1)) - 1) * 100).toFixed(2)}%
                              </Typography>
                            </StyledTableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </StyledCard>
                </Box> */}
              </>
            )}
    
            {/* Year End Dialog */}
            <Dialog
              open={yearEndDialog}
              onClose={() => setYearEndDialog(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <History />
                  <Typography>Process Year End</Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ mt: 2, p: 3 }}>
                <Typography variant="body1" paragraph>
                  Are you sure you want to process year end? This will:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" sx={{ mb: 1 }}>
                    Transfer all current balances to next year's opening balances
                  </Typography>
                  <Typography component="li" sx={{ mb: 1 }}>
                    Close all transactions for the current year
                  </Typography>
                  <Typography component="li">
                    Reset allocations for the new year
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button 
                  onClick={() => setYearEndDialog(false)}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleYearEnd}
                  variant="contained"
                  disabled={yearEndProcessing}
                  sx={{ 
                    ml: 2,
                    bgcolor: 'secondary.main',
                    '&:hover': { bgcolor: 'secondary.dark' }
                  }}
                >
                  {yearEndProcessing ? <CircularProgress size={24} /> : 'Confirm'}
                </Button>
              </DialogActions>
            </Dialog>
    
            <Snackbar
              open={Boolean(message)}
              autoHideDuration={6000}
              onClose={() => setMessage(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert 
                onClose={() => setMessage(null)} 
                severity={message?.type || 'info'}
                variant="filled"
                sx={{ 
                  borderRadius: '8px',
                  backgroundColor: message?.type === 'error' 
                    ? theme.palette.error.main 
                    : theme.palette.primary.main,
                }}
              >
                {message?.text}
              </Alert>
            </Snackbar>
          </Box>
        </ThemeProvider>
      );
    };
    
    export default CommunitySettings;