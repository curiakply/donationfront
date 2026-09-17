import React, { useState, useEffect, useCallback } from 'react';
import { InputNumber } from "antd";
import { FaProjectDiagram } from "react-icons/fa";
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  FileDownload as FileDownloadIcon, 
  Refresh as RefreshIcon,
  SaveAlt
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

const OtherProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastYearData, setLastYearData] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const { selectedYear1: currentYear } = useFinancialYear();
  const lastYear = currentYear - 1;

  const updateBalances = useCallback((updatedProjects) => {
    let runningTotalAllocated = 0;
    return updatedProjects.map(project => {
      runningTotalAllocated += Number(project.amountAllocated || 0);
      return {
        ...project,
        balanceAfterAllocation: totalAmount - runningTotalAllocated,
        currentBalance: project.openingBalance + project.amountAllocated - project.totalTransactions
      };
    });
  }, [totalAmount]); 
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
  
      const [
        communitySettingsResponse,
        projectsResponse
      ] = await Promise.all([
        axiosInstance.get(`/community-settings/year/${currentYear}`),
        axiosInstance.get(`/project-settings/with-balance/${currentYear}`)
      ]);
  
      // Set total amount
      setTotalAmount(communitySettingsResponse.data.other_projects_amount || 0);
  
      // Projects data comes pre-merged now
      const projectsWithBalances = updateBalances(projectsResponse.data.projects);
      setProjects(projectsWithBalances);
  
      // Set last year data
      setLastYearData({
        totalAmount: communitySettingsResponse.data.other_projects_amount || 0,
        totalAllocated: projectsResponse.data.projects.reduce(
          (sum, project) => sum + (project.lastYearAmount || 0), 
          0
        )
      });
  
      setMessage({ type: "success", text: "Data loaded successfully" });
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  }, [currentYear, updateBalances]);
  // const fetchInitialData = useCallback(async () => {
  //   try {
  //     setLoading(true);

  //     // Parallelize all initial API calls
  //     const [
  //       communitySettingsResponse,
  //       projectsResponse,
  //       currentYearResponse,
  //       lastYearResponse,
  //       balanceResponse
  //     ] = await Promise.all([
  //       axiosInstance.get(`/community-settings/year/${currentYear}`),
  //       axiosInstance.get("/fund"),
  //       axiosInstance.get(`/project-settings/year/${currentYear}`).catch(() => ({ data: { settings: [] } })),
  //       axiosInstance.get(`/project-settings/year/${lastYear}`).catch(() => ({ data: { settings: [] } })),
  //       axiosInstance.get(`/balance/project/all/${currentYear}`).catch(() => ({ data: [] }))
  //     ]);

  //     if (!projectsResponse?.data) {
  //       throw new Error("Failed to fetch projects data");
  //     }

  //     // Set total amount immediately
  //     setTotalAmount(communitySettingsResponse.data.other_projects_amount || 0);

  //     // Create efficient maps for lookups
  //     const balanceMap = new Map(
  //       balanceResponse.data.map((balance) => [balance.entity_id, balance])
  //     );

  //     const currentSettings = new Map(
  //       currentYearResponse.data.settings.map((setting) => [setting.project_id, setting])
  //     );

  //     const lastYearAllocations = new Map(
  //       lastYearResponse.data.settings.map((setting) => [setting.project_id, setting.allocated_amount])
  //     );

  //     // Process projects data in a single pass
  //     const mergedData = projectsResponse.data.map((project) => {
  //       const currentSetting = currentSettings.get(project._id);
  //       const balance = balanceMap.get(project._id) || {
  //         opening_balance: 0,
  //         total_transactions: 0,
  //         closing_balance: 0
  //       };

  //       return {
  //         _id: project._id,
  //         name: project.name,
  //         head: project.head,
  //         percent: currentSetting?.percentage || 0,
  //         amountAllocated: currentSetting?.allocated_amount || 0,
  //         lastYearAmount: lastYearAllocations.get(project._id) || 0,
  //         openingBalance: balance.opening_balance || 0,
  //         totalTransactions: balance.total_transactions || 0,
  //         currentBalance: balance.closing_balance || 0,
  //         balanceAfterAllocation: currentSetting?.allocated_amount || 0,
  //         year: currentYear
  //       };
  //     });

  //     const projectsWithBalances = updateBalances(mergedData);
  //     setProjects(projectsWithBalances);

  //     // Calculate last year data
  //     setLastYearData({
  //       totalAmount: communitySettingsResponse.data.other_projects_amount || 0,
  //       totalAllocated: Array.from(lastYearAllocations.values()).reduce((sum, amount) => sum + amount, 0)
  //     });

  //     setMessage({ type: "success", text: "Data loaded successfully" });
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     setMessage({ type: "error", text: "Failed to fetch data" });
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [currentYear, lastYear,updateBalances]); // ✅ Dependencies
  
  // ✅ Now fetchInitialData is stable and included in dependencies
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

 // ✅ Dependency on totalAmount
  

 const handlePercentageChange = (id, newPercentage) => {
  if (newPercentage === null) return;

  setProjects(prevProjects => {
    return updateBalances(
      prevProjects.map(project => {
        if (project._id === id) {
          const updatedAmount = (totalAmount * newPercentage) / 100;
          return {
            ...project,
            percent: newPercentage,
            amountAllocated: Number(updatedAmount.toFixed(2))
          };
        }
        return project;
      })
    );
  });

  setHasChanges(true);
};


const handleAllocatedAmountChange = (id, newAmount) => {
  if (newAmount === null) return;

  setProjects(prevProjects => {
    return updateBalances(
      prevProjects.map(project => {
        if (project._id === id) {
          const updatedPercentage = (newAmount / totalAmount) * 100;
          return {
            ...project,
            percent: Number(updatedPercentage.toFixed(2)),
            amountAllocated: newAmount
          };
        }
        return project;
      })
    );
  });

  setHasChanges(true);
};


  const handleSave = async () => {
    try {
      setLoading(true);
      const formattedData = projects.map(project => ({
        year: currentYear,
        project_id: project._id,
        project_name: project.name,
        percentage: Number(project.percent),
        allocated_amount: Number(project.amountAllocated),
        balance_after_allocation: project.balanceAfterAllocation
      }));

      const totalPercentage = projects.reduce((sum, project) => 
        sum + Number(project.percent), 0);
      if (totalPercentage > 100) {
        setMessage({ type: 'error', text: 'Total percentage cannot exceed 100%' });
        return;
      }

      const totalAllocated = projects.reduce((sum, project) => 
        sum + Number(project.amountAllocated), 0);
      if (totalAllocated > totalAmount) {
        setMessage({ type: 'error', text: 'Total allocated amount cannot exceed available funds' });
        return;
      }

      await axiosInstance.post('/project-settings/bulk', {
        settings: formattedData,
        total_amount: totalAmount,
        year: currentYear
      });

      const balanceUpdates = projects.map(project => ({
        year: currentYear,
        entity_type: 'project',
        entity_id: project._id,
        opening_balance: project.openingBalance,
        allocated_amount: project.amountAllocated,
        total_transactions: project.totalTransactions,
        balance_after_allocation: project.balanceAfterAllocation
      }));

      await axiosInstance.post('/balance/batch-update', {
        balances: balanceUpdates
      });

      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setHasChanges(false);
      await fetchInitialData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const doc = new jsPDF();
    const tableData = projects.map((project) => [
      project.name,
      `${project.percent}%`,
      project.amountAllocated.toFixed(2),
      project.openingBalance.toFixed(2),
      project.currentBalance.toFixed(2),
      project.lastYearAmount.toFixed(2)
    ]);
    
    autoTable(doc, {
      head: [['Project', 'Percentage', 'Allocated', 'Opening Balance', 'Current Balance', 'Last Year']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      startY: 20,
    });
    
    doc.text('Other Projects Settings Report', 14, 15);
    doc.save('other-projects-settings.pdf');
  };

  const totalAllocated = projects.reduce((sum, p) => sum + Number(p.amountAllocated), 0);
  const totalPercentage = projects.reduce((sum, p) => sum + Number(p.percent), 0);
  const remainingAmount = totalAmount - totalAllocated;
  const totalOpeningBalance = projects.reduce((sum, p) => sum + Number(p.openingBalance), 0);
  const totalCurrentBalance = projects.reduce((sum, p) => sum + Number(p.currentBalance), 0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.default', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)'
      }}>
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <FaProjectDiagram style={{ fontSize: 32, color: theme.palette.primary.main }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Other Projects Settings
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage other projects allocations and budgets
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
              <Button
                variant="outlined"
                onClick={handleExportData}
                startIcon={<FileDownloadIcon />}
                sx={{ borderRadius: 2 }}
              >
                Export Data
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
                      <StyledTableCell>Project Name</StyledTableCell>
                      <StyledTableCell align="right">Percentage (%)</StyledTableCell>
                      <StyledTableCell align="right">Allocated Amount (₹)</StyledTableCell>
                      <StyledTableCell align="right">Opening Balance (₹)</StyledTableCell>
                      <StyledTableCell align="right">Total Transactions (₹)</StyledTableCell>
                      <StyledTableCell align="right">Current Balance (₹)</StyledTableCell>
                      <StyledTableCell align="right">Last Year Amount (₹)</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projects.map((project) => (
                      <StyledTableRow key={project._id}>
                        <StyledTableCell>{project.name}</StyledTableCell>
                        <StyledTableCell align="right">
                          <InputNumber
                            min={0}
                            max={100}
                            value={project.percent}
                            onChange={(value) => handlePercentageChange(project._id, value)}
                            precision={2}
                            style={{ width: '100%' }}
                            addonAfter="%"
                          />
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <InputNumber
                            min={0}
                            max={totalAmount}
                            value={project.amountAllocated}
                            onChange={(value) => handleAllocatedAmountChange(project._id, value)}
                            precision={2}
                            style={{ width: '100%' }}
                            formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          />
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {project.openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {project.totalTransactions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </StyledTableCell>
                        <StyledTableCell 
                          align="right"
                          sx={{ color: project.currentBalance < 0 ? 'error.main' : 'success.main' }}
                        >
                          {project.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {project.lastYearAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                          ₹{projects.reduce((sum, p) => sum + p.totalTransactions, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                          ₹{projects.reduce((sum, p) => sum + p.lastYearAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                        <StyledTableCell>Project</StyledTableCell>
                        <StyledTableCell align="right">Current Year (₹)</StyledTableCell>
                        <StyledTableCell align="right">Last Year (₹)</StyledTableCell>
                        <StyledTableCell align="right">Difference (₹)</StyledTableCell>
                        <StyledTableCell align="right">Change (%)</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projects.map((project) => {
                        const difference = project.amountAllocated - project.lastYearAmount;
                        const percentageChange = project.lastYearAmount 
                          ? (difference / project.lastYearAmount) * 100 
                          : 100;

                        return (
                          <StyledTableRow key={`yoy-${project._id}`}>
                            <StyledTableCell>{project.name}</StyledTableCell>
                            <StyledTableCell align="right">
                              {project.amountAllocated.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {project.lastYearAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                            ₹{projects.reduce((sum, p) => sum + p.lastYearAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <Typography 
                            fontWeight="bold"
                            color={totalAllocated - projects.reduce((sum, p) => sum + p.lastYearAmount, 0) < 0 ? 'error.main' : 'success.main'}
                          >
                            ₹{(totalAllocated - projects.reduce((sum, p) => sum + p.lastYearAmount, 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <Typography 
                            fontWeight="bold"
                            color={((totalAllocated / (projects.reduce((sum, p) => sum + p.lastYearAmount, 0) || 1)) - 1) * 100 < 0 ? 'error.main' : 'success.main'}
                          >
                            {(((totalAllocated / (projects.reduce((sum, p) => sum + p.lastYearAmount, 0) || 1)) - 1) * 100).toFixed(2)}%
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

export default OtherProjects;